/**
 * CraftingUI — improved canvas panel showing all recipes with tabs and better layout.
 *
 * Toggle with 'C'. Tab-based organization, scrollable content, better text wrapping.
 * Locked recipes (level too low) are shown grayed with a lock + required level.
 * Unlocked-but-missing-materials recipes are shown amber. Ready recipes are green and clickable.
 */
class CraftingUI {
  constructor(inventory, skillManager) {
    this.inventory    = inventory;
    this.skillManager = skillManager;
    this.isOpen       = false;

    this.panelW    = 420;   // wider panel for better text layout
    this.panelH    = 520;   // max height
    this.headerH   = 32;
    this.tabH      = 28;
    this.recipeH   = 85;    // taller rows for better spacing
    this.panelPad  = 10;
    this.contentPad = 8;

    this.categories = [];   // list of category names
    this.activeCategory = 0; // which tab is selected
    this.scrollY = 0;        // vertical scroll offset
    this.recipes = [];       // filtered recipes for active category

    this.hoverRecipeId = -1;
    this._px = 0;
    this._py = 0;
    this._contentStartY = 0;
    this._contentH = 0;

    this._feedback = null; // { text, color, ttl }
  }

  toggle() { this.isOpen = !this.isOpen; if (this.isOpen) this._buildCategories(); }
  close()  { this.isOpen = false; }

  onMouseMove(sx, sy) {
    if (!this.isOpen) return;
    this._updateHover(sx, sy);
  }

  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const inside = sx >= this._px && sx <= this._px + this.panelW &&
                   sy >= this._py && sy <= this._py + this.panelH;
    if (!inside) return false;

    // Check tab clicks
    const tabY = this._py + this.headerH;
    if (sy >= tabY && sy < tabY + this.tabH) {
      for (let i = 0; i < this.categories.length; i++) {
        const tabW = (this.panelW - this.panelPad * 2) / this.categories.length;
        const tabX = this._px + this.panelPad + i * tabW;
        if (sx >= tabX && sx < tabX + tabW) {
          this.activeCategory = i;
          this.scrollY = 0;
          this._buildRecipes();
          return true;
        }
      }
    }

    // Check recipe clicks
    const contentStartY = this._contentStartY;
    const contentH = this._contentH;
    if (sy >= contentStartY && sy < contentStartY + contentH) {
      const relY = sy - contentStartY + this.scrollY;
      const recipeIdx = Math.floor(relY / this.recipeH);
      if (recipeIdx >= 0 && recipeIdx < this.recipes.length) {
        this._tryCraft(this.recipes[recipeIdx]);
      }
    }

