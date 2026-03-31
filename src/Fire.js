// ─── Fire Configuration ───────────────────────────────────────────────────────
const FIRE_TYPES = {
  log: {
    logId: 'log',
    levelRequired: 1,
    xp: 40,
    burnTime: 60, // seconds the fire lasts
  },
  oak_log: {
    logId: 'oak_log',
    levelRequired: 15,
    xp: 60,
    burnTime: 90,
  },
  willow_log: {
    logId: 'willow_log',
    levelRequired: 30,
    xp: 90,
    burnTime: 120,
  },
  maple_log: {
    logId: 'maple_log',
    levelRequired: 45,
    xp: 135,
    burnTime: 150,
  },
  yew_log: {
    logId: 'yew_log',
    levelRequired: 60,
    xp: 202,
    burnTime: 200,
  },
};

const FireState = {
  BURNING: 'BURNING',
  DYING: 'DYING',
  EXTINGUISHED: 'EXTINGUISHED',
};

class Fire {
  constructor(col, row, world, logType = 'log') {
    this.col = col;
    this.row = row;
    this.world = world;
    this.logType = logType;
    this.config = FIRE_TYPES[logType] || FIRE_TYPES.log;

    this.state = FireState.BURNING;
    this.burnTimer = this.config.burnTime;
    
    // Animation
    this.flameOffset = Math.random() * Math.PI * 2;
    this.sparkTimer = 0;
    this.sparks = [];
  }

  get isBurning() {
    return this.state === FireState.BURNING || this.state === FireState.DYING;
  }

  /** Check if player can light this type of fire */
  static canLight(player, logId) {
    const fireConfig = FIRE_TYPES[logId];
    if (!fireConfig) return { canLight: false, reason: 'Cannot burn this item.' };

    // Check for tinderbox
    const hasTinderbox = player.inventory.hasItem('tinderbox');
    if (!hasTinderbox) return { canLight: false, reason: 'You need a tinderbox to light fires.' };

    // Check level
    const firemakingLevel = player.skills.getLevel('firemaking');
    if (firemakingLevel < fireConfig.levelRequired) {
      return { canLight: false, reason: `You need level ${fireConfig.levelRequired} Firemaking.` };
    }

    // Check if player has the logs
    const hasLogs = player.inventory.hasItem(logId);
    if (!hasLogs) return { canLight: false, reason: 'You need logs to light a fire.' };

    return { canLight: true };
  }

  /** Light a fire at the player's location */
  static lightFire(player, logId, world) {
    const check = Fire.canLight(player, logId);
    if (!check.canLight) return null;

    // Remove the log from inventory
    player.inventory.removeItem(logId, 1);

    // Create the fire at player's current position
    const fire = new Fire(player.col, player.row, world, logId);

    // Award XP
    const fireConfig = FIRE_TYPES[logId];
    player.skills.gainXP('firemaking', fireConfig.xp);

    // Move player one tile west (like OSRS)
    const westCol = player.col - 1;
    if (westCol >= 0 && world.grid[player.row][westCol] === TILE.GRASS) {
      player.col = westCol;
      player.x = (player.col + 0.5) * player.tileSize;
    }

    return fire;
  }

  update(dt) {
    if (this.state === FireState.EXTINGUISHED) return;

    this.burnTimer -= dt;

    // Transition to dying state when low on time
    if (this.burnTimer <= 10 && this.state === FireState.BURNING) {
      this.state = FireState.DYING;
    }

    // Extinguish when time runs out
    if (this.burnTimer <= 0) {
      this.state = FireState.EXTINGUISHED;
      return;
    }

    // Update sparks
    this.sparkTimer += dt;
    if (this.sparkTimer >= 0.15) {
      this.sparkTimer = 0;
      this._emitSpark();
    }

    // Update existing sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.life -= dt;
      spark.y -= dt * 30;
      spark.x += Math.sin(spark.wobble) * dt * 10;
      spark.wobble += dt * 8;
      
      if (spark.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  _emitSpark() {
    if (this.sparks.length >= 8) return;
    
    this.sparks.push({
      x: (Math.random() - 0.5) * 10,
      y: 0,
      life: 0.5 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  render(ctx, camera, tileSize) {
    if (this.state === FireState.EXTINGUISHED) return;

    const ts = tileSize;
    const sx = this.col * ts - camera.x;
    const sy = this.row * ts - camera.y;
    const cx = sx + ts / 2;
    const cy = sy + ts / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Draw fire glow
    this._drawGlow(ctx, ts);

    // Draw flames
    this._drawFlames(ctx, ts);

    // Draw sparks
    this._drawSparks(ctx);

    // Draw ash pile when dying
    if (this.state === FireState.DYING) {
      this._drawAsh(ctx, ts);
    }

    ctx.restore();
  }

  _drawGlow(ctx, ts) {
    const time = Date.now() / 200;
    const pulseSize = 1 + Math.sin(time) * 0.1;
    const alpha = this.state === FireState.DYING ? 0.15 : 0.3;
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ts * 0.8 * pulseSize);
    gradient.addColorStop(0, `rgba(255, 150, 50, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 20, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, ts * 0.8 * pulseSize, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawFlames(ctx, ts) {
    const time = Date.now() / 100 + this.flameOffset;
    const scale = this.state === FireState.DYING ? 0.5 : 1;

    // Draw multiple flame layers
    for (let i = 0; i < 3; i++) {
      const layerTime = time + i * 1.5;
      const xOffset = Math.sin(layerTime * 0.8) * ts * 0.08;
      const height = (ts * 0.3 + Math.sin(layerTime) * ts * 0.05) * scale;
      
      // Outer flame (orange-red)
      ctx.fillStyle = i === 0 ? '#FF4500' : i === 1 ? '#FF6600' : '#FF8C00';
      ctx.beginPath();
      ctx.moveTo(-ts * 0.15 + xOffset, ts * 0.1);
      ctx.quadraticCurveTo(
        -ts * 0.1 + xOffset, -height * 0.5,
        xOffset, -height
      );
      ctx.quadraticCurveTo(
        ts * 0.1 + xOffset, -height * 0.5,
        ts * 0.15 + xOffset, ts * 0.1
      );
      ctx.closePath();
      ctx.fill();
    }

    // Inner flame (yellow)
    const innerHeight = (ts * 0.2 + Math.sin(time * 1.2) * ts * 0.03) * scale;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-ts * 0.08, ts * 0.05);
    ctx.quadraticCurveTo(0, -innerHeight * 0.7, 0, -innerHeight);
    ctx.quadraticCurveTo(0, -innerHeight * 0.7, ts * 0.08, ts * 0.05);
    ctx.closePath();
    ctx.fill();

    // Core (white-yellow)
    ctx.fillStyle = '#FFFACD';
    ctx.beginPath();
    ctx.ellipse(0, ts * 0.02, ts * 0.05, ts * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawSparks(ctx) {
    for (const spark of this.sparks) {
      const alpha = spark.life / 1;
      ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawAsh(ctx, ts) {
    ctx.fillStyle = '#3D3D3D';
    ctx.beginPath();
    ctx.ellipse(0, ts * 0.15, ts * 0.2, ts * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
