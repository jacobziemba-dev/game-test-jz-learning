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

  function getRarityColor(rarity) {
    const colors = {
      common: '#f5f5f5',
      uncommon: '#81c784',
      rare: '#64b5f6',
      epic: '#ba68c8',
      unique: '#ffb74d',
    };
    return colors[rarity] ?? colors.common;
  }

  return { register, get, all, getRarityColor };
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

ItemRegistry.register({
  id: 'coins',
  name: 'Coins',
  description: 'A stack of gold coins.',
  type: 'currency',
  stackable: true,
  maxStack: 1000000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.18;
    const offsets = [
      [-r * 1.1, r * 0.6],
      [0, r * 0.2],
      [r * 1.1, -r * 0.2],
    ];

    for (const [ox, oy] of offsets) {
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy, r * 1.25, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
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
  rarity: 'uncommon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  requiredSkills: [{ skillId: 'attack', level: 1 }],
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
  rarity: 'rare',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  requiredSkills: [{ skillId: 'attack', level: 10 }],
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
  rarity: 'uncommon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'offhand',
  requiredSkills: [{ skillId: 'defence', level: 4 }],
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
  rarity: 'uncommon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  requiredSkills: [{ skillId: 'defence', level: 5 }],
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
  rarity: 'common',
  stackable: false,
  maxStack: 1,
  equipSlot: 'legs',
  requiredSkills: [{ skillId: 'defence', level: 3 }],
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
  rarity: 'common',
  stackable: false,
  maxStack: 1,
  equipSlot: 'head',
  requiredSkills: [{ skillId: 'defence', level: 2 }],
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
  rarity: 'common',
  stackable: false,
  maxStack: 1,
  equipSlot: 'hands',
  requiredSkills: [{ skillId: 'defence', level: 1 }],
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
  rarity: 'common',
  stackable: false,
  maxStack: 1,
  equipSlot: 'boots',
  requiredSkills: [{ skillId: 'defence', level: 1 }],
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

ItemRegistry.register({
  id: 'copper_ore',
  name: 'Copper Ore',
  description: 'Ore mined from a copper rock. Used for smithing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;

    ctx.fillStyle = '#6d7b80';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.8, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b87333';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.04, r * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy + r * 0.18, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'tin_ore',
  name: 'Tin Ore',
  description: 'Ore mined from a tin rock. Used for bronze smithing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;

    ctx.fillStyle = '#60727a';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.85, cy + r * 0.22);
    ctx.lineTo(cx - r * 0.45, cy - r * 0.62);
    ctx.lineTo(cx + r * 0.18, cy - r * 0.76);
    ctx.lineTo(cx + r * 0.82, cy - r * 0.12);
    ctx.lineTo(cx + r * 0.56, cy + r * 0.58);
    ctx.lineTo(cx - r * 0.05, cy + r * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.05, r * 0.15, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.24, cy + r * 0.14, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'bronze_bar',
  name: 'Bronze Bar',
  description: 'A bronze bar ready to smith into basic equipment.',
  type: 'resource',
  rarity: 'common',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const pad = size * 0.14;
    const w = size - pad * 2;
    const h = size * 0.42;
    const x0 = x + pad;
    const y0 = y + (size - h) / 2;

    const grad = ctx.createLinearGradient(x0, y0, x0, y0 + h);
    grad.addColorStop(0, '#d8a05d');
    grad.addColorStop(1, '#b87333');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();

    ctx.strokeStyle = '#8d5524';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(x0 + 4, y0 + 4);
    ctx.lineTo(x0 + w - 4, y0 + 4);
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'goblin_charm',
  name: 'Goblin Charm',
  description: 'A carved trinket stolen from a goblin war camp.',
  type: 'misc',
  rarity: 'rare',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.32;

    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#81c784';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'bandit_cache',
  name: 'Bandit Cache',
  description: 'A small pouch of valuables looted from desert bandits.',
  type: 'misc',
  rarity: 'epic',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const w = size * 0.62;
    const h = size * 0.48;
    const x0 = x + (size - w) / 2;
    const y0 = y + (size - h) / 2;

    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();

    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(x0 + w * 0.42, y0 + h * 0.1, w * 0.16, h * 0.8);
  },
});

ItemRegistry.register({
  id: 'giant_relic',
  name: 'Giant Relic',
  description: 'A unique relic dropped by an ancient giant.',
  type: 'misc',
  rarity: 'unique',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.32);
    ctx.lineTo(cx + size * 0.24, cy);
    ctx.lineTo(cx, cy + size * 0.32);
    ctx.lineTo(cx - size * 0.24, cy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffb74d';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  },
});

// ─── Classic crafting tools and materials ───────────────────────────────────

ItemRegistry.register({
  id: 'needle',
  name: 'Needle',
  description: 'Used with thread for leather crafting.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
});

ItemRegistry.register({
  id: 'thread',
  name: 'Thread',
  description: 'Used with a needle to stitch leather items.',
  type: 'tool',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'chisel',
  name: 'Chisel',
  description: 'Used to cut uncut gems.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
});

ItemRegistry.register({
  id: 'ring_mould',
  name: 'Ring Mould',
  description: 'A mould for crafting rings at a furnace.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
});

ItemRegistry.register({
  id: 'necklace_mould',
  name: 'Necklace Mould',
  description: 'A mould for crafting necklaces at a furnace.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
});

ItemRegistry.register({
  id: 'amulet_mould',
  name: 'Amulet Mould',
  description: 'A mould for crafting amulets at a furnace.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
});

ItemRegistry.register({
  id: 'cowhide',
  name: 'Cowhide',
  description: 'Raw hide that can be tanned into leather.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'leather',
  name: 'Leather',
  description: 'Tanned hide used for leather armour crafting.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'hard_leather',
  name: 'Hard Leather',
  description: 'A sturdier form of leather for higher tiers.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'wool',
  name: 'Wool',
  description: 'Can be spun into a ball of wool.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'ball_of_wool',
  name: 'Ball of Wool',
  description: 'Used for stringing amulets and cloth work.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'flax',
  name: 'Flax',
  description: 'Spin this on a wheel to make bowstring.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'bowstring',
  name: 'Bowstring',
  description: 'A spun string used for bows and fletching.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'bucket',
  name: 'Bucket',
  description: 'An empty bucket.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'bucket_of_water',
  name: 'Bucket of Water',
  description: 'Used to soften clay for pottery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'clay',
  name: 'Clay',
  description: 'Raw clay that can be softened and shaped.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'soft_clay',
  name: 'Soft Clay',
  description: 'Prepared clay for pottery wheel crafting.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'unfired_pot',
  name: 'Unfired Pot',
  description: 'Needs to be fired in a pottery oven.',
  type: 'pottery',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'unfired_bowl',
  name: 'Unfired Bowl',
  description: 'Needs to be fired in a pottery oven.',
  type: 'pottery',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'pot',
  name: 'Pot',
  description: 'A fired pottery pot.',
  type: 'pottery',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'bowl',
  name: 'Bowl',
  description: 'A fired pottery bowl.',
  type: 'pottery',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'broken_pottery',
  name: 'Broken Pottery',
  description: 'A failed pottery attempt.',
  type: 'misc',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'crushed_gem',
  name: 'Crushed Gem',
  description: 'A gem that shattered while being cut.',
  type: 'misc',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'silver_bar',
  name: 'Silver Bar',
  description: 'A bar of silver for crafting silver jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'gold_bar',
  name: 'Gold Bar',
  description: 'A bar of gold used to craft jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'uncut_sapphire',
  name: 'Uncut Sapphire',
  description: 'Can be cut with a chisel.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'uncut_emerald',
  name: 'Uncut Emerald',
  description: 'Can be cut with a chisel.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'uncut_ruby',
  name: 'Uncut Ruby',
  description: 'Can be cut with a chisel.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'uncut_diamond',
  name: 'Uncut Diamond',
  description: 'Can be cut with a chisel.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'sapphire',
  name: 'Sapphire',
  description: 'A cut gemstone used in jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'emerald',
  name: 'Emerald',
  description: 'A cut gemstone used in jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'ruby',
  name: 'Ruby',
  description: 'A cut gemstone used in jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({
  id: 'diamond',
  name: 'Diamond',
  description: 'A cut gemstone used in jewellery.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
});

ItemRegistry.register({ id: 'gold_ring', name: 'Gold Ring', description: 'A plain gold ring.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'gold_necklace', name: 'Gold Necklace', description: 'A plain gold necklace.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'gold_amulet_unstrung', name: 'Gold Amulet (u)', description: 'Needs stringing with wool.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'gold_amulet', name: 'Gold Amulet', description: 'A strung gold amulet.', type: 'jewellery', stackable: false, maxStack: 1 });

ItemRegistry.register({ id: 'sapphire_ring', name: 'Sapphire Ring', description: 'A gold ring set with sapphire.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'sapphire_necklace', name: 'Sapphire Necklace', description: 'A gold necklace set with sapphire.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'sapphire_amulet_unstrung', name: 'Sapphire Amulet (u)', description: 'Needs stringing with wool.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'sapphire_amulet', name: 'Sapphire Amulet', description: 'A strung sapphire amulet.', type: 'jewellery', stackable: false, maxStack: 1 });

ItemRegistry.register({ id: 'emerald_ring', name: 'Emerald Ring', description: 'A gold ring set with emerald.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'emerald_necklace', name: 'Emerald Necklace', description: 'A gold necklace set with emerald.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'emerald_amulet_unstrung', name: 'Emerald Amulet (u)', description: 'Needs stringing with wool.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'emerald_amulet', name: 'Emerald Amulet', description: 'A strung emerald amulet.', type: 'jewellery', stackable: false, maxStack: 1 });

ItemRegistry.register({ id: 'ruby_ring', name: 'Ruby Ring', description: 'A gold ring set with ruby.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'ruby_necklace', name: 'Ruby Necklace', description: 'A gold necklace set with ruby.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'ruby_amulet_unstrung', name: 'Ruby Amulet (u)', description: 'Needs stringing with wool.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'ruby_amulet', name: 'Ruby Amulet', description: 'A strung ruby amulet.', type: 'jewellery', stackable: false, maxStack: 1 });

ItemRegistry.register({ id: 'diamond_ring', name: 'Diamond Ring', description: 'A gold ring set with diamond.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'diamond_necklace', name: 'Diamond Necklace', description: 'A gold necklace set with diamond.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'diamond_amulet_unstrung', name: 'Diamond Amulet (u)', description: 'Needs stringing with wool.', type: 'jewellery', stackable: false, maxStack: 1 });
ItemRegistry.register({ id: 'diamond_amulet', name: 'Diamond Amulet', description: 'A strung diamond amulet.', type: 'jewellery', stackable: false, maxStack: 1 });

// ─── Tiered Logs (Woodcutting) ────────────────────────────────────────────────

ItemRegistry.register({
  id: 'oak_log',
  name: 'Oak Logs',
  description: 'Sturdy oak logs. Requires 15 Woodcutting to chop.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.38;
    const grad = ctx.createLinearGradient(cx, cy - r * 0.5, cx, cy + r * 0.5);
    grad.addColorStop(0, '#8B7355');
    grad.addColorStop(0.5, '#5D4E37');
    grad.addColorStop(1, '#3E2723');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6D5D4D';
    ctx.beginPath();
    ctx.ellipse(cx - r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5D4E37';
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.14, r * 0.27, 0, 0, Math.PI * 2);
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'willow_log',
  name: 'Willow Logs',
  description: 'Flexible willow logs. Requires 30 Woodcutting to chop.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.38;
    const grad = ctx.createLinearGradient(cx, cy - r * 0.5, cx, cy + r * 0.5);
    grad.addColorStop(0, '#9E9D7D');
    grad.addColorStop(0.5, '#7D7C5C');
    grad.addColorStop(1, '#5C5B3B');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8E8D6D';
    ctx.beginPath();
    ctx.ellipse(cx - r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7D7C5C';
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'maple_log',
  name: 'Maple Logs',
  description: 'Quality maple logs. Requires 45 Woodcutting to chop.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.38;
    const grad = ctx.createLinearGradient(cx, cy - r * 0.5, cx, cy + r * 0.5);
    grad.addColorStop(0, '#C4A35A');
    grad.addColorStop(0.5, '#A38139');
    grad.addColorStop(1, '#826018');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B4934A';
    ctx.beginPath();
    ctx.ellipse(cx - r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A38139';
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'yew_log',
  name: 'Yew Logs',
  description: 'Dense yew logs. Requires 60 Woodcutting to chop.',
  type: 'resource',
  rarity: 'uncommon',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.38;
    const grad = ctx.createLinearGradient(cx, cy - r * 0.5, cx, cy + r * 0.5);
    grad.addColorStop(0, '#8B4513');
    grad.addColorStop(0.5, '#6B3300');
    grad.addColorStop(1, '#4B2200');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7B3503';
    ctx.beginPath();
    ctx.ellipse(cx - r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6B3300';
    ctx.beginPath();
    ctx.ellipse(cx + r * 1.4, cy, r * 0.28, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  },
});

// ─── Tiered Ores (Mining) ─────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'iron_ore',
  name: 'Iron Ore',
  description: 'Ore mined from an iron rock. Requires 15 Mining.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;
    ctx.fillStyle = '#5D4E37';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.8, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.04, r * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy + r * 0.18, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'coal',
  name: 'Coal',
  description: 'Black coal used for smelting higher tier bars. Requires 30 Mining.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.8, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.04, r * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy + r * 0.18, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    // Shiny spots
    ctx.fillStyle = '#4A4A4A';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.2, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'mithril_ore',
  name: 'Mithril Ore',
  description: 'Dark blue mithril ore. Requires 55 Mining.',
  type: 'resource',
  rarity: 'uncommon',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;
    ctx.fillStyle = '#3D3D5C';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.8, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.04, r * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy + r * 0.18, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'adamant_ore',
  name: 'Adamantite Ore',
  description: 'Green adamantite ore. Requires 70 Mining.',
  type: 'resource',
  rarity: 'rare',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.34;
    ctx.fillStyle = '#2F4F4F';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy + r * 0.2);
    ctx.lineTo(cx - r * 0.55, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.1, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.8, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.5);
    ctx.lineTo(cx, cy + r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.04, r * 0.18, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.25, cy + r * 0.18, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  },
});

// ─── Tiered Bars (Smithing) ───────────────────────────────────────────────────

ItemRegistry.register({
  id: 'iron_bar',
  name: 'Iron Bar',
  description: 'An iron bar ready to smith into equipment.',
  type: 'resource',
  rarity: 'common',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const pad = size * 0.14;
    const w = size - pad * 2;
    const h = size * 0.42;
    const x0 = x + pad;
    const y0 = y + (size - h) / 2;
    const grad = ctx.createLinearGradient(x0, y0, x0, y0 + h);
    grad.addColorStop(0, '#A0A0A0');
    grad.addColorStop(1, '#606060');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'steel_bar',
  name: 'Steel Bar',
  description: 'A steel bar (iron + 2 coal). Requires 30 Smithing.',
  type: 'resource',
  rarity: 'uncommon',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const pad = size * 0.14;
    const w = size - pad * 2;
    const h = size * 0.42;
    const x0 = x + pad;
    const y0 = y + (size - h) / 2;
    const grad = ctx.createLinearGradient(x0, y0, x0, y0 + h);
    grad.addColorStop(0, '#C0C0C0');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(x0 + 4, y0 + 4);
    ctx.lineTo(x0 + w - 4, y0 + 4);
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'mithril_bar',
  name: 'Mithril Bar',
  description: 'A mithril bar (mithril + 4 coal). Requires 50 Smithing.',
  type: 'resource',
  rarity: 'rare',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const pad = size * 0.14;
    const w = size - pad * 2;
    const h = size * 0.42;
    const x0 = x + pad;
    const y0 = y + (size - h) / 2;
    const grad = ctx.createLinearGradient(x0, y0, x0, y0 + h);
    grad.addColorStop(0, '#6495ED');
    grad.addColorStop(1, '#4169E1');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#2F4F8F';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'adamant_bar',
  name: 'Adamant Bar',
  description: 'An adamant bar (adamant + 6 coal). Requires 70 Smithing.',
  type: 'resource',
  rarity: 'epic',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const pad = size * 0.14;
    const w = size - pad * 2;
    const h = size * 0.42;
    const x0 = x + pad;
    const y0 = y + (size - h) / 2;
    const grad = ctx.createLinearGradient(x0, y0, x0, y0 + h);
    grad.addColorStop(0, '#3CB371');
    grad.addColorStop(1, '#228B22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x0, y0, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

// ─── Raw Fish (Fishing) ───────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'raw_shrimp',
  name: 'Raw Shrimps',
  description: 'Small shrimp caught with a net. Requires 1 Fishing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3, size * 0.15, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'raw_trout',
  name: 'Raw Trout',
  description: 'A medium fish caught with a fly fishing rod. Requires 20 Fishing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    // Body
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.12);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx - size * 0.2, cy - size * 0.04, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'raw_salmon',
  name: 'Raw Salmon',
  description: 'A pink fish caught with a fly fishing rod. Requires 30 Fishing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#FA8072';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.12);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx - size * 0.2, cy - size * 0.04, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'raw_lobster',
  name: 'Raw Lobster',
  description: 'A large lobster caught with a cage. Requires 40 Fishing.',
  type: 'resource',
  rarity: 'uncommon',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#8B0000';
    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Claws
    ctx.beginPath();
    ctx.ellipse(cx - size * 0.28, cy - size * 0.15, size * 0.12, size * 0.08, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.28, cy - size * 0.15, size * 0.12, size * 0.08, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'raw_swordfish',
  name: 'Raw Swordfish',
  description: 'A large swordfish caught with a harpoon. Requires 50 Fishing.',
  type: 'resource',
  rarity: 'rare',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#4682B4';
    // Body
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.05, cy, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sword
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.25, cy);
    ctx.lineTo(cx - size * 0.45, cy);
    ctx.lineTo(cx - size * 0.25, cy + size * 0.03);
    ctx.closePath();
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.15);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.15);
    ctx.closePath();
    ctx.fill();
  },
});

// ─── Cooked Fish (Cooking) ────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'cooked_shrimp',
  name: 'Shrimps',
  description: 'Cooked shrimps. Heals 3 HP.',
  type: 'food',
  stackable: true,
  maxStack: 1000,
  healAmount: 3,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.3, size * 0.15, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#CD5C00';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'cooked_trout',
  name: 'Trout',
  description: 'Cooked trout. Heals 7 HP.',
  type: 'food',
  stackable: true,
  maxStack: 1000,
  healAmount: 7,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.12);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.12);
    ctx.closePath();
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'cooked_salmon',
  name: 'Salmon',
  description: 'Cooked salmon. Heals 9 HP.',
  type: 'food',
  stackable: true,
  maxStack: 1000,
  healAmount: 9,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#E9967A';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.12);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.12);
    ctx.closePath();
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'cooked_lobster',
  name: 'Lobster',
  description: 'Cooked lobster. Heals 12 HP.',
  type: 'food',
  rarity: 'uncommon',
  stackable: true,
  maxStack: 1000,
  healAmount: 12,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.25, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - size * 0.28, cy - size * 0.15, size * 0.12, size * 0.08, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.28, cy - size * 0.15, size * 0.12, size * 0.08, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'cooked_swordfish',
  name: 'Swordfish',
  description: 'Cooked swordfish. Heals 14 HP.',
  type: 'food',
  rarity: 'rare',
  stackable: true,
  maxStack: 1000,
  healAmount: 14,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.ellipse(cx + size * 0.05, cy, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.25, cy);
    ctx.lineTo(cx - size * 0.45, cy);
    ctx.lineTo(cx - size * 0.25, cy + size * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.15);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.15);
    ctx.closePath();
    ctx.fill();
  },
});

