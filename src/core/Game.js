class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.world       = new World();
    this.spriteSystem = new SpriteSystem({ basePath: 'assets/sprites/' });
    this.spriteSystem.registerManifest(SpriteManifest.atlases);
    this.world.spriteSystem = this.spriteSystem;
    this.world.game = this;
    this.camera      = new Camera(this.canvas.width, this.canvas.height, this.world);
    this.player      = new Player(this.world);
    this.ui          = new UI();
    this.inventoryUI = new InventoryUI(
      this.player.inventory,
      this.player.equipment,
      this.player.skills,
      (text, color) => this.ui.pushSystem(text, color)
    );
    this.craftingUI  = new CraftingUI(this.player.inventory, this.player.skills);
    this.shopUI      = new ShopUI(this.player, (text, color) => this.ui.pushSystem(text, color));
    this.skillsUI    = new SkillsUI(this.player.skills);
    this.skillJournalUI = new SkillJournalUI(this.player.skills);
    this.lootFilterUI = new LootFilterUI(this.player);
    this.playerUI    = new PlayerUI(this.player);
    this.helpUI      = new HelpUI();
    this.spellbookUI = new SpellbookUI(this.player);
    this.hotbarUI    = new HotbarUI([
      { key: '1', label: 'Save', action: () => this.manualSave() },
      { key: '2', label: 'Load', action: () => this.manualLoad() },
      { key: '3', label: 'Inventory', action: () => this.inventoryUI.toggle() },
      { key: '4', label: 'Crafting', action: () => this.craftingUI.toggle() },
      {
        key: '5',
        label: () => `Style: ${this.player.combatStyle[0].toUpperCase()}`,
        action: () => {
          const style = this.player.cycleCombatStyle();
          this.ui.pushSystem(`Combat style: ${style}`, '#90caf9');
        },
      },
      { key: '6', label: 'Journal', action: () => this.skillJournalUI.toggle() },
      {
        key: '7',
        label: () => this.player.lootFilter.enabled ? 'Loot: Filter' : 'Loot: All',
        action: () => {
          const enabled = this.player.toggleLootFilterEnabled();
          this.ui.pushSystem(`Loot filter ${enabled ? 'enabled' : 'disabled'}`, enabled ? '#81c784' : '#ffcc80');
        },
      },
      { key: '8', label: 'Character', action: () => this.playerUI.toggle() },
      { key: 'M', label: 'Spells', action: () => this.spellbookUI.toggle() },
    ]);
    this.input       = new InputHandler(
      this.canvas, this.camera, this.world, this.player,
      this.inventoryUI, this.craftingUI, this.shopUI, this.skillsUI, this.skillJournalUI, this.lootFilterUI, this.playerUI, this.helpUI, this.hotbarUI, this.spellbookUI,
      {
        onManualSave: () => this.manualSave(),
        onManualLoad: () => this.manualLoad(),
        onSystemMessage: (text, color = '#90caf9') => this.ui.pushSystem(text, color),
      }
    );

    this.camera.follow(this.player);

    this._saveDirty = false;
    this._autosaveTimer = 0;
    this._autosaveEvery = 20;
    this._lastDeathVersion = this.player.deathVersion;

    this._loadFromSave();

    this.lastTime = 0;
    this.loop = this.loop.bind(this);
  }

  resize() {
    this.canvas.width  = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
    if (this.camera) {
      this.camera.width  = this.canvas.width;
      this.camera.height = this.canvas.height;
    }
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.player.update(dt);
    this.world.update(dt, this.player);
    this.camera.update();
    this.input.update(dt);
    this.ui.update(dt);
    this.craftingUI.update(dt);
    this.shopUI.update(dt);
    this.spellbookUI.update(dt);

    // Poll for level-up events and push them to the toast system
    for (const evt of this.player.skills.popLevelUps()) {
      this.ui.pushLevelUp(evt.skillName, evt.level);
      this._markDirty();
    }

    for (const evt of this.player.skills.popUnlocks()) {
      this.ui.pushSystem(`Unlock: ${evt.skillName} Lv ${evt.level} - ${evt.title}`, '#64b5f6');
      this._markDirty();
    }

    // Poll for loot pickup events and push them to the toast system
    for (const evt of this.player.popLootPickups()) {
      this.ui.pushLoot(evt.itemName, evt.quantity, evt.rarity);
      this._markDirty();
    }

    if (this.player.deathVersion !== this._lastDeathVersion) {
      this._lastDeathVersion = this.player.deathVersion;
      this._markDirty();
    }

    this._autosaveTimer += dt;
    if (this._autosaveTimer >= this._autosaveEvery) {
      this._saveNow();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.world.render(ctx, this.camera);
    this.input.renderMarker(ctx, this.camera);
    this.player.render(ctx, this.camera);

    // HUD (always on top of world, under panels)
    this.ui.render(ctx, this.player);

    // Toggleable panels — render last so they sit on top
    this.inventoryUI.render(ctx, this.canvas.width, this.canvas.height);
    this.craftingUI.render(ctx, this.canvas.width, this.canvas.height);
    this.shopUI.render(ctx, this.canvas.width, this.canvas.height);
    this.skillsUI.render(ctx, this.canvas.width, this.canvas.height);
    this.skillJournalUI.render(ctx, this.canvas.width, this.canvas.height);
    this.lootFilterUI.render(ctx, this.canvas.width, this.canvas.height);
    this.playerUI.render(ctx, this.canvas.width, this.canvas.height);
    this.helpUI.render(ctx, this.canvas.width, this.canvas.height);
    this.spellbookUI.render(ctx, this.canvas.width, this.canvas.height);
    this.hotbarUI.render(ctx, this.canvas.width, this.canvas.height);
  }

  _markDirty() {
    this._saveDirty = true;
  }

  _saveNow() {
    const result = SaveSystem.saveGame(this.player, this.world);
    this._saveDirty = !result.ok;
    this._autosaveTimer = 0;
    if (result.ok) {
      this.ui.setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`, '#9ccc65', 2.8);
    } else {
      this.ui.setSaveStatus('Save failed', '#ef9a9a', 4.0);
      this.ui.pushSystem('Save failed', '#ef9a9a');
    }
  }

  _loadFromSave() {
    const loaded = SaveSystem.loadGame();
    if (!loaded.ok) {
      this.ui.setSaveStatus('Save data invalid', '#ef9a9a', 4.0);
      return false;
    }
    if (!loaded.data) {
      this.ui.setSaveStatus('No save found', '#ffcc80', 2.5);
      return false;
    }

    try {
      this.player.deserialize(loaded.data.player);
      this.world.deserialize(loaded.data.world);
      this._lastDeathVersion = this.player.deathVersion;
      this.camera.update();
      this._autosaveTimer = 0;
      this.ui.setSaveStatus('Save loaded', '#90caf9', 3.2);
      return true;
    } catch (err) {
      console.warn('Game: failed to apply save, using fresh state.', err);
      this.ui.setSaveStatus('Load failed', '#ef9a9a', 4.0);
      return false;
    }
  }

  manualSave() {
    this._saveNow();
    this.ui.pushSystem('Game saved', '#9ccc65');
  }

  manualLoad() {
    const loaded = this._loadFromSave();
    if (loaded) {
      this.ui.pushSystem('Save loaded', '#90caf9');
    } else {
      this.ui.pushSystem('No valid save to load', '#ffcc80');
    }
  }
}
