const DropTableRegistry = (() => {
  const _tables = {};

  function register(id, def) {
    if (_tables[id]) {
      console.warn(`DropTableRegistry: overwriting existing table '${id}'`);
    }
    _tables[id] = {
      guaranteed: Array.isArray(def.guaranteed) ? def.guaranteed : [],
      random: Array.isArray(def.random) ? def.random : [],
      randomDropRolls: Number.isFinite(def.randomDropRolls) ? Math.max(0, Math.floor(def.randomDropRolls)) : 1,
    };
  }

  function get(id) {
    return _tables[id] ?? null;
  }

  return { register, get };
})();

DropTableRegistry.register('goblin_common', {
  guaranteed: [{ itemId: 'coins', min: 2, max: 10 }],
  random: [
    { itemId: 'log', min: 1, max: 1, weight: 42 },
    { itemId: 'arrow_shaft', min: 2, max: 7, weight: 36 },
    { itemId: 'cowhide', min: 1, max: 1, weight: 30 },
    { itemId: 'wool', min: 1, max: 2, weight: 24 },
    { itemId: 'clay', min: 1, max: 2, weight: 22 },
    { itemId: 'flax', min: 1, max: 2, weight: 16 },
    { itemId: 'thread', min: 2, max: 5, weight: 14 },
    { itemId: 'bronze_sword', min: 1, max: 1, weight: 12 },
    { itemId: 'goblin_charm', min: 1, max: 1, weight: 10 },
  ],
  randomDropRolls: 1,
});

DropTableRegistry.register('skeleton_guard', {
  guaranteed: [{ itemId: 'coins', min: 6, max: 18 }],
  random: [
    { itemId: 'arrow_shaft', min: 6, max: 12, weight: 32 },
    { itemId: 'gold_bar', min: 1, max: 1, weight: 20 },
    { itemId: 'silver_bar', min: 1, max: 1, weight: 22 },
    { itemId: 'uncut_sapphire', min: 1, max: 1, weight: 14 },
    { itemId: 'bronze_shield', min: 1, max: 1, weight: 26 },
    { itemId: 'leather_body', min: 1, max: 1, weight: 24 },
    { itemId: 'iron_sword', min: 1, max: 1, weight: 18 },
  ],
  randomDropRolls: 1,
});

DropTableRegistry.register('bandit_raider', {
  guaranteed: [{ itemId: 'coins', min: 16, max: 42 }],
  random: [
    { itemId: 'bronze_bar', min: 1, max: 3, weight: 34 },
    { itemId: 'gold_bar', min: 1, max: 2, weight: 24 },
    { itemId: 'uncut_emerald', min: 1, max: 1, weight: 16 },
    { itemId: 'uncut_ruby', min: 1, max: 1, weight: 10 },
    { itemId: 'iron_sword', min: 1, max: 1, weight: 22 },
    { itemId: 'bandit_cache', min: 1, max: 1, weight: 9 },
    { itemId: 'goblin_charm', min: 1, max: 1, weight: 35 },
  ],
  randomDropRolls: 2,
});

DropTableRegistry.register('ancient_giant_boss', {
  guaranteed: [{ itemId: 'coins', min: 90, max: 180 }],
  random: [
    { itemId: 'iron_sword', min: 1, max: 1, weight: 34 },
    { itemId: 'gold_bar', min: 2, max: 4, weight: 24 },
    { itemId: 'uncut_diamond', min: 1, max: 2, weight: 16 },
    { itemId: 'bandit_cache', min: 1, max: 1, weight: 40 },
    { itemId: 'giant_relic', min: 1, max: 1, weight: 26 },
  ],
  randomDropRolls: 2,
});
