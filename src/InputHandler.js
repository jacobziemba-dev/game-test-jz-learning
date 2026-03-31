class ContextMenu {
  constructor() {
    this.visible = false;
    this.screenX = 0;
    this.screenY = 0;
    this.items = []; // [{label, color, action}]
    this.hoverIndex = -1;
    this.itemH = 26;
    this.width = 150;
    this.headerH = 22;
    this.padding = 6;
  }

  open(sx, sy, items, canvasW, canvasH) {
    this.items = items;
    this.hoverIndex = -1;
    const totalH = this.headerH + this.items.length * this.itemH + this.padding;
    // Keep menu inside canvas
    this.screenX = Math.min(sx, canvasW - this.width - 4);
    this.screenY = Math.min(sy, canvasH - totalH - 4);
    this.visible = true;
  }

  close() {
    this.visible = false;
    this.hoverIndex = -1;
  }

  onMouseMove(sx, sy) {
    if (!this.visible) return;
    const relY = sy - this.screenY - this.headerH;
    if (sx >= this.screenX && sx <= this.screenX + this.width && relY >= 0) {
      this.hoverIndex = Math.floor(relY / this.itemH);
      if (this.hoverIndex >= this.items.length) this.hoverIndex = -1;
    } else {
      this.hoverIndex = -1;
    }
  }

  // Returns true if click was consumed by the menu
  onClick(sx, sy) {
    if (!this.visible) return false;
    const totalH = this.headerH + this.items.length * this.itemH + this.padding;
    // Click outside → close
    if (sx < this.screenX || sx > this.screenX + this.width ||
        sy < this.screenY || sy > this.screenY + totalH) {
      this.close();
      return true; // still consume the click
    }
    // Click on an item
    const relY = sy - this.screenY - this.headerH;
    if (relY >= 0) {
      const idx = Math.floor(relY / this.itemH);
      if (idx >= 0 && idx < this.items.length) {
        this.items[idx].action();
      }
    }
    this.close();
    return true;
  }

  render(ctx) {
    if (!this.visible) return;
    const { screenX: x, screenY: y, width: w, itemH, headerH, padding, items } = this;
    const totalH = headerH + items.length * itemH + padding;

    // Background
    ctx.save();
    ctx.fillStyle = 'rgba(20, 14, 6, 0.95)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, totalH, 4);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Choose option', x + w / 2, y + 15);

    // Divider
    ctx.strokeStyle = '#c8a45a44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + headerH);
    ctx.lineTo(x + w - 6, y + headerH);
    ctx.stroke();

    // Items
    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';
    for (let i = 0; i < items.length; i++) {
      const iy = y + headerH + i * itemH;

      // Hover highlight
      if (i === this.hoverIndex) {
        ctx.fillStyle = 'rgba(200, 164, 90, 0.2)';
        ctx.fillRect(x + 1, iy, w - 2, itemH);
      }

      // Label — first word in accent color, rest in white
      const parts = items[i].label.split(' ');
      const accent = parts[0];
      const rest = parts.slice(1).join(' ');
      const tx = x + 10;
      const ty = iy + itemH / 2 + 4;

      ctx.fillStyle = items[i].color || '#ffcc44';
      ctx.fillText(accent, tx, ty);
      const accentW = ctx.measureText(accent + ' ').width;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(rest, tx + accentW, ty);
    }

    ctx.restore();
  }
}

// ─────────────────────────────────────────────

class InputHandler {
  constructor(canvas, camera, world, player, inventoryUI, craftingUI, skillsUI, skillJournalUI, lootFilterUI, playerUI, helpUI, hotbarUI, actions = {}) {
    this.canvas      = canvas;
    this.camera      = camera;
    this.world       = world;
    this.player      = player;
    this.inventoryUI = inventoryUI;
    this.craftingUI  = craftingUI;
    this.skillsUI    = skillsUI;
    this.skillJournalUI = skillJournalUI;
    this.lootFilterUI = lootFilterUI;
    this.playerUI    = playerUI;
    this.helpUI      = helpUI;
    this.hotbarUI    = hotbarUI;
    this.actions     = actions;

    this.clickMarker = null; // { x, y, alpha }
    this.menu = new ContextMenu();

    canvas.addEventListener('click',       (e) => this._onClick(e));
    canvas.addEventListener('contextmenu', (e) => this._onRightClick(e));
    canvas.addEventListener('mousemove',   (e) => this._onMouseMove(e));
    window.addEventListener('keydown',     (e) => this._onKeyDown(e));
  }

