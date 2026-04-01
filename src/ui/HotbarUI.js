class HotbarUI {
  constructor(slots = []) {
    this.slots = slots;
    this.isOpen = true;

    this.slotW = 92;
    this.slotH = 34;
    this.gap = 6;

    this._slotsLayout = []; // Cache bounds of each slot {x, y, w, h}
    this._hoverSlot = -1;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  onMouseMove(sx, sy) {
    if (!this.isOpen) return;
    this._hoverSlot = this._slotAt(sx, sy);
  }

  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const idx = this._slotAt(sx, sy);
    if (idx < 0) return false;

    this.activateSlot(idx);
    return true;
  }

  onKey(key) {
    if (!this.isOpen) return false;
    const idx = this._indexFromKey(key);
    if (idx < 0) return false;

    this.activateSlot(idx);
    return true;
  }

  activateSlot(idx) {
    const slot = this.slots[idx];
    if (!slot) return;
    slot.action?.();
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen || this.slots.length === 0) return;

    this._slotsLayout = [];
    ctx.save();

    // Determine safe margin and calculate items per row
    const sideMargin = 12;
    const maxAvailableWidth = canvasW - (sideMargin * 2);

    // We want as many items per row as will fit, up to the total amount
    let slotsPerRow = Math.floor((maxAvailableWidth + this.gap) / (this.slotW + this.gap));
    if (slotsPerRow < 1) slotsPerRow = 1;
    if (slotsPerRow > this.slots.length) slotsPerRow = this.slots.length;

    // Number of rows required
    const rows = Math.ceil(this.slots.length / slotsPerRow);

    // Total height of the entire hotbar block
    const blockHeight = (rows * this.slotH) + ((rows - 1) * this.gap);
    const startY = canvasH - blockHeight - 18;

    for (let i = 0; i < this.slots.length; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;

      // Calculate how many items are actually in THIS row (last row might be shorter)
      const itemsInThisRow = Math.min(slotsPerRow, this.slots.length - (row * slotsPerRow));
      const rowWidth = (itemsInThisRow * this.slotW) + ((itemsInThisRow - 1) * this.gap);

      const startX = Math.round((canvasW - rowWidth) / 2);

      const x = startX + (col * (this.slotW + this.gap));
      const y = startY + (row * (this.slotH + this.gap));

      this._slotsLayout.push({ x, y, w: this.slotW, h: this.slotH });

      const slot = this.slots[i];
      const hovered = i === this._hoverSlot;

      ctx.fillStyle = hovered ? 'rgba(200,164,90,0.22)' : 'rgba(18,12,6,0.9)';
      ctx.strokeStyle = hovered ? '#c8a45a' : '#ffffff20';
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, x, y, this.slotW, this.slotH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c8a45a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${slot.key}`, x + 6, y + 4);

      ctx.fillStyle = '#f1f1f1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = typeof slot.label === 'function' ? slot.label() : slot.label;
      ctx.fillText(label, x + this.slotW / 2 + 6, y + this.slotH / 2 + 1);
    }

    ctx.restore();
  }

  _slotAt(sx, sy) {
    for (let i = 0; i < this._slotsLayout.length; i++) {
      const rect = this._slotsLayout[i];
      if (sx >= rect.x && sx <= rect.x + rect.w && sy >= rect.y && sy <= rect.y + rect.h) {
        return i;
      }
    }
    return -1;
  }

  _indexFromKey(key) {
    const map = ['1', '2', '3', '4', '5', '6', '7', '8'];
    return map.indexOf(key);
  }
}
