/**
 * InventorySlot — one cell in the inventory grid.
 * Holds a reference to an Item definition and a quantity.
 */
class InventorySlot {
  constructor() {
    this.item     = null; // Item instance from ItemRegistry
    this.quantity = 0;
  }

  get isEmpty() { return this.item === null; }

  clear() {
    this.item     = null;
    this.quantity = 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inventory — grid-based container for items.
 *
 * Default size matches RuneScape's inventory: 4 columns × 7 rows = 28 slots.
 *
 * Public API:
 *   addItem(itemId, qty)          Add items; returns qty that couldn't fit (overflow)
 *   removeItem(itemId, qty)       Remove items by id; returns qty actually removed
 *   hasItem(itemId, qty)          Returns true if at least `qty` of that item exists
 *   countItem(itemId)             Total quantity of an item across all slots
 *   getSlot(index)                Returns InventorySlot at flat index
 *   slotAt(col, row)              Returns InventorySlot at grid position
 *   isFull()                      True if no empty slot and all stackable slots are maxed
 */
class Inventory {
  constructor(cols = 4, rows = 7) {
    this.cols  = cols;
    this.rows  = rows;
    this.size  = cols * rows;
    this.slots = Array.from({ length: this.size }, () => new InventorySlot());
  }

  /** Add `qty` of `itemId`. Returns any overflow that couldn't be added. */
  addItem(itemId, qty = 1) {
    const item = ItemRegistry.get(itemId);
    if (!item) return qty;

    let remaining = qty;

    if (item.stackable) {
      // First pass: top up existing stacks
      for (const slot of this.slots) {
        if (!slot.isEmpty && slot.item.id === itemId) {
          const space = item.maxStack - slot.quantity;
          const add   = Math.min(space, remaining);
          slot.quantity += add;
          remaining     -= add;
          if (remaining <= 0) return 0;
        }
      }
    }

    // Second pass: fill empty slots
    for (const slot of this.slots) {
      if (slot.isEmpty) {
        const add     = item.stackable ? Math.min(item.maxStack, remaining) : 1;
        slot.item     = item;
        slot.quantity = add;
        remaining     -= add;
        if (remaining <= 0) return 0;
      }
    }

    return remaining; // overflow
  }

  /** Remove `qty` of `itemId`. Returns how many were actually removed. */
  removeItem(itemId, qty = 1) {
    let toRemove = qty;
    let removed  = 0;

    for (const slot of this.slots) {
      if (!slot.isEmpty && slot.item.id === itemId) {
        const take    = Math.min(slot.quantity, toRemove);
        slot.quantity -= take;
        removed       += take;
        toRemove      -= take;
        if (slot.quantity === 0) slot.clear();
        if (toRemove <= 0) break;
      }
    }

    return removed;
  }

  /** Total quantity of an item across all slots. */
  countItem(itemId) {
    return this.slots.reduce((sum, s) =>
      (!s.isEmpty && s.item.id === itemId) ? sum + s.quantity : sum, 0);
  }

  /** True if inventory holds at least `qty` of `itemId`. */
  hasItem(itemId, qty = 1) {
    return this.countItem(itemId) >= qty;
  }

  /** Get slot by flat index (0 … size-1). */
  getSlot(index) {
    return this.slots[index] ?? null;
  }

  /** Get slot by grid position. */
  slotAt(col, row) {
    return this.slots[row * this.cols + col] ?? null;
  }

  /** True when no slot can accept any more items. */
  isFull() {
    return this.slots.every(s => {
      if (s.isEmpty) return false;
      if (!s.item.stackable) return true;
      return s.quantity >= s.item.maxStack;
    });
  }

  serialize() {
    return {
      cols: this.cols,
      rows: this.rows,
      slots: this.slots.map(slot => {
        if (slot.isEmpty) return null;
        return {
          itemId: slot.item.id,
          quantity: slot.quantity,
        };
      }),
    };
  }

  deserialize(data) {
    if (!data || !Array.isArray(data.slots)) return;

    for (const slot of this.slots) slot.clear();

    const max = Math.min(this.slots.length, data.slots.length);
    for (let i = 0; i < max; i++) {
      const raw = data.slots[i];
      if (!raw || !raw.itemId) continue;

      const item = ItemRegistry.get(raw.itemId);
      if (!item) continue;

      const qty = Math.max(1, Math.floor(raw.quantity ?? 1));
      this.slots[i].item = item;
      this.slots[i].quantity = item.stackable ? Math.min(item.maxStack, qty) : 1;
    }
  }
}
