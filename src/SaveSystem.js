const SaveSystem = (() => {
  const SAVE_KEY = 'rpg_save_v1';
  const SCHEMA_VERSION = 1;

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
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ok: true, data: null };

      const payload = JSON.parse(raw);
      if (!payload || payload.schemaVersion !== SCHEMA_VERSION) {
        console.warn('SaveSystem: schema mismatch or invalid payload; ignoring save.');
        return { ok: false, data: null };
      }

      return { ok: true, data: payload };
    } catch (err) {
      console.warn('SaveSystem: load failed; ignoring corrupted save.', err);
      return { ok: false, data: null, error: err };
    }
  }

  function clear() {
    localStorage.removeItem(SAVE_KEY);
  }

  return {
    saveGame,
    loadGame,
    clear,
  };
})();
