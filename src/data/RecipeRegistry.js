/**
 * RecipeRegistry — central catalog of every craftable recipe.
 *
 * To add a new recipe anywhere in the codebase:
 *   RecipeRegistry.register({ id, name, category, inputs, outputs, requiredSkills, grantXP })
 *
 * Public API:
 *   register(def)                Register a new recipe
 *   get(id)                      Get recipe by id
 *   all()                        All recipes
 *   forCategory(category)        All recipes in a category, sorted by minLevel
 *   categories()                 Sorted list of unique category names
 */
const RecipeRegistry = (() => {
  const _recipes = {};

  function register(def) {
    if (_recipes[def.id]) console.warn(`RecipeRegistry: overwriting '${def.id}'`);
    _recipes[def.id] = new Recipe(def);
  }

  function get(id) { return _recipes[id] ?? null; }

  function all() { return Object.values(_recipes); }

  function forCategory(category) {
    return all()
      .filter(r => r.category === category)
      .sort((a, b) => a.minLevel - b.minLevel);
  }

  function categories() {
    return [...new Set(all().map(r => r.category))].sort();
  }

  function stations() {
    return [...new Set(all().map(r => r.station).filter(s => s && s !== 'any'))].sort();
  }

  return { register, get, all, forCategory, categories, stations };
})();

// ─── Woodcutting Recipes ──────────────────────────────────────────────────────
// Sorted by required level — players unlock these as they level up woodcutting.

RecipeRegistry.register({
  id:             'arrow_shafts',
  name:           'Arrow Shafts',
  category:       'Woodcutting',
  inputs:         [{ itemId: 'log', qty: 1 }],
  outputs:        [{ itemId: 'arrow_shaft', qty: 15 }],
  requiredSkills: [{ skillId: 'woodcutting', level: 1 }],
  grantXP:        [{ skillId: 'woodcutting', amount: 5 }],
});

RecipeRegistry.register({
  id:             'crude_bow',
  name:           'Crude Bow',
  category:       'Woodcutting',
  inputs:         [{ itemId: 'log', qty: 2 }],
  outputs:        [{ itemId: 'crude_bow', qty: 1 }],
  requiredSkills: [{ skillId: 'woodcutting', level: 5 }],
  grantXP:        [{ skillId: 'woodcutting', amount: 25 }],
});

RecipeRegistry.register({
  id:             'plank',
  name:           'Plank',
  category:       'Woodcutting',
  inputs:         [{ itemId: 'log', qty: 1 }],
  outputs:        [{ itemId: 'plank', qty: 1 }],
  requiredSkills: [{ skillId: 'woodcutting', level: 10 }],
  grantXP:        [{ skillId: 'woodcutting', amount: 15 }],
});

RecipeRegistry.register({
  id:             'longbow',
  name:           'Longbow',
  category:       'Woodcutting',
  inputs:         [{ itemId: 'log', qty: 3 }],
  outputs:        [{ itemId: 'longbow', qty: 1 }],
  requiredSkills: [{ skillId: 'woodcutting', level: 20 }],
  grantXP:        [{ skillId: 'woodcutting', amount: 50 }],
});

// ─── Smithing Recipes ─────────────────────────────────────────────────────────

RecipeRegistry.register({
  id:             'bronze_bar',
  name:           'Smelt Bronze Bar',
  category:       'Smithing',
  inputs:         [{ itemId: 'copper_ore', qty: 1 }, { itemId: 'tin_ore', qty: 1 }],
  outputs:        [{ itemId: 'bronze_bar', qty: 1 }],
  requiredSkills: [{ skillId: 'smithing', level: 1 }],
  grantXP:        [{ skillId: 'smithing', amount: 12 }],
});

RecipeRegistry.register({
  id:             'bronze_bar_batch',
  name:           'Smelt Bronze Batch',
  category:       'Smithing',
  inputs:         [{ itemId: 'copper_ore', qty: 3 }, { itemId: 'tin_ore', qty: 3 }],
  outputs:        [{ itemId: 'bronze_bar', qty: 3 }],
  requiredSkills: [{ skillId: 'smithing', level: 4 }],
  grantXP:        [{ skillId: 'smithing', amount: 40 }],
});

