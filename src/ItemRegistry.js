/**
 * ItemRegistry — central catalog of every item in the game.
 *
 * To add a new item:
 *   1. Call ItemRegistry.register({ id, name, description, type, stackable, maxStack, draw })
 *   2. Use ItemRegistry.get('your_item_id') anywhere you need to reference it.
 *
 * The draw function receives (ctx, x, y, size) and should render the icon within
 * a (size × size) bounding box starting at (x, y).
 */
const ItemRegistry = (() => {
  const _items = {};

  function register(def) {
    if (_items[def.id]) {
      console.warn(`ItemRegistry: overwriting existing item '${def.id}'`);
    }
    _items[def.id] = new Item(def);
  }

  function get(id) {
    if (!_items[id]) {
      console.error(`ItemRegistry: unknown item '${id}'`);
      return null;
    }
    return _items[id];
  }

  function all() {
    return Object.values(_items);
  }

  return { register, get, all };
})();

// ─── Item Definitions ────────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'log',
  name: 'Logs',
  description: 'Freshly cut logs from a tree. Used for crafting and firemaking.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r  = size * 0.38;

    // Log body (horizontal cylinder)
    const grad = ctx.createLinearGradient(cx, cy - r * 0.5, cx, cy + r * 0.5);
    grad.addColorStop(0, '#a1887f');
    grad.addColorStop(0.5, '#6d4c41');
    grad.addColorStop(1, '#4e342e');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left end cap
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(cx - r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right end cap (cross-section)
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tree rings on right end
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.14, r * 0.27, 0, 0, Math.PI * 2);
    ctx.stroke();
  },
});

// ─── Woodcutting crafting outputs ────────────────────────────────────────────

ItemRegistry.register({
  id: 'arrow_shaft',
  name: 'Arrow Shaft',
  description: 'A thin wooden shaft. Attach a head and feather to make an arrow.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 4);
    // Shaft
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.38);
    ctx.lineTo(0, size * 0.38);
    ctx.stroke();
    // Notch at bottom
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-3, size * 0.3);
    ctx.lineTo(3, size * 0.38);
    ctx.moveTo(3, size * 0.3);
    ctx.lineTo(-3, size * 0.38);
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'crude_bow',
  name: 'Crude Bow',
  description: 'A simple unstrung bow carved from wood.',
  type: 'weapon',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Bow arc
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(size * 0.15, 0, size * 0.38, -Math.PI * 0.65, Math.PI * 0.65);
    ctx.stroke();
    // String
    ctx.strokeStyle = '#bcaaa4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size * 0.15 + size * 0.38 * Math.cos(-Math.PI * 0.65), size * 0.38 * Math.sin(-Math.PI * 0.65));
    ctx.lineTo(size * 0.15 + size * 0.38 * Math.cos(Math.PI * 0.65),  size * 0.38 * Math.sin(Math.PI * 0.65));
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'plank',
  name: 'Plank',
  description: 'A flat wooden plank. Useful for construction.',
  type: 'resource',
  stackable: true,
  maxStack: 500,
  draw(ctx, x, y, size) {
    const pad = size * 0.1;
    const pw  = size - pad * 2;
    const ph  = size * 0.35;
    const px  = x + pad;
    const py  = y + (size - ph) / 2;
    // Plank body
    const grad = ctx.createLinearGradient(px, py, px, py + ph);
    grad.addColorStop(0, '#bcaaa4');
    grad.addColorStop(1, '#8d6e63');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 2);
    ctx.fill();
    // Wood grain lines
    ctx.strokeStyle = '#795548';
    ctx.lineWidth   = 0.8;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(px + pw * (i / 3), py + 2);
      ctx.lineTo(px + pw * (i / 3), py + ph - 2);
      ctx.stroke();
    }
  },
});

ItemRegistry.register({
  id: 'longbow',
  name: 'Longbow',
  description: 'A tall unstrung longbow. More powerful than a crude bow.',
  type: 'weapon',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Larger bow arc
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(size * 0.12, 0, size * 0.44, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    // String
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 1;
    const r = size * 0.44, a = Math.PI * 0.7, ox = size * 0.12;
    ctx.beginPath();
    ctx.moveTo(ox + r * Math.cos(-a), r * Math.sin(-a));
    ctx.lineTo(ox + r * Math.cos(a),  r * Math.sin(a));
    ctx.stroke();
    ctx.restore();
  },
});

