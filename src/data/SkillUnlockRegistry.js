const SkillUnlockRegistry = (() => {
  const _milestones = {
    attack: [
      { level: 5, title: 'Combat Stance I', desc: 'Your melee timing improves.' },
      { level: 10, title: 'Iron Weapons', desc: 'You can equip iron melee weapons.' },
      { level: 20, title: 'Power Strikes', desc: 'Improved damage consistency in melee combat.' },
    ],
    strength: [
      { level: 5, title: 'Heavy Swing', desc: 'Your max hit scales better with strength.' },
      { level: 15, title: 'Crushing Force', desc: 'Strength training unlock tier milestone.' },
      { level: 30, title: 'Brutal Finisher', desc: 'Further melee damage potential unlocked.' },
    ],
    defence: [
      { level: 5, title: 'Leather Body Access', desc: 'Defensive gear tiers begin unlocking.' },
      { level: 10, title: 'Bronze Offhand Mastery', desc: 'Shield progression milestone.' },
      { level: 20, title: 'Armored Footwork', desc: 'Defensive combat efficiency improves.' },
    ],
    hitpoints: [
      { level: 5, title: 'Vitality I', desc: 'Increased survivability baseline.' },
      { level: 15, title: 'Vitality II', desc: 'Endurance progression milestone.' },
      { level: 30, title: 'Vitality III', desc: 'Core combat durability unlocked.' },
    ],
    ranged: [
      { level: 5, title: 'Ranged Foundations', desc: 'Preparing for future ranged combat systems.' },
      { level: 20, title: 'Precision Training', desc: 'Ranged progression milestone.' },
      { level: 40, title: 'Expert Aim', desc: 'Advanced ranged milestone unlocked.' },
    ],
    prayer: [
      { level: 5, title: 'Prayer Training', desc: 'Preparing for future prayer buffs.' },
      { level: 20, title: 'Focused Prayer', desc: 'Prayer progression milestone.' },
      { level: 40, title: 'Devotion Tier', desc: 'High-level prayer milestone unlocked.' },
    ],
    magic: [
      { level: 5, title: 'Arcane Basics', desc: 'Preparing for future magic combat systems.' },
      { level: 20, title: 'Runic Focus', desc: 'Magic progression milestone.' },
      { level: 40, title: 'Arcane Mastery I', desc: 'Advanced magic milestone unlocked.' },
    ],
    woodcutting: [
      { level: 5, title: 'Crude Bow Recipe', desc: 'Basic wood shaping proficiency unlocked.' },
      { level: 10, title: 'Plank Crafting', desc: 'Construction-ready wood processing unlocked.' },
      { level: 20, title: 'Longbow Crafting', desc: 'Advanced woodcutting craft unlock.' },
    ],
    mining: [
      { level: 5, title: 'Steady Swing', desc: 'Mining efficiency milestone.' },
      { level: 10, title: 'Ore Specialist I', desc: 'Improved ore progression path unlocked.' },
      { level: 20, title: 'Ore Specialist II', desc: 'Mid-tier mining milestone unlocked.' },
    ],
    smithing: [
      { level: 6, title: 'Leather Body Craft', desc: 'Entry armor crafting milestone.' },
      { level: 8, title: 'Bronze Sword Forge', desc: 'Bronze weapon progression unlocked.' },
      { level: 10, title: 'Bronze Shield Forge', desc: 'Bronze shield progression unlocked.' },
      { level: 20, title: 'Iron Smithing Prep', desc: 'Preparing for iron-tier smithing expansion.' },
    ],
    crafting: [
      { level: 1, title: 'Leather Basics', desc: 'Needle-and-thread crafting unlocked.' },
      { level: 10, title: 'Spinning Mastery I', desc: 'Bowstring spinning becomes available.' },
      { level: 20, title: 'Gem Cutting I', desc: 'You can start cutting sapphires.' },
      { level: 34, title: 'Gem Cutting II', desc: 'Ruby cutting tier unlocked.' },
      { level: 50, title: 'Jewellery Tier III', desc: 'Ruby amulet crafting unlocked.' },
      { level: 70, title: 'Jewellery Tier IV', desc: 'Diamond amulet crafting unlocked.' },
    ],
    runecrafting: [
      { level: 1, title: 'Air Runes', desc: 'Craft basic air runes.' },
      { level: 2, title: 'Mind Runes', desc: 'Unlock mind runes for magic.' },
      { level: 5, title: 'Water Runes', desc: 'Craft water runes.' },
      { level: 9, title: 'Earth Runes', desc: 'Craft earth runes.' },
      { level: 14, title: 'Fire Runes', desc: 'Craft fire runes.' },
    ],
  };

  function milestonesFor(skillId) {
    return (_milestones[skillId] ?? []).slice().sort((a, b) => a.level - b.level);
  }

  function allSkills() {
    return Object.keys(_milestones);
  }

  return {
    milestonesFor,
    allSkills,
  };
})();