  _onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (key === 'i') { this.inventoryUI.toggle(); this.menu.close(); }
    if (key === 'c') { this.craftingUI.toggle();  this.menu.close(); }
    if (key === 'k') { this.skillsUI.toggle();    this.menu.close(); }
    if (key === 'j') { this.skillJournalUI.toggle(); this.menu.close(); }
    if (key === 'p') { this.playerUI.toggle();    this.menu.close(); }
    if (key === 'h') { this.helpUI.toggle();      this.menu.close(); }
    if (key === 'f') { this.lootFilterUI.toggle(); this.menu.close(); }
    if (key === 'o') {
      this.actions.onManualSave?.();
      this.menu.close();
    }
    if (key === 'l') {
      this.actions.onManualLoad?.();
      this.menu.close();
    }
    if (key === 'b') {
      this.hotbarUI.toggle();
      this.menu.close();
    }
    if (this.hotbarUI.onKey(key)) {
      this.menu.close();
    }
    if (e.key === 'Escape') {
      this.inventoryUI.close();
      this.craftingUI.close();
      this.skillsUI.close();
      this.skillJournalUI.close();
      this.lootFilterUI.close();
      this.playerUI.close();
      this.helpUI.close();
      this.menu.close();
    }
  }

  _screenPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }

  _onClick(e) {
    const { sx, sy } = this._screenPos(e);

    // UI panels consume clicks when open
    if (this.inventoryUI.onClick(sx, sy)) return;
    if (this.craftingUI.onClick(sx, sy))  return;
    if (this.skillsUI.onClick(sx, sy))    return;
    if (this.skillJournalUI.onClick(sx, sy)) return;
    if (this.lootFilterUI.onClick(sx, sy)) return;
    if (this.playerUI.onClick(sx, sy))    return;
    if (this.helpUI.onClick(sx, sy))      return;
    if (this.hotbarUI.onClick(sx, sy))    return;

    // If context menu is open, let it consume the click
    if (this.menu.visible) {
      this.menu.onClick(sx, sy);
      return;
    }

    const { col, row } = this.camera.screenToTile(sx, sy);
    if (col < 0 || row < 0 || col >= this.world.cols || row >= this.world.rows) return;

    const loot = this.world.getLootAt(col, row);
    if (loot) {
      const pickup = this.world.pickupLoot(loot, this.player.inventory);
      if (pickup) this.player.queueLootPickup(pickup.itemName, pickup.quantity, pickup.rarity);
      return;
    }

    const monster = this.world.getMonsterAt(col, row);
    if (monster) {
      this.player.attackMonster(monster);
      return;
    }

    const tree = this.world.getTreeAt(col, row);
    if (tree) {
      // Left-click on tree → default action: cut tree
      this.player.chopTree(tree);
      return;
    }

    const oreNode = this.world.getOreNodeAt(col, row);
    if (oreNode) {
      this.player.mineOreNode(oreNode);
      return;
    }

    // Ground — walk there
    const wPos = this.camera.screenToWorld(sx, sy);
    this.clickMarker = { x: wPos.x, y: wPos.y, alpha: 1.0 };
    this.player.walkTo(col, row);
  }

  _onRightClick(e) {
    e.preventDefault();
    const { sx, sy } = this._screenPos(e);

    // Close existing menu first
    this.menu.close();

    const { col, row } = this.camera.screenToTile(sx, sy);
    if (col < 0 || row < 0 || col >= this.world.cols || row >= this.world.rows) return;

    const items = [];
    const loot = this.world.getLootAt(col, row);
    if (loot) {
      const item = ItemRegistry.get(loot.itemId);
      const label = item ? `Take ${item.name.toLowerCase()}` : 'Take loot';
      items.push({
        label,
        color: '#9ccc65',
        action: () => {
          const pickup = this.world.pickupLoot(loot, this.player.inventory);
          if (pickup) this.player.queueLootPickup(pickup.itemName, pickup.quantity, pickup.rarity);
        },
      });

      const stack = this.world.getLootStackAt(col, row);
      if (stack.length > 1) {
        items.push({
          label: `Take all (${stack.length})`,
          color: '#80cbc4',
          action: () => {
            const pickups = this.world.pickupAllLootAt(
              col,
              row,
              this.player.inventory,
              this.player.lootFilter.enabled
                ? (drop) => {
                  const rarity = ItemRegistry.get(drop.itemId)?.rarity ?? 'common';
                  return this.player.allowsLootRarity(rarity);
                }
                : null
            );

            if (pickups.length === 0 && this.player.lootFilter.enabled) {
              this.actions.onSystemMessage?.('No allowed loot by current filter', '#ffcc80');
            }

            for (const pickup of pickups) {
              this.player.queueLootPickup(pickup.itemName, pickup.quantity, pickup.rarity);
            }
          },
        });
      }
    }

    const monster = this.world.getMonsterAt(col, row);
    if (monster) {
      items.push({
        label: `Attack ${monster.name.toLowerCase()}`,
        color: '#ff8a65',
        action: () => this.player.attackMonster(monster),
      });
    }

    const tree = this.world.getTreeAt(col, row);

    if (tree) {
      items.push({
        label: 'Cut tree',
        color: '#a5d6a7',
        action: () => this.player.chopTree(tree),
      });
    }

    const oreNode = this.world.getOreNodeAt(col, row);
    if (oreNode) {
      items.push({
        label: `Mine ${oreNode.name.toLowerCase()}`,
        color: '#90a4ae',
        action: () => this.player.mineOreNode(oreNode),
      });
    }

    // "Walk here" — navigate to nearest walkable tile
    items.push({
      label: 'Walk here',
      color: '#ffcc44',
      action: () => {
        const blockedTarget = tree || oreNode;
        if (blockedTarget) {
          const adj = Pathfinder.findAdjacentTile(
            this.player.col, this.player.row, blockedTarget.col, blockedTarget.row, this.world
          );
          if (adj) {
            const wPos = this.camera.screenToWorld(sx, sy);
            this.clickMarker = { x: wPos.x, y: wPos.y, alpha: 1.0 };
            this.player.walkTo(adj.col, adj.row);
          }
        } else {
          const wPos = this.camera.screenToWorld(sx, sy);
          this.clickMarker = { x: wPos.x, y: wPos.y, alpha: 1.0 };
          this.player.walkTo(col, row);
        }
      },
    });

    items.push({
      label: 'Cancel',
      color: '#ff6b6b',
      action: () => {},
    });

    this.menu.open(sx, sy, items, this.canvas.width, this.canvas.height);
  }

  _onMouseMove(e) {
    const { sx, sy } = this._screenPos(e);
    this.menu.onMouseMove(sx, sy);
    this.inventoryUI.onMouseMove(sx, sy);
    this.craftingUI.onMouseMove(sx, sy);
    this.skillJournalUI.onMouseMove(sx, sy);
    this.lootFilterUI.onMouseMove(sx, sy);
    this.playerUI.onMouseMove(sx, sy);
    this.hotbarUI.onMouseMove(sx, sy);
  }

  update(dt) {
    if (this.clickMarker) {
      this.clickMarker.alpha -= dt * 2.5;
      if (this.clickMarker.alpha <= 0) this.clickMarker = null;
    }
  }

  renderMarker(ctx, camera) {
    if (this.clickMarker) {
      const { x, y, alpha } = this.clickMarker;
      const sx = x - camera.x;
      const sy = y - camera.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      const size = 10;
      ctx.beginPath();
      ctx.moveTo(sx - size, sy); ctx.lineTo(sx + size, sy);
      ctx.moveTo(sx, sy - size); ctx.lineTo(sx, sy + size);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Menu renders in screen space (no camera offset)
    this.menu.render(ctx);
  }
}
