/**
 * InventoryUI — canvas-drawn inventory panel.
 *
 * Toggle open/close with the 'I' key (wired in InputHandler).
 * Renders a 4×7 grid of item slots. Hovering a slot shows a tooltip.
 */
class InventoryUI {
  constructor(inventory, equipment = null) {
    this.inventory   = inventory;
    this.equipment   = equipment; // optional — enables click-to-equip
    this.isOpen      = false;

    // Layout constants
    this.slotSize    = 44;  // px per slot cell
    this.slotGap     = 4;   // gap between cells
    this.panelPad    = 14;  // inner padding
    this.headerH     = 32;  // title bar height
    this.footerH     = 8;   // bottom padding

    const { cols, rows } = inventory;
    this.panelW = cols * (this.slotSize + this.slotGap) - this.slotGap + this.panelPad * 2;
    this.panelH = this.headerH + rows * (this.slotSize + this.slotGap) - this.slotGap
                + this.panelPad + this.footerH;

    this.hoverIndex  = -1;  // slot index mouse is over
    this._panelX     = 0;   // computed each render (depends on canvas size)
    this._panelY     = 0;
  }

  toggle() { this.isOpen = !this.isOpen; }
  open()   { this.isOpen = true; }
  close()  { this.isOpen = false; this.hoverIndex = -1; }

  /** Call from InputHandler mousemove. sx/sy are screen coords. */
  onMouseMove(sx, sy) {
    if (!this.isOpen) return;
    this.hoverIndex = this._slotIndexAt(sx, sy);
  }

  /** Call from InputHandler click — returns true if click was consumed. */
  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const inside = sx >= this._panelX && sx <= this._panelX + this.panelW &&
                   sy >= this._panelY && sy <= this._panelY + this.panelH;
    if (!inside) return false;

    // Click-to-equip: if the clicked item has an equipSlot, equip it
    if (this.equipment) {
      const idx = this._slotIndexAt(sx, sy);
      if (idx >= 0) {
        const slot = this.inventory.getSlot(idx);
        if (slot && !slot.isEmpty && slot.item.equipSlot) {
          const displaced = this.equipment.equip(slot.item);
          this.inventory.removeItem(slot.item.id, 1);
          if (displaced) {
            // Swap displaced item back into inventory
            const overflow = this.inventory.addItem(displaced.id, 1);
            if (overflow > 0) {
              // Inventory full — undo the equip
              this.equipment.unequip(slot.item.equipSlot);
              this.inventory.addItem(slot.item.id, 1);
            }
          }
        }
      }
    }

