class GroundLoot {
  constructor(col, row, itemId, quantity, ttlSeconds = 30) {
    this.col = col;
    this.row = row;
    this.itemId = itemId;
    this.quantity = quantity;
    this.ttl = ttlSeconds;
    this.maxTtl = ttlSeconds;
  }

  get isExpired() {
    return this.ttl <= 0 || this.quantity <= 0;
  }

  update(dt) {
    this.ttl -= dt;
  }

  render(ctx, camera, tileSize) {
    if (this.quantity <= 0) return;

    const item = ItemRegistry.get(this.itemId);
    if (!item) return;

    const cx = (this.col + 0.5) * tileSize - camera.x;
    const cy = (this.row + 0.5) * tileSize - camera.y;
    const iconSize = tileSize * 0.45;

    ctx.save();

    // Ground marker
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + iconSize * 0.35, iconSize * 0.7, iconSize * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    item.draw(ctx, cx - iconSize / 2, cy - iconSize / 2, iconSize);

    if (this.quantity > 1) {
      ctx.fillStyle = '#f5f5f5';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      const qtyText = `${this.quantity}`;
      ctx.strokeText(qtyText, cx + iconSize * 0.5, cy + iconSize * 0.6);
      ctx.fillText(qtyText, cx + iconSize * 0.5, cy + iconSize * 0.6);
    }

    ctx.restore();
  }
}
