class Pathfinder {
  /**
   * A* pathfinding on a tile grid.
   * @param {number} startCol
   * @param {number} startRow
   * @param {number} endCol
   * @param {number} endRow
   * @param {World} world
   * @returns {{col, row}[]} array of tiles from start (exclusive) to end (inclusive), or []
   */
  static findPath(startCol, startRow, endCol, endRow, world) {
    if (startCol === endCol && startRow === endRow) return [];
    if (!world.isWalkable(endCol, endRow)) return [];

    const key = (c, r) => `${c},${r}`;
    const heuristic = (c, r) => Math.abs(c - endCol) + Math.abs(r - endRow);

    const open = new Map();
    const closed = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = key(startCol, startRow);
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(startCol, startRow));
    open.set(startKey, { col: startCol, row: startRow });

    const dirs = [
      { dc: 0, dr: -1 }, { dc: 0, dr: 1 },
      { dc: -1, dr: 0 }, { dc: 1, dr: 0 },
    ];

    while (open.size > 0) {
      // Pick node with lowest fScore
      let current = null;
      let lowestF = Infinity;
      for (const [k, node] of open) {
        const f = fScore.get(k) ?? Infinity;
        if (f < lowestF) { lowestF = f; current = { key: k, ...node }; }
      }

      if (current.col === endCol && current.row === endRow) {
        // Reconstruct path
        const path = [];
        let k = current.key;
        while (cameFrom.has(k)) {
          const node = open.get(k) || { col: current.col, row: current.row };
          // Parse from key
          const [c, r] = k.split(',').map(Number);
          path.unshift({ col: c, row: r });
          k = cameFrom.get(k);
        }
        return path;
      }

      open.delete(current.key);
      closed.add(current.key);

      for (const { dc, dr } of dirs) {
        const nc = current.col + dc;
        const nr = current.row + dr;
        const nk = key(nc, nr);
        if (closed.has(nk)) continue;
        if (!world.isWalkable(nc, nr)) continue;

        const tentativeG = (gScore.get(current.key) ?? Infinity) + 1;
        if (tentativeG < (gScore.get(nk) ?? Infinity)) {
          cameFrom.set(nk, current.key);
          gScore.set(nk, tentativeG);
          fScore.set(nk, tentativeG + heuristic(nc, nr));
          open.set(nk, { col: nc, row: nr });
        }
      }
    }

    return []; // No path found
  }

  /**
   * Find a walkable tile adjacent to (treeCol, treeRow) that is closest to (fromCol, fromRow).
   */
  static findAdjacentTile(fromCol, fromRow, treeCol, treeRow, world) {
    const dirs = [
      { dc: 0, dr: -1 }, { dc: 0, dr: 1 },
      { dc: -1, dr: 0 }, { dc: 1, dr: 0 },
    ];
    let best = null;
    let bestDist = Infinity;
    for (const { dc, dr } of dirs) {
      const c = treeCol + dc;
      const r = treeRow + dr;
      if (world.isWalkable(c, r)) {
        const dist = Math.abs(c - fromCol) + Math.abs(r - fromRow);
        if (dist < bestDist) { bestDist = dist; best = { col: c, row: r }; }
      }
    }
    return best;
  }
}
21