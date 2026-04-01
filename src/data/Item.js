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
  constructor({
    id,
    name,
    description = '',
    type = 'misc',
    stackable = true,
    maxStack = 1000,
    equipSlot = null,
    bonuses = {},
    rarity = 'common',
    requiredSkills = [],
    draw,
  }) {
    this.id          = id;
    this.name        = name;
    this.description = description;
    this.type        = type;
    this.stackable   = stackable;
    this.maxStack    = maxStack;
    this.equipSlot   = equipSlot;
    this.bonuses     = bonuses;
    this.rarity      = rarity;
    this.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
    this._draw       = draw;
  }

  /** Render this item's icon into a (size × size) box whose top-left is (x, y). */
  draw(ctx, x, y, size) {
    if (this._draw) {
      this._draw(ctx, x, y, size);
      return;
    }

    const colorByType = {
      resource: '#90a4ae',
      weapon: '#b0bec5',
      armor: '#8d6e63',
      food: '#ffcc80',
      misc: '#9575cd',
      tool: '#ffd54f',
      jewellery: '#ffb74d',
      pottery: '#a1887f',
    };
    const fill = colorByType[this.type] ?? '#9e9e9e';

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x + size * 0.16, y + size * 0.16, size * 0.68, size * 0.68, 4);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.4, size * 0.08);
  }
}
