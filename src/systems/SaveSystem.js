const SaveSystem = (() => {
  const SAVE_KEY = 'rpg_save_v2';
  const LEGACY_KEYS = ['rpg_save_v1'];
  const SCHEMA_VERSION = 2;

  function saveGame(player, world) {
    try {
      const payload = {
        schemaVersion: SCHEMA_VERSION,
        savedAt: Date.now(),
        player: player.serialize(),
        world: world.serialize(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return { ok: true };
    } catch (err) {
      console.warn('SaveSystem: save failed', err);
      return { ok: false, error: err };
    }
  }

  function loadGame() {
    try {
      let raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        for (const legacyKey of LEGACY_KEYS) {
          raw = localStorage.getItem(legacyKey);
          if (raw) break;
        }
      }
      if (!raw) return { ok: true, data: null };

      const payload = JSON.parse(raw);
      const migrated = _migratePayload(payload);
      if (!migrated) {
        console.warn('SaveSystem: schema mismatch or invalid payload; ignoring save.');
        return { ok: false, data: null };
      }

      return { ok: true, data: migrated };
    } catch (err) {
      console.warn('SaveSystem: load failed; ignoring corrupted save.', err);
      return { ok: false, data: null, error: err };
    }
  }

  function _migratePayload(payload) {
    if (!payload || typeof payload !== 'object') return null;

    if (payload.schemaVersion === SCHEMA_VERSION) return payload;

    if (payload.schemaVersion === 1) {
      return {
        schemaVersion: SCHEMA_VERSION,
        savedAt: payload.savedAt ?? Date.now(),
        player: payload.player,
        world: payload.world,
      };
    }

    return null;
  }

  function clear() {
    localStorage.removeItem(SAVE_KEY);
    for (const legacyKey of LEGACY_KEYS) {
      localStorage.removeItem(legacyKey);
    }
  }

  return {
    saveGame,
    loadGame,
    clear,
  };
})();
