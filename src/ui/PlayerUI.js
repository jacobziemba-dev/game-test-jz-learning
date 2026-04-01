/**
 * PlayerUI — the Character panel (toggle with 'P').
 *
 * Left half:  Equipment paperdoll — shows all worn items in their slots.
 *             Click a filled slot to unequip the item back into inventory.
 * Right half: Stats — all skill levels with equipment bonuses shown.
 *
 * Layout mirrors OSRS's equipment screen:
 *         [head]
 *  [cape] [neck] [ammo]
 *  [weap] [body] [offh]
 *  [hand] [legs] [boot]
 *         [ring]
 */
class PlayerUI {
  constructor(player) {
    this.player  = player;
    this.isOpen  = false;

    // Panel dimensions
    this.panelW  = 390;
    this.headerH = 32;
    this.slotS   = 42;   // slot size (px)
    this.slotG   = 4;    // gap between slots
    this.leftW   = 190;  // paperdoll section width
    this.rightW  = 200;  // stats section width

    // Paperdoll: 3 cols × 5 rows (some cells empty)
    this._slotLayout = [
      { id: 'head',    gridRow: 0, gridCol: 1 },
      { id: 'cape',    gridRow: 1, gridCol: 0 },
      { id: 'neck',    gridRow: 1, gridCol: 1 },
      { id: 'ammo',    gridRow: 1, gridCol: 2 },
      { id: 'weapon',  gridRow: 2, gridCol: 0 },
      { id: 'body',    gridRow: 2, gridCol: 1 },
      { id: 'offhand', gridRow: 2, gridCol: 2 },
      { id: 'hands',   gridRow: 3, gridCol: 0 },
      { id: 'legs',    gridRow: 3, gridCol: 1 },
      { id: 'boots',   gridRow: 3, gridCol: 2 },
      { id: 'ring',    gridRow: 4, gridCol: 1 },
    ];

    // Compute panel height from rows
    const gridH = 5 * (this.slotS + this.slotG) - this.slotG;
    this._sectionLabelH = 20;
    this._sectionPad    = 10;
    this.panelH = this.headerH + this._sectionLabelH + this._sectionPad + gridH + this._sectionPad + 20; // 20 = footer

    // Hit-test state
    this._panelX      = 0;
    this._panelY      = 0;
    this._hoveredSlot = null; // slot id
  }

  toggle() { this.isOpen = !this.isOpen; }
  open()   { this.isOpen = true; }
  close()  { this.isOpen = false; this._hoveredSlot = null; }

  /** Call from InputHandler on mousemove. */
  onMouseMove(sx, sy) {
    if (!this.isOpen) return;
    this._hoveredSlot = this._slotAt(sx, sy);
  }

  /**
   * Call from InputHandler on click.
   * Returns true if click was consumed by this panel.
   */
  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const inside = this._insidePanel(sx, sy);
    if (!inside) return false;

    // Clicking a slot with an item → unequip it
    const slotId = this._slotAt(sx, sy);
    if (slotId) {
      const item = this.player.equipment.unequip(slotId);
      if (item) {
        const overflow = this.player.inventory.addItem(item.id, 1);
        if (overflow > 0) {
          // Inventory full — re-equip
          this.player.equipment.equip(item, this.player.skills);
        }
      }
    }

    return true;
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this._panelX = Math.round((canvasW - this.panelW) / 2);
    this._panelY = Math.round((canvasH - this.panelH) / 2);

    const px = this._panelX;
    const py = this._panelY;

    ctx.save();

    // ── Panel background ──────────────────────────────────────────────────────
    ctx.fillStyle   = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    DrawingUtils.rrect(ctx, px, py, this.panelW, this.panelH, 6);
    ctx.fill();
    ctx.stroke();

    // ── Header ───────────────────────────────────────────────────────────────
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Character', px + this.panelW / 2, py + this.headerH / 2);

    this._divider(ctx, px, py + this.headerH, this.panelW);

