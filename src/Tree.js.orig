const CHOPS_TO_FELL = { min: 3, max: 5 };
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
    this.health = this._randomHealth();
    this.respawnTimer = 0;

    // Slight random size variation for visual variety
    this.scale = 0.85 + Math.random() * 0.3;
    this.wobble = 0;
    this.wobbleDir = 1;
  }

  _randomHealth() {
    return CHOPS_TO_FELL.min + Math.floor(Math.random() * (CHOPS_TO_FELL.max - CHOPS_TO_FELL.min + 1));
  }

  /** Called by Player each chop interval */
  chop(player) {
    if (this.state !== TreeState.BEING_CHOPPED) return;
    this.wobble = 0.18; // trigger wobble animation
    this.health--;
    if (this.health <= 0) {
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
