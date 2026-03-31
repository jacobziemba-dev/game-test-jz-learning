/**
 * Item — a definition (blueprint) for a type of item.
 * One Item instance describes the type; Inventory slots hold a reference to it + a quantity.
 *
 * Properties:
 *   id          {string}   Unique key used throughout the codebase ('log', 'iron_ore', etc.)
 *   name        {string}   Display name shown in UI
 *   description {string}   Tooltip description
 *   type        {string}   Category: 'resource' | 'weapon' | 'armor' | 'food' | 'misc'
 *   stackable   {boolean}  Whether multiple can occupy the same inventory slot
 *   maxStack    {number}   Max quantity per slot (only relevant when stackable = true)
 *   equipSlot   {string|null}  Equipment slot id ('weapon','body','head',etc.) or null if not equippable
 *   bonuses     {object}   Stat bonuses when equipped e.g. { attack: 7, strength: 3 }
 *   draw        {function} (ctx, x, y, size) => void — renders icon inside a (size × size) box at (x, y)
 */
class Item {
  constructor({ id, name, description = '', type = 'misc', stackable = true, maxStack = 1000, equipSlot = null, bonuses = {}, draw }) {
    this.id          = id;
    this.name        = name;
    this.description = description;
    this.type        = type;
    this.stackable   = stackable;
    this.maxStack    = maxStack;
    this.equipSlot   = equipSlot;
    this.bonuses     = bonuses;
    this._draw       = draw;
  }

  /** Render this item's icon into a (size × size) box whose top-left is (x, y). */
  draw(ctx, x, y, size) {
    if (this._draw) this._draw(ctx, x, y, size);
  }
}
