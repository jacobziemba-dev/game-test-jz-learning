class Vendor {
  constructor(col, row, world, config = {}) {
    this.col = col;
    this.row = row;
    this.world = world;

    this.id = config.id ?? `vendor_${col}_${row}`;
    this.name = config.name ?? 'Merchant';
    this.shopType = config.shopType ?? 'general';
    this.greeting = config.greeting ?? 'Take a look at my wares.';

    this._restockTick = 0;
    this._restockEvery = 12;
    this._animTimer = 0;
    this._visual = {
      anim: new AnimationStateMachine(SpriteManifest?.clips?.vendor?.clips ?? {}, 'idle'),
    };

    this.stock = new Map();
    this._seedStock(Array.isArray(config.stock) ? config.stock : []);
  }

  _seedStock(entries) {
    this.stock.clear();
    for (const entry of entries) {
      if (!entry || !entry.itemId) continue;
      const qty = Math.max(0, Math.floor(entry.quantity ?? 0));
      const restockTo = Math.max(qty, Math.floor(entry.restockTo ?? qty));
      this.stock.set(entry.itemId, {
        quantity: qty,
        restockTo,
      });
    }
  }

  getStockQuantity(itemId) {
    return this.stock.get(itemId)?.quantity ?? 0;
  }

  setStockQuantity(itemId, quantity, restockTo = null) {
    const current = this.stock.get(itemId);
    const normalizedQty = Math.max(0, Math.floor(quantity));
    const normalizedRestock = Math.max(
      normalizedQty,
      Math.floor(restockTo ?? current?.restockTo ?? Math.max(1, normalizedQty))
    );

    this.stock.set(itemId, {
      quantity: normalizedQty,
      restockTo: normalizedRestock,
    });
  }

  adjustStock(itemId, delta, minRestockTo = 1) {
    const current = this.stock.get(itemId);
    if (!current) {
      const qty = Math.max(0, Math.floor(delta));
      this.stock.set(itemId, {
        quantity: qty,
        restockTo: Math.max(minRestockTo, qty),
      });
      return;
    }

    current.quantity = Math.max(0, Math.floor(current.quantity + delta));
    current.restockTo = Math.max(current.restockTo, minRestockTo);
  }

  getBuyEntries() {
    const out = [];
    for (const [itemId, state] of this.stock.entries()) {
      if (state.quantity <= 0) continue;
      const item = ItemRegistry.get(itemId);
      if (!item) continue;
      out.push({ itemId, item, quantity: state.quantity });
    }
    out.sort((a, b) => a.item.name.localeCompare(b.item.name));
    return out;
  }

  update(dt) {
    this._restockTick += dt;
    this._animTimer += dt;

    this._visual.anim.setClip('idle');
    this._visual.anim.update(dt);

    if (this._restockTick < this._restockEvery) return;
    this._restockTick = 0;

    for (const state of this.stock.values()) {
      if (state.quantity < state.restockTo) {
        state.quantity += 1;
      }
    }
  }

  serialize() {
    const stock = [];
    for (const [itemId, state] of this.stock.entries()) {
      stock.push({
        itemId,
        quantity: state.quantity,
        restockTo: state.restockTo,
      });
    }

    return {
      id: this.id,
      name: this.name,
      shopType: this.shopType,
      greeting: this.greeting,
      col: this.col,
      row: this.row,
      stock,
    };
  }

  applyState(data) {
    if (!data || !Array.isArray(data.stock)) return;

    this._seedStock(data.stock);
  }

  render(ctx, camera, tileSize) {
    const x = this.col * tileSize - camera.x;
    const y = this.row * tileSize - camera.y;
    const clipConfig = SpriteManifest?.clips?.vendor;
    const hasSpriteRuntime = !!clipConfig && !!this.world?.spriteSystem;
    const drawScale = clipConfig?.drawScale ?? 4.2;
    const drawSize = tileSize * drawScale;
    const groundY = y + tileSize * 0.745;
    const spriteTop = groundY - drawSize * 0.62;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    ctx.beginPath();
    ctx.ellipse(x + tileSize * 0.5, groundY + tileSize * 0.008, tileSize * 0.24, tileSize * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!this._renderSprite(ctx, camera, tileSize, x, y)) {
      ctx.fillStyle = this.shopType === 'crafting' ? '#ffe0b2' : '#b3e5fc';
      ctx.beginPath();
      ctx.arc(x + tileSize * 0.5, y + tileSize * 0.38, tileSize * 0.24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.shopType === 'crafting' ? '#8d6e63' : '#455a64';
      ctx.beginPath();
      ctx.roundRect(x + tileSize * 0.26, y + tileSize * 0.48, tileSize * 0.48, tileSize * 0.28, 5);
      ctx.fill();

      ctx.strokeStyle = '#26323866';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = '#fff9';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelY = hasSpriteRuntime ? spriteTop + drawSize * 0.40 - 12 : y + tileSize * 0.02;
    ctx.fillText(this.shopType === 'crafting' ? 'Artisan' : 'Shop', x + tileSize * 0.5, labelY);

    ctx.restore();
  }

  _renderSprite(ctx, camera, tileSize, x, y) {
    const clipConfig = SpriteManifest?.clips?.vendor;
    const spriteSystem = this.world?.spriteSystem;
    if (!clipConfig || !spriteSystem) return false;

    const frameKey = this._visual.anim.getFrameKey();
    if (!frameKey) return false;

    const drawSize = tileSize * (clipConfig.drawScale ?? 1.2);
    const groundY = y + tileSize * 0.745;
    return spriteSystem.drawFrame(
      ctx,
      clipConfig.atlasId,
      frameKey,
      x + tileSize * 0.5,
      groundY,
      drawSize,
      drawSize,
      { anchorX: 0.5, anchorY: 0.62, pixelPerfect: true }
    );
  }
}
