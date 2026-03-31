/**
 * HelpUI — Controls reference overlay (toggle with 'H').
 *
 * Shows all keyboard shortcuts and mouse controls in a simple panel.
 */
class HelpUI {
  constructor() {
    this.isOpen = false;

    this._panelW = 300;
    this._headerH = 32;
    this._sectionLabelH = 18;
    this._sectionPad = 8;
    this._rowH = 20;
    this._footerH = 20;

    this._keybinds = [
      { key: 'I',      desc: 'Inventory' },
      { key: 'C',      desc: 'Crafting' },
      { key: 'K',      desc: 'Skills' },
      { key: 'J',      desc: 'Skill Journal (unlocks book)' },
      { key: 'F',      desc: 'Loot filter panel' },
      { key: 'P',      desc: 'Character (equipment + stats)' },
      { key: 'H',      desc: 'Help (this panel)' },
      { key: '1..8',   desc: 'Hotbar actions' },
      { key: 'B',      desc: 'Toggle hotbar' },
      { key: 'O',      desc: 'Manual save' },
      { key: 'L',      desc: 'Load latest save' },
      { key: 'Escape', desc: 'Close all panels' },
    ];

    this._mouseControls = [
      { key: 'Left click',  desc: 'Walk / Attack / Gather / Take top loot' },
      { key: 'Right click', desc: 'Context menu (loot and trading)' },
    ];

    // Compute panel height
    const kbRows    = this._keybinds.length;
    const mouseRows = this._mouseControls.length;
    this._panelH =
      this._headerH +
      this._sectionLabelH + this._sectionPad + kbRows * this._rowH + this._sectionPad +
      this._sectionLabelH + this._sectionPad + mouseRows * this._rowH + this._sectionPad +
      this._footerH;

    this._panelX = 0;
    this._panelY = 0;
  }

  toggle() { this.isOpen = !this.isOpen; }
  open()   { this.isOpen = true; }
  close()  { this.isOpen = false; }

  /** Returns true if click was consumed. */
  onClick(sx, sy) {
    if (!this.isOpen) return false;
    return this._inside(sx, sy);
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this._panelX = Math.round((canvasW - this._panelW) / 2);
    this._panelY = Math.round((canvasH - this._panelH) / 2);

    const px = this._panelX;
    const py = this._panelY;
    const pw = this._panelW;

    ctx.save();

    // Background
    ctx.fillStyle   = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    DrawingUtils.rrect(ctx, px, py, pw, this._panelH, 6);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Controls', px + pw / 2, py + this._headerH / 2);

    this._divider(ctx, px, py + this._headerH, pw);

    let y = py + this._headerH;

    // Keyboard section
    y = this._renderSection(ctx, px, y, pw, 'KEYBOARD', this._keybinds);

    // Thin divider between sections
    ctx.strokeStyle = '#ffffff15';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(px + 14, y);
    ctx.lineTo(px + pw - 14, y);
    ctx.stroke();

    // Mouse section
    this._renderSection(ctx, px, y, pw, 'MOUSE', this._mouseControls);

    // Footer
    ctx.fillStyle    = '#555';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[H] close', px + pw / 2, py + this._panelH - 4);

    ctx.restore();
  }

  _renderSection(ctx, px, startY, pw, label, rows) {
    let y = startY + this._sectionLabelH / 2;

    // Section label
    ctx.fillStyle    = '#555';
    ctx.font         = 'bold 9px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, px + 14, y + 4);

    y = startY + this._sectionLabelH + this._sectionPad;

    const keyColW  = 70;
    const keyX     = px + 14;
    const descX    = keyX + keyColW;

    for (const row of rows) {
      const midY = y + this._rowH / 2;

      // Key badge
      ctx.fillStyle    = 'rgba(255,255,255,0.08)';
      ctx.strokeStyle  = '#ffffff22';
      ctx.lineWidth    = 1;
      const badgeW     = ctx.measureText(row.key).width + 14;
      DrawingUtils.rrect(ctx, keyX, y + 3, badgeW, this._rowH - 6, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle    = '#c8a45a';
      ctx.font         = 'bold 10px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.key, keyX + badgeW / 2, midY);

      // Description
      ctx.fillStyle    = '#ccc';
      ctx.font         = '11px sans-serif';
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.desc, descX, midY);

      y += this._rowH;
    }

    return y + this._sectionPad;
  }

  _inside(sx, sy) {
    return sx >= this._panelX && sx <= this._panelX + this._panelW &&
           sy >= this._panelY && sy <= this._panelY + this._panelH;
  }

  _divider(ctx, x, y, w) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.stroke();
  }
}
