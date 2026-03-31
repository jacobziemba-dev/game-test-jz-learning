class LootFilterUI {
  constructor(player) {
    this.player = player;
    this.isOpen = false;

    this.panelW = 260;
    this.panelH = 240;
    this.headerH = 32;

    this._px = 0;
    this._py = 0;

    this._rows = [
      { id: 'enabled', label: 'Enable filter', type: 'toggle' },
      { id: 'common', label: 'Allow Common', type: 'rarity' },
      { id: 'uncommon', label: 'Allow Uncommon', type: 'rarity' },
      { id: 'rare', label: 'Allow Rare', type: 'rarity' },
      { id: 'epic', label: 'Allow Epic', type: 'rarity' },
      { id: 'unique', label: 'Allow Unique', type: 'rarity' },
    ];
  }

  toggle() { this.isOpen = !this.isOpen; }
  close() { this.isOpen = false; }
  onMouseMove() {}

  onClick(sx, sy) {
    if (!this.isOpen) return false;

    const inside = sx >= this._px && sx <= this._px + this.panelW &&
      sy >= this._py && sy <= this._py + this.panelH;
    if (!inside) return false;

    const rowH = 28;
    const startY = this._py + this.headerH + 12;
    for (let i = 0; i < this._rows.length; i++) {
      const row = this._rows[i];
      const y = startY + i * rowH;
      if (sy < y || sy > y + rowH - 2) continue;

      if (row.type === 'toggle') {
        this.player.toggleLootFilterEnabled();
        return true;
      }

      const allow = this.player.lootFilter.allow[row.id] ?? true;
      this.player.setLootRarityAllowed(row.id, !allow);
      return true;
    }

    return true;
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this._px = canvasW - this.panelW - 14;
    this._py = Math.round((canvasH - this.panelH) / 2);

    ctx.save();

    ctx.fillStyle = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth = 2;
    DrawingUtils.rrect(ctx, this._px, this._py, this.panelW, this.panelH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loot Filter', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._px, this._py + this.headerH, this.panelW);

    const rowH = 28;
    const startY = this._py + this.headerH + 12;
    for (let i = 0; i < this._rows.length; i++) {
      const row = this._rows[i];
      const y = startY + i * rowH;

      const enabled = row.type === 'toggle'
        ? this.player.lootFilter.enabled
        : (this.player.lootFilter.allow[row.id] ?? true);

      ctx.fillStyle = enabled ? 'rgba(129,199,132,0.18)' : 'rgba(255,255,255,0.04)';
      DrawingUtils.rrect(ctx, this._px + 10, y, this.panelW - 20, rowH - 4, 4);
      ctx.fill();

      ctx.strokeStyle = enabled ? '#81c78466' : '#ffffff20';
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, this._px + 10, y, this.panelW - 20, rowH - 4, 4);
      ctx.stroke();

      ctx.fillStyle = row.type === 'rarity' ? ItemRegistry.getRarityColor(row.id) : '#f0f0f0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.label, this._px + 18, y + (rowH - 4) / 2);

      ctx.fillStyle = enabled ? '#81c784' : '#9e9e9e';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(enabled ? 'ON' : 'OFF', this._px + this.panelW - 18, y + (rowH - 4) / 2);
    }

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[F] close', this._px + this.panelW / 2, this._py + this.panelH - 5);

    ctx.restore();
  }

  _divider(ctx, x, y, w) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.stroke();
  }

}
