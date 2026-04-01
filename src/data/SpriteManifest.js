const SpriteManifest = (() => {
  function frame(col, row, size = 100) {
    return { x: col * size, y: row * size, w: size, h: size };
  }

  // Soldier/Orc pack atlases (100x100 cell grid).
  const atlases = {
    soldier: {
      imagePath: 'Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Soldier/Soldier/Soldier.png',
      frames: {
        soldier_idle_0: frame(0, 0),
        soldier_idle_1: frame(1, 0),
        soldier_idle_2: frame(2, 0),
        soldier_idle_3: frame(3, 0),
        soldier_idle_4: frame(4, 0),
        soldier_idle_5: frame(5, 0),

        soldier_walk_0: frame(0, 1),
        soldier_walk_1: frame(1, 1),
        soldier_walk_2: frame(2, 1),
        soldier_walk_3: frame(3, 1),
        soldier_walk_4: frame(4, 1),
        soldier_walk_5: frame(5, 1),
        soldier_walk_6: frame(6, 1),
        soldier_walk_7: frame(7, 1),

        soldier_attack_0: frame(0, 2),
        soldier_attack_1: frame(1, 2),
        soldier_attack_2: frame(2, 2),
        soldier_attack_3: frame(3, 2),
        soldier_attack_4: frame(4, 2),
        soldier_attack_5: frame(5, 2),

        soldier_hurt_0: frame(0, 5),
        soldier_hurt_1: frame(1, 5),
        soldier_hurt_2: frame(2, 5),
        soldier_hurt_3: frame(3, 5),

        soldier_death_0: frame(0, 6),
        soldier_death_1: frame(1, 6),
        soldier_death_2: frame(2, 6),
        soldier_death_3: frame(3, 6),
      },
    },
    orc: {
      imagePath: 'Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Orc/Orc/Orc.png',
      frames: {
        orc_idle_0: frame(0, 0),
        orc_idle_1: frame(1, 0),
        orc_idle_2: frame(2, 0),
        orc_idle_3: frame(3, 0),
        orc_idle_4: frame(4, 0),
        orc_idle_5: frame(5, 0),

        orc_walk_0: frame(0, 1),
        orc_walk_1: frame(1, 1),
        orc_walk_2: frame(2, 1),
        orc_walk_3: frame(3, 1),
        orc_walk_4: frame(4, 1),
        orc_walk_5: frame(5, 1),
        orc_walk_6: frame(6, 1),
        orc_walk_7: frame(7, 1),

        orc_attack_0: frame(0, 2),
        orc_attack_1: frame(1, 2),
        orc_attack_2: frame(2, 2),
        orc_attack_3: frame(3, 2),
        orc_attack_4: frame(4, 2),
        orc_attack_5: frame(5, 2),

        orc_hurt_0: frame(0, 4),
        orc_hurt_1: frame(1, 4),
        orc_hurt_2: frame(2, 4),
        orc_hurt_3: frame(3, 4),

        orc_death_0: frame(0, 5),
        orc_death_1: frame(1, 5),
        orc_death_2: frame(2, 5),
        orc_death_3: frame(3, 5),
      },
    },
    tree_1: {
      imagePath: 'The Fan-tasy Tileset (Free)/Art/Trees and Bushes/Tree_Emerald_1.png',
      frames: { default: { x: 0, y: 0, w: 64, h: 63 } },
    },
    tree_2: {
      imagePath: 'The Fan-tasy Tileset (Free)/Art/Trees and Bushes/Tree_Emerald_2.png',
      frames: { default: { x: 0, y: 0, w: 46, h: 63 } },
    },
    tree_3: {
      imagePath: 'The Fan-tasy Tileset (Free)/Art/Trees and Bushes/Tree_Emerald_3.png',
      frames: { default: { x: 0, y: 0, w: 52, h: 92 } },
    },
    tree_4: {
      imagePath: 'The Fan-tasy Tileset (Free)/Art/Trees and Bushes/Tree_Emerald_4.png',
      frames: { default: { x: 0, y: 0, w: 48, h: 93 } },
    },
    stump: {
      imagePath: 'The Fan-tasy Tileset (Free)/Art/Props/Chopped_Tree_1.png',
      frames: { default: { x: 0, y: 0, w: 32, h: 31 } },
    },
  };

  const clips = {
    player: {
      atlasId: 'soldier',
      drawScale: 4.8,
      clips: {
        idle_down: { frames: ['soldier_idle_0', 'soldier_idle_1', 'soldier_idle_2', 'soldier_idle_3', 'soldier_idle_4', 'soldier_idle_5'], fps: 7, loop: true },
        idle_up: { frames: ['soldier_idle_0', 'soldier_idle_1', 'soldier_idle_2', 'soldier_idle_3', 'soldier_idle_4', 'soldier_idle_5'], fps: 7, loop: true },
        idle_left: { frames: ['soldier_idle_0', 'soldier_idle_1', 'soldier_idle_2', 'soldier_idle_3', 'soldier_idle_4', 'soldier_idle_5'], fps: 7, loop: true },
        idle_right: { frames: ['soldier_idle_0', 'soldier_idle_1', 'soldier_idle_2', 'soldier_idle_3', 'soldier_idle_4', 'soldier_idle_5'], fps: 7, loop: true },

        walk_down: { frames: ['soldier_walk_0', 'soldier_walk_1', 'soldier_walk_2', 'soldier_walk_3', 'soldier_walk_4', 'soldier_walk_5', 'soldier_walk_6', 'soldier_walk_7'], fps: 10, loop: true },
        walk_up: { frames: ['soldier_walk_0', 'soldier_walk_1', 'soldier_walk_2', 'soldier_walk_3', 'soldier_walk_4', 'soldier_walk_5', 'soldier_walk_6', 'soldier_walk_7'], fps: 10, loop: true },
        walk_left: { frames: ['soldier_walk_0', 'soldier_walk_1', 'soldier_walk_2', 'soldier_walk_3', 'soldier_walk_4', 'soldier_walk_5', 'soldier_walk_6', 'soldier_walk_7'], fps: 10, loop: true },
        walk_right: { frames: ['soldier_walk_0', 'soldier_walk_1', 'soldier_walk_2', 'soldier_walk_3', 'soldier_walk_4', 'soldier_walk_5', 'soldier_walk_6', 'soldier_walk_7'], fps: 10, loop: true },

        mining_down: { frames: ['soldier_attack_0', 'soldier_attack_1', 'soldier_attack_2', 'soldier_attack_3', 'soldier_attack_4', 'soldier_attack_5'], fps: 12, loop: true },
        mining_up: { frames: ['soldier_attack_0', 'soldier_attack_1', 'soldier_attack_2', 'soldier_attack_3', 'soldier_attack_4', 'soldier_attack_5'], fps: 12, loop: true },
        mining_left: { frames: ['soldier_attack_0', 'soldier_attack_1', 'soldier_attack_2', 'soldier_attack_3', 'soldier_attack_4', 'soldier_attack_5'], fps: 12, loop: true },
        mining_right: { frames: ['soldier_attack_0', 'soldier_attack_1', 'soldier_attack_2', 'soldier_attack_3', 'soldier_attack_4', 'soldier_attack_5'], fps: 12, loop: true },

        attack: { frames: ['soldier_attack_0', 'soldier_attack_1', 'soldier_attack_2', 'soldier_attack_3', 'soldier_attack_4', 'soldier_attack_5'], fps: 14, loop: false },
        hurt: { frames: ['soldier_hurt_0', 'soldier_hurt_1', 'soldier_hurt_2', 'soldier_hurt_3'], fps: 10, loop: false },
        death: { frames: ['soldier_death_0', 'soldier_death_1', 'soldier_death_2', 'soldier_death_3'], fps: 8, loop: false },
      },
    },
    monster: {
      atlasId: 'orc',
      drawScale: 4.6,
      clips: {
        idle: { frames: ['orc_idle_0', 'orc_idle_1', 'orc_idle_2', 'orc_idle_3', 'orc_idle_4', 'orc_idle_5'], fps: 7, loop: true },
        walk: { frames: ['orc_walk_0', 'orc_walk_1', 'orc_walk_2', 'orc_walk_3', 'orc_walk_4', 'orc_walk_5', 'orc_walk_6', 'orc_walk_7'], fps: 10, loop: true },
        attack: { frames: ['orc_attack_0', 'orc_attack_1', 'orc_attack_2', 'orc_attack_3', 'orc_attack_4', 'orc_attack_5'], fps: 12, loop: false },
        hurt: { frames: ['orc_hurt_0', 'orc_hurt_1', 'orc_hurt_2', 'orc_hurt_3'], fps: 10, loop: false },
        death: { frames: ['orc_death_0', 'orc_death_1', 'orc_death_2', 'orc_death_3'], fps: 8, loop: false },
      },
    },
    vendor: {
      atlasId: 'orc',
      drawScale: 4.2,
      clips: {
        idle: { frames: ['orc_idle_0', 'orc_idle_1', 'orc_idle_2', 'orc_idle_3', 'orc_idle_4', 'orc_idle_5'], fps: 6, loop: true },
      },
    },
  };

  return {
    atlases,
    clips,
  };
})();
