class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.world       = new World();
    this.camera      = new Camera(this.canvas.width, this.canvas.height, this.world);
    this.player      = new Player(this.world);
    this.ui          = new UI();
    this.inventoryUI = new InventoryUI(this.player.inventory, this.player.equipment);
    this.craftingUI  = new CraftingUI(this.player.inventory, this.player.skills);
    this.skillsUI    = new SkillsUI(this.player.skills);
    this.playerUI    = new PlayerUI(this.player);
    this.helpUI      = new HelpUI();
    this.input       = new InputHandler(
      this.canvas, this.camera, this.world, this.player,
      this.inventoryUI, this.craftingUI, this.skillsUI, this.playerUI, this.helpUI
    );

    this.camera.follow(this.player);

    this.lastTime = 0;
    this.loop = this.loop.bind(this);
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
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

    // Poll for level-up events and push them to the toast system
    for (const evt of this.player.skills.popLevelUps()) {
      this.ui.pushLevelUp(evt.skillName, evt.level);
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
    this.skillsUI.render(ctx, this.canvas.width, this.canvas.height);
    this.playerUI.render(ctx, this.canvas.width, this.canvas.height);
    this.helpUI.render(ctx, this.canvas.width, this.canvas.height);
  }
}
