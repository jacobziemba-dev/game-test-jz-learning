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

  return { register, get, all, forCategory, categories };
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
