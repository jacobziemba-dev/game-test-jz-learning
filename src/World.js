const TILE = {
  GRASS: 0,
  TREE: 1,
  ROCK: 2,
  NPC: 4,
};

const TILE_SIZE = 48;
const BASE_WORLD_COLS = 40;
const BASE_WORLD_ROWS = 40;
const VIEWPORT_TILE_PADDING = 6;

// How many trees to scatter (avoid 5x5 spawn area in center)
const TREE_DENSITY = 0.05;
const MONSTER_DENSITY = 0.01;
const ORE_NODE_DENSITY = 0.012;
const MIN_TREE_COUNT = 80;
const MIN_MONSTER_COUNT = 16;
const MIN_ORE_NODE_COUNT = 18;

const VENDOR_LAYOUT = [
  {
    id: 'general_merchant',
    name: 'Mara the Merchant',
    shopType: 'general',
    dc: 0,
    dr: 4,
    greeting: 'Need supplies? I buy and sell almost everything.',
    stock: [
      { itemId: 'thread', quantity: 20, restockTo: 20 },
      { itemId: 'wool', quantity: 16, restockTo: 16 },
      { itemId: 'needle', quantity: 3, restockTo: 3 },
      { itemId: 'chisel', quantity: 3, restockTo: 3 },
      { itemId: 'flax', quantity: 16, restockTo: 16 },
      { itemId: 'ball_of_wool', quantity: 10, restockTo: 10 },
      { itemId: 'clay', quantity: 16, restockTo: 16 },
      { itemId: 'soft_clay', quantity: 8, restockTo: 8 },
    ],
  },
  {
    id: 'crafting_merchant',
    name: 'Brom the Artisan',
    shopType: 'crafting',
    dc: -2,
    dr: 4,
    greeting: 'Fine moulds and bars for crafters.',
    stock: [
      { itemId: 'ring_mould', quantity: 3, restockTo: 3 },
      { itemId: 'necklace_mould', quantity: 3, restockTo: 3 },
      { itemId: 'amulet_mould', quantity: 3, restockTo: 3 },
      { itemId: 'silver_bar', quantity: 10, restockTo: 10 },
      { itemId: 'gold_bar', quantity: 8, restockTo: 8 },
      { itemId: 'cowhide', quantity: 8, restockTo: 8 },
      { itemId: 'leather', quantity: 8, restockTo: 8 },
    ],
  },
];

const MONSTER_ARCHETYPES = [
  {
    name: 'Goblin',
    family: 'goblin',
    dropTableId: 'goblin_common',
    level: 2,
    attack: 3,
    strength: 3,
    defence: 2,
    maxHitpoints: 8,
    respawnMin: 7,
    respawnMax: 12,
    weight: 54,
  },
  {
    name: 'Skeleton',
    family: 'skeleton',
    dropTableId: 'skeleton_guard',
    level: 5,
    attack: 6,
    strength: 5,
    defence: 5,
    maxHitpoints: 14,
    respawnMin: 11,
    respawnMax: 16,
    weight: 28,
  },
  {
    name: 'Bandit',
    family: 'bandit',
    dropTableId: 'bandit_raider',
    level: 8,
    attack: 8,
    strength: 8,
    defence: 7,
    maxHitpoints: 20,
    respawnMin: 12,
    respawnMax: 18,
    weight: 16,
  },
  {
    name: 'Ancient Giant',
    family: 'giant',
    dropTableId: 'ancient_giant_boss',
    level: 16,
    attack: 13,
    strength: 14,
    defence: 11,
    maxHitpoints: 38,
    respawnMin: 30,
    respawnMax: 45,
    weight: 2,
  },
];