ItemRegistry.register({
  id: 'burnt_fish',
  name: 'Burnt Fish',
  description: 'Accidentally burnt while cooking. Useless.',
  type: 'misc',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#2F2F2F';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.35, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.32, cy);
    ctx.lineTo(cx + size * 0.42, cy - size * 0.12);
    ctx.lineTo(cx + size * 0.42, cy + size * 0.12);
    ctx.closePath();
    ctx.fill();
  },
});

// ─── Fishing Tools ────────────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'small_fishing_net',
  name: 'Small Fishing Net',
  description: 'A net for catching small fish like shrimp.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.3, cy - size * 0.3);
    ctx.lineTo(cx - size * 0.3, cy + size * 0.3);
    ctx.stroke();
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.3, cy - size * 0.2 + i * size * 0.12);
      ctx.quadraticCurveTo(cx + size * 0.1, cy - size * 0.1 + i * size * 0.1, cx + size * 0.3, cy + size * 0.2);
      ctx.stroke();
    }
  },
});

ItemRegistry.register({
  id: 'fly_fishing_rod',
  name: 'Fly Fishing Rod',
  description: 'A rod for catching trout and salmon.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 4);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.lineTo(0, size * 0.4);
    ctx.stroke();
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.quadraticCurveTo(size * 0.2, -size * 0.2, size * 0.15, 0);
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'feather',
  name: 'Feather',
  description: 'Used as bait for fly fishing.',
  type: 'resource',
  stackable: true,
  maxStack: 1000,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.08, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
});

