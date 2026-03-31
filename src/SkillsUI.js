/**
 * SkillsUI — canvas panel showing all player skills with levels and XP bars.
 * Toggle with the 'K' key.
 */
class SkillsUI {
  constructor(skillManager) {
    this.skillManager = skillManager;
    this.isOpen       = false;
    this.panelW       = 220;
    this.rowH         = 48;
    this.headerH      = 32;
    this.panelPad     = 12;
  }

  toggle() { this.isOpen = !this.isOpen; }
  close()  { this.isOpen = false; }

  /** Returns true if click is inside the panel (consumed). */
  onClick(sx, sy) {
    if (!this.isOpen) return false;
    return sx >= this._px && sx <= this._px + this.panelW &&
           sy >= this._py && sy <= this._py + this._panelH();
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    const skills  = this.skillManager.all();
    const panelH  = this._panelH(skills.length);
    // Position to the left of center, or wherever there's space
    this._px = canvasW - this.panelW - 16;
    this._py = Math.round((canvasH - panelH) / 2);

    ctx.save();
    this._drawPanel(ctx, this._px, this._py, this.panelW, panelH);

    // Title
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Skills', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._px, this._py + this.headerH, this.panelW);

    // Skill rows
    skills.forEach((skill, i) => {
      const ry = this._py + this.headerH + this.panelPad + i * this.rowH;
      this._drawSkillRow(ctx, skill, this._px + this.panelPad, ry, this.panelW - this.panelPad * 2);
    });

    // Footer hint
    ctx.fillStyle    = '#555';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[K] close', this._px + this.panelW / 2, this._py + panelH - 4);

    ctx.restore();
  }

  _panelH(count) {
    const skills = count ?? this.skillManager.all().length;
    return this.headerH + this.panelPad + skills * this.rowH + 18;
  }

  _drawSkillRow(ctx, skill, x, y, w) {
    const barH = 7;
    const progress = skill.progressToNextLevel;

    // Skill name + level badge
    ctx.fillStyle    = skill.color;
    ctx.font         = 'bold 12px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(skill.name, x, y + 2);

    // Level badge (right-aligned)
    const badge = `Lv. ${skill.level}`;
    ctx.font      = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(badge, x + w, y + 2);

    // XP info
    const xpText = skill.level < 99
      ? `${skill.xpInCurrentLevel.toLocaleString()} / ${skill.xpToNextLevel.toLocaleString()} XP`
      : `${skill.xp.toLocaleString()} XP (MAX)`;
    ctx.fillStyle    = '#888';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(xpText, x, y + 18);

    // XP bar track
    const barY = y + this.rowH - barH - 4;
    ctx.fillStyle = '#333';
    this._rrect(ctx, x, barY, w, barH, 2);
    ctx.fill();

    // XP bar fill
    ctx.fillStyle = skill.color;
    this._rrect(ctx, x, barY, w * Math.min(progress, 1), barH, 2);
    ctx.fill();
  }

  _drawPanel(ctx, x, y, w, h) {
    ctx.fillStyle   = 'rgba(18,12,6,0.96)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    this._rrect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
  }

  _divider(ctx, x, y, w) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.stroke();
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
