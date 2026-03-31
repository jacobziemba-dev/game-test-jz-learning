const PlayerState = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  CHOPPING: 'CHOPPING',
};

const WALK_SPEED = 5.5; // tiles per second

class Player {
  constructor(world) {
    this.world = world;
    this.tileSize = world.tileSize;

    // Start in center of world
    this.col = Math.floor(world.cols / 2);
    this.row = Math.floor(world.rows / 2);
    this.x = (this.col + 0.5) * this.tileSize; // world pixel center
    this.y = (this.row + 0.5) * this.tileSize;

    this.state = PlayerState.IDLE;
    this.path = [];          // [{col, row}, ...]
    this.pathProgress = 0;   // 0..1 between current tile and next tile
    this.direction = 'DOWN'; // UP DOWN LEFT RIGHT

    // Pending action after arriving
    this._pendingAction = null; // { type: 'CHOP', tree }

    // Chopping
    this.chopTarget = null;
    this.chopTimer = 0;
    this.chopInterval = 0.85; // seconds per chop hit
    this.axeAngle = 0;        // spinning axe orbit angle (radians)

    // Walk animation
    this.bobTime = 0;

    // Inventory
    this.inventory = new Inventory();

    // Equipment — items worn by the player
    this.equipment = new Equipment();

    // Skills — register all skills here; add new ones as the game grows
    this.skills = new SkillManager();
    // Combat skills
    this.skills.register('attack',    'Attack',    '#5c9bd6');
    this.skills.register('strength',  'Strength',  '#e07b54');
    this.skills.register('defence',   'Defence',   '#b0bec5');
    this.skills.register('hitpoints', 'Hitpoints', '#e05c5c');
    this.skills.register('ranged',    'Ranged',    '#7ab87a');
    this.skills.register('prayer',    'Prayer',    '#d4c96e');
    this.skills.register('magic',     'Magic',     '#7b9cd6');
    // Gathering / crafting skills
    this.skills.register('woodcutting', 'Woodcutting', '#a5d6a7');
  }

  /** Called by InputHandler when player clicks ground */
  walkTo(col, row) {
    const path = Pathfinder.findPath(this.col, this.row, col, row, this.world);
    if (path.length === 0 && !(this.col === col && this.row === row)) return;
    this._pendingAction = null;
    this.chopTarget = null;
    this._startWalking(path);
  }

  /** Called by InputHandler when player clicks a tree */
  chopTree(tree) {
    const adj = Pathfinder.findAdjacentTile(this.col, this.row, tree.col, tree.row, this.world);
    if (!adj) return; // tree completely surrounded — no-op
    const path = Pathfinder.findPath(this.col, this.row, adj.col, adj.row, this.world);
    this._pendingAction = { type: 'CHOP', tree };
    this._startWalking(path);
  }

  _startWalking(path) {
    this.path = path;
    this.pathProgress = 0;
    this.state = path.length > 0 ? PlayerState.WALKING : PlayerState.IDLE;
    if (this._pendingAction && path.length === 0) {
      // Already adjacent
      this._beginChop(this._pendingAction.tree);
      this._pendingAction = null;
    }
  }

  _beginChop(tree) {
    if (tree.state !== 'ALIVE') return;
    this.state = PlayerState.CHOPPING;
    this.chopTarget = tree;
    this.chopTimer = 0;
    tree.state = 'BEING_CHOPPED';
    // Face the tree
    const dc = tree.col - this.col;
    const dr = tree.row - this.row;
    if (Math.abs(dc) >= Math.abs(dr)) {
      this.direction = dc > 0 ? 'RIGHT' : 'LEFT';
    } else {
      this.direction = dr > 0 ? 'DOWN' : 'UP';
    }
  }

  update(dt) {
    this.bobTime += dt;

    if (this.state === PlayerState.WALKING) {
      this._updateWalking(dt);
    } else if (this.state === PlayerState.CHOPPING) {
      this._updateChopping(dt);
    }
  }

  _updateWalking(dt) {
    if (this.path.length === 0) {
      this.state = PlayerState.IDLE;
      if (this._pendingAction) {
        this._beginChop(this._pendingAction.tree);
        this._pendingAction = null;
      }
      return;
    }

    const next = this.path[0];
    const targetX = (next.col + 0.5) * this.tileSize;
    const targetY = (next.row + 0.5) * this.tileSize;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = WALK_SPEED * this.tileSize * dt;

    // Update direction
    if (Math.abs(dx) >= Math.abs(dy)) {
      this.direction = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      this.direction = dy > 0 ? 'DOWN' : 'UP';
    }

    if (step >= dist) {
      // Arrived at this tile
      this.x = targetX;
      this.y = targetY;
      this.col = next.col;
      this.row = next.row;
      this.path.shift();
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
  }

  _updateChopping(dt) {
    if (!this.chopTarget || this.chopTarget.state === 'STUMP') {
      this.state = PlayerState.IDLE;
      this.chopTarget = null;
      return;
    }

    this.chopTimer += dt;

    // Spin the axe around the player
    this.axeAngle += 4.5 * dt; // ~0.7 rotations per second

    if (this.chopTimer >= this.chopInterval) {
      this.chopTimer = 0;
      this.chopTarget.chop(this);
    }
  }

  render(ctx, camera) {
    const ts = this.tileSize;
    const radius = ts * 0.35;

    // Walk bob offset
    let bobY = 0;
    if (this.state === PlayerState.WALKING) {
      bobY = Math.sin(this.bobTime * 12) * 3;
    }

    const sx = this.x - camera.x;
    const sy = this.y - camera.y + bobY;

    ctx.save();
    ctx.translate(sx, sy);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.7, radius * 0.7, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body circle
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    

    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction dot
    const dotOffset = radius * 0.6;
    let dotX = 0, dotY = 0;
    if (this.direction === 'UP')    dotY = -dotOffset;
    if (this.direction === 'DOWN')  dotY =  dotOffset;
    if (this.direction === 'LEFT')  dotX = -dotOffset;
    if (this.direction === 'RIGHT') dotX =  dotOffset;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(dotX, dotY, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Spinning axe while chopping
    if (this.state === PlayerState.CHOPPING) {
      this._drawSpinningAxe(ctx, radius);
    }

    ctx.restore();
  }

  _drawSpinningAxe(ctx, radius) {
    const orbitR = radius * 1.55;
    const ax = Math.cos(this.axeAngle) * orbitR;
    const ay = Math.sin(this.axeAngle) * orbitR;

    ctx.save();
    ctx.translate(ax, ay);
    // Rotate axe to face the direction it's swinging (tangent of orbit)
    ctx.rotate(this.axeAngle + Math.PI / 2);

    // Handle
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 6);
    ctx.stroke();

    // Blade (axe head) — a rounded wedge shape
    ctx.fillStyle = '#b0bec5';
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);       // top of handle
    ctx.lineTo(7, -16);       // blade tip top
    ctx.quadraticCurveTo(10, -12, 7, -7); // curved blade edge
    ctx.lineTo(0, -7);        // back to handle
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blade shine
    ctx.strokeStyle = '#eceff1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, -11);
    ctx.lineTo(6, -15);
    ctx.stroke();

    ctx.restore();
  }
}
