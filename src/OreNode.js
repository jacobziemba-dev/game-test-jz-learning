// ─── Ore Type Definitions ─────────────────────────────────────────────────────
const ORE_TYPES = {
  copper: {
    name: 'Copper Rock',
    oreItemId: 'copper_ore',
    levelRequired: 1,
    xp: 18,
    hits: { min: 2, max: 4 },
    respawnTime: 16,
    rockColor: '#7f8c8d',
    oreColor: '#b87333',
  },
  tin: {
    name: 'Tin Rock',
    oreItemId: 'tin_ore',
    levelRequired: 1,
    xp: 18,
    hits: { min: 2, max: 4 },
    respawnTime: 16,
    rockColor: '#7f8c8d',
    oreColor: '#b0bec5',
  },
  iron: {
    name: 'Iron Rock',
    oreItemId: 'iron_ore',
    levelRequired: 15,
    xp: 35,
    hits: { min: 3, max: 5 },
    respawnTime: 10,
    rockColor: '#5D4E37',
    oreColor: '#8B4513',
  },
  coal: {
    name: 'Coal Rock',
    oreItemId: 'coal',
    levelRequired: 30,
    xp: 50,
    hits: { min: 4, max: 6 },
    respawnTime: 50,
    rockColor: '#2C2C2C',
    oreColor: '#1A1A1A',
  },
  mithril: {
    name: 'Mithril Rock',
    oreItemId: 'mithril_ore',
    levelRequired: 55,
    xp: 80,
    hits: { min: 5, max: 8 },
    respawnTime: 120,
    rockColor: '#3D3D5C',
    oreColor: '#4169E1',
  },
  adamant: {
    name: 'Adamantite Rock',
    oreItemId: 'adamant_ore',
    levelRequired: 70,
    xp: 95,
    hits: { min: 6, max: 10 },
    respawnTime: 240,
    rockColor: '#2F4F4F',
    oreColor: '#228B22',
  },
};

const OreNodeState = {
  ALIVE: 'ALIVE',
  BEING_MINED: 'BEING_MINED',
  DEPLETED: 'DEPLETED',
};

class OreNode {
  constructor(col, row, world, oreType = 'copper') {
    this.col = col;
    this.row = row;
    this.world = world;
    this.oreType = oreType;
    this.config = ORE_TYPES[oreType] || ORE_TYPES.copper;

    this.oreItemId = this.config.oreItemId;
    this.name = this.config.name;
    this.xp = this.config.xp;

    this.state = OreNodeState.ALIVE;
    this.health = this._randomHealth();
    this.respawnTimer = 0;

    this.scale = 0.9 + Math.random() * 0.2;
    this.shake = 0;
  }

  get levelRequired() {
    return this.config.levelRequired;
  }

  _randomHealth() {
    const { min, max } = this.config.hits;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /** Check if player can mine this ore */
  canMine(player) {
    const miningLevel = player.skills.getLevel('mining');
    return miningLevel >= this.config.levelRequired;
  }

  mine(player) {
    if (this.state !== OreNodeState.BEING_MINED) return;

    // Check level requirement
    if (!this.canMine(player)) {
      player.state = PlayerState.IDLE;
      player.mineTarget = null;
      return;
    }

    this.shake = 0.12;
    this.health--;

    if (this.health <= 0) {
      this._deplete(player);
    }
  }

  _deplete(player) {
    this.state = OreNodeState.DEPLETED;
    this.respawnTimer = this.config.respawnTime;

    player.world.grid[this.row][this.col] = TILE.GRASS;
    player.inventory.addItem(this.oreItemId, 1);
    player.skills.gainXP('mining', this.xp);

    player.state = PlayerState.IDLE;
    player.mineTarget = null;
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
    this.health = this._randomHealth();
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

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.95, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rock body - use ore type color
    ctx.fillStyle = this.config.rockColor;
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

    ctx.strokeStyle = this._darkenColor(this.config.rockColor, 0.7);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ore veins - use ore type color
    ctx.fillStyle = this.config.oreColor;
    ctx.beginPath();
    ctx.arc(-r * 0.18, -r * 0.05, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.22, r * 0.18, r * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Add sparkle for higher tier ores
    if (this.oreType === 'mithril' || this.oreType === 'adamant') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(-r * 0.22, -r * 0.1, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
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

  _darkenColor(hex, factor) {
    // Simple color darkening
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  }
}
