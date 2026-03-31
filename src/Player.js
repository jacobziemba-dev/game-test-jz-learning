const PlayerState = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  CHOPPING: 'CHOPPING',
  MINING: 'MINING',
};

const WALK_SPEED = 5.5; // tiles per second
const COMBAT_STYLES = ['balanced', 'attack', 'strength', 'defence'];

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
    this._pendingAction = null; // { type: 'CHOP', tree } | { type: 'MINE', oreNode }

    // Combat
    this.targetMonster = null;
    this.attackTimer = 0;
    // Slightly slower cadence feels closer to classic melee pacing.
    this.attackSpeed = 1.8;
    this._combatRepathTimer = 0;
    this.maxHitpoints = 10;
    this.currentHitpoints = this.maxHitpoints;
    this._lootPickupQueue = [];
    this.deathVersion = 0;
    this.combatStyle = 'balanced';
    this.lootFilter = {
      enabled: false,
      allow: {
        common: true,
        uncommon: true,
        rare: true,
        epic: true,
        unique: true,
      },
    };

    // Chopping
    this.chopTarget = null;
    this.chopTimer = 0;
    this.chopInterval = 0.85; // seconds per chop hit
    this.axeAngle = 0;        // spinning axe orbit angle (radians)

    // Mining
    this.mineTarget = null;
    this.mineTimer = 0;
    this.mineInterval = 0.9;

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
    this.skills.register('mining', 'Mining', '#90a4ae');
    this.skills.register('smithing', 'Smithing', '#b0bec5');
  }

  /** Called by InputHandler when player clicks ground */
  walkTo(col, row) {
    const path = Pathfinder.findPath(this.col, this.row, col, row, this.world);
    if (path.length === 0 && !(this.col === col && this.row === row)) return;
    this._pendingAction = null;
    this._cancelGatheringActions();
    this.targetMonster = null;
    this._startWalking(path);
  }

  /** Called by InputHandler when player clicks a tree */
  chopTree(tree) {
    this.targetMonster = null;
    this._cancelGatheringActions();
    const adj = Pathfinder.findAdjacentTile(this.col, this.row, tree.col, tree.row, this.world);
    if (!adj) return; // tree completely surrounded — no-op
    const path = Pathfinder.findPath(this.col, this.row, adj.col, adj.row, this.world);
    this._pendingAction = { type: 'CHOP', tree };
    this._startWalking(path);
  }

  /** Called by InputHandler when player clicks an ore node. */
  mineOreNode(oreNode) {
    if (!oreNode || oreNode.state === 'DEPLETED') return;

    this.targetMonster = null;
    this._cancelGatheringActions();

    const adj = Pathfinder.findAdjacentTile(this.col, this.row, oreNode.col, oreNode.row, this.world);
    if (!adj) return;
    const path = Pathfinder.findPath(this.col, this.row, adj.col, adj.row, this.world);
    this._pendingAction = { type: 'MINE', oreNode };
    this._startWalking(path);
  }

  /** Called by InputHandler when player clicks a monster. */
  attackMonster(monster) {
    if (!monster || !monster.isAlive) return;

    this._cancelGatheringActions();
    this._pendingAction = null;
    this.targetMonster = monster;

    if (!this._isMonsterInMeleeRange(monster)) {
      this._pathToMonster(monster);
    }
  }

  _startWalking(path) {
    this.path = path;
    this.pathProgress = 0;
    this.state = path.length > 0 ? PlayerState.WALKING : PlayerState.IDLE;
    if (this._pendingAction && path.length === 0) {
      // Already adjacent
      if (this._pendingAction.type === 'CHOP') {
        this._beginChop(this._pendingAction.tree);
      }
      if (this._pendingAction.type === 'MINE') {
        this._beginMining(this._pendingAction.oreNode);
      }
      this._pendingAction = null;
    }
  }

  _beginChop(tree) {
    if (tree.state !== 'ALIVE') return;
    this.state = PlayerState.CHOPPING;
    this.chopTarget = tree;
    this.mineTarget = null;
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

  _beginMining(oreNode) {
    if (oreNode.state !== 'ALIVE') return;
    this.state = PlayerState.MINING;
    this.mineTarget = oreNode;
    this.chopTarget = null;
    this.mineTimer = 0;
    oreNode.state = 'BEING_MINED';

    const dc = oreNode.col - this.col;
    const dr = oreNode.row - this.row;
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
    } else if (this.state === PlayerState.MINING) {
      this._updateMining(dt);
    }

    this._updateCombat(dt);
  }

  _cancelGatheringActions() {
    if (this.chopTarget && this.chopTarget.state === 'BEING_CHOPPED') {
      this.chopTarget.state = 'ALIVE';
    }
    if (this.mineTarget && this.mineTarget.state === 'BEING_MINED') {
      this.mineTarget.state = 'ALIVE';
    }

    this.chopTarget = null;
    this.mineTarget = null;

    if (this.state === PlayerState.CHOPPING || this.state === PlayerState.MINING) {
      this.state = PlayerState.IDLE;
    }
  }

  _updateWalking(dt) {
    if (this.path.length === 0) {
      this.state = PlayerState.IDLE;
      if (this._pendingAction) {
        if (this._pendingAction.type === 'CHOP') {
          this._beginChop(this._pendingAction.tree);
        }
        if (this._pendingAction.type === 'MINE') {
          this._beginMining(this._pendingAction.oreNode);
        }
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

  _updateMining(dt) {
    if (!this.mineTarget || this.mineTarget.state === 'DEPLETED') {
      this.state = PlayerState.IDLE;
      this.mineTarget = null;
      return;
    }

    this.mineTimer += dt;

    if (this.mineTimer >= this.mineInterval) {
      this.mineTimer = 0;
      this.mineTarget.mine(this);
    }
  }

  _updateCombat(dt) {
    if (!this.targetMonster) return;

    if (!this.targetMonster.isAlive) {
      this.targetMonster = null;
      return;
    }

    // Gathering actions should always cancel combat intent.
    if (this.state === PlayerState.CHOPPING || this.state === PlayerState.MINING) return;

    this._combatRepathTimer -= dt;
    if (!this._isMonsterInMeleeRange(this.targetMonster)) {
      if (this._combatRepathTimer <= 0 && this.state !== PlayerState.WALKING) {
        this._combatRepathTimer = 0.25;
        this._pathToMonster(this.targetMonster);
      }
      return;
    }

    this.attackTimer -= dt;
    if (this.attackTimer > 0) return;

    this.attackTimer = this.attackSpeed;

    // Face target before each attack swing.
    const dc = this.targetMonster.col - this.col;
    const dr = this.targetMonster.row - this.row;
    if (Math.abs(dc) >= Math.abs(dr)) {
      this.direction = dc > 0 ? 'RIGHT' : 'LEFT';
    } else {
      this.direction = dr > 0 ? 'DOWN' : 'UP';
    }

    const hitChance = this._rollHitChanceAgainstMonster(this.targetMonster);
    const landed = Math.random() <= hitChance;
    const damage = landed ? this._rollMaxHit() : 0;
    const died = this.targetMonster.takeDamage(damage);

    if (damage > 0) {
      if (this.combatStyle === 'attack') {
        this.skills.gainXP('attack', damage * 4);
      } else if (this.combatStyle === 'strength') {
        this.skills.gainXP('strength', damage * 4);
      } else if (this.combatStyle === 'defence') {
        this.skills.gainXP('defence', damage * 4);
      } else {
        this.skills.gainXP('attack', damage * 2);
        this.skills.gainXP('strength', damage * 2);
      }
      this.skills.gainXP('hitpoints', Math.ceil(damage * 1.33));
    }

    if (died) {
      this.targetMonster = null;
    }
  }

  _pathToMonster(monster) {
    const adj = Pathfinder.findAdjacentTile(this.col, this.row, monster.col, monster.row, this.world);
    if (!adj) return;
    const path = Pathfinder.findPath(this.col, this.row, adj.col, adj.row, this.world);
    this._startWalking(path);
  }

  _isMonsterInMeleeRange(monster) {
    const dc = Math.abs(monster.col - this.col);
    const dr = Math.abs(monster.row - this.row);
    return dc <= 1 && dr <= 1;
  }

  _rollHitChanceAgainstMonster(monster) {
    const attackScore = this.getEffectiveAttack() + this.skills.getLevel('attack') * 0.75;
    const defenceScore = Math.max(1, monster.defence + monster.level * 0.75);
    const raw = attackScore / (attackScore + defenceScore);
    return Math.max(0.2, Math.min(0.92, raw));
  }

  _rollMaxHit() {
    const maxHit = Math.max(1, Math.floor(this.getEffectiveStrength() / 4));
    return 1 + Math.floor(Math.random() * maxHit);
  }

  getEffectiveAttack() {
    return this.skills.getLevel('attack') + this.equipment.getBonuses().attack;
  }

  getEffectiveStrength() {
    return this.skills.getLevel('strength') + this.equipment.getBonuses().strength;
  }

  getEffectiveDefence() {
    return this.skills.getLevel('defence') + this.equipment.getBonuses().defence;
  }

  getCombatLevel() {
    const attack = this.skills.getLevel('attack');
    const strength = this.skills.getLevel('strength');
    const defence = this.skills.getLevel('defence');
    const hitpoints = this.skills.getLevel('hitpoints');
    const ranged = this.skills.getLevel('ranged');
    const magic = this.skills.getLevel('magic');
    const prayer = this.skills.getLevel('prayer');

    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const rangedStyle = 0.325 * Math.floor(1.5 * ranged);
    const magicStyle = 0.325 * Math.floor(1.5 * magic);

    return Math.floor(base + Math.max(melee, rangedStyle, magicStyle));
  }

  cycleCombatStyle() {
    const idx = COMBAT_STYLES.indexOf(this.combatStyle);
    const next = (idx + 1) % COMBAT_STYLES.length;
    this.combatStyle = COMBAT_STYLES[next];
    return this.combatStyle;
  }

  toggleLootFilterEnabled() {
    this.lootFilter.enabled = !this.lootFilter.enabled;
    return this.lootFilter.enabled;
  }

  setLootRarityAllowed(rarity, allowed) {
    if (!(rarity in this.lootFilter.allow)) return;
    this.lootFilter.allow[rarity] = !!allowed;
  }

  allowsLootRarity(rarity) {
    if (!this.lootFilter.enabled) return true;
    return this.lootFilter.allow[rarity ?? 'common'] ?? false;
  }

  queueLootPickup(itemName, quantity, rarity = 'common') {
    this._lootPickupQueue.push({ itemName, quantity, rarity });
    if (this._lootPickupQueue.length > 8) this._lootPickupQueue.shift();
  }

  popLootPickups() {
    return this._lootPickupQueue.splice(0);
  }

  takeDamage(amount) {
    const dmg = Math.max(0, Math.floor(amount));
    this.currentHitpoints -= dmg;
    if (this.currentHitpoints > 0) return;

    // Basic death handling for first combat milestone.
    this.currentHitpoints = this.maxHitpoints;
    this.targetMonster = null;
    this._cancelGatheringActions();
    this._pendingAction = null;
    this.path = [];
    this.state = PlayerState.IDLE;

    this.col = Math.floor(this.world.cols / 2);
    this.row = Math.floor(this.world.rows / 2);
    this.x = (this.col + 0.5) * this.tileSize;
    this.y = (this.row + 0.5) * this.tileSize;
    this.deathVersion++;
  }

  serialize() {
    return {
      col: this.col,
      row: this.row,
      direction: this.direction,
      currentHitpoints: this.currentHitpoints,
      maxHitpoints: this.maxHitpoints,
      combatStyle: this.combatStyle,
      lootFilter: this.lootFilter,
      deathVersion: this.deathVersion,
      inventory: this.inventory.serialize(),
      equipment: this.equipment.serialize(),
      skills: this.skills.serialize(),
    };
  }

  deserialize(data) {
    if (!data || typeof data !== 'object') return;

    const col = Math.max(0, Math.min(this.world.cols - 1, Math.floor(data.col ?? this.col)));
    const row = Math.max(0, Math.min(this.world.rows - 1, Math.floor(data.row ?? this.row)));

    this.col = col;
    this.row = row;
    this.x = (this.col + 0.5) * this.tileSize;
    this.y = (this.row + 0.5) * this.tileSize;

    this.direction = data.direction ?? this.direction;
    this.maxHitpoints = Math.max(1, Math.floor(data.maxHitpoints ?? this.maxHitpoints));
    this.currentHitpoints = Math.max(1, Math.min(this.maxHitpoints, Math.floor(data.currentHitpoints ?? this.maxHitpoints)));
    this.combatStyle = COMBAT_STYLES.includes(data.combatStyle) ? data.combatStyle : this.combatStyle;
    if (data.lootFilter && typeof data.lootFilter === 'object') {
      this.lootFilter.enabled = !!data.lootFilter.enabled;
      if (data.lootFilter.allow && typeof data.lootFilter.allow === 'object') {
        for (const rarity of Object.keys(this.lootFilter.allow)) {
          if (rarity in data.lootFilter.allow) {
            this.lootFilter.allow[rarity] = !!data.lootFilter.allow[rarity];
          }
        }
      }
    }
    this.deathVersion = Math.max(0, Math.floor(data.deathVersion ?? this.deathVersion));

    this.inventory.deserialize(data.inventory);
    this.equipment.deserialize(data.equipment);
    this.skills.deserialize(data.skills);

    // Reset transient runtime-only state on load.
    this.state = PlayerState.IDLE;
    this.path = [];
    this.pathProgress = 0;
    this._pendingAction = null;
    this.chopTarget = null;
    this.mineTarget = null;
    this.targetMonster = null;
    this.attackTimer = 0;
    this._combatRepathTimer = 0;
    this._lootPickupQueue = [];
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

    // Combat targeting indicator
    if (this.targetMonster && this.targetMonster.isAlive) {
      ctx.strokeStyle = '#ff8a65';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
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
