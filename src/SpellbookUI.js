class SpellbookUI {
  constructor(player) {
    this.player = player;
    this.isVisible = false;
    this.x = 0;
    this.y = 0;
    this.width = 340;
    this.height = 420;

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
      },
      {
        id: 'water_strike',
        name: 'Water Strike',
        description: 'A basic magic attack.',
        levelReq: 5,
        maxHit: 4,
        runes: [
          { id: 'air_rune', qty: 1 },
          { id: 'mind_rune', qty: 1 },
          // Using air instead of water to keep it simple for now
        ],
      },
    ];
  }

  toggle() {
    this.isVisible = !this.isVisible;
  }

  update(dt) {}

  handleClick(x, y) {
    if (!this.isVisible) return false;
    if (x < this.x || x > this.x + this.width || y < this.y || y > this.y + this.height) {
      this.isVisible = false;
      return true; // Click outside closes panel
    }

    const startY = this.y + 60;
    const rowH = 70;

    for (let i = 0; i < this.spells.length; i++) {
      const sx = this.x + 20;
      const sy = startY + (i * rowH);
      if (x >= sx && x <= this.x + this.width - 20 && y >= sy && y <= sy + rowH - 10) {
        this.player.activeSpell = this.spells[i];
        this.player.combatStyle = 'magic'; // Auto-switch to magic style
        return true;
      }
    }

    return true; // Clicked inside panel
  }

  render(ctx, screenWidth, screenHeight) {
    if (!this.isVisible) return;

    this.x = (screenWidth - this.width) / 2;
    this.y = (screenHeight - this.height) / 2;

    DrawingUtils.rrect(ctx, this.x, this.y, this.width, this.height, 8);
    ctx.fillStyle = '#1e1e1e';
    ctx.fill();
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#7b9cd6';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Spellbook', this.x + this.width / 2, this.y + 16);

    ctx.fillStyle = '#757575';
    ctx.font = '12px monospace';
    ctx.fillText('Click a spell to autocast', this.x + this.width / 2, this.y + 36);

    const startY = this.y + 60;
    const rowH = 70;

    for (let i = 0; i < this.spells.length; i++) {
      const spell = this.spells[i];
      const sy = startY + (i * rowH);
      const isUnlocked = this.player.skills.getLevel('magic') >= spell.levelReq;
      const isActive = this.player.activeSpell?.id === spell.id;

      // Background
      if (isActive) {
        ctx.fillStyle = '#2c3e50';
      } else {
        ctx.fillStyle = '#2a2a2a';
      }
      DrawingUtils.rrect(ctx, this.x + 20, sy, this.width - 40, rowH - 10, 4);
      ctx.fill();
      ctx.strokeStyle = isActive ? '#64b5f6' : '#3a3a3a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Title
      ctx.fillStyle = isUnlocked ? '#e0e0e0' : '#757575';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${spell.name} (Lv ${spell.levelReq})`, this.x + 30, sy + 10);

      // Runes needed
      let rx = this.x + 30;
      for (const rune of spell.runes) {
        const item = ItemRegistry.get(rune.id);
        const hasQty = this.player.inventory.countItem(rune.id);
        const hasEnough = hasQty >= rune.qty;

        ctx.fillStyle = hasEnough ? '#81c784' : '#e53935';
        ctx.font = '12px monospace';
        const txt = `${rune.qty} ${item.name}`;
        ctx.fillText(txt, rx, sy + 32);
        rx += ctx.measureText(txt).width + 10;
      }
    }
  }
}
