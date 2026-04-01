const RESPAWN_TIME = 20; // seconds
const XP_PER_TREE = 25;

const TreeState = {
  ALIVE: 'ALIVE',
  BEING_CHOPPED: 'BEING_CHOPPED',
  STUMP: 'STUMP',
};

class Tree {
  constructor(col, row, world) {
    this.col = col;
    this.row = row;
    this.state = TreeState.ALIVE;
    this.respawnTimer = 0;

    // Slight random size variation for visual variety
    this.scale = 1.0 + Math.random() * 0.15;
    this.wobble = 0;
    this.wobbleDir = 1;

    const treeTypes = ['tree_1', 'tree_2', 'tree_3', 'tree_4'];
    this.spriteId = treeTypes[Math.floor(Math.random() * treeTypes.length)];
  }

  /** Called by Player each chop interval */
  chop(player) {
    if (this.state !== TreeState.BEING_CHOPPED) return;
    this.wobble = 0.18; // trigger wobble animation
    const chance = 0.30 + (player.skills.getLevel('woodcutting') * 0.02);
    if (CryptoUtils.secureRandom() <= chance) {
      this._fell(player);
    }
  }

  _fell(player) {
    this.state = TreeState.STUMP;
    this.respawnTimer = RESPAWN_TIME;

    // Update world grid so pathfinder allows walking through stump
    player.world.grid[this.row][this.col] = TILE.GRASS;

    // Reward player
    player.inventory.addItem('log', 1);
    player.skills.gainXP('woodcutting', XP_PER_TREE);

    // Stop player chopping
    player.state = PlayerState.IDLE;
    player.chopTarget = null;
    player.addFloatingText('+1 Log', '#a5d6a7');
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

    const hasSpriteSystem = window.game && window.game.spriteSystem;

    if (this.state === TreeState.STUMP) {
      if (hasSpriteSystem && window.game.spriteSystem.isAtlasReady('stump')) {
        window.game.spriteSystem.drawFrame(ctx, 'stump', 'default', 0, ts * 0.2, 32 * this.scale * 1.5, 31 * this.scale * 1.5, { anchorX: 0.5, anchorY: 0.9 });
      } else {
        ctx.scale(this.scale, this.scale);
        this._drawStump(ctx, ts);
      }
    } else {
      if (this.wobble > 0) {
        ctx.rotate(Math.sin(Date.now() * 0.025) * this.wobble);
      }
      
      if (hasSpriteSystem && window.game.spriteSystem.isAtlasReady(this.spriteId)) {
        const dims = {
          tree_1: { w: 64, h: 63 },
          tree_2: { w: 46, h: 63 },
          tree_3: { w: 52, h: 92 },
          tree_4: { w: 48, h: 93 },
        };
        const dim = dims[this.spriteId];
        const w = dim.w * this.scale * 1.2;
        const h = dim.h * this.scale * 1.2;
        window.game.spriteSystem.drawFrame(ctx, this.spriteId, 'default', 0, ts * 0.45, w, h, { anchorX: 0.5, anchorY: 0.95 });
      } else {
        ctx.scale(this.scale, this.scale);
        this._drawTree(ctx, ts);
      }
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

    // Trunk
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-trunkW / 2, ts * 0.05, trunkW, trunkH);

    // Canopy (back)
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(0, -ts * 0.08, canopyR, 0, Math.PI * 2);
    ctx.fill();

    // Canopy highlight
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.arc(-canopyR * 0.2, -ts * 0.15, canopyR * 0.65, 0, Math.PI * 2);
    ctx.fill();
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
