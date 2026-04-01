class HotbarUI {
  constructor(slots = []) {
    this.slots = slots;
    this.isOpen = true;

    // We use a getter now so it responds to resize/orientation correctly
    this.baseSlotW = 92;
    this.baseSlotH = 34;
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
    const isMobile = window.game && window.game.isMobile;
    const slotW = isMobile ? Math.min(110, Math.floor((canvasW - 24) / 4) - this.gap) : 92;
    const slotH = isMobile ? 42 : 34;

    const sideMargin = 12;
    const maxAvailableWidth = canvasW - (sideMargin * 2);

    // Force max 4 columns on mobile so it forms a nice 4x2 grid, or let it flow
    let maxCols = isMobile ? 4 : this.slots.length;
    let slotsPerRow = Math.floor((maxAvailableWidth + this.gap) / (slotW + this.gap));
    if (slotsPerRow > maxCols) slotsPerRow = maxCols;
    if (slotsPerRow < 1) slotsPerRow = 1;
    if (slotsPerRow > this.slots.length) slotsPerRow = this.slots.length;

    // Number of rows required
    const rows = Math.ceil(this.slots.length / slotsPerRow);

    // Total height of the entire hotbar block
    const blockHeight = (rows * slotH) + ((rows - 1) * this.gap);
    const startY = canvasH - blockHeight - 18;

    for (let i = 0; i < this.slots.length; i++) {
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;

      // Calculate how many items are actually in THIS row (last row might be shorter)
      const itemsInThisRow = Math.min(slotsPerRow, this.slots.length - (row * slotsPerRow));
      const rowWidth = (itemsInThisRow * slotW) + ((itemsInThisRow - 1) * this.gap);

      const startX = Math.round((canvasW - rowWidth) / 2);

      const x = startX + (col * (slotW + this.gap));
      const y = startY + (row * (slotH + this.gap));

      this._slotsLayout.push({ x, y, w: slotW, h: slotH });

      const slot = this.slots[i];
      const hovered = i === this._hoverSlot;

      ctx.fillStyle = hovered ? 'rgba(200,164,90,0.22)' : 'rgba(18,12,6,0.9)';
      ctx.strokeStyle = hovered ? '#c8a45a' : '#ffffff20';
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, x, y, slotW, slotH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c8a45a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${slot.key}`, x + 6, y + 4);

      ctx.fillStyle = '#f1f1f1';
      // scale font slightly if slot is tiny
      ctx.font = slotW < 70 ? '8px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = typeof slot.label === 'function' ? slot.label() : slot.label;
      ctx.fillText(label, x + slotW / 2 + 6, y + slotH / 2 + 1);
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