class World {
  constructor() {
    this.tileSize = TILE_SIZE;
    this.cols = this._resolveCols();
    this.rows = this._resolveRows();
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    const totalTiles = this.cols * this.rows;
    this.treeTarget = Math.max(MIN_TREE_COUNT, Math.floor(totalTiles * TREE_DENSITY));
    this.monsterTarget = Math.max(MIN_MONSTER_COUNT, Math.floor(totalTiles * MONSTER_DENSITY));
    this.oreNodeTarget = Math.max(MIN_ORE_NODE_COUNT, Math.floor(totalTiles * ORE_NODE_DENSITY));

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

    // Ore nodes list
    this.oreNodes = [];
    this._spawnOreNodes();

    // Ground loot objects
    this.groundLoot = [];
    this._visibleLootCache = null;
    this._lastLootViewport = null;

    // Town vendors (starter economy)
    this.vendors = [];
    this._spawnVendors();
  }

  _resolveCols() {
    const viewportCols = Math.ceil((window.innerWidth || 0) / this.tileSize) + VIEWPORT_TILE_PADDING;
    return Math.max(BASE_WORLD_COLS, viewportCols);
  }

  _resolveRows() {
    const viewportRows = Math.ceil((window.innerHeight || 0) / this.tileSize) + VIEWPORT_TILE_PADDING;
    return Math.max(BASE_WORLD_ROWS, viewportRows);
  }

