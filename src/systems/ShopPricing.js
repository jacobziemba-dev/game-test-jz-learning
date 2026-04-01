const ShopPricing = (() => {
  const BASE_BY_ITEM = {
    coins: 1,

    log: 4,
    arrow_shaft: 2,
    wool: 7,
    flax: 6,
    thread: 8,
    ball_of_wool: 12,
    cowhide: 16,
    leather: 24,
    hard_leather: 42,
    clay: 10,
    soft_clay: 16,

    copper_ore: 12,
    tin_ore: 12,
    copper_bar: 26,
    bronze_bar: 34,
    silver_bar: 58,
    gold_bar: 88,

    needle: 22,
    chisel: 22,
    ring_mould: 28,
    necklace_mould: 28,
    amulet_mould: 28,

    bronze_sword: 62,
    bronze_shield: 58,
    iron_sword: 118,

    uncut_sapphire: 120,
    uncut_emerald: 180,
    uncut_ruby: 260,
    uncut_diamond: 360,
    sapphire: 165,
    emerald: 240,
    ruby: 330,
    diamond: 480,

    gold_ring: 130,
    gold_necklace: 158,
    gold_amulet_unstrung: 172,
    gold_amulet: 188,
  };

  const TYPE_BASE = {
    resource: 18,
    tool: 34,
    weapon: 74,
    armor: 68,
    jewellery: 160,
    pottery: 28,
    currency: 1,
    misc: 20,
  };

  const RARITY_MULTIPLIER = {
    common: 1,
    uncommon: 1.45,
    rare: 2.1,
    epic: 3.3,
    unique: 6,
  };

  const SHOP_BUY_MARKUP = {
    general: 1.28,
    crafting: 1.16,
  };

  const SHOP_SELL_FACTOR = {
    general: 0.44,
    crafting: 0.52,
  };

  const CRAFTING_TYPES = new Set(['resource', 'tool', 'jewellery', 'pottery']);

  function _baseValue(item) {
    if (!item) return 1;
    if (BASE_BY_ITEM[item.id] != null) return BASE_BY_ITEM[item.id];

    const byType = TYPE_BASE[item.type] ?? TYPE_BASE.misc;
    const rarity = RARITY_MULTIPLIER[item.rarity ?? 'common'] ?? 1;
    return Math.max(1, Math.round(byType * rarity));
  }

  function canShopBuyItem(shopType, item) {
    if (!item || item.id === 'coins') return false;
    if (shopType === 'crafting') {
      return CRAFTING_TYPES.has(item.type);
    }
    return true;
  }

  function buyPrice(itemId, shopType = 'general') {
    const item = ItemRegistry.get(itemId);
    const base = _baseValue(item);
    const markup = SHOP_BUY_MARKUP[shopType] ?? SHOP_BUY_MARKUP.general;
    return Math.max(1, Math.ceil(base * markup));
  }

  function sellPrice(itemId, shopType = 'general') {
    const item = ItemRegistry.get(itemId);
    if (!canShopBuyItem(shopType, item)) return 0;

    const base = _baseValue(item);
    const factor = SHOP_SELL_FACTOR[shopType] ?? SHOP_SELL_FACTOR.general;
    return Math.max(1, Math.floor(base * factor));
  }

  return {
    buyPrice,
    sellPrice,
    canShopBuyItem,
  };
})();
