/**
 * UI — always-visible HUD (skill bar, keybind hints) + level-up toast notifications.
 *
 * Level-up toasts are queued externally via ui.pushLevelUp(skillName, level).
 */
class UI {
  constructor() {
    this._toasts = []; // [{ text, ttl, maxTtl }]
  }

  /** Call this when a level-up event fires (from Game.js polling player.skills.popLevelUps()). */
  pushLevelUp(skillName, level) {
    this._toasts.push({
      text:   `⬆ ${skillName} level up! (${level})`,
      ttl:    3.5,
      maxTtl: 3.5,
    });
    // Cap to 4 simultaneous toasts
    if (this._toasts.length > 4) this._toasts.shift();
  }

  update(dt) {
    for (const t of this._toasts) t.ttl -= dt;
    this._toasts = this._toasts.filter(t => t.ttl > 0);
  }

  render(ctx, player) {
    this._renderSkillBar(ctx, player);
    this._renderKeybindHints(ctx, player);
    this._renderToasts(ctx);
  }

  _renderSkillBar(ctx, player) {
    const skill   = player.skills.getSkill('woodcutting');
    if (!skill) return;

    const padding = 12;
    const panelX  = padding;
    const panelY  = padding;
    const panelW  = 190;
    const panelH  = 68;

    ctx.save();
    ctx.fillStyle   = 'rgba(0,0,0,0.65)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth   = 1;
    this._rrect(ctx, panelX, panelY, panelW, panelH, 6);
    ctx.fill();
    ctx.stroke();

    // Skill name + level
    ctx.fillStyle    = skill.color;
    ctx.font         = 'bold 12px monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`🪓 ${skill.name}`, panelX + 10, panelY + 8);

    ctx.fillStyle = '#fff';
    ctx.font      = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Lv. ${skill.level}`, panelX + panelW - 10, panelY + 8);

    // XP bar
    const barX = panelX + 10;
    const barY = panelY + 26;
    const barW = panelW - 20;
    const barH = 7;

    ctx.fillStyle = '#2a2a2a';
    this._rrect(ctx, barX, barY, barW, barH, 2);
    ctx.fill();

    ctx.fillStyle = skill.color;
    this._rrect(ctx, barX, barY, barW * skill.progressToNextLevel, barH, 2);
    ctx.fill();

    // XP text
    const xpText = skill.level < 99
      ? `${skill.xpInCurrentLevel} / ${skill.xpToNextLevel} XP`
      : 'MAX';
    ctx.fillStyle    = '#999';
    ctx.font         = '9px monospace';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(xpText, barX, barY + barH + 4);

    // HP display for combat testing
    ctx.fillStyle = '#ff8a80';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(
      `HP ${player.currentHitpoints}/${player.maxHitpoints}`,
      panelX + panelW - 10,
      barY + barH + 4
    );

    ctx.restore();
  }

  _renderKeybindHints(ctx, player) {
    const hints = ['[I] Inventory', '[C] Crafting', '[K] Skills', '[P] Character', '[H] Help'];
    ctx.save();
    ctx.fillStyle    = 'rgba(255,255,255,0.3)';
    ctx.font         = '10px monospace';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(hints.join('   '), ctx.canvas.width - 12, ctx.canvas.height - 12);
    ctx.restore();
  }

  _renderToasts(ctx) {
    if (this._toasts.length === 0) return;
    ctx.save();

    const toastW = 260;
    const toastH = 32;
    const gap    = 6;
    const cx     = ctx.canvas.width / 2;
    const baseY  = 70;

    this._toasts.forEach((toast, i) => {
      const fade = Math.min(1, toast.ttl * 1.5, (toast.maxTtl - toast.ttl) * 4);
      const y    = baseY + i * (toastH + gap);

      ctx.globalAlpha = fade;
      ctx.fillStyle   = 'rgba(20,12,4,0.92)';
      ctx.strokeStyle = '#c8a45a';
      ctx.lineWidth   = 1.5;
      this._rrect(ctx, cx - toastW / 2, y, toastW, toastH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle    = '#ffd54f';
      ctx.font         = 'bold 13px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(toast.text, cx, y + toastH / 2);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  _rrect(ctx, x, y, w, h, r) {
    if (w <= 0) return;
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
