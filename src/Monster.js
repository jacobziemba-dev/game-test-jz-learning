const MonsterState = {
  ALIVE: 'ALIVE',
  DEAD: 'DEAD',
};

class Monster {
  constructor(col, row, world, config = {}) {
    this.world = world;
    this.tileSize = world.tileSize;

    this.col = col;
    this.row = row;
    this.x = (col + 0.5) * this.tileSize;
    this.y = (row + 0.5) * this.tileSize;

    this.name = config.name ?? 'Goblin';
    this.level = config.level ?? 2;
    this.attack = config.attack ?? 3;
    this.strength = config.strength ?? 3;
    this.defence = config.defence ?? 2;
    this.maxHitpoints = config.maxHitpoints ?? 8;
    this.family = config.family ?? 'goblin';
    this.dropTableId = config.dropTableId ?? 'goblin_common';
    this.respawnMin = config.respawnMin ?? 8;
    this.respawnMax = config.respawnMax ?? 14;
    this.guaranteedDrops = config.guaranteedDrops ?? [];
    this.randomDrops = config.randomDrops ?? [];
    this.randomDropRolls = config.randomDropRolls ?? 1;

    this.currentHitpoints = this.maxHitpoints;
    this.state = MonsterState.ALIVE;
    this.respawnTimer = 0;

    this.attackTimer = 0;
    this.attackSpeed = 1.8;
    this._attackAnimTimer = 0;
    this._hurtAnimTimer = 0;
    this._deathAnimTimer = 0;

    this._pendingHitsplats = [];
    this._visual = {
      anim: new AnimationStateMachine(SpriteManifest?.clips?.monster?.clips ?? {}, 'idle'),
    };
  }

  get isAlive() {
    return this.state === MonsterState.ALIVE;
  }

  isInMeleeRange(player) {
    const dc = Math.abs(this.col - player.col);
    const dr = Math.abs(this.row - player.row);
    return dc <= 1 && dr <= 1;
  }

  takeDamage(amount) {
    if (!this.isAlive) return false;

    const dmg = Math.max(0, Math.floor(amount));
    if (dmg <= 0) {
      this._queueHitsplat(0, '#b0bec5');
      return false;
    }

    this.currentHitpoints -= dmg;
    this._queueHitsplat(dmg, '#ffd54f');
    this._hurtAnimTimer = 0.28;

    if (this.currentHitpoints <= 0) {
      this.currentHitpoints = 0;
      this._die();
      return true;
    }

    return false;
  }

  update(dt, player) {
    this._attackAnimTimer = Math.max(0, this._attackAnimTimer - dt);
    this._hurtAnimTimer = Math.max(0, this._hurtAnimTimer - dt);
    this._deathAnimTimer = Math.max(0, this._deathAnimTimer - dt);

    if (!this.isAlive) this._visual.anim.setClip('death');
    else if (this._hurtAnimTimer > 0) this._visual.anim.setClip('hurt');
    else if (this._attackAnimTimer > 0) this._visual.anim.setClip('attack');
    else this._visual.anim.setClip('idle');

    this._visual.anim.update(dt);

    for (const hs of this._pendingHitsplats) hs.ttl -= dt;
    this._pendingHitsplats = this._pendingHitsplats.filter(hs => hs.ttl > 0);

    if (!this.isAlive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this._respawn();
      }
      return;
    }

    // Monsters only retaliate for now when actively targeted.
    if (player.targetMonster !== this) return;

    if (!this.isInMeleeRange(player)) return;

    this.attackTimer -= dt;
    if (this.attackTimer > 0) return;

    this.attackTimer = this.attackSpeed;
    this._attackAnimTimer = 0.22;
    const hitChance = this._rollHitChanceAgainstPlayer(player);
    if (Math.random() > hitChance) {
      player.takeDamage(0);
      return;
    }