// ─── Equipment items ─────────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'bronze_sword',
  name: 'Bronze Sword',
  description: 'A basic sword forged from bronze.',
  type: 'weapon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  bonuses: { attack: 7, strength: 3 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    // Blade
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.42);
    ctx.lineTo(size * 0.09, size * 0.1);
    ctx.lineTo(-size * 0.09, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Guard
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(-size * 0.22, size * 0.07, size * 0.44, size * 0.07);
    // Handle
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.05, size * 0.12, size * 0.1, size * 0.22);
    // Pommel
    ctx.fillStyle = '#cd7f32';
    ctx.beginPath();
    ctx.arc(0, size * 0.34, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'iron_sword',
  name: 'Iron Sword',
  description: 'A sturdy sword forged from iron.',
  type: 'weapon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  bonuses: { attack: 10, strength: 5 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    // Blade (darker iron tone)
    ctx.fillStyle = '#90a4ae';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.44);
    ctx.lineTo(size * 0.1, size * 0.1);
    ctx.lineTo(-size * 0.1, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Blade fuller (center line)
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.38);
    ctx.lineTo(0, size * 0.04);
    ctx.stroke();
    // Guard
    ctx.fillStyle = '#607d8b';
    ctx.fillRect(-size * 0.24, size * 0.07, size * 0.48, size * 0.07);
    // Handle
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.055, size * 0.12, size * 0.11, size * 0.22);
    // Pommel
    ctx.fillStyle = '#607d8b';
    ctx.beginPath();
    ctx.arc(0, size * 0.35, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'bronze_shield',
  name: 'Bronze Shield',
  description: 'A kite shield of bronze. Good for blocking.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'offhand',
  bonuses: { defence: 5 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Shield body
    ctx.fillStyle = '#cd7f32';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.42);
    ctx.lineTo(-size * 0.36, size * 0.04);
    ctx.lineTo(-size * 0.36, -size * 0.28);
    ctx.lineTo(0, -size * 0.38);
    ctx.lineTo(size * 0.36, -size * 0.28);
    ctx.lineTo(size * 0.36, size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Boss (center rivet)
    ctx.fillStyle = '#e8a83e';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Cross emblem
    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.22); ctx.lineTo(0, size * 0.28);
    ctx.moveTo(-size * 0.24, -size * 0.08); ctx.lineTo(size * 0.24, -size * 0.08);
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'leather_body',
  name: 'Leather Body',
  description: 'A simple leather chest piece. Lightweight protection.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  bonuses: { defence: 8 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Torso shape
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(-size * 0.32, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.32, -size * 0.38);
    ctx.lineTo(size * 0.12, -size * 0.44);  // right neck
    ctx.lineTo(-size * 0.12, -size * 0.44); // left neck
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Lacing down center
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const laceY = i * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(-size * 0.06, laceY - size * 0.04);
      ctx.lineTo(size * 0.06, laceY + size * 0.04);
      ctx.stroke();
    }
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'leather_legs',
  name: 'Leather Legs',
  description: 'Leather leg protection. Covers the lower body.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'legs',
  bonuses: { defence: 5 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Waistband
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-size * 0.36, -size * 0.42, size * 0.72, size * 0.14);
    // Left leg
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.roundRect(-size * 0.36, -size * 0.28, size * 0.3, size * 0.7, 4);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.roundRect(size * 0.06, -size * 0.28, size * 0.3, size * 0.7, 4);
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-size * 0.36, -size * 0.28, size * 0.3, size * 0.7, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(size * 0.06, -size * 0.28, size * 0.3, size * 0.7, 4);
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'leather_hat',
  name: 'Leather Coif',
  description: 'A close-fitting leather cap that protects the head.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'head',
  bonuses: { defence: 2 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Cap dome
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.arc(0, -size * 0.06, size * 0.36, Math.PI, 0, false);
    ctx.fill();
    // Brim
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-size * 0.38, -size * 0.08, size * 0.76, size * 0.12);
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -size * 0.06, size * 0.36, Math.PI, 0, false);
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'leather_gloves',
  name: 'Leather Gloves',
  description: 'Simple leather gloves.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'hands',
  bonuses: { defence: 1 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Palm
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.roundRect(-size * 0.28, -size * 0.18, size * 0.56, size * 0.44, 4);
    ctx.fill();
    // Fingers (three bumps at top)
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * size * 0.14, -size * 0.22, size * 0.1, Math.PI, 0, false);
      ctx.fill();
    }
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-size * 0.28, -size * 0.18, size * 0.56, size * 0.44, 4);
    ctx.stroke();
    // Cuff strap
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-size * 0.28, size * 0.2, size * 0.56, size * 0.1);
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'leather_boots',
  name: 'Leather Boots',
  description: 'Sturdy leather boots.',
  type: 'armor',
  stackable: false,
  maxStack: 1,
  equipSlot: 'boots',
  bonuses: { defence: 2 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // Shaft (upper boot)
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.roundRect(-size * 0.2, -size * 0.4, size * 0.4, size * 0.44, 4);
    ctx.fill();
    // Foot
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.roundRect(-size * 0.22, size * 0.0, size * 0.5, size * 0.24, 4);
    ctx.fill();
    ctx.strokeStyle = '#4a2c21';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-size * 0.22, size * 0.0, size * 0.5, size * 0.24, 4);
    ctx.stroke();
    // Laces
    ctx.strokeStyle = '#bcaaa4';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const ly = -size * 0.3 + i * size * 0.12;
      ctx.beginPath();
      ctx.moveTo(-size * 0.14, ly);
      ctx.lineTo(size * 0.14, ly);
      ctx.stroke();
    }
    ctx.restore();
  },
});

// ─── Future items (add as new skills are implemented) ────────────────────────
// ItemRegistry.register({ id: 'iron_ore',  name: 'Iron Ore',   type: 'resource', ... });
// ItemRegistry.register({ id: 'raw_fish',  name: 'Raw Fish',   type: 'resource', ... });
// ItemRegistry.register({ id: 'iron_bar',  name: 'Iron Bar',   type: 'resource', ... });
