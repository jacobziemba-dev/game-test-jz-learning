// ─── Tree Type Definitions ────────────────────────────────────────────────────
const TREE_TYPES = {
  normal: {
    name: 'Tree',
    logId: 'log',
    levelRequired: 1,
    xp: 25,
    chops: { min: 3, max: 5 },
    respawnTime: 20,
    trunkColor: '#6d4c41',
    canopyColor: '#2e7d32',
    canopyHighlight: '#43a047',
  },
  oak: {
    name: 'Oak Tree',
    logId: 'oak_log',
    levelRequired: 15,
    xp: 37,
    chops: { min: 4, max: 6 },
    respawnTime: 25,
    trunkColor: '#5D4E37',
    canopyColor: '#1B5E20',
    canopyHighlight: '#2E7D32',
  },
  willow: {
    name: 'Willow Tree',
    logId: 'willow_log',
    levelRequired: 30,
    xp: 68,
    chops: { min: 5, max: 8 },
    respawnTime: 30,
    trunkColor: '#7D7C5C',
    canopyColor: '#558B2F',
    canopyHighlight: '#7CB342',
  },
  maple: {
    name: 'Maple Tree',
    logId: 'maple_log',
    levelRequired: 45,
    xp: 100,
    chops: { min: 6, max: 10 },
    respawnTime: 45,
    trunkColor: '#A38139',
    canopyColor: '#E65100',
    canopyHighlight: '#FF8F00',
  },
  yew: {
    name: 'Yew Tree',
    logId: 'yew_log',
    levelRequired: 60,
    xp: 175,
    chops: { min: 8, max: 14 },
    respawnTime: 90,
    trunkColor: '#6B3300',
    canopyColor: '#1A237E',
    canopyHighlight: '#303F9F',
  },
};

const TreeState = {
  ALIVE: 'ALIVE',
  BEING_CHOPPED: 'BEING_CHOPPED',
  STUMP: 'STUMP',
};

class Tree {
  constructor(col, row, world, treeType = 'normal') {
    this.col = col;
    this.row = row;
    this.treeType = treeType;
    this.config = TREE_TYPES[treeType] || TREE_TYPES.normal;
    
    this.state = TreeState.ALIVE;
    this.health = this._randomHealth();
    this.respawnTimer = 0;

    // Slight random size variation for visual variety
    this.scale = 0.85 + Math.random() * 0.3;
    this.wobble = 0;
    this.wobbleDir = 1;
  }

  get name() {
    return this.config.name;
  }

  get levelRequired() {
    return this.config.levelRequired;
  }

  _randomHealth() {
    const { min, max } = this.config.chops;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /** Check if player can chop this tree */
  canChop(player) {
    const wcLevel = player.skills.getLevel('woodcutting');
    return wcLevel >= this.config.levelRequired;
  }

  /** Called by Player each chop interval */
  chop(player) {
    if (this.state !== TreeState.BEING_CHOPPED) return;
    
    // Check level requirement
    if (!this.canChop(player)) {
      player.state = PlayerState.IDLE;
      player.chopTarget = null;
      return;
    }
    
    this.wobble = 0.18; // trigger wobble animation
    this.health--;
    if (this.health <= 0) {
      this._fell(player);
    }
  }

  _fell(player) {
    this.state = TreeState.STUMP;
    this.respawnTimer = this.config.respawnTime;

    // Update world grid so pathfinder allows walking through stump
    player.world.grid[this.row][this.col] = TILE.GRASS;

    // Reward player
    player.inventory.addItem(this.config.logId, 1);
    player.skills.gainXP('woodcutting', this.config.xp);

    // Stop player chopping
    player.state = PlayerState.IDLE;
    player.chopTarget = null;
  }

  update(dt, world) {
    // Wobble decay
    if (this.wobble > 0) {
      this.wobble -= dt * 2.5;
      if (this.wobble < 0) this.wobble = 0;
    }

    if (this.state === TreeState.STUMP) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this._respawn(world);
      }
    }
  }

  _respawn(world) {
    this.state = TreeState.ALIVE;
    this.health = this._randomHealth();
    world.grid[this.row][this.col] = TILE.TREE;
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

    if (this.state === TreeState.STUMP) {
      this._drawStump(ctx, ts);
    } else {
      if (this.wobble > 0) {
        ctx.rotate(Math.sin(Date.now() * 0.025) * this.wobble);
      }
      this._drawTree(ctx, ts);
    }

    ctx.restore();
  }

  _drawTree(ctx, ts) {
    const trunkW = ts * 0.18;
    const trunkH = ts * 0.35;
    const canopyR = ts * 0.38;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, ts * 0.28, canopyR * 0.7, canopyR * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk - use tree type color
    ctx.fillStyle = this.config.trunkColor;
    ctx.fillRect(-trunkW / 2, ts * 0.05, trunkW, trunkH);

    // Canopy (back) - use tree type color
    ctx.fillStyle = this.config.canopyColor;
    ctx.beginPath();
    ctx.arc(0, -ts * 0.08, canopyR, 0, Math.PI * 2);
    ctx.fill();

    // Canopy highlight - use tree type color
    ctx.fillStyle = this.config.canopyHighlight;
    ctx.beginPath();
    ctx.arc(-canopyR * 0.2, -ts * 0.15, canopyR * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Special rendering for willow (drooping branches)
    if (this.treeType === 'willow') {
      ctx.strokeStyle = this.config.canopyHighlight;
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * canopyR * 0.25, -ts * 0.1);
        ctx.quadraticCurveTo(i * canopyR * 0.3, ts * 0.15, i * canopyR * 0.35, ts * 0.25);
        ctx.stroke();
      }
    }

    // Special rendering for yew (darker, mystical)
    if (this.treeType === 'yew') {
      ctx.fillStyle = 'rgba(75, 0, 130, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -ts * 0.08, canopyR * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawStump(ctx, ts) {
    const stumpW = ts * 0.28;
    const stumpH = ts * 0.16;

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, stumpH * 0.8, stumpW * 0.7, stumpH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.roundRect(-stumpW / 2, -stumpH / 2, stumpW, stumpH, 4);
    ctx.fill();

    // Tree ring
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, stumpW * 0.3, stumpW * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
