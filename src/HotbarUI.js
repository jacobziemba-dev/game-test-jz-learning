class HotbarUI {
  constructor(slots = []) {
    this.slots = slots;
    this.isOpen = true;

    this.slotW = 92;
    this.slotH = 34;
    this.gap = 6;

    this._x = 0;
    this._y = 0;
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

    const totalW = this.slots.length * this.slotW + (this.slots.length - 1) * this.gap;
    this._x = Math.round((canvasW - totalW) / 2);
    this._y = canvasH - this.slotH - 18;

    ctx.save();

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const x = this._x + i * (this.slotW + this.gap);
      const y = this._y;
      const hovered = i === this._hoverSlot;

      ctx.fillStyle = hovered ? 'rgba(200,164,90,0.22)' : 'rgba(18,12,6,0.9)';
      ctx.strokeStyle = hovered ? '#c8a45a' : '#ffffff20';
      ctx.lineWidth = 1;
      this._rrect(ctx, x, y, this.slotW, this.slotH, 5);
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
    const totalW = this.slots.length * this.slotW + (this.slots.length - 1) * this.gap;
    if (sx < this._x || sx > this._x + totalW) return -1;
    if (sy < this._y || sy > this._y + this.slotH) return -1;

    for (let i = 0; i < this.slots.length; i++) {
      const x = this._x + i * (this.slotW + this.gap);
      if (sx >= x && sx <= x + this.slotW) return i;
    }
    return -1;
  }

  _indexFromKey(key) {
    const map = ['1', '2', '3', '4', '5', '6', '7', '8'];
    return map.indexOf(key);
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