    // ── Vertical divider between equipment and stats ──────────────────────────
    const divX = px + this.leftW;
    ctx.strokeStyle = '#c8a45a33';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(divX, py + this.headerH + 4);
    ctx.lineTo(divX, py + this.panelH - 4);
    ctx.stroke();

    // ── Left: Equipment paperdoll ─────────────────────────────────────────────
    const contentY = py + this.headerH;
    this._renderEquipmentSection(ctx, px, contentY);

    // ── Right: Stats ──────────────────────────────────────────────────────────
    this._renderStatsSection(ctx, divX, contentY, canvasW, canvasH);

    // ── Footer hint ───────────────────────────────────────────────────────────
    ctx.fillStyle    = '#555';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[P] close', px + this.panelW / 2, py + this.panelH - 4);

    ctx.restore();
  }

  // ─── Private: Equipment section ───────────────────────────────────────────

  _renderEquipmentSection(ctx, sectionX, sectionY) {
    const cx = sectionX + this.leftW / 2;

    // Section label
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Equipment', cx, sectionY + 6);

    const gridY = sectionY + this._sectionLabelH + this._sectionPad;
    const gridW  = 3 * (this.slotS + this.slotG) - this.slotG;
    const gridX  = sectionX + Math.floor((this.leftW - gridW) / 2);

    for (const def of this._slotLayout) {
      const sx = gridX + def.gridCol * (this.slotS + this.slotG);
      const sy = gridY + def.gridRow * (this.slotS + this.slotG);
      const item     = this.player.equipment.getSlot(def.id);
      const hovered  = this._hoveredSlot === def.id;
      this._drawEquipSlot(ctx, sx, sy, def.id, item, hovered);
    }
  }

  _drawEquipSlot(ctx, x, y, slotId, item, hovered) {
    const s = this.slotS;

    // Background
    ctx.fillStyle = item
      ? (hovered ? 'rgba(200,164,90,0.22)' : 'rgba(255,255,255,0.07)')
      : 'rgba(255,255,255,0.03)';
    DrawingUtils.rrect(ctx, x, y, s, s, 4);
    ctx.fill();

    // Border
    ctx.strokeStyle = hovered && item ? '#c8a45a' : (item ? '#c8a45a77' : '#ffffff18');
    ctx.lineWidth   = 1;
    DrawingUtils.rrect(ctx, x, y, s, s, 4);
    ctx.stroke();

    if (item) {
      // Draw item icon
      const pad = 4;
      item.draw(ctx, x + pad, y + pad, s - pad * 2);
    } else {
      // Slot label hint
      const label = EQUIP_SLOT_LABELS[slotId] ?? slotId;
      ctx.fillStyle    = '#ffffff18';
      ctx.font         = '8px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + s / 2, y + s / 2);
    }

    // Tooltip on hover
    if (hovered && item) {
      this._drawSlotTooltip(ctx, item, x, y);
    }
  }

  _drawSlotTooltip(ctx, item, slotX, slotY) {
    const lines = [item.name, 'Click to unequip'];
    const tipW  = 140;
    const lineH = 16;
    const pad   = 7;
    const tipH  = pad * 2 + lines.length * lineH;

    let tx = slotX + this.slotS + 4;
    let ty = slotY;
    // Keep within panel
    if (tx + tipW > this._panelX + this.panelW - 4) tx = slotX - tipW - 4;

    ctx.fillStyle   = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 1;
    DrawingUtils.rrect(ctx, tx, ty, tipW, tipH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.font      = i === 0 ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.fillStyle = i === 0 ? '#c8a45a' : '#888';
      ctx.fillText(line, tx + pad, ty + pad + i * lineH);
    });
  }

  // ─── Private: Stats section ───────────────────────────────────────────────

  _renderStatsSection(ctx, sectionX, sectionY) {
    const sectionW = this.rightW;
    const cx       = sectionX + sectionW / 2;
    const rowX     = sectionX + 10;
    const rowW     = sectionW - 20;

    // Section label
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Stats', cx, sectionY + 6);

    ctx.fillStyle    = '#ddd';
    ctx.font         = 'bold 10px sans-serif';
    ctx.fillText(`Combat Lv ${this.player.getCombatLevel()}`, cx, sectionY + 20);

    let y = sectionY + this._sectionLabelH + this._sectionPad + 14;

    // ── Equipment bonuses ─────────────────────────────────────────────────────
    ctx.fillStyle    = '#555';
    ctx.font         = 'bold 9px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('EQUIPMENT BONUSES', rowX, y);
    y += 12;

    const bonuses    = this.player.equipment.getBonuses();
    const bonusStats = [
      { label: 'Atk bonus',  value: bonuses.attack   },
      { label: 'Str bonus',  value: bonuses.strength },
      { label: 'Def bonus',  value: bonuses.defence  },
      { label: 'Rng bonus',  value: bonuses.ranged   },
      { label: 'Mage bonus', value: bonuses.magic    },
    ];
    for (const b of bonusStats) {
      this._drawBonusRow(ctx, rowX, y, rowW, b.label, b.value);
      y += 18;
    }

    // Divider
    ctx.strokeStyle = '#ffffff15';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(rowX, y + 3);
    ctx.lineTo(rowX + rowW, y + 3);
    ctx.stroke();
    y += 10;

    // ── Skill levels — 2-column grid ──────────────────────────────────────────
    ctx.fillStyle    = '#555';
    ctx.font         = 'bold 9px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('SKILL LEVELS', rowX, y);
    y += 12;

    const skills    = this.player.skills.all();
    const colW      = Math.floor(rowW / 2);
    const skillRowH = 22;

    skills.forEach((skill, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this._drawStatRow(ctx, rowX + col * colW, y + row * skillRowH, colW - 4, skill);
    });
  }

  _drawBonusRow(ctx, x, y, w, label, value) {
    const sign = value >= 0 ? '+' : '';

    ctx.fillStyle    = '#aaa';
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y);

    ctx.fillStyle = value > 0 ? '#7ab87a' : (value < 0 ? '#e07b54' : '#666');
    ctx.font      = 'bold 11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${sign}${value}`, x + w, y);
  }

  _drawStatRow(ctx, x, y, w, skill) {
    const s    = 14; // icon size
    const iconY = y + 7;

    // Color square icon
    ctx.fillStyle = skill.color;
    DrawingUtils.rrect(ctx, x, iconY, s, s, 2);
    ctx.fill();

    // Skill name
    ctx.fillStyle    = '#ccc';
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(skill.name, x + s + 6, iconY + s / 2);

    // Level (right-aligned)
    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(skill.level, x + w, iconY + s / 2);
  }

  // ─── Private: Hit testing ─────────────────────────────────────────────────

  _insidePanel(sx, sy) {
    return sx >= this._panelX && sx <= this._panelX + this.panelW &&
           sy >= this._panelY && sy <= this._panelY + this.panelH;
  }

  /** Returns the equipment slot id under screen coords, or null. */
  _slotAt(sx, sy) {
    if (!this._insidePanel(sx, sy)) return null;

    const gridY = this._panelY + this.headerH + this._sectionLabelH + this._sectionPad;
    const gridW  = 3 * (this.slotS + this.slotG) - this.slotG;
    const gridX  = this._panelX + Math.floor((this.leftW - gridW) / 2);

    for (const def of this._slotLayout) {
      const slotX = gridX + def.gridCol * (this.slotS + this.slotG);
      const slotY = gridY + def.gridRow * (this.slotS + this.slotG);
      if (sx >= slotX && sx <= slotX + this.slotS &&
          sy >= slotY && sy <= slotY + this.slotS) {
        return def.id;
      }
    }
    return null;
  }

  // ─── Private: Canvas helpers ─────────────────────────────────────────────

  _divider(ctx, x, y, w) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.stroke();
  }
}