RecipeRegistry.register({
  id:             'forge_bronze_sword',
  name:           'Forge Bronze Sword',
  category:       'Smithing',
  inputs:         [{ itemId: 'bronze_bar', qty: 2 }],
  outputs:        [{ itemId: 'bronze_sword', qty: 1 }],
  requiredSkills: [{ skillId: 'smithing', level: 8 }],
  grantXP:        [{ skillId: 'smithing', amount: 25 }],
});

RecipeRegistry.register({
  id:             'forge_bronze_shield',
  name:           'Forge Bronze Shield',
  category:       'Smithing',
  inputs:         [{ itemId: 'bronze_bar', qty: 3 }],
  outputs:        [{ itemId: 'bronze_shield', qty: 1 }],
  requiredSkills: [{ skillId: 'smithing', level: 10 }],
  grantXP:        [{ skillId: 'smithing', amount: 30 }],
});

RecipeRegistry.register({
  id:             'forge_leather_body',
  name:           'Craft Leather Body',
  category:       'Smithing',
  inputs:         [{ itemId: 'bronze_bar', qty: 1 }],
  outputs:        [{ itemId: 'leather_body', qty: 1 }],
  requiredSkills: [{ skillId: 'smithing', level: 6 }],
  grantXP:        [{ skillId: 'smithing', amount: 18 }],
});

// ─── Future recipe categories (add when those skills exist) ──────────────────
// RecipeRegistry.register({ id: 'iron_bar', name: 'Iron Bar', category: 'Smithing', ... });
// RecipeRegistry.register({ id: 'cooked_fish', name: 'Cooked Fish', category: 'Cooking', ... });

// ─── Classic Crafting: Leather Working ───────────────────────────────────────

RecipeRegistry.register({
  id: 'tan_leather',
  name: 'Tan Leather',
  category: 'Crafting: Leather',
  station: 'tanner',
  inputs: [{ itemId: 'cowhide', qty: 1 }, { itemId: 'coins', qty: 1 }],
  outputs: [{ itemId: 'leather', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 1 }],
});

RecipeRegistry.register({
  id: 'craft_leather_gloves',
  name: 'Leather Gloves',
  category: 'Crafting: Leather',
  station: 'any',
  tools: [{ itemId: 'needle' }],
  inputs: [{ itemId: 'leather', qty: 1 }, { itemId: 'thread', qty: 1 }],
  outputs: [{ itemId: 'leather_gloves', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 13.75 }],
});

RecipeRegistry.register({
  id: 'craft_leather_boots',
  name: 'Leather Boots',
  category: 'Crafting: Leather',
  station: 'any',
  tools: [{ itemId: 'needle' }],
  inputs: [{ itemId: 'leather', qty: 1 }, { itemId: 'thread', qty: 1 }],
  outputs: [{ itemId: 'leather_boots', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 7 }],
  grantXP: [{ skillId: 'crafting', amount: 16.25 }],
});

RecipeRegistry.register({
  id: 'craft_leather_coif',
  name: 'Leather Coif',
  category: 'Crafting: Leather',
  station: 'any',
  tools: [{ itemId: 'needle' }],
  inputs: [{ itemId: 'leather', qty: 1 }, { itemId: 'thread', qty: 1 }],
  outputs: [{ itemId: 'leather_hat', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 9 }],
  grantXP: [{ skillId: 'crafting', amount: 18.5 }],
});

RecipeRegistry.register({
  id: 'craft_leather_legs',
  name: 'Leather Chaps',
  category: 'Crafting: Leather',
  station: 'any',
  tools: [{ itemId: 'needle' }],
  inputs: [{ itemId: 'leather', qty: 1 }, { itemId: 'thread', qty: 1 }],
  outputs: [{ itemId: 'leather_legs', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 11 }],
  grantXP: [{ skillId: 'crafting', amount: 27 }],
});

