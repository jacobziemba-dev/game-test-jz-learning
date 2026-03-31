class Camera {
  constructor(width, height, world) {
    this.width = width;
    this.height = height;
    this.world = world;
    this.x = 0; // world pixel offset
    this.y = 0;
    this._target = null;
  }

  follow(entity) {
    this._target = entity;
  }

  update() {
    if (!this._target) return;

    // Center camera on target
    this.x = this._target.x - this.width / 2;
    this.y = this._target.y - this.height / 2;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, this.world.width - this.width));
    this.y = Math.max(0, Math.min(this.y, this.world.height - this.height));
  }

  // Convert world pixel coords to screen pixel coords
  worldToScreen(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  }

  // Convert screen pixel coords to world pixel coords
  screenToWorld(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
  }

  // Convert screen pixel coords to tile coords
  screenToTile(sx, sy) {
    const world = this.screenToWorld(sx, sy);
    return {
      col: Math.floor(world.x / this.world.tileSize),
      row: Math.floor(world.y / this.world.tileSize),
    };
  }
}
