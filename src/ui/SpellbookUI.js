class SpellbookUI {
  constructor(player) {
    this.player = player;
    this.isVisible = false;
    
    // Grid settings
    this.width = 340;
    this.height = 420;
    this.cols = 5;
    this.slotSize = 48;
    this.slotGap = 10;
    
    this.hoverIndex = -1;
    this._panelX = 0;
    this._panelY = 0;

    this.spells = [
      {
        id: 'wind_strike',
        name: 'Wind Strike',
        description: 'A basic magic attack.',
        levelReq: 1,
        maxHit: 2,
        runes: [
          { id: 'air_rune', qty: 1 },
          { id: 'mind_rune', qty: 1 },
        ],
        drawIcon: (ctx, x, y, size) => {
          const cx = x + size / 2, cy = y + size / 2, r = size * 0.4;
          ctx.strokeStyle = '#e0f7fa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 2.8);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(cx, cy, r*0.3, 0, Math.PI*2); ctx.fill();
        }
      },
      {
        id: 'water_strike',
        name: 'Water Strike',
        description: 'A basic magic attack.',
        levelReq: 5,
        maxHit: 4,
        runes: [
          { id: 'water_rune', qty: 1 },
          { id: 'mind_rune', qty: 1 },
        ],
        drawIcon: (ctx, x, y, size) => {
          const cx = x + size / 2, cy = y + size / 2, r = size * 0.4;
          ctx.fillStyle = '#42a5f5';
          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          ctx.arc(cx, cy + r * 0.2, r * 0.6, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
        }
      },
    ];
  }

  toggle() {
    this.isVisible = !this.isVisible;
    if (!this.isVisible) this.hoverIndex = -1;
  }

  update(dt) {}
  
  onMouseMove(sx, sy) {
    if (!this.isVisible) return;
    this.hoverIndex = this._slotIndexAt(sx, sy);
  }

  onClick(sx, sy) {
    if (!this.isVisible) return false;
    if (sx < this._panelX || sx > this._panelX + this.width || sy < this._panelY || sy > this._panelY + this.height) {
      this.isVisible = false;
      this.hoverIndex = -1;
      return true; // Click outside panel consumes click and closes it
    }

    const idx = this._slotIndexAt(sx, sy);
    if (idx >= 0 && idx < this.spells.length) {
      const spell = this.spells[idx];
      const hasLevel = this.player.skills.getLevel('magic') >= spell.levelReq;
      if (hasLevel) {
        this.player.activeSpell = spell;
        this.player.combatStyle = 'magic';
      }
    }
    return true; // Click inside panel consumes click
  }

  _slotIndexAt(sx, sy) {
    const padX = 20;
    const startY = 60;
    const originX = this._panelX + padX;
    const originY = this._panelY + startY;
    const step = this.slotSize + this.slotGap;

    const relX = sx - originX;
    const relY = sy - originY;
    if (relX < 0 || relY < 0) return -1;
    
    // total rows we might have
    const rows = Math.ceil(this.spells.length / this.cols) + 2; 

    const c = Math.floor(relX / step);
    const r = Math.floor(relY / step);

    if (c >= this.cols || r >= rows) return -1;
    
    const localX = relX - c * step;
    const localY = relY - r * step;
    if (localX > this.slotSize || localY > this.slotSize) return -1; // clicking the gap

    return r * this.cols + c;
  }

  render(ctx, screenWidth, screenHeight) {
    if (!this.isVisible) return;

    this._panelX = (screenWidth - this.width) / 2;
    this._panelY = (screenHeight - this.height) / 2;
    const px = this._panelX;
    const py = this._panelY;

    // Panel background
    DrawingUtils.rrect(ctx, px, py, this.width, this.height, 8);
    ctx.fillStyle = 'rgba(18, 12, 6, 0.96)';
    ctx.fill();
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Spellbook', px + this.width / 2, py + 16);

    ctx.fillStyle = '#757575';
    ctx.font = '12px monospace';
    ctx.fillText('Click a spell to autocast', px + this.width / 2, py + 36);

    // Title divider
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 20, py + 52);
    ctx.lineTo(px + this.width - 20, py + 52);
    ctx.stroke();

    const startY = py + 60;
    const padX = 20;

    for (let i = 0; i < this.spells.length; i++) {
      const spell = this.spells[i];
      const c = i % this.cols;
      const r = Math.floor(i / this.cols);
      
      const cx = px + padX + c * (this.slotSize + this.slotGap);
      const cy = startY + r * (this.slotSize + this.slotGap);

      const hasLevel = this.player.skills.getLevel('magic') >= spell.levelReq;
      let hasRunes = true;
      if (this.player.combatStyle === 'magic') {
          for (const rune of spell.runes) {
            if (this.player.inventory.countItem(rune.id) < rune.qty) {
              hasRunes = false;
            }
          }
      } else {
          for (const rune of spell.runes) {
            if (this.player.inventory.countItem(rune.id) < rune.qty) {
              hasRunes = false;
            }
          }
      }
      
      // If we don't have level or runes, dim it
      const canCast = hasLevel && hasRunes;
      const isHovered = (i === this.hoverIndex);
      const isActive = (this.player.activeSpell?.id === spell.id);

      // Slot background
      if (isActive) {
        ctx.fillStyle = 'rgba(100, 181, 246, 0.2)';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(200, 164, 90, 0.18)';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      }
      DrawingUtils.rrect(ctx, cx, cy, this.slotSize, this.slotSize, 4);
      ctx.fill();

      // Slot border
      ctx.strokeStyle = isActive ? '#64b5f6' : (isHovered ? '#c8a45a' : '#ffffff22');
      ctx.lineWidth = isActive ? 2 : 1;
      DrawingUtils.rrect(ctx, cx, cy, this.slotSize, this.slotSize, 4);
      ctx.stroke();

      // Draw Icon
      ctx.save();
      // Only 30% opacity if lack runes or level
      if (!hasLevel || !hasRunes) ctx.globalAlpha = 0.3;
      
      if (spell.drawIcon) {
        spell.drawIcon(ctx, cx, cy, this.slotSize);
      }
      ctx.restore();
    }

    // Draw Tooltip last so it overlays
    if (this.hoverIndex >= 0 && this.hoverIndex < this.spells.length) {
      const spell = this.spells[this.hoverIndex];
      const c = this.hoverIndex % this.cols;
      const r = Math.floor(this.hoverIndex / this.cols);
      const cx = px + padX + c * (this.slotSize + this.slotGap);
      const cy = startY + r * (this.slotSize + this.slotGap);
      this._drawTooltip(ctx, spell, cx, cy, screenWidth, screenHeight);
    }
  }

  _drawTooltip(ctx, spell, slotSx, slotSy, canvasW, canvasH) {
    const tipW = 200;
    const padding = 8;
    const lineH = 16;
    let requiredLines = 2 + spell.runes.length; // name, levelreq, runes
    
    const tipH = padding * 2 + requiredLines * lineH;

    let tx = slotSx + this.slotSize + 6;
    let ty = slotSy;
    if (tx + tipW > canvasW - 4) tx = slotSx - tipW - 6;
    if (ty + tipH > canvasH - 4) ty = canvasH - tipH - 4;

    ctx.fillStyle   = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 1;
    DrawingUtils.rrect(ctx, tx, ty, tipW, tipH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';

    // Title
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(spell.name, tx + padding, ty + padding);

    // Level Req
    const hasLevel = this.player.skills.getLevel('magic') >= spell.levelReq;
    ctx.fillStyle = hasLevel ? '#c8a45a' : '#e53935';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Level ${spell.levelReq} Magic`, tx + padding, ty + padding + lineH);

    // Runes
    for (let i = 0; i < spell.runes.length; i++) {
      const rune = spell.runes[i];
      const item = ItemRegistry.get(rune.id); // Assuming ItemRegistry is global
      const hasQty = this.player.inventory.countItem(rune.id);
      const name = item ? item.name : rune.id;
      
      ctx.fillStyle = (hasQty >= rune.qty) ? '#81c784' : '#e53935';
      ctx.fillText(`${rune.qty} ${name}`, tx + padding, ty + padding + lineH * 2 + i * lineH);
    }
  }
}
