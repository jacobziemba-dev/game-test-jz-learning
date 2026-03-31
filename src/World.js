const TILE = {
  GRASS: 0,
  TREE: 1,
};

const TILE_SIZE = 48;
const WORLD_COLS = 40;
const WORLD_ROWS = 40;

// How many trees to scatter (avoid 5x5 spawn area in center)
const TREE_COUNT = 80;
const MONSTER_COUNT = 16;

class World {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.cols = WORLD_COLS;
    this.rows = WORLD_ROWS;
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    // 2D grid: grid[row][col]
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = new Array(this.cols).fill(TILE.GRASS);
    }

    // Trees list
    this.trees = [];
    this._spawnTrees();

    // Monsters list
    this.monsters = [];
    this._spawnMonsters();
  }

  _spawnTrees() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);
    let placed = 0;

    while (placed < TREE_COUNT) {
      const col = Math.floor(Math.random() * this.cols);
      const row = Math.floor(Math.random() * this.rows);

      // Keep spawn area clear (5-tile radius)
      const dc = Math.abs(col - spawnCol);
      const dr = Math.abs(row - spawnRow);
      if (dc <= 3 && dr <= 3) continue;

      if (this.grid[row][col] === TILE.GRASS) {
        this.grid[row][col] = TILE.TREE;
        const tree = new Tree(col, row, this);
        this.trees.push(tree);
        placed++;
      }
    }
  }

  _spawnMonsters() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);
    let placed = 0;
    let attempts = 0;

    while (placed < MONSTER_COUNT && attempts < MONSTER_COUNT * 40) {
      attempts++;
      const col = Math.floor(Math.random() * this.cols);
      const row = Math.floor(Math.random() * this.rows);

      const dc = Math.abs(col - spawnCol);
      const dr = Math.abs(row - spawnRow);
      if (dc <= 4 && dr <= 4) continue;

      if (this.grid[row][col] !== TILE.GRASS) continue;
      if (this.monsters.some(m => m.col === col && m.row === row)) continue;

      const monster = new Monster(col, row, this, {
        name: 'Goblin',
        level: 2,
        attack: 3,
        strength: 3,
        defence: 2,
        maxHitpoints: 8,
      });
      this.monsters.push(monster);
      placed++;
    }
  }

  isWalkable(col, row) {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false;
    return this.grid[row][col] === TILE.GRASS;
  }

  getTreeAt(col, row) {
    return this.trees.find(t => t.col === col && t.row === row && t.state !== 'STUMP') || null;
  }

  getMonsterAt(col, row) {
    return this.monsters.find(m => m.col === col && m.row === row && m.isAlive) || null;
  }

  update(dt, player) {
    for (const tree of this.trees) {
      tree.update(dt, this);
    }

    for (const monster of this.monsters) {
      monster.update(dt, player);
    }
  }

  render(ctx, camera) {
    const ts = this.tileSize;

    // Only render tiles visible on screen (culling)
    const startCol = Math.max(0, Math.floor(camera.x / ts));
    const startRow = Math.max(0, Math.floor(camera.y / ts));
    const endCol = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width) / ts));
    const endRow = Math.min(this.rows - 1, Math.ceil((camera.y + camera.height) / ts));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const sx = c * ts - camera.x;
        const sy = r * ts - camera.y;

        // Ground tile
        ctx.fillStyle = (r + c) % 2 === 0 ? '#3a7d44' : '#358040';
        ctx.fillRect(sx, sy, ts, ts);
      }
    }

    // Render trees sorted by row (Y) so lower trees draw on top
    const visibleTrees = this.trees.filter(t =>
      t.col >= startCol - 1 && t.col <= endCol + 1 &&
      t.row >= startRow - 1 && t.row <= endRow + 1
    );
    visibleTrees.sort((a, b) => a.row - b.row);
    for (const tree of visibleTrees) {
      tree.render(ctx, camera, ts);
    }

    const visibleMonsters = this.monsters.filter(m =>
      m.col >= startCol - 1 && m.col <= endCol + 1 &&
      m.row >= startRow - 1 && m.row <= endRow + 1
    );
    visibleMonsters.sort((a, b) => a.row - b.row);
    for (const monster of visibleMonsters) {
      monster.render(ctx, camera);
    }
  }
}
