// ─── Fishing Spot Type Definitions ────────────────────────────────────────────
const FISHING_SPOT_TYPES = {
  net: {
    name: 'Fishing Spot (Net)',
    action: 'Net',
    toolRequired: 'small_fishing_net',
    fish: [
      { itemId: 'raw_shrimp', levelRequired: 1, xp: 10, weight: 1 },
    ],
    catchTime: { min: 2, max: 4 },
  },
  lure: {
    name: 'Fishing Spot (Lure)',
    action: 'Lure',
    toolRequired: 'fly_fishing_rod',
    baitRequired: 'feather',
    fish: [
      { itemId: 'raw_trout', levelRequired: 20, xp: 50, weight: 1 },
      { itemId: 'raw_salmon', levelRequired: 30, xp: 70, weight: 0.6 },
    ],
    catchTime: { min: 2.5, max: 5 },
  },
  cage: {
    name: 'Fishing Spot (Cage)',
    action: 'Cage',
    toolRequired: 'lobster_pot',
    fish: [
      { itemId: 'raw_lobster', levelRequired: 40, xp: 90, weight: 1 },
    ],
    catchTime: { min: 4, max: 7 },
  },
  harpoon: {
    name: 'Fishing Spot (Harpoon)',
    action: 'Harpoon',
    toolRequired: 'harpoon',
    fish: [
      { itemId: 'raw_swordfish', levelRequired: 50, xp: 100, weight: 1 },
    ],
    catchTime: { min: 5, max: 9 },
  },
};

const FishingSpotState = {
  ACTIVE: 'ACTIVE',
  BEING_FISHED: 'BEING_FISHED',
  MOVED: 'MOVED',
};

class FishingSpot {
  constructor(col, row, world, spotType = 'net') {
    this.col = col;
    this.row = row;
    this.world = world;
    this.spotType = spotType;
    this.config = FISHING_SPOT_TYPES[spotType] || FISHING_SPOT_TYPES.net;

    this.state = FishingSpotState.ACTIVE;
    this.moveTimer = 0;
    this.moveInterval = 60 + Math.random() * 60; // Moves every 60-120 seconds

    // Visual animation
    this.bobOffset = Math.random() * Math.PI * 2;
    this.splashTimer = 0;
  }

  get name() {
    return this.config.name;
  }

  get action() {
    return this.config.action;
  }

  /** Check if player has required tool and level */
  canFish(player) {
    // Check for fishing tool
    const hasTool = player.inventory.hasItem(this.config.toolRequired);
    if (!hasTool) return { canFish: false, reason: `You need a ${ItemRegistry.get(this.config.toolRequired)?.name || this.config.toolRequired}.` };

    // Check for bait if required
    if (this.config.baitRequired) {
      const hasBait = player.inventory.hasItem(this.config.baitRequired);
      if (!hasBait) return { canFish: false, reason: `You need ${ItemRegistry.get(this.config.baitRequired)?.name || this.config.baitRequired} as bait.` };
    }

    // Check level for at least one fish type
    const fishingLevel = player.skills.getLevel('fishing');
    const canCatchAny = this.config.fish.some(f => fishingLevel >= f.levelRequired);
    if (!canCatchAny) {
      const lowestReq = Math.min(...this.config.fish.map(f => f.levelRequired));
      return { canFish: false, reason: `You need level ${lowestReq} Fishing.` };
    }

    return { canFish: true };
  }

  /** Get a random fish the player can catch based on their level */
  getRandomCatch(player) {
    const fishingLevel = player.skills.getLevel('fishing');
    const available = this.config.fish.filter(f => fishingLevel >= f.levelRequired);
    
    if (available.length === 0) return null;

    // Weighted random selection
    const totalWeight = available.reduce((sum, f) => sum + f.weight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const fish of available) {
      roll -= fish.weight;
      if (roll <= 0) return fish;
    }
    
    return available[available.length - 1];
  }

  /** Called when player catches a fish */
  catchFish(player) {
    const check = this.canFish(player);
    if (!check.canFish) {
      player.state = PlayerState.IDLE;
      player.fishTarget = null;
      return;
    }

    // Consume bait if required
    if (this.config.baitRequired) {
      player.inventory.removeItem(this.config.baitRequired, 1);
    }

    const caught = this.getRandomCatch(player);
    if (caught) {
      player.inventory.addItem(caught.itemId, 1);
      player.skills.gainXP('fishing', caught.xp);
      this.splashTimer = 0.5;
    }
  }

  update(dt, world) {
    // Splash animation decay
    if (this.splashTimer > 0) {
      this.splashTimer -= dt;
    }

    // Move timer - fishing spots occasionally move
    this.moveTimer += dt;
    if (this.moveTimer >= this.moveInterval) {
      this._moveSpot(world);
    }
  }

  _moveSpot(world) {
    // Find a new valid water tile nearby
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    
    const validSpots = [];
    for (const [dx, dy] of directions) {
      const newCol = this.col + dx;
      const newRow = this.row + dy;
      if (newRow >= 0 && newRow < world.grid.length && 
          newCol >= 0 && newCol < world.grid[0].length) {
        if (world.grid[newRow][newCol] === TILE.WATER) {
          validSpots.push({ col: newCol, row: newRow });
        }
      }
    }

    if (validSpots.length > 0) {
      const newSpot = validSpots[Math.floor(Math.random() * validSpots.length)];
      this.col = newSpot.col;
      this.row = newSpot.row;
    }

    this.moveTimer = 0;
    this.moveInterval = 60 + Math.random() * 60;
  }

  render(ctx, camera, tileSize) {
    const ts = tileSize;
    const sx = this.col * ts - camera.x;
    const sy = this.row * ts - camera.y;
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;

    // Bobbing animation
    const bob = Math.sin((Date.now() / 500) + this.bobOffset) * 3;

    ctx.save();
    ctx.translate(cx, cy + bob);

    // Draw ripples
    this._drawRipples(ctx, ts);

    // Draw splash if just caught
    if (this.splashTimer > 0) {
      this._drawSplash(ctx, ts);
    }

    // Draw fishing spot indicator (bubbles)
    this._drawBubbles(ctx, ts);

    ctx.restore();
  }

  _drawRipples(ctx, ts) {
    const time = Date.now() / 1000;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 3; i++) {
      const phase = (time + i * 0.5) % 2;
      const radius = ts * 0.15 + phase * ts * 0.2;
      const alpha = Math.max(0, 1 - phase / 2);
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawBubbles(ctx, ts) {
    const time = Date.now() / 800;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    for (let i = 0; i < 3; i++) {
      const phase = (time + i * 0.7) % 1.5;
      const x = Math.sin(i * 2.5) * ts * 0.12;
      const y = -phase * ts * 0.15;
      const size = ts * 0.04 * (1 - phase / 1.5);
      
      if (size > 0) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _drawSplash(ctx, ts) {
    const progress = 1 - this.splashTimer / 0.5;
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 2;
    
    const radius = ts * 0.2 + progress * ts * 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Splash droplets
    ctx.fillStyle = `rgba(200, 230, 255, ${1 - progress})`;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = radius * 0.8;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist * 0.5 - progress * ts * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, ts * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