    return true;
  }

  update(dt) {
    if (this._feedback) {
      this._feedback.ttl -= dt;
      if (this._feedback.ttl <= 0) this._feedback = null;
    }
    if (this.isOpen) {
      this._buildRecipes();
    }
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this._px = Math.round((canvasW - this.panelW) / 2);
    this._py = Math.round((canvasH - this.panelH) / 2);
    if (this._py < 8) this._py = 8;

    ctx.save();

    // ─── Panel Background ───
    ctx.fillStyle   = 'rgba(18,12,6,0.96)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    this._rrect(ctx, this._px, this._py, this.panelW, this.panelH, 6);
    ctx.fill();
    ctx.stroke();

    // ─── Header ───
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Crafting', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._px, this._py + this.headerH, this.panelW);

    // ─── Category Tabs ───
    const tabY = this._py + this.headerH;
    const tabW = (this.panelW - this.panelPad * 2) / Math.max(1, this.categories.length);
    for (let i = 0; i < this.categories.length; i++) {
      const tabX = this._px + this.panelPad + i * tabW;
      this._drawTab(ctx, tabX, tabY, tabW, this.tabH, this.categories[i], i === this.activeCategory);
    }

    this._divider(ctx, this._px, tabY + this.tabH, this.panelW);

    // ─── Content Area (scrollable recipes) ───
    const contentY = tabY + this.tabH;
    const contentH = this.panelH - this.headerH - this.tabH - 20; // leave room for feedback
    this._contentStartY = contentY;
    this._contentH = contentH;

    // Clip content area
    ctx.save();
    this._rrect(ctx, this._px + this.contentPad, contentY, this.panelW - this.contentPad * 2, contentH, 4);
    ctx.clip();

    let curY = contentY - this.scrollY;
    for (const recipe of this.recipes) {
      if (curY + this.recipeH > contentY && curY < contentY + contentH) {
        this._drawRecipeCard(ctx, recipe, curY, curY + this.recipeH > contentY && curY < contentY + contentH);
      }
      curY += this.recipeH;
    }

    ctx.restore();

    // ─── Feedback Toast ───
    if (this._feedback) {
      ctx.fillStyle    = this._feedback.color;
      ctx.font         = 'bold 11px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.globalAlpha  = Math.min(1, this._feedback.ttl * 3);
      ctx.fillText(this._feedback.text, this._px + this.panelW / 2, this._py + this.panelH - 18);
      ctx.globalAlpha = 1;
    }

    // ─── Footer hint ───
    ctx.fillStyle    = '#666';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[C] close', this._px + this.panelW - 10, this._py + this.panelH - 2);

    ctx.restore();
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  _buildCategories() {
    this.categories = RecipeRegistry.categories();
    this.activeCategory = 0;
    this._buildRecipes();
  }

  _buildRecipes() {
    const category = this.categories[this.activeCategory];
    this.recipes = category ? RecipeRegistry.forCategory(category) : [];
  }

  _updateHover(sx, sy) {
    const contentY = this._contentStartY;
    if (sy >= contentY && sy < contentY + this._contentH) {
      const relY = sy - contentY + this.scrollY;
      this.hoverRecipeId = Math.floor(relY / this.recipeH);
    } else {
      this.hoverRecipeId = -1;
    }
  }

  _drawTab(ctx, x, y, w, h, label, active) {
    // Tab background
    if (active) {
      ctx.fillStyle = 'rgba(100,150,100,0.3)';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
    }
    this._rrect(ctx, x + 1, y + 1, w - 2, h - 2, 3);
    ctx.fill();

    // Tab border
    ctx.strokeStyle = active ? '#66bb6a' : '#ffffff22';
    ctx.lineWidth   = 1;
    this._rrect(ctx, x + 1, y + 1, w - 2, h - 2, 3);
    ctx.stroke();

    // Tab text
    ctx.fillStyle    = active ? '#a5d6a7' : '#aaa';
    ctx.font         = active ? 'bold 11px sans-serif' : '11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  _drawRecipeCard(ctx, recipe, y, visible) {
    if (!visible) return;

    const x = this._px + this.contentPad + 4;
    const w = this.panelW - this.contentPad * 2 - 8;

    const unlocked  = recipe.isUnlocked(this.skillManager);
    const canCraft  = unlocked && recipe.canCraft(this.inventory, this.skillManager);
    const missingMat = unlocked && !canCraft;

    // ─── Card Background ───
    let bgColor = 'rgba(255,255,255,0.04)';
    let borderColor = '#ffffff11';
    if (canCraft) {
      bgColor = 'rgba(100,200,100,0.10)';
      borderColor = '#66bb6a55';
    } else if (missingMat) {
      bgColor = 'rgba(255,200,80,0.08)';
      borderColor = '#ffa72655';
    }

    ctx.fillStyle = bgColor;
    this._rrect(ctx, x, y, w, this.recipeH - 2, 4);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = 1;
    this._rrect(ctx, x, y, w, this.recipeH - 2, 4);
    ctx.stroke();

    const alpha = unlocked ? 1.0 : 0.4;
    ctx.globalAlpha = alpha;

    // ─── Recipe Name ───
    let nameColor = '#ffffff';
    if (canCraft) nameColor = '#a5d6a7';
    else if (missingMat) nameColor = '#ffcc80';
    else if (!unlocked) nameColor = '#888888';

    ctx.fillStyle    = nameColor;
    ctx.font         = 'bold 12px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(recipe.name, x + 8, y + 4);

    // ─── Lock badge ───
    if (!unlocked) {
      const req = recipe.requiredSkills[0];
      ctx.font      = 'bold 10px sans-serif';
      ctx.fillStyle = '#ff8888';
      ctx.textAlign = 'right';
      ctx.fillText(`🔒 Lv.${req.level}`, x + w - 8, y + 4);
    }

    // ─── Input / Output line ───
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = '#aaa';

    // Inputs
    const inputStrs = recipe.inputs.map(i => {
      const item = ItemRegistry.get(i.itemId);
      const have = this.inventory.countItem(i.itemId);
      const color = have >= i.qty ? '#aaa' : '#ff8y88';
      return { text: `${i.qty}x ${item?.name ?? i.itemId}`, color };
    });

    let tx = x + 8;
    for (const inp of inputStrs) {
      ctx.fillStyle = inp.color;
      ctx.fillText(inp.text, tx, y + 20);
      tx += ctx.measureText(inp.text).width + 4;
    }

    // Arrow separator
    ctx.fillStyle = '#666';
    ctx.fillText(' → ', tx, y + 20);
    tx += ctx.measureText(' → ').width + 4;

    // Outputs
    ctx.fillStyle = '#c8e6c9';
    ctx.font      = 'bold 10px sans-serif';
    const outputStrs = recipe.outputs.map(o => {
      const item = ItemRegistry.get(o.itemId);
      return `${o.qty}x ${item?.name ?? o.itemId}`;
    }).join(', ');
    ctx.fillText(outputStrs, tx, y + 20);

    // ─── Bottom: XP + CRAFT button ───
    ctx.font = '9px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';

    if (recipe.grantXP.length > 0) {
      const xpStr = recipe.grantXP.map(xp => `+${xp.amount} ${xp.skillId}`).join(', ');
      ctx.fillStyle = '#81c784';
      ctx.fillText(xpStr, x + 8, y + 36);
    }

    // CRAFT button
    if (canCraft) {
      ctx.fillStyle = '#66bb6a';
      ctx.font      = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('[ CRAFT ]', x + w - 8, y + 36);
    }

    ctx.globalAlpha = 1;
  }

  _tryCraft(recipe) {
    const success = recipe.execute(this.inventory, this.skillManager);
    if (success) {
      const outNames = recipe.outputs.map(o => {
        const item = ItemRegistry.get(o.itemId);
        return `${o.qty}x ${item?.name ?? o.itemId}`;
      }).join(', ');
      this._feedback = { text: `✓ Crafted: ${outNames}`, color: '#81c784', ttl: 2.0 };
    } else {
      this._feedback = { text: '✗ Missing materials or level too low', color: '#ef9a9a', ttl: 2.0 };
    }
  }

  _divider(ctx, x, y, w) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + w - 8, y);
    ctx.stroke();
  }

  _rrect(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