ItemRegistry.register({
  id: 'lobster_pot',
  name: 'Lobster Pot',
  description: 'A cage for catching lobsters.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - size * 0.3, cy - size * 0.25, size * 0.6, size * 0.5, 4);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.3, cy - size * 0.15 + i * size * 0.15);
      ctx.lineTo(cx + size * 0.3, cy - size * 0.15 + i * size * 0.15);
      ctx.stroke();
    }
  },
});

ItemRegistry.register({
  id: 'harpoon',
  name: 'Harpoon',
  description: 'Used to catch swordfish and tuna.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 4);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.35);
    ctx.lineTo(0, size * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#A9A9A9';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.lineTo(-size * 0.08, -size * 0.28);
    ctx.lineTo(size * 0.08, -size * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },
});

// ─── Tinderbox for Firemaking ─────────────────────────────────────────────────

ItemRegistry.register({
  id: 'tinderbox',
  name: 'Tinderbox',
  description: 'Used to light fires from logs.',
  type: 'tool',
  stackable: false,
  maxStack: 1,
  draw(ctx, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.roundRect(cx - size * 0.3, cy - size * 0.2, size * 0.6, size * 0.4, 3);
    ctx.fill();
    ctx.strokeStyle = '#5D3A1A';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
});

// ─── Tiered Weapons (Smithing) ────────────────────────────────────────────────

ItemRegistry.register({
  id: 'steel_sword',
  name: 'Steel Sword',
  description: 'A strong steel sword.',
  type: 'weapon',
  rarity: 'uncommon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  requiredSkills: [{ skillId: 'attack', level: 5 }],
  bonuses: { attack: 14, strength: 8 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.44);
    ctx.lineTo(size * 0.1, size * 0.1);
    ctx.lineTo(-size * 0.1, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#A0A0A0';
    ctx.fillRect(-size * 0.24, size * 0.07, size * 0.48, size * 0.07);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.055, size * 0.12, size * 0.11, size * 0.22);
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.arc(0, size * 0.35, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'mithril_sword',
  name: 'Mithril Sword',
  description: 'A sharp mithril sword.',
  type: 'weapon',
  rarity: 'rare',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  requiredSkills: [{ skillId: 'attack', level: 20 }],
  bonuses: { attack: 21, strength: 12 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#6495ED';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.44);
    ctx.lineTo(size * 0.1, size * 0.1);
    ctx.lineTo(-size * 0.1, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4169E1';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(-size * 0.24, size * 0.07, size * 0.48, size * 0.07);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.055, size * 0.12, size * 0.11, size * 0.22);
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.arc(0, size * 0.35, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'adamant_sword',
  name: 'Adamant Sword',
  description: 'A powerful adamant sword.',
  type: 'weapon',
  rarity: 'epic',
  stackable: false,
  maxStack: 1,
  equipSlot: 'weapon',
  requiredSkills: [{ skillId: 'attack', level: 30 }],
  bonuses: { attack: 29, strength: 17 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#3CB371';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.44);
    ctx.lineTo(size * 0.1, size * 0.1);
    ctx.lineTo(-size * 0.1, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(-size * 0.24, size * 0.07, size * 0.48, size * 0.07);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.055, size * 0.12, size * 0.11, size * 0.22);
    ctx.fillStyle = '#2E8B57';
    ctx.beginPath();
    ctx.arc(0, size * 0.35, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
});

// ─── Tiered Armor ─────────────────────────────────────────────────────────────

ItemRegistry.register({
  id: 'iron_platebody',
  name: 'Iron Platebody',
  description: 'Iron chest armor. Requires 1 Defence.',
  type: 'armor',
  rarity: 'common',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  requiredSkills: [{ skillId: 'defence', level: 1 }],
  bonuses: { defence: 14 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath();
    ctx.moveTo(-size * 0.32, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.32, -size * 0.38);
    ctx.lineTo(size * 0.12, -size * 0.44);
    ctx.lineTo(-size * 0.12, -size * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'steel_platebody',
  name: 'Steel Platebody',
  description: 'Steel chest armor. Requires 5 Defence.',
  type: 'armor',
  rarity: 'uncommon',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  requiredSkills: [{ skillId: 'defence', level: 5 }],
  bonuses: { defence: 21 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.moveTo(-size * 0.32, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.32, -size * 0.38);
    ctx.lineTo(size * 0.12, -size * 0.44);
    ctx.lineTo(-size * 0.12, -size * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'mithril_platebody',
  name: 'Mithril Platebody',
  description: 'Mithril chest armor. Requires 20 Defence.',
  type: 'armor',
  rarity: 'rare',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  requiredSkills: [{ skillId: 'defence', level: 20 }],
  bonuses: { defence: 33 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#6495ED';
    ctx.beginPath();
    ctx.moveTo(-size * 0.32, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.32, -size * 0.38);
    ctx.lineTo(size * 0.12, -size * 0.44);
    ctx.lineTo(-size * 0.12, -size * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4169E1';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  },
});

ItemRegistry.register({
  id: 'adamant_platebody',
  name: 'Adamant Platebody',
  description: 'Adamant chest armor. Requires 30 Defence.',
  type: 'armor',
  rarity: 'epic',
  stackable: false,
  maxStack: 1,
  equipSlot: 'body',
  requiredSkills: [{ skillId: 'defence', level: 30 }],
  bonuses: { defence: 46 },
  draw(ctx, x, y, size) {
    const cx = x + size / 2, cy = y + size / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#3CB371';
    ctx.beginPath();
    ctx.moveTo(-size * 0.32, -size * 0.38);
    ctx.lineTo(-size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.38, size * 0.38);
    ctx.lineTo(size * 0.32, -size * 0.38);
    ctx.lineTo(size * 0.12, -size * 0.44);
    ctx.lineTo(-size * 0.12, -size * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  },
});
