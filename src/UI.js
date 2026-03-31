/**
 * UI — always-visible HUD (skill bar, keybind hints) + level-up toast notifications.
 *
 * Level-up toasts are queued externally via ui.pushLevelUp(skillName, level).
 */
class UI {
  constructor() {
    this._toasts = []; // [{ text, ttl, maxTtl }]
    this._saveStatus = {
      text: 'Autosave active',
      color: '#9e9e9e',
      ttl: 0,
      maxTtl: 0,
    };
  }

  /** Call this when a level-up event fires (from Game.js polling player.skills.popLevelUps()). */
  pushLevelUp(skillName, level) {
    this._toasts.push({
      text:   `⬆ ${skillName} level up! (${level})`,
      color:  '#ffd54f',
      ttl:    3.5,
      maxTtl: 3.5,
    });
    // Cap to 4 simultaneous toasts
    if (this._toasts.length > 4) this._toasts.shift();
  }

  pushLoot(itemName, quantity, rarity = 'common') {
    const rarityColor = ItemRegistry.getRarityColor(rarity);
    this._toasts.push({
      text:   `+${quantity} ${itemName}`,
      color:  rarityColor,
      ttl:    2.5,
      maxTtl: 2.5,
    });
    if (this._toasts.length > 4) this._toasts.shift();
  }

  pushSystem(text, color = '#90caf9') {
    this._toasts.push({
      text,
      color,
      ttl: 2.2,
      maxTtl: 2.2,
    });
    if (this._toasts.length > 4) this._toasts.shift();
  }

  setSaveStatus(text, color = '#9e9e9e', ttl = 0) {
    this._saveStatus = {
      text,
      color,
      ttl,
      maxTtl: ttl,
    };
  }

  update(dt) {
    for (const t of this._toasts) t.ttl -= dt;
    this._toasts = this._toasts.filter(t => t.ttl > 0);

    if (this._saveStatus.ttl > 0) {
      this._saveStatus.ttl -= dt;
      if (this._saveStatus.ttl <= 0) {
        this.setSaveStatus('Autosave active', '#9e9e9e', 0);
      }
    }
  }

  render(ctx, player) {
    this._renderSkillBar(ctx, player);
    this._renderKeybindHints(ctx, player);
    this._renderSaveStatus(ctx);
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
    DrawingUtils.rrect(ctx, panelX, panelY, panelW, panelH, 6);
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
    DrawingUtils.rrect(ctx, barX, barY, barW, barH, 2);
    ctx.fill();

    ctx.fillStyle = skill.color;
    DrawingUtils.rrect(ctx, barX, barY, barW * skill.progressToNextLevel, barH, 2);
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
    const hints = ['[I] Inventory', '[C] Crafting', '[K] Skills', '[J] Journal', '[F] Loot Filter', '[1..8] Hotbar', '[B] Toggle bar', '[O] Save', '[L] Load'];
    ctx.save();
    ctx.fillStyle    = 'rgba(255,255,255,0.3)';
    ctx.font         = '10px monospace';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(hints.join('   '), ctx.canvas.width - 12, ctx.canvas.height - 12);
    ctx.restore();
  }

  _renderSaveStatus(ctx) {
    const text = this._saveStatus.text;
    if (!text) return;

    ctx.save();
    const w = 176;
    const h = 24;
    const x = ctx.canvas.width - w - 12;
    const y = 12;

    const fade = this._saveStatus.maxTtl > 0
      ? Math.max(0.45, this._saveStatus.ttl / this._saveStatus.maxTtl)
      : 0.55;

    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    DrawingUtils.rrect(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = this._saveStatus.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);

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
      DrawingUtils.rrect(ctx, cx - toastW / 2, y, toastW, toastH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle    = toast.color || '#ffd54f';
      ctx.font         = 'bold 13px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(toast.text, cx, y + toastH / 2);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

}