    return true;
  }

  /** Render — call last so it draws on top of everything. */
  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    // Center the panel on screen
    this._panelX = Math.round((canvasW - this.panelW) / 2);
    this._panelY = Math.round((canvasH - this.panelH) / 2);

    const px = this._panelX;
    const py = this._panelY;

    ctx.save();

    // ── Panel background ──
    ctx.fillStyle   = 'rgba(18, 12, 6, 0.96)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    this._rrect(ctx, px, py, this.panelW, this.panelH, 6);
    ctx.fill();
    ctx.stroke();

    // ── Title ──
    ctx.fillStyle  = '#c8a45a';
    ctx.font       = 'bold 14px sans-serif';
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Inventory', px + this.panelW / 2, py + this.headerH / 2);

    // Title divider
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px + 8, py + this.headerH);
    ctx.lineTo(px + this.panelW - 8, py + this.headerH);
    ctx.stroke();

    // ── Slots ──
    const { cols, rows } = this.inventory;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx  = r * cols + c;
        const slot = this.inventory.getSlot(idx);
        const sx   = px + this.panelPad + c * (this.slotSize + this.slotGap);
        const sy   = py + this.headerH  + this.panelPad + r * (this.slotSize + this.slotGap);

        this._drawSlot(ctx, sx, sy, slot, idx === this.hoverIndex);
      }
    }

    // ── Tooltip ──
    if (this.hoverIndex >= 0) {
      const slot = this.inventory.getSlot(this.hoverIndex);
      if (slot && !slot.isEmpty) {
        const c  = this.hoverIndex % cols;
        const r  = Math.floor(this.hoverIndex / cols);
        const sx = px + this.panelPad + c * (this.slotSize + this.slotGap);
        const sy = py + this.headerH  + this.panelPad + r * (this.slotSize + this.slotGap);
        this._drawTooltip(ctx, slot, sx, sy, canvasW, canvasH);
      }
    }

    ctx.restore();
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _drawSlot(ctx, sx, sy, slot, hovered) {
    const s = this.slotSize;

    // Slot background
    ctx.fillStyle = hovered ? 'rgba(200,164,90,0.18)' : 'rgba(255,255,255,0.05)';
    this._rrect(ctx, sx, sy, s, s, 4);
    ctx.fill();

    // Slot border
    ctx.strokeStyle = hovered ? '#c8a45a' : '#ffffff22';
    ctx.lineWidth   = 1;
    this._rrect(ctx, sx, sy, s, s, 4);
    ctx.stroke();

    if (!slot || slot.isEmpty) return;

    // Draw item icon (leave 4px padding inside slot)
    const pad  = 4;
    slot.item.draw(ctx, sx + pad, sy + pad, s - pad * 2);

    // Quantity badge (bottom-right corner)
    if (slot.quantity > 1) {
      const label = slot.quantity >= 1000
        ? `${(slot.quantity / 1000).toFixed(1)}k`
        : String(slot.quantity);

      ctx.font         = 'bold 10px sans-serif';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'bottom';

      // Shadow for readability
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(label, sx + s - 2 + 1, sy + s - 1 + 1);

      ctx.fillStyle = '#ffff00';
      ctx.fillText(label, sx + s - 2, sy + s - 1);
    }
  }

  _drawTooltip(ctx, slot, slotSx, slotSy, canvasW, canvasH) {
    const item    = slot.item;
    const tipW    = 220;
    const lineH   = 15;
    const tipPad  = 8;
    
    const wrapped = [];
    wrapped.push({ text: item.name, isTitle: true });
    if (item.description) {
      const maxTextW = tipW - tipPad * 2;
      const descLines = this._wrapText(ctx, item.description, maxTextW, '11px sans-serif');
      for (const line of descLines) wrapped.push({ text: line, isTitle: false });
    }
    
    const tipH = tipPad * 2 + wrapped.length * lineH;

    // Position tooltip to the right of the slot, or left if near edge
    let tx = slotSx + this.slotSize + 6;
    let ty = slotSy;
    if (tx + tipW > canvasW - 4) tx = slotSx - tipW - 6;
    if (ty + tipH > canvasH - 4) ty = canvasH - tipH - 4;

    ctx.fillStyle   = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 1;
    this._rrect(ctx, tx, ty, tipW, tipH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    wrapped.forEach((line, i) => {
      ctx.font      = line.isTitle ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.fillStyle = line.isTitle ? '#c8a45a' : '#aaaaaa';
      ctx.fillText(line.text, tx + tipPad, ty + tipPad + i * lineH);
    });
  }

  _wrapText(ctx, text, maxWidth, font) {
    ctx.save();
    if (font) ctx.font = font;

    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
    ctx.restore();
    return lines;
  }

  /** Returns flat slot index under screen point (sx, sy), or -1 if none. */
  _slotIndexAt(sx, sy) {
    if (!this.isOpen) return -1;
    const px = this._panelX;
    const py = this._panelY;
    const originX = px + this.panelPad;
    const originY = py + this.headerH + this.panelPad;
    const step    = this.slotSize + this.slotGap;

    const relX = sx - originX;
    const relY = sy - originY;
    if (relX < 0 || relY < 0) return -1;

    const c = Math.floor(relX / step);
    const r = Math.floor(relY / step);

    if (c < 0 || c >= this.inventory.cols) return -1;
    if (r < 0 || r >= this.inventory.rows) return -1;

    // Ensure cursor is actually inside the slot (not in the gap)
    const localX = relX - c * step;
    const localY = relY - r * step;
    if (localX > this.slotSize || localY > this.slotSize) return -1;

    return r * this.inventory.cols + c;
  }

  _rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
