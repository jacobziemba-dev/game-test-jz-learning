class CraftingUI {
  constructor(inventory, skillManager) {
    this.inventory = inventory;
    this.skillManager = skillManager;
    this.isOpen = false;

    this.panelW = 760;
    this.panelH = 560;
    this.headerH = 34;
    this.tabH = 28;
    this.stationH = 30;
    this.footerH = 42;

    this.categories = [];
    this.activeCategory = 0;
    this.stationOptions = ['any'];
    this.selectedStation = 'any';

    this.recipes = [];
    this.selectedRecipeIndex = 0;
    this.recipeRowH = 48;
    this.recipeScroll = 0;

    this.quantityOptions = [1, 5, 10, 'MAX'];
    this.quantityIndex = 0;

    this._px = 0;
    this._py = 0;
    this._listBounds = null;
    this._detailBounds = null;

    this._feedback = null;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this._rebuild();
  }

  open() {
    this.isOpen = true;
    this._rebuild();
  }

  close() {
    this.isOpen = false;
  }

  setPreferredStation(stationType) {
    this.selectedStation = stationType;
  }

  onMouseMove() { }

  onWheel(deltaY) {
    if (!this.isOpen || !this._listBounds) return false;
    const maxScroll = Math.max(0, this.recipes.length * this.recipeRowH - this._listBounds.h);
    this.recipeScroll = Math.max(0, Math.min(maxScroll, this.recipeScroll + (deltaY > 0 ? 28 : -28)));
    return true;
  }

  onClick(sx, sy) {
    if (!this.isOpen) return false;
    if (!this._inside(sx, sy, this._px, this._py, this.panelW, this.panelH)) return false;

    const tabY = this._py + this.headerH;
    const stationY = tabY + this.tabH;
    const bodyY = stationY + this.stationH;

    if (this._handleCategoryClick(sx, sy, tabY)) return true;
    if (this._handleStationClick(sx, sy, stationY)) return true;

    if (this._listBounds && this._inside(sx, sy, this._listBounds.x, this._listBounds.y, this._listBounds.w, this._listBounds.h)) {
      const localY = sy - this._listBounds.y + this.recipeScroll;
      const idx = Math.floor(localY / this.recipeRowH);
      if (idx >= 0 && idx < this.recipes.length) this.selectedRecipeIndex = idx;
      return true;
    }

    if (this._detailBounds && this._inside(sx, sy, this._detailBounds.x, this._detailBounds.y, this._detailBounds.w, this._detailBounds.h)) {
      if (this._handleDetailClick(sx, sy, bodyY)) return true;
    }

    return true;
  }

  update(dt) {
    if (!this.isOpen) return;
    this._rebuildRecipesOnly();
    if (this._feedback) {
      this._feedback.ttl -= dt;
      if (this._feedback.ttl <= 0) this._feedback = null;
    }
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this.panelW = Math.min(canvasW - 16, 760);
    this.panelH = Math.min(canvasH - 16, 460);
    if (!this.isOpen) return;

    this._px = Math.round((canvasW - this.panelW) / 2);
    this._py = Math.round((canvasH - this.panelH) / 2);

    const tabY = this._py + this.headerH;
    const stationY = tabY + this.tabH;
    const bodyY = stationY + this.stationH;
    const bodyH = this.panelH - this.headerH - this.tabH - this.stationH - this.footerH;
    const footerY = bodyY + bodyH;

    const isPortrait = this.panelH > this.panelW;
    const listW = isPortrait ? this.panelW - 16 : 320;
    const detailX = isPortrait ? this._px + 8 : this._px + listW + 8;
    const detailW = isPortrait ? this.panelW - 16 : this.panelW - listW - 16;
    const listH = isPortrait ? Math.floor(bodyH * 0.4) : bodyH - 16;
    const detailY = isPortrait ? bodyY + listH + 8 : bodyY + 8;
    const detailH = isPortrait ? bodyH - listH - 16 : bodyH - 16;

    this._listBounds = { x: this._px + 8, y: bodyY + 8, w: listW, h: listH };
    this._detailBounds = { x: detailX, y: detailY, w: detailW, h: detailH };

    ctx.save();

    ctx.fillStyle = 'rgba(18, 12, 6, 0.97)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth = 2;
    DrawingUtils.rrect(ctx, this._px, this._py, this.panelW, this.panelH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Crafting - Classic Style', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._py + this.headerH);
    this._drawCategoryTabs(ctx, tabY);
    this._divider(ctx, tabY + this.tabH);
    this._drawStationButtons(ctx, stationY);
    this._divider(ctx, stationY + this.stationH);

    this._drawRecipeList(ctx);
    this._drawRecipeDetail(ctx);

    this._divider(ctx, footerY);
    this._drawFooter(ctx, footerY);

    ctx.restore();
  }

  _rebuild() {
    this.categories = RecipeRegistry.categories();
    this.stationOptions = ['any', ...RecipeRegistry.stations()];
    if (!this.categories.length) this.categories = ['General'];
    this.activeCategory = Math.max(0, Math.min(this.activeCategory, this.categories.length - 1));
    this._rebuildRecipesOnly();
  }

  _rebuildRecipesOnly() {
    const category = this.categories[this.activeCategory];
    this.recipes = category ? RecipeRegistry.forCategory(category) : [];

    if (this.selectedRecipeIndex >= this.recipes.length) {
      this.selectedRecipeIndex = Math.max(0, this.recipes.length - 1);
    }
    const maxScroll = Math.max(0, this.recipes.length * this.recipeRowH - (this._listBounds?.h ?? 0));
    this.recipeScroll = Math.max(0, Math.min(maxScroll, this.recipeScroll));
  }

  _activeRecipe() {
    return this.recipes[this.selectedRecipeIndex] ?? null;
  }

  _handleCategoryClick(sx, sy, tabY) {
    if (sy < tabY || sy > tabY + this.tabH) return false;

    // Match the drawing logic:
    const minTabW = 70;
    const totalTabsW = this.panelW - 16;
    const tabW = Math.max(minTabW, totalTabsW / Math.max(1, this.categories.length));

    // Quick bounds check if mouse is within the total clipped area (for overflowing tabs)
    if (sx < this._px + 8 || sx > this._px + 8 + totalTabsW) return false;

    for (let i = 0; i < this.categories.length; i++) {
      const x = this._px + 8 + i * tabW;
      if (sx >= x && sx <= x + tabW) {
        this.activeCategory = i;
        this.recipeScroll = 0;
        this.selectedRecipeIndex = 0;
        this._rebuildRecipesOnly();
        return true;
      }
    }
    return false;
  }

  _handleStationClick(sx, sy, stationY) {
    if (sy < stationY || sy > stationY + this.stationH) return false;
    const buttonW = 112;
    const gap = 6;
    let x = this._px + 8;
    for (const station of this.stationOptions) {
      if (sx >= x && sx <= x + buttonW && sy >= stationY + 3 && sy <= stationY + this.stationH - 3) {
        this.selectedStation = station;
        return true;
      }
      x += buttonW + gap;
      if (x + buttonW > this._px + this.panelW - 8) break;
    }
    return false;
  }

  _handleDetailClick(sx, sy) {
    const qtyY = this._detailBounds.y + this._detailBounds.h - 62;
    const qtyW = 64;
    const qtyGap = 8;
    let qx = this._detailBounds.x + 10;

    for (let i = 0; i < this.quantityOptions.length; i++) {
      if (this._inside(sx, sy, qx, qtyY, qtyW, 24)) {
        this.quantityIndex = i;
        return true;
      }
      qx += qtyW + qtyGap;
    }

    const craftBtnW = 120;
    const craftBtnX = this._detailBounds.x + this._detailBounds.w - craftBtnW - 10;
    if (this._inside(sx, sy, craftBtnX, qtyY, craftBtnW, 24)) {
      this._craftSelected();
      return true;
    }

    return false;
  }

  _craftSelected() {
    const recipe = this._activeRecipe();
    if (!recipe) return;

    const maxCraftable = recipe.maxCraftable(this.inventory, this.skillManager, this.selectedStation);
    const selectedQty = this.quantityOptions[this.quantityIndex];
    const requested = selectedQty === 'MAX' ? maxCraftable : selectedQty;

    if (maxCraftable <= 0) {
      const state = recipe.canCraftDetailed(this.inventory, this.skillManager, this.selectedStation);
      if (state.missingSkills.length > 0) {
        const req = state.missingSkills[0];
        this._feedback = { text: `Cannot craft: Need Level ${req.level} ${req.skillId}`, color: "#ef9a9a", ttl: 2.5 };
      } else {
        this._feedback = { text: "Cannot craft: requirements not met", color: "#ef9a9a", ttl: 2.5 };
      }
      return;
    }

    if (window.game && window.game.player) {
      window.game.player._beginCrafting(recipe, requested, this.selectedStation);
      this.close();
    }
  }

  _drawCategoryTabs(ctx, y) {
    const minTabW = 70; // Ensure tabs aren't microscopically thin
    const totalTabsW = this.panelW - 16;
    const tabW = Math.max(minTabW, totalTabsW / Math.max(1, this.categories.length));

    // Quick and dirty manual "scroll" offset if they exceed width, though normally they fit now.
    // For now we just draw them; if they overflow panel bounds, clip them.
    ctx.save();
    ctx.beginPath();
    ctx.rect(this._px + 8, y, totalTabsW, this.tabH);
    ctx.clip();

    for (let i = 0; i < this.categories.length; i++) {
      const x = this._px + 8 + i * tabW;
      const active = i === this.activeCategory;
      ctx.fillStyle = active ? 'rgba(80, 140, 90, 0.35)' : 'rgba(255, 255, 255, 0.05)';
      DrawingUtils.rrect(ctx, x + 1, y + 3, tabW - 3, this.tabH - 6, 4);
      ctx.fill();

      ctx.strokeStyle = active ? '#66bb6a' : '#ffffff22';
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, x + 1, y + 3, tabW - 3, this.tabH - 6, 4);
      ctx.stroke();

      ctx.fillStyle = active ? '#e8f5e9' : '#c7c7c7';
      ctx.font = active ? 'bold 11px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = this.categories[i].replace(/^Crafting:\s*/i, '');
      ctx.fillText(label, x + tabW / 2, y + this.tabH / 2 + 1);
    }

    ctx.restore();
  }

  _drawStationButtons(ctx, y) {
    ctx.fillStyle = '#b0bec5';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Station:', this._px + 10, y + this.stationH / 2);

    const buttonW = 112;
    const gap = 6;
    let x = this._px + 66;
    for (const station of this.stationOptions) {
      if (x + buttonW > this._px + this.panelW - 8) break;
      const selected = station === this.selectedStation;
      ctx.fillStyle = selected ? 'rgba(100, 160, 220, 0.35)' : 'rgba(255,255,255,0.05)';
      DrawingUtils.rrect(ctx, x, y + 4, buttonW, this.stationH - 8, 4);
      ctx.fill();

      ctx.strokeStyle = selected ? '#64b5f6' : '#ffffff22';
      ctx.lineWidth = 1;
      DrawingUtils.rrect(ctx, x, y + 4, buttonW, this.stationH - 8, 4);
      ctx.stroke();

      ctx.fillStyle = selected ? '#e3f2fd' : '#d0d0d0';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this._humanStation(station), x + buttonW / 2, y + this.stationH / 2 + 1);
      x += buttonW + gap;
    }
  }

  _drawRecipeList(ctx) {
    const b = this._listBounds;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    DrawingUtils.rrect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffffff1a';
    ctx.stroke();

    ctx.save();
    DrawingUtils.rrect(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 2, 4);
    ctx.clip();

    let y = b.y - this.recipeScroll;
    for (let i = 0; i < this.recipes.length; i++) {
      const recipe = this.recipes[i];
      const selected = i === this.selectedRecipeIndex;
      if (y + this.recipeRowH >= b.y && y <= b.y + b.h) {
        this._drawRecipeRow(ctx, recipe, y, selected);
      }
      y += this.recipeRowH;
    }
    ctx.restore();
  }

  _drawRecipeRow(ctx, recipe, y, selected) {
    const x = this._listBounds.x;
    const w = this._listBounds.w;
    const rowH = this.recipeRowH;

    const state = recipe.canCraftDetailed(this.inventory, this.skillManager, this.selectedStation);
    const unlocked = recipe.isUnlocked(this.skillManager);

    ctx.fillStyle = selected ? 'rgba(200, 164, 90, 0.25)' : 'rgba(255,255,255,0.02)';
    ctx.fillRect(x + 2, y + 2, w - 4, rowH - 3);

    if (state.canCraft) ctx.strokeStyle = '#66bb6a66';
    else if (!unlocked) ctx.strokeStyle = '#ef9a9a66';
    else ctx.strokeStyle = '#ffcc8066';
    ctx.strokeRect(x + 2, y + 2, w - 4, rowH - 3);

    ctx.fillStyle = '#f2f2f2';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(recipe.name, x + 8, y + 7);

    const req = recipe.requiredSkills[0];
    const reqText = req ? `${req.skillId} ${req.level}` : 'no req';
    ctx.fillStyle = '#b0bec5';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Req: ${reqText}`, x + 8, y + 24);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#d7ccc8';
    ctx.fillText(this._humanStation(recipe.station), x + w - 8, y + 24);
  }

  _drawRecipeDetail(ctx) {
    const b = this._detailBounds;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    DrawingUtils.rrect(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffffff1a';
    ctx.stroke();

    const recipe = this._activeRecipe();
    if (!recipe) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('No recipes in this category.', b.x + 10, b.y + 20);
      return;
    }

    const state = recipe.canCraftDetailed(this.inventory, this.skillManager, this.selectedStation);
    const maxCraftable = recipe.maxCraftable(this.inventory, this.skillManager, this.selectedStation);

    let y = b.y + 10;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#f2f2f2';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(recipe.name, b.x + 10, y);
    y += 24;

    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#c7c7c7';
    ctx.fillText(`Station: ${this._humanStation(recipe.station)}`, b.x + 10, y);
    y += 18;

    const xpText = recipe.grantXP.map(x => `+${x.amount} ${x.skillId}`).join(', ') || 'No XP';
    ctx.fillStyle = '#9ccc65';
    ctx.fillText(`XP: ${xpText}`, b.x + 10, y);
    y += 20;

    ctx.fillStyle = '#90caf9';
    ctx.fillText(`Max craftable now: ${maxCraftable}`, b.x + 10, y);
    y += 22;

    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Inputs', b.x + 10, y);
    y += 16;
    ctx.font = '11px sans-serif';
    for (const inp of recipe.inputs) {
      const item = ItemRegistry.get(inp.itemId);
      const have = this.inventory.countItem(inp.itemId);
      const ok = have >= inp.qty;
      ctx.fillStyle = ok ? '#c7c7c7' : '#ef9a9a';
      ctx.fillText(`- ${inp.qty} ${item?.name ?? inp.itemId} (${have})`, b.x + 12, y);
      y += 15;
    }

    y += 6;
    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Tools', b.x + 10, y);
    y += 16;
    ctx.font = '11px sans-serif';
    if (!recipe.tools.length) {
      ctx.fillStyle = '#c7c7c7';
      ctx.fillText('- None', b.x + 12, y);
      y += 15;
    } else {
      for (const tool of recipe.tools) {
        const item = ItemRegistry.get(tool.itemId);
        const has = this.inventory.hasItem(tool.itemId, 1);
        ctx.fillStyle = has ? '#c7c7c7' : '#ef9a9a';
        ctx.fillText(`- ${item?.name ?? tool.itemId}`, b.x + 12, y);
        y += 15;
      }
    }

    y += 6;
    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Outputs', b.x + 10, y);
    y += 16;
    ctx.font = '11px sans-serif';
    for (const out of recipe.outputs) {
      const item = ItemRegistry.get(out.itemId);
      ctx.fillStyle = '#81c784';
      ctx.fillText(`- ${out.qty} ${item?.name ?? out.itemId}`, b.x + 12, y);
      y += 15;
    }

    if (recipe.onFailOutputs.length) {
      y += 6;
      ctx.fillStyle = '#ffcc80';
      ctx.fillText('On fail:', b.x + 10, y);
      y += 15;
      for (const out of recipe.onFailOutputs) {
        const item = ItemRegistry.get(out.itemId);
        ctx.fillText(`- ${out.qty} ${item?.name ?? out.itemId}`, b.x + 12, y);
        y += 15;
      }
    }

    const qtyY = b.y + b.h - 62;
    const qtyW = 64;
    const qtyGap = 8;
    let qx = b.x + 10;
    for (let i = 0; i < this.quantityOptions.length; i++) {
      const selected = i === this.quantityIndex;
      ctx.fillStyle = selected ? 'rgba(100, 149, 237, 0.35)' : 'rgba(255,255,255,0.06)';
      DrawingUtils.rrect(ctx, qx, qtyY, qtyW, 24, 4);
      ctx.fill();
      ctx.strokeStyle = selected ? '#64b5f6' : '#ffffff22';
      ctx.stroke();
      ctx.fillStyle = '#f0f0f0';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(this.quantityOptions[i]), qx + qtyW / 2, qtyY + 12);
      qx += qtyW + qtyGap;
    }

    const craftBtnW = 120;
    const craftBtnX = b.x + b.w - craftBtnW - 10;
    const canPress = state.canCraft && maxCraftable > 0;
    ctx.fillStyle = canPress ? 'rgba(102, 187, 106, 0.35)' : 'rgba(180, 180, 180, 0.2)';
    DrawingUtils.rrect(ctx, craftBtnX, qtyY, craftBtnW, 24, 4);
    ctx.fill();
    ctx.strokeStyle = canPress ? '#66bb6a' : '#888';
    ctx.stroke();

    ctx.fillStyle = canPress ? '#e8f5e9' : '#bdbdbd';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CRAFT', craftBtnX + craftBtnW / 2, qtyY + 12);
  }

  _drawFooter(ctx, y) {
    if (this._feedback) {
      ctx.fillStyle = this._feedback.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._feedback.text, this._px + 12, y + this.footerH / 2);
    }

    ctx.fillStyle = '#8f8f8f';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('[C] close  [Mouse wheel] scroll', this._px + this.panelW - 12, y + this.footerH / 2);
  }

  _humanStation(station) {
    if (station === 'any') return 'Any';
    return station.split('_').map(part => part[0].toUpperCase() + part.slice(1)).join(' ');
  }

  _divider(ctx, y) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this._px + 8, y);
    ctx.lineTo(this._px + this.panelW - 8, y);
    ctx.stroke();
  }

  _inside(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  }
}