    const maxHit = Math.max(1, Math.floor(this.strength / 2));
    const damage = 1 + Math.floor(Math.random() * maxHit);
    player.takeDamage(damage);
  }

  render(ctx, camera) {
    if (!this.isAlive && this._deathAnimTimer <= 0) return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const r = this.tileSize * 0.3;
    const clipConfig = SpriteManifest?.clips?.monster;
    const hasSpriteRuntime = !!clipConfig && !!this.world?.spriteSystem;
    const drawScale = clipConfig?.drawScale ?? 4.6;
    const drawSize = this.tileSize * drawScale;
    const groundY = sy + this.tileSize * 0.225;
    const spriteTop = groundY - drawSize * 0.62;

    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(sx, groundY + this.tileSize * 0.008, r * 0.8, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const drewSprite = this._renderSprite(ctx, camera, sx, sy);
    if (!drewSprite) {
      ctx.fillStyle = '#8bc34a';
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#33691e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath();
      ctx.arc(sx - r * 0.22, sy - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.arc(sx + r * 0.22, sy - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // HP bar
    if (this.isAlive) {
      const bw = this.tileSize * 0.65;
      const bh = 6;
      const bx = sx - bw / 2;
      const by = drewSprite && hasSpriteRuntime
        ? spriteTop + drawSize * 0.40 - 12
        : sy - r - 12;
      const hpPct = this.currentHitpoints / this.maxHitpoints;

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#e53935';
      ctx.fillRect(bx + 1, by + 1, (bw - 2) * hpPct, bh - 2);

      // Label
      ctx.fillStyle = '#f5f5f5';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${this.name} (Lv ${this.level})`, sx, by - 2);
    }

    // Hitsplats
    for (const hs of this._pendingHitsplats) {
      const rise = (1 - hs.ttl / hs.maxTtl) * 14;
      const alpha = Math.max(0, hs.ttl / hs.maxTtl);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = hs.color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${hs.value}`, sx, sy - r - 22 - rise);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  _renderSprite(ctx, camera, sx, sy) {
    const clipConfig = SpriteManifest?.clips?.monster;
    const spriteSystem = this.world?.spriteSystem;
    if (!clipConfig || !spriteSystem) return false;

    const frameKey = this._visual.anim.getFrameKey();
    if (!frameKey) return false;

    const ts = this.tileSize;
    const drawSize = ts * (clipConfig.drawScale ?? 1.2);

    const groundY = sy + ts * 0.225;
    return spriteSystem.drawFrame(
      ctx,
      clipConfig.atlasId,
      frameKey,
      sx,
      groundY,
      drawSize,
      drawSize,
      { anchorX: 0.5, anchorY: 0.62, pixelPerfect: true }
    );
  }

  _die() {
    this.world.spawnDropsForMonster(this);
    this.state = MonsterState.DEAD;
    this.respawnTimer = this.respawnMin + Math.random() * (this.respawnMax - this.respawnMin);
    this._deathAnimTimer = 0.55;
    this._attackAnimTimer = 0;
    this._hurtAnimTimer = 0;
    this._visual.anim.setClip('death', true);
  }

  _respawn() {
    this.state = MonsterState.ALIVE;
    this.currentHitpoints = this.maxHitpoints;
    this.attackTimer = 0;
    this.respawnTimer = 0;
    this._deathAnimTimer = 0;
    this._attackAnimTimer = 0;
    this._hurtAnimTimer = 0;
    this._visual.anim.setClip('idle', true);
  }

  _queueHitsplat(value, color) {
    this._pendingHitsplats.push({
      value,
      color,
      ttl: 0.6,
      maxTtl: 0.6,
    });
  }

  _rollHitChanceAgainstPlayer(player) {
    const playerDef = player.getEffectiveDefence();
    const attackScore = this.attack + this.level * 0.75;
    const defenceScore = Math.max(1, playerDef * 0.8);
    const raw = attackScore / (attackScore + defenceScore);
    return Math.max(0.15, Math.min(0.9, raw));
  }

  serialize() {
    return {
      col: this.col,
      row: this.row,
      name: this.name,
      level: this.level,
      attack: this.attack,
      strength: this.strength,
      defence: this.defence,
      maxHitpoints: this.maxHitpoints,
      family: this.family,
      dropTableId: this.dropTableId,
      currentHitpoints: this.currentHitpoints,
      respawnMin: this.respawnMin,
      respawnMax: this.respawnMax,
      state: this.state,
      respawnTimer: this.respawnTimer,
      guaranteedDrops: this.guaranteedDrops,
      randomDrops: this.randomDrops,
      randomDropRolls: this.randomDropRolls,
    };
  }
}