  _spawnTrees() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);
    let placed = 0;
    let attempts = 0;

    while (placed < this.treeTarget && attempts < this.treeTarget * 40) {
      attempts++;
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

  _spawnVendors() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);

    for (const def of VENDOR_LAYOUT) {
      const col = Math.max(1, Math.min(this.cols - 2, spawnCol + def.dc));
      const row = Math.max(1, Math.min(this.rows - 2, spawnRow + def.dr));

      this.trees = this.trees.filter(t => !(t.col === col && t.row === row));
      this.oreNodes = this.oreNodes.filter(n => !(n.col === col && n.row === row));
      this.monsters = this.monsters.filter(m => !(m.col === col && m.row === row));

      this.grid[row][col] = TILE.NPC;
      this.vendors.push(new Vendor(col, row, this, def));
    }
  }

  _spawnMonsters() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);
    let placed = 0;
    let attempts = 0;

    while (placed < this.monsterTarget && attempts < this.monsterTarget * 40) {
      attempts++;
      const col = Math.floor(Math.random() * this.cols);
      const row = Math.floor(Math.random() * this.rows);

      const dc = Math.abs(col - spawnCol);
      const dr = Math.abs(row - spawnRow);
      if (dc <= 4 && dr <= 4) continue;

      if (this.grid[row][col] !== TILE.GRASS) continue;
      if (this.monsters.some(m => m.col === col && m.row === row)) continue;

      const archetype = this._chooseWeightedDrop(MONSTER_ARCHETYPES);
      if (!archetype) continue;

      const table = DropTableRegistry.get(archetype.dropTableId);
      if (!table) continue;

      const monster = new Monster(col, row, this, {
        name: archetype.name,
        family: archetype.family,
        dropTableId: archetype.dropTableId,
        level: archetype.level,
        attack: archetype.attack,
        strength: archetype.strength,
        defence: archetype.defence,
        maxHitpoints: archetype.maxHitpoints,
        respawnMin: archetype.respawnMin,
        respawnMax: archetype.respawnMax,
        guaranteedDrops: table.guaranteed,
        randomDrops: table.random,
        randomDropRolls: table.randomDropRolls,
      });
      this.monsters.push(monster);
      placed++;
    }
  }

  _spawnOreNodes() {
    const spawnCol = Math.floor(this.cols / 2);
    const spawnRow = Math.floor(this.rows / 2);
    let placed = 0;
    let attempts = 0;

    while (placed < this.oreNodeTarget && attempts < this.oreNodeTarget * 45) {
      attempts++;
      const col = Math.floor(Math.random() * this.cols);
      const row = Math.floor(Math.random() * this.rows);

      const dc = Math.abs(col - spawnCol);
      const dr = Math.abs(row - spawnRow);
      if (dc <= 4 && dr <= 4) continue;

      if (this.grid[row][col] !== TILE.GRASS) continue;
      if (this.monsters.some(m => m.col === col && m.row === row)) continue;
      if (this.oreNodes.some(n => n.col === col && n.row === row)) continue;

      const isTin = placed % 2 === 1;
      const node = new OreNode(col, row, this, {
        name: isTin ? 'Tin Rock' : 'Copper Rock',
        oreItemId: isTin ? 'tin_ore' : 'copper_ore',
        xp: isTin ? 18 : 17,
      });

      this.oreNodes.push(node);
      this.grid[row][col] = TILE.ROCK;
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

  getOreNodeAt(col, row) {
    return this.oreNodes.find(n => n.col === col && n.row === row && n.state !== 'DEPLETED') || null;
  }

  getVendorAt(col, row) {
    return this.vendors.find(v => v.col === col && v.row === row) ?? null;
  }

  getLootAt(col, row) {
    const stack = this.getLootStackAt(col, row);
    return stack[0] ?? null;
  }

  getLootStackAt(col, row) {
    return this.groundLoot
      .filter(l => l.col === col && l.row === row && !l.isExpired)
      .sort((a, b) => {
        const aRank = this._rarityRank(ItemRegistry.get(a.itemId)?.rarity);
        const bRank = this._rarityRank(ItemRegistry.get(b.itemId)?.rarity);
        if (aRank !== bRank) return bRank - aRank;
        return b.quantity - a.quantity;
      });
  }

  spawnGroundLoot(col, row, itemId, quantity) {
    if (quantity <= 0) return;

    const item = ItemRegistry.get(itemId);
    if (!item) return;

    if (item.stackable) {
      const existing = this.groundLoot.find(l =>
        l.col === col && l.row === row && l.itemId === itemId && !l.isExpired
      );
      if (existing) {
        existing.quantity += quantity;
        existing.ttl = Math.max(existing.ttl, 20);
        return;
      }
    }

    const ttl = this._getLootTtl(item);
    this.groundLoot.push(new GroundLoot(col, row, itemId, quantity, ttl));
    this._visibleLootCache = null;
  }

  spawnDropsForMonster(monster) {
    const col = monster.col;
    const row = monster.row;

    for (const drop of monster.guaranteedDrops) {
      const qty = this._rollQuantity(drop.min, drop.max);
      this.spawnGroundLoot(col, row, drop.itemId, qty);
    }

    for (let i = 0; i < monster.randomDropRolls; i++) {
      const chosen = this._chooseWeightedDrop(monster.randomDrops);
      if (!chosen) continue;
      const qty = this._rollQuantity(chosen.min, chosen.max);
      this.spawnGroundLoot(col, row, chosen.itemId, qty);
    }
  }

  pickupLoot(loot, inventory) {
    if (!loot || loot.isExpired) return null;

    const item = ItemRegistry.get(loot.itemId);
    if (!item) return null;

    const overflow = inventory.addItem(loot.itemId, loot.quantity);
    const picked = loot.quantity - overflow;
    if (picked <= 0) return null;

    loot.quantity = overflow;
    if (loot.quantity <= 0) {
      this._removeLoot(loot);
    }

    return { itemName: item.name, quantity: picked, rarity: item.rarity ?? 'common' };
  }

  pickupAllLootAt(col, row, inventory, filterFn = null) {
    const stack = this.getLootStackAt(col, row);
    const pickups = [];

    for (const loot of stack) {
      if (filterFn && !filterFn(loot)) continue;
      const pickup = this.pickupLoot(loot, inventory);
      if (pickup) pickups.push(pickup);
    }

    return pickups;
  }

  update(dt, player) {
    for (const tree of this.trees) {
      tree.update(dt, this);
    }

    for (const monster of this.monsters) {
      monster.update(dt, player);
    }

    for (const oreNode of this.oreNodes) {
      oreNode.update(dt, this);
    }

    for (const vendor of this.vendors) {
      vendor.update(dt);
    }

    let expiredAny = false;
    for (const loot of this.groundLoot) {
      loot.update(dt);
      if (loot.isExpired) expiredAny = true;
    }
    if (expiredAny) {
      this.groundLoot = this.groundLoot.filter(l => !l.isExpired);
      this._visibleLootCache = null;
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

    const visibleOreNodes = this.oreNodes.filter(n =>
      n.col >= startCol - 1 && n.col <= endCol + 1 &&
      n.row >= startRow - 1 && n.row <= endRow + 1
    );
    visibleOreNodes.sort((a, b) => a.row - b.row);
    for (const oreNode of visibleOreNodes) {
      oreNode.render(ctx, camera, ts);
    }

    const visibleVendors = this.vendors.filter(v =>
      v.col >= startCol - 1 && v.col <= endCol + 1 &&
      v.row >= startRow - 1 && v.row <= endRow + 1
    );
    visibleVendors.sort((a, b) => a.row - b.row);
    for (const vendor of visibleVendors) {
      vendor.render(ctx, camera, ts);
    }

    const viewportKey = `${startCol},${startRow},${endCol},${endRow}`;
    if (!this._visibleLootCache || this._lastLootViewport !== viewportKey) {
      this._visibleLootCache = this.groundLoot.filter(l =>
        l.col >= startCol - 1 && l.col <= endCol + 1 &&
        l.row >= startRow - 1 && l.row <= endRow + 1
      );
      this._visibleLootCache.sort((a, b) => a.row - b.row);
      this._lastLootViewport = viewportKey;
    }

    for (const loot of this._visibleLootCache) {
      loot.render(ctx, camera, ts);
    }
  }

  _rollQuantity(min, max) {
    if (max <= min) return min;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  _chooseWeightedDrop(options) {
    if (!options || options.length === 0) return null;
    const totalWeight = options.reduce((sum, o) => sum + (o.weight ?? 0), 0);
    if (totalWeight <= 0) return options[0] ?? null;

    let roll = Math.random() * totalWeight;
    for (const opt of options) {
      roll -= (opt.weight ?? 0);
      if (roll <= 0) return opt;
    }
    return options[options.length - 1];
  }

  _removeLoot(loot) {
    const idx = this.groundLoot.indexOf(loot);
    if (idx >= 0) {
      this.groundLoot.splice(idx, 1);
      this._visibleLootCache = null;
    }
  }

  _getLootTtl(item) {
    const rarity = item?.rarity ?? 'common';
    if (rarity === 'unique') return 180;
    if (rarity === 'epic') return 120;
    if (rarity === 'rare') return 90;
    if (rarity === 'uncommon') return 55;
    return 35;
  }

  _rarityRank(rarity) {
    if (rarity === 'unique') return 5;
    if (rarity === 'epic') return 4;
    if (rarity === 'rare') return 3;
    if (rarity === 'uncommon') return 2;
    return 1;
  }

  serialize() {
    return {
      trees: this.trees.map(t => ({
        col: t.col,
        row: t.row,
        state: t.state,
        health: t.health,
        respawnTimer: t.respawnTimer,
      })),
      monsters: this.monsters.map(m => m.serialize()),
      oreNodes: this.oreNodes.map(n => ({
        col: n.col,
        row: n.row,
        name: n.name,
        oreItemId: n.oreItemId,
        xp: n.xp,
        state: n.state,
        health: n.health,
        respawnTimer: n.respawnTimer,
      })),
      groundLoot: this.groundLoot.map(l => ({
        col: l.col,
        row: l.row,
        itemId: l.itemId,
        quantity: l.quantity,
        ttl: l.ttl,
      })),
      vendors: this.vendors.map(v => v.serialize()),
    };
  }

  deserialize(data) {
    if (!data || typeof data !== 'object') return;

    if (Array.isArray(data.trees)) {
      for (const treeData of data.trees) {
        const tree = this.trees.find(t => t.col === treeData.col && t.row === treeData.row);
        if (!tree) continue;
        tree.state = treeData.state ?? tree.state;
        tree.health = Math.max(1, Math.floor(treeData.health ?? tree.health));
        tree.respawnTimer = Math.max(0, Number(treeData.respawnTimer ?? 0));
        this.grid[tree.row][tree.col] = tree.state === 'STUMP' ? TILE.GRASS : TILE.TREE;
      }
    }

    if (Array.isArray(data.monsters)) {
      this.monsters = data.monsters
        .filter(m => Number.isFinite(m?.col) && Number.isFinite(m?.row))
        .map(m => {
          const monster = new Monster(m.col, m.row, this, {
            name: m.name,
            family: m.family,
            dropTableId: m.dropTableId,
            level: m.level,
            attack: m.attack,
            strength: m.strength,
            defence: m.defence,
            maxHitpoints: m.maxHitpoints,
            respawnMin: m.respawnMin,
            respawnMax: m.respawnMax,
            guaranteedDrops: m.guaranteedDrops,
            randomDrops: m.randomDrops,
            randomDropRolls: m.randomDropRolls,
          });
          monster.state = m.state === 'DEAD' ? 'DEAD' : 'ALIVE';
          monster.currentHitpoints = Math.max(0, Math.min(monster.maxHitpoints, Math.floor(m.currentHitpoints ?? monster.maxHitpoints)));
          monster.respawnTimer = Math.max(0, Number(m.respawnTimer ?? 0));
          return monster;
        });
    }

    if (Array.isArray(data.oreNodes)) {
      this.oreNodes = data.oreNodes
        .filter(n => Number.isFinite(n?.col) && Number.isFinite(n?.row) && n?.oreItemId)
        .map(n => {
          const node = new OreNode(Math.floor(n.col), Math.floor(n.row), this, {
            name: n.name,
            oreItemId: n.oreItemId,
            xp: n.xp,
          });
          node.state = n.state === 'DEPLETED' ? 'DEPLETED' : 'ALIVE';
          node.health = Math.max(1, Math.floor(n.health ?? node.health));
          node.respawnTimer = Math.max(0, Number(n.respawnTimer ?? 0));
          this.grid[node.row][node.col] = node.state === 'DEPLETED' ? TILE.GRASS : TILE.ROCK;
          return node;
        });
    }

    this.groundLoot = [];
    this._visibleLootCache = null;
    if (Array.isArray(data.groundLoot)) {
      for (const l of data.groundLoot) {
        if (!l || !l.itemId) continue;
        const qty = Math.max(1, Math.floor(l.quantity ?? 1));
        const ttl = Math.max(0.1, Number(l.ttl ?? 30));
        this.groundLoot.push(new GroundLoot(Math.floor(l.col), Math.floor(l.row), l.itemId, qty, ttl));
      }
    }

    if (Array.isArray(data.vendors)) {
      this.vendors = [];
      for (const raw of data.vendors) {
        if (!raw || !Number.isFinite(raw.col) || !Number.isFinite(raw.row)) continue;

        const col = Math.max(1, Math.min(this.cols - 2, Math.floor(raw.col)));
        const row = Math.max(1, Math.min(this.rows - 2, Math.floor(raw.row)));
        const vendor = new Vendor(col, row, this, {
          id: raw.id,
          name: raw.name,
          shopType: raw.shopType,
          greeting: raw.greeting,
          stock: Array.isArray(raw.stock) ? raw.stock : [],
        });
        vendor.applyState(raw);
        this.grid[row][col] = TILE.NPC;
        this.vendors.push(vendor);
      }
    }
  }
}
