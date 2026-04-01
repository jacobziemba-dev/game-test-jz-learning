class SkillJournalUI {
  constructor(skillManager) {
    this.skillManager = skillManager;
    this.isOpen = false;

    // Dimensions determined dynamically in render
    this.panelW = 560;
    this.panelH = 430;
    this.headerH = 34;

    this._px = 0;
    this._py = 0;
    this._selectedSkillId = 'attack';
  }

  toggle() { this.isOpen = !this.isOpen; }
  close() { this.isOpen = false; }

  onMouseMove() {}

  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const inside = sx >= this._px && sx <= this._px + this.panelW &&
      sy >= this._py && sy <= this._py + this.panelH;
    if (!inside) return false;

    const isPortrait = this.panelH > this.panelW;
    const listX = this._px + 12;
    const listY = this._py + this.headerH + 10;
    const listW = isPortrait ? this.panelW - 24 : 190;
    const rowH = 28;
    const skills = this.skillManager.all();

    for (let i = 0; i < skills.length; i++) {
      const y = listY + i * rowH;
      if (sx >= listX && sx <= listX + listW && sy >= y && sy <= y + rowH - 2) {
        this._selectedSkillId = skills[i].id;
        return true;
      }
    }

    return true;
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this.panelW = Math.min(canvasW - 16, 560);
    this.panelH = Math.min(canvasH - 16, 430);

    this._px = Math.round((canvasW - this.panelW) / 2);
    this._py = Math.round((canvasH - this.panelH) / 2);

    ctx.save();

    ctx.fillStyle = 'rgba(18,12,6,0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth = 2;
    DrawingUtils.rrect(ctx, this._px, this._py, this.panelW, this.panelH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Skill Journal', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._px, this._py + this.headerH, this.panelW);

    this._renderSkillList(ctx);
    this._renderMilestonePane(ctx);

    ctx.fillStyle = '#555';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[J] close', this._px + this.panelW / 2, this._py + this.panelH - 5);

    ctx.restore();
  }

  _renderSkillList(ctx) {
    const isPortrait = this.panelH > this.panelW;
    const listX = this._px + 12;
    const listY = this._py + this.headerH + 10;
    const listW = isPortrait ? this.panelW - 24 : 190;
    const rowH = 28;

    const skills = this.skillManager.all();

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    DrawingUtils.rrect(ctx, listX - 2, listY - 2, listW + 4, skills.length * rowH + 4, 4);
    ctx.fill();

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const y = listY + i * rowH;
      const selected = skill.id === this._selectedSkillId;

      if (selected) {
        ctx.fillStyle = 'rgba(129,199,132,0.22)';
        DrawingUtils.rrect(ctx, listX, y, listW, rowH - 2, 3);
        ctx.fill();
      }

      ctx.fillStyle = skill.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(skill.name, listX + 8, y + rowH / 2);

      ctx.fillStyle = '#ddd';
      ctx.textAlign = 'right';
      ctx.fillText(`Lv ${skill.level}`, listX + listW - 8, y + rowH / 2);
    }
  }

  _renderMilestonePane(ctx) {
    const isPortrait = this.panelH > this.panelW;
    const paneX = isPortrait ? this._px + 12 : this._px + 220;
    const paneY = isPortrait ? this._py + this.headerH + 10 + (this.skillManager.all().length * 28) + 10 : this._py + this.headerH + 10;
    const paneW = isPortrait ? this.panelW - 24 : this.panelW - 232;
    const paneH = this.panelH - (paneY - this._py) - 18;

    const skill = this.skillManager.getSkill(this._selectedSkillId);
    if (!skill) return;

    const milestones = SkillUnlockRegistry.milestonesFor(skill.id);

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    DrawingUtils.rrect(ctx, paneX, paneY, paneW, paneH, 4);
    ctx.fill();

    ctx.fillStyle = skill.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${skill.name} Milestones`, paneX + 10, paneY + 8);

    let y = paneY + 34;
    for (const milestone of milestones) {
      const unlocked = this.skillManager.isUnlockMilestoneReached(skill.id, milestone.level);
      const isNext = !unlocked && skill.level < milestone.level &&
        milestones.find(m => !this.skillManager.isUnlockMilestoneReached(skill.id, m.level))?.level === milestone.level;

      const cardH = 52;
      ctx.fillStyle = unlocked ? 'rgba(129,199,132,0.18)' : (isNext ? 'rgba(100,181,246,0.14)' : 'rgba(255,255,255,0.04)');
      DrawingUtils.rrect(ctx, paneX + 10, y, paneW - 20, cardH, 4);
      ctx.fill();

      ctx.strokeStyle = unlocked ? '#81c78466' : (isNext ? '#64b5f666' : '#ffffff22');
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, paneX + 10, y, paneW - 20, cardH, 4);
      ctx.stroke();

      ctx.fillStyle = unlocked ? '#81c784' : (isNext ? '#64b5f6' : '#9e9e9e');
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Lv ${milestone.level} - ${milestone.title}`, paneX + 18, y + 7);

      ctx.fillStyle = '#c7c7c7';
      ctx.font = '10px sans-serif';
      ctx.fillText(milestone.desc, paneX + 18, y + 24);

      y += cardH + 7;
      if (y + cardH > paneY + paneH - 4) break;
    }
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
