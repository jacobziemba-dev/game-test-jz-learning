const SpriteManifest = (() => {
  function frame(col, row, size = 32) {
    return { x: col * size, y: row * size, w: size, h: size };
  }

  // Atlas paths are placeholders until final sprite sheets are added.
  const atlases = {
    characters: {
      imagePath: 'characters.png',
      frames: {
        player_idle_down: frame(0, 0),
        player_idle_up: frame(1, 0),
        player_idle_left: frame(2, 0),
        player_idle_right: frame(3, 0),

        player_walk_down_0: frame(0, 1),
        player_walk_down_1: frame(1, 1),
        player_walk_down_2: frame(2, 1),
        player_walk_down_3: frame(3, 1),

        player_walk_up_0: frame(0, 2),
        player_walk_up_1: frame(1, 2),
        player_walk_up_2: frame(2, 2),
        player_walk_up_3: frame(3, 2),

        player_walk_left_0: frame(0, 3),
        player_walk_left_1: frame(1, 3),
        player_walk_left_2: frame(2, 3),
        player_walk_left_3: frame(3, 3),

        player_walk_right_0: frame(0, 4),
        player_walk_right_1: frame(1, 4),
        player_walk_right_2: frame(2, 4),
        player_walk_right_3: frame(3, 4),

        player_mining_down_0: frame(0, 5),
        player_mining_down_1: frame(1, 5),
        player_mining_down_2: frame(2, 5),

        player_mining_up_0: frame(0, 6),
        player_mining_up_1: frame(1, 6),
        player_mining_up_2: frame(2, 6),

        player_mining_left_0: frame(0, 7),
        player_mining_left_1: frame(1, 7),
        player_mining_left_2: frame(2, 7),

        player_mining_right_0: frame(0, 8),
        player_mining_right_1: frame(1, 8),
        player_mining_right_2: frame(2, 8),

        goblin_idle_0: frame(8, 0),
        goblin_idle_1: frame(9, 0),

        vendor_idle_0: frame(8, 1),
        vendor_idle_1: frame(9, 1),
      },
    },
  };

  const clips = {
    player: {
      atlasId: 'characters',
      drawScale: 1.45,
      clips: {
        idle_down: { frames: ['player_idle_down'], fps: 6, loop: true },
        idle_up: { frames: ['player_idle_up'], fps: 6, loop: true },
        idle_left: { frames: ['player_idle_left'], fps: 6, loop: true },
        idle_right: { frames: ['player_idle_right'], fps: 6, loop: true },

        walk_down: { frames: ['player_walk_down_0', 'player_walk_down_1', 'player_walk_down_2', 'player_walk_down_3'], fps: 8, loop: true },
        walk_up: { frames: ['player_walk_up_0', 'player_walk_up_1', 'player_walk_up_2', 'player_walk_up_3'], fps: 8, loop: true },
        walk_left: { frames: ['player_walk_left_0', 'player_walk_left_1', 'player_walk_left_2', 'player_walk_left_3'], fps: 8, loop: true },
        walk_right: { frames: ['player_walk_right_0', 'player_walk_right_1', 'player_walk_right_2', 'player_walk_right_3'], fps: 8, loop: true },

        mining_down: { frames: ['player_mining_down_0', 'player_mining_down_1', 'player_mining_down_2'], fps: 6, loop: true },
        mining_up: { frames: ['player_mining_up_0', 'player_mining_up_1', 'player_mining_up_2'], fps: 6, loop: true },
        mining_left: { frames: ['player_mining_left_0', 'player_mining_left_1', 'player_mining_left_2'], fps: 6, loop: true },
        mining_right: { frames: ['player_mining_right_0', 'player_mining_right_1', 'player_mining_right_2'], fps: 6, loop: true },
      },
    },
    monster: {
      atlasId: 'characters',
      drawScale: 1.2,
      clips: {
        idle: { frames: ['goblin_idle_0', 'goblin_idle_1'], fps: 4, loop: true },
      },
    },
    vendor: {
      atlasId: 'characters',
      drawScale: 1.2,
      clips: {
        idle: { frames: ['vendor_idle_0', 'vendor_idle_1'], fps: 3, loop: true },
      },
    },
  };

  return {
    atlases,
    clips,
  };
})();