RecipeRegistry.register({
  id: 'craft_leather_body_classic',
  name: 'Leather Body',
  category: 'Crafting: Leather',
  station: 'any',
  tools: [{ itemId: 'needle' }],
  inputs: [{ itemId: 'leather', qty: 1 }, { itemId: 'thread', qty: 1 }],
  outputs: [{ itemId: 'leather_body', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 14 }],
  grantXP: [{ skillId: 'crafting', amount: 25 }],
});

// ─── Classic Crafting: Spinning ─────────────────────────────────────────────

RecipeRegistry.register({
  id: 'spin_wool',
  name: 'Spin Wool',
  category: 'Crafting: Spinning',
  station: 'spinning_wheel',
  inputs: [{ itemId: 'wool', qty: 1 }],
  outputs: [{ itemId: 'ball_of_wool', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 2.5 }],
});

RecipeRegistry.register({
  id: 'spin_flax',
  name: 'Spin Flax',
  category: 'Crafting: Spinning',
  station: 'spinning_wheel',
  inputs: [{ itemId: 'flax', qty: 1 }],
  outputs: [{ itemId: 'bowstring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 10 }],
  grantXP: [{ skillId: 'crafting', amount: 15 }],
});

// ─── Classic Crafting: Pottery ──────────────────────────────────────────────

RecipeRegistry.register({
  id: 'soften_clay',
  name: 'Soften Clay',
  category: 'Crafting: Pottery',
  station: 'water_source',
  inputs: [{ itemId: 'clay', qty: 1 }, { itemId: 'bucket_of_water', qty: 1 }],
  outputs: [{ itemId: 'soft_clay', qty: 1 }, { itemId: 'bucket', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 1 }],
});

RecipeRegistry.register({
  id: 'mould_unfired_pot',
  name: 'Mould Unfired Pot',
  category: 'Crafting: Pottery',
  station: 'pottery_wheel',
  inputs: [{ itemId: 'soft_clay', qty: 1 }],
  outputs: [{ itemId: 'unfired_pot', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 6.25 }],
});

RecipeRegistry.register({
  id: 'fire_pot',
  name: 'Fire Pot',
  category: 'Crafting: Pottery',
  station: 'pottery_oven',
  inputs: [{ itemId: 'unfired_pot', qty: 1 }],
  outputs: [{ itemId: 'pot', qty: 1 }],
  onFailOutputs: [{ itemId: 'broken_pottery', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 1 }],
  grantXP: [{ skillId: 'crafting', amount: 6.25 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 1 }],
  successChance: (skills) => Math.min(1, 0.72 + skills.getLevel('crafting') * 0.01),
});

RecipeRegistry.register({
  id: 'mould_unfired_bowl',
  name: 'Mould Unfired Bowl',
  category: 'Crafting: Pottery',
  station: 'pottery_wheel',
  inputs: [{ itemId: 'soft_clay', qty: 1 }],
  outputs: [{ itemId: 'unfired_bowl', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 7 }],
  grantXP: [{ skillId: 'crafting', amount: 10 }],
});

RecipeRegistry.register({
  id: 'fire_bowl',
  name: 'Fire Bowl',
  category: 'Crafting: Pottery',
  station: 'pottery_oven',
  inputs: [{ itemId: 'unfired_bowl', qty: 1 }],
  outputs: [{ itemId: 'bowl', qty: 1 }],
  onFailOutputs: [{ itemId: 'broken_pottery', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 7 }],
  grantXP: [{ skillId: 'crafting', amount: 15 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 2 }],
  successChance: (skills) => Math.min(1, 0.68 + skills.getLevel('crafting') * 0.011),
});

// ─── Classic Crafting: Gem Cutting ──────────────────────────────────────────

RecipeRegistry.register({
  id: 'cut_sapphire',
  name: 'Cut Sapphire',
  category: 'Crafting: Gem Cutting',
  station: 'any',
  tools: [{ itemId: 'chisel' }],
  inputs: [{ itemId: 'uncut_sapphire', qty: 1 }],
  outputs: [{ itemId: 'sapphire', qty: 1 }],
  onFailOutputs: [{ itemId: 'crushed_gem', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 20 }],
  grantXP: [{ skillId: 'crafting', amount: 50 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 12.5 }],
  successChance: 0.92,
});

RecipeRegistry.register({
  id: 'cut_emerald',
  name: 'Cut Emerald',
  category: 'Crafting: Gem Cutting',
  station: 'any',
  tools: [{ itemId: 'chisel' }],
  inputs: [{ itemId: 'uncut_emerald', qty: 1 }],
  outputs: [{ itemId: 'emerald', qty: 1 }],
  onFailOutputs: [{ itemId: 'crushed_gem', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 27 }],
  grantXP: [{ skillId: 'crafting', amount: 67.5 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 16 }],
  successChance: 0.9,
});

RecipeRegistry.register({
  id: 'cut_ruby',
  name: 'Cut Ruby',
  category: 'Crafting: Gem Cutting',
  station: 'any',
  tools: [{ itemId: 'chisel' }],
  inputs: [{ itemId: 'uncut_ruby', qty: 1 }],
  outputs: [{ itemId: 'ruby', qty: 1 }],
  onFailOutputs: [{ itemId: 'crushed_gem', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 34 }],
  grantXP: [{ skillId: 'crafting', amount: 85 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 21 }],
  successChance: 0.87,
});

RecipeRegistry.register({
  id: 'cut_diamond',
  name: 'Cut Diamond',
  category: 'Crafting: Gem Cutting',
  station: 'any',
  tools: [{ itemId: 'chisel' }],
  inputs: [{ itemId: 'uncut_diamond', qty: 1 }],
  outputs: [{ itemId: 'diamond', qty: 1 }],
  onFailOutputs: [{ itemId: 'crushed_gem', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 43 }],
  grantXP: [{ skillId: 'crafting', amount: 107.5 }],
  grantXPOnFail: [{ skillId: 'crafting', amount: 26 }],
  successChance: 0.84,
});

// ─── Classic Crafting: Jewellery ────────────────────────────────────────────

RecipeRegistry.register({
  id: 'gold_ring',
  name: 'Gold Ring',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'ring_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }],
  outputs: [{ itemId: 'gold_ring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 5 }],
  grantXP: [{ skillId: 'crafting', amount: 15 }],
});

RecipeRegistry.register({
  id: 'gold_necklace',
  name: 'Gold Necklace',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'necklace_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }],
  outputs: [{ itemId: 'gold_necklace', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 6 }],
  grantXP: [{ skillId: 'crafting', amount: 20 }],
});

RecipeRegistry.register({
  id: 'gold_amulet_unstrung',
  name: 'Gold Amulet (u)',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'amulet_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }],
  outputs: [{ itemId: 'gold_amulet_unstrung', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 8 }],
  grantXP: [{ skillId: 'crafting', amount: 30 }],
});

RecipeRegistry.register({
  id: 'string_gold_amulet',
  name: 'String Gold Amulet',
  category: 'Crafting: Jewellery',
  station: 'any',
  inputs: [{ itemId: 'gold_amulet_unstrung', qty: 1 }, { itemId: 'ball_of_wool', qty: 1 }],
  outputs: [{ itemId: 'gold_amulet', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 8 }],
  grantXP: [{ skillId: 'crafting', amount: 4 }],
});

RecipeRegistry.register({
  id: 'sapphire_ring',
  name: 'Sapphire Ring',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'ring_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'sapphire', qty: 1 }],
  outputs: [{ itemId: 'sapphire_ring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 8 }],
  grantXP: [{ skillId: 'crafting', amount: 40 }],
});

RecipeRegistry.register({
  id: 'sapphire_necklace',
  name: 'Sapphire Necklace',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'necklace_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'sapphire', qty: 1 }],
  outputs: [{ itemId: 'sapphire_necklace', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 10 }],
  grantXP: [{ skillId: 'crafting', amount: 55 }],
});

RecipeRegistry.register({
  id: 'sapphire_amulet_unstrung',
  name: 'Sapphire Amulet (u)',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'amulet_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'sapphire', qty: 1 }],
  outputs: [{ itemId: 'sapphire_amulet_unstrung', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 13 }],
  grantXP: [{ skillId: 'crafting', amount: 65 }],
});

RecipeRegistry.register({
  id: 'string_sapphire_amulet',
  name: 'String Sapphire Amulet',
  category: 'Crafting: Jewellery',
  station: 'any',
  inputs: [{ itemId: 'sapphire_amulet_unstrung', qty: 1 }, { itemId: 'ball_of_wool', qty: 1 }],
  outputs: [{ itemId: 'sapphire_amulet', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 13 }],
  grantXP: [{ skillId: 'crafting', amount: 4 }],
});

RecipeRegistry.register({
  id: 'emerald_ring',
  name: 'Emerald Ring',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'ring_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'emerald', qty: 1 }],
  outputs: [{ itemId: 'emerald_ring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 18 }],
  grantXP: [{ skillId: 'crafting', amount: 55 }],
});

RecipeRegistry.register({
  id: 'emerald_necklace',
  name: 'Emerald Necklace',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'necklace_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'emerald', qty: 1 }],
  outputs: [{ itemId: 'emerald_necklace', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 24 }],
  grantXP: [{ skillId: 'crafting', amount: 60 }],
});

RecipeRegistry.register({
  id: 'emerald_amulet_unstrung',
  name: 'Emerald Amulet (u)',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'amulet_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'emerald', qty: 1 }],
  outputs: [{ itemId: 'emerald_amulet_unstrung', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 30 }],
  grantXP: [{ skillId: 'crafting', amount: 70 }],
});

RecipeRegistry.register({
  id: 'string_emerald_amulet',
  name: 'String Emerald Amulet',
  category: 'Crafting: Jewellery',
  station: 'any',
  inputs: [{ itemId: 'emerald_amulet_unstrung', qty: 1 }, { itemId: 'ball_of_wool', qty: 1 }],
  outputs: [{ itemId: 'emerald_amulet', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 30 }],
  grantXP: [{ skillId: 'crafting', amount: 4 }],
});

RecipeRegistry.register({
  id: 'ruby_ring',
  name: 'Ruby Ring',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'ring_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'ruby', qty: 1 }],
  outputs: [{ itemId: 'ruby_ring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 30 }],
  grantXP: [{ skillId: 'crafting', amount: 70 }],
});

RecipeRegistry.register({
  id: 'ruby_necklace',
  name: 'Ruby Necklace',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'necklace_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'ruby', qty: 1 }],
  outputs: [{ itemId: 'ruby_necklace', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 40 }],
  grantXP: [{ skillId: 'crafting', amount: 75 }],
});

RecipeRegistry.register({
  id: 'ruby_amulet_unstrung',
  name: 'Ruby Amulet (u)',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'amulet_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'ruby', qty: 1 }],
  outputs: [{ itemId: 'ruby_amulet_unstrung', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 50 }],
  grantXP: [{ skillId: 'crafting', amount: 85 }],
});

RecipeRegistry.register({
  id: 'string_ruby_amulet',
  name: 'String Ruby Amulet',
  category: 'Crafting: Jewellery',
  station: 'any',
  inputs: [{ itemId: 'ruby_amulet_unstrung', qty: 1 }, { itemId: 'ball_of_wool', qty: 1 }],
  outputs: [{ itemId: 'ruby_amulet', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 50 }],
  grantXP: [{ skillId: 'crafting', amount: 4 }],
});

RecipeRegistry.register({
  id: 'diamond_ring',
  name: 'Diamond Ring',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'ring_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'diamond', qty: 1 }],
  outputs: [{ itemId: 'diamond_ring', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 42 }],
  grantXP: [{ skillId: 'crafting', amount: 85 }],
});

RecipeRegistry.register({
  id: 'diamond_necklace',
  name: 'Diamond Necklace',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'necklace_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'diamond', qty: 1 }],
  outputs: [{ itemId: 'diamond_necklace', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 56 }],
  grantXP: [{ skillId: 'crafting', amount: 90 }],
});

RecipeRegistry.register({
  id: 'diamond_amulet_unstrung',
  name: 'Diamond Amulet (u)',
  category: 'Crafting: Jewellery',
  station: 'furnace',
  tools: [{ itemId: 'amulet_mould' }],
  inputs: [{ itemId: 'gold_bar', qty: 1 }, { itemId: 'diamond', qty: 1 }],
  outputs: [{ itemId: 'diamond_amulet_unstrung', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 70 }],
  grantXP: [{ skillId: 'crafting', amount: 100 }],
});

RecipeRegistry.register({
  id: 'string_diamond_amulet',
  name: 'String Diamond Amulet',
  category: 'Crafting: Jewellery',
  station: 'any',
  inputs: [{ itemId: 'diamond_amulet_unstrung', qty: 1 }, { itemId: 'ball_of_wool', qty: 1 }],
  outputs: [{ itemId: 'diamond_amulet', qty: 1 }],
  requiredSkills: [{ skillId: 'crafting', level: 70 }],
  grantXP: [{ skillId: 'crafting', amount: 4 }],
});

// ─── Runecrafting ───────────────────────────────────────────────────────────

RecipeRegistry.register({
  id: 'craft_air_rune',
  name: 'Air Rune',
  category: 'Runecrafting',
  station: 'any',
  inputs: [{ itemId: 'rune_essence', qty: 1 }],
  outputs: [{ itemId: 'air_rune', qty: 1 }],
  requiredSkills: [{ skillId: 'runecrafting', level: 1 }],
  grantXP: [{ skillId: 'runecrafting', amount: 5 }],
});

RecipeRegistry.register({
  id: 'craft_mind_rune',
  name: 'Mind Rune',
  category: 'Runecrafting',
  station: 'any',
  inputs: [{ itemId: 'rune_essence', qty: 1 }],
  outputs: [{ itemId: 'mind_rune', qty: 1 }],
  requiredSkills: [{ skillId: 'runecrafting', level: 2 }],
  grantXP: [{ skillId: 'runecrafting', amount: 5.5 }],
});

RecipeRegistry.register({
  id: 'craft_water_rune',
  name: 'Water Rune',
  category: 'Runecrafting',
  station: 'any',
  inputs: [{ itemId: 'rune_essence', qty: 1 }],
  outputs: [{ itemId: 'water_rune', qty: 1 }],
  requiredSkills: [{ skillId: 'runecrafting', level: 5 }],
  grantXP: [{ skillId: 'runecrafting', amount: 6 }],
});

RecipeRegistry.register({
  id: 'craft_earth_rune',
  name: 'Earth Rune',
  category: 'Runecrafting',
  station: 'any',
  inputs: [{ itemId: 'rune_essence', qty: 1 }],
  outputs: [{ itemId: 'earth_rune', qty: 1 }],
  requiredSkills: [{ skillId: 'runecrafting', level: 9 }],
  grantXP: [{ skillId: 'runecrafting', amount: 6.5 }],
});

RecipeRegistry.register({
  id: 'craft_fire_rune',
  name: 'Fire Rune',
  category: 'Runecrafting',
  station: 'any',
  inputs: [{ itemId: 'rune_essence', qty: 1 }],
  outputs: [{ itemId: 'fire_rune', qty: 1 }],
  requiredSkills: [{ skillId: 'runecrafting', level: 14 }],
  grantXP: [{ skillId: 'runecrafting', amount: 7 }],
});
