const ORE_RESPAWN_TIME = 16; // seconds

const OreNodeState = {
  ALIVE: 'ALIVE',
  BEING_MINED: 'BEING_MINED',
  DEPLETED: 'DEPLETED',
};

class OreNode {
  constructor(col, row, world, config = {}) {
    this.col = col;
    this.row = row;
    this.world = world;

    this.oreItemId = config.oreItemId ?? 'copper_ore';
    this.name = config.name ?? 'Copper Rock';
    this.xp = Math.max(1, Math.floor(config.xp ?? 18));

    this.state = OreNodeState.ALIVE;
    this.respawnTimer = 0;

    this.scale = 0.9 + Math.random() * 0.2;
    this.shake = 0;
  }

  mine(player) {
    if (this.state !== OreNodeState.BEING_MINED) return;

    this.shake = 0.12;

    const chance = 0.25 + (player.skills.getLevel('mining') * 0.02);
    if (CryptoUtils.secureRandom() <= chance) {
      this._deplete(player);
    }
  }

  _deplete(player) {
    this.state = OreNodeState.DEPLETED;
    this.respawnTimer = ORE_RESPAWN_TIME;

    player.world.grid[this.row][this.col] = TILE.GRASS;
    player.inventory.addItem(this.oreItemId, 1);
    player.skills.gainXP('mining', this.xp);

    player.state = PlayerState.IDLE;
    player.mineTarget = null;

    const item = ItemRegistry?.get(this.oreItemId) || { name: this.oreItemId };
    player.addFloatingText(`+1 ${item.name}`, '#ffcc80');
  }

  update(dt, world) {
    if (this.shake > 0) {
      this.shake -= dt * 2.8;
      if (this.shake < 0) this.shake = 0;
    }

    if (this.state === OreNodeState.DEPLETED) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this._respawn(world);
    }
  }

  _respawn(world) {
    this.state = OreNodeState.ALIVE;
    world.grid[this.row][this.col] = TILE.ROCK;
  }

  render(ctx, camera, tileSize) {
    const ts = tileSize;
    const sx = this.col * ts - camera.x;
    const sy = this.row * ts - camera.y;
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.scale, this.scale);

    if (this.state === OreNodeState.DEPLETED) {
      this._drawDepleted(ctx, ts);
    } else {
      if (this.shake > 0) {
        ctx.rotate(Math.sin(Date.now() * 0.03) * this.shake);
      }
      this._drawRock(ctx, ts);
    }

    ctx.restore();
  }

  _drawRock(ctx, ts) {
    const r = ts * 0.34;

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.95, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.2);
    ctx.lineTo(-r * 0.55, -r * 0.55);
    ctx.lineTo(r * 0.1, -r * 0.8);
    ctx.lineTo(r * 0.75, -r * 0.25);
    ctx.lineTo(r * 0.85, r * 0.4);
    ctx.lineTo(r * 0.25, r * 0.85);
    ctx.lineTo(-r * 0.5, r * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#5f6b6c';
    ctx.lineWidth = 1;
    ctx.stroke();

    let fillColor = '#b87333'; // copper
    if (this.oreItemId === 'tin_ore') fillColor = '#b0bec5';
    if (this.oreItemId === 'rune_essence') fillColor = '#e0e0e0';
    
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(-r * 0.18, -r * 0.05, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.22, r * 0.18, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawDepleted(ctx, ts) {
    const w = ts * 0.58;
    const h = ts * 0.18;

    ctx.fillStyle = 'rgba(0,0,0,0.17)';
    ctx.beginPath();
    ctx.ellipse(0, h * 1.8, w * 0.52, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 4);
    ctx.fill();
  }
}
