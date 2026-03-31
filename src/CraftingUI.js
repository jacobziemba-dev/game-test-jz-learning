/**
 * CraftingUI — canvas panel showing all recipes, organised by category.
 *
 * Toggle with 'C'. Locked recipes (level too low) are shown grayed with a lock + required level.
 * Unlocked-but-missing-materials recipes are shown amber. Ready recipes are green and clickable.
 */
class CraftingUI {
  constructor(inventory, skillManager) {
    this.inventory    = inventory;
    this.skillManager = skillManager;
    this.isOpen       = false;

    this.panelW   = 280;
    this.rowH     = 62;   // height of each recipe row
    this.headerH  = 32;
    this.catH     = 22;   // category label row height
    this.panelPad = 12;
    this.maxH     = 520;  // panel won't exceed this height (scroll future TODO)

    this.hoverIndex = -1; // flat recipe index under cursor
    this._rows      = []; // computed layout [{type:'cat'|'recipe', ...}]
    this._px = 0;
    this._py = 0;

    this._feedback = null; // { text, color, ttl }
  }

  toggle() { this.isOpen = !this.isOpen; if (this.isOpen) this._buildRows(); }
  close()  { this.isOpen = false; this.hoverIndex = -1; }

  onMouseMove(sx, sy) {
    if (!this.isOpen) return;
    this.hoverIndex = this._rowIndexAt(sx, sy, 'recipe');
  }

  onClick(sx, sy) {
    if (!this.isOpen) return false;
    const inside = sx >= this._px && sx <= this._px + this.panelW &&
                   sy >= this._py && sy <= this._py + this._computedH;
    if (!inside) return false;

    const idx = this._rowIndexAt(sx, sy, 'recipe');
    if (idx >= 0) {
      const row = this._rows[idx];
      if (row && row.recipe) this._tryCraft(row.recipe);
    }
    return true;
  }

  update(dt) {
    if (this._feedback) {
      this._feedback.ttl -= dt;
      if (this._feedback.ttl <= 0) this._feedback = null;
    }
    if (this.isOpen) this._buildRows(); // refresh state every frame
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    const panelH = Math.min(this.maxH,
      this.headerH + this.panelPad +
      this._rows.reduce((h, r) => h + (r.type === 'cat' ? this.catH : this.rowH), 0) +
      (this._feedback ? 28 : 0) + 18
    );
    this._computedH = panelH;

    // Center horizontally, slight right lean
    this._px = Math.round((canvasW - this.panelW) / 2) + 40;
    this._py = Math.round((canvasH - panelH) / 2);

    // Clamp to screen
    if (this._px + this.panelW > canvasW - 4) this._px = canvasW - this.panelW - 4;
    if (this._py < 4) this._py = 4;

    ctx.save();

    // Panel background
    ctx.fillStyle   = 'rgba(18,12,6,0.96)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    this._rrect(ctx, this._px, this._py, this.panelW, panelH, 6);
    ctx.fill();
    ctx.stroke();

    // Title
    ctx.fillStyle    = '#c8a45a';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Crafting', this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._px, this._py + this.headerH, this.panelW);

    // Rows
    let curY = this._py + this.headerH + this.panelPad;
    this._rows.forEach((row, i) => {
      row._screenY = curY;
      if (row.type === 'cat') {
        this._drawCategoryHeader(ctx, row.label, curY);
        curY += this.catH;
      } else {
        this._drawRecipeRow(ctx, row.recipe, curY, i === this.hoverIndex);
        curY += this.rowH;
      }
    });

    // Feedback toast (craft success/fail)
    if (this._feedback) {
      ctx.fillStyle    = this._feedback.color;
      ctx.font         = 'bold 12px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.globalAlpha  = Math.min(1, this._feedback.ttl * 3);
      ctx.fillText(this._feedback.text, this._px + this.panelW / 2, this._py + panelH - 30);
      ctx.globalAlpha = 1;
    }

    // Footer hint
    ctx.fillStyle    = '#555';
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('[C] close', this._px + this.panelW / 2, this._py + panelH - 4);

    ctx.restore();
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  _buildRows() {
    this._rows = [];
    const categories = RecipeRegistry.categories();
    for (const cat of categories) {
      const recipes = RecipeRegistry.forCategory(cat);
      if (recipes.length === 0) continue;
      this._rows.push({ type: 'cat', label: cat });
      for (const recipe of recipes) {
        this._rows.push({ type: 'recipe', recipe });
      }
    }
  }

  _drawCategoryHeader(ctx, label, y) {
    ctx.fillStyle    = '#c8a45a99';
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`— ${label} —`, this._px + this.panelPad, y + this.catH / 2);
  }

  _drawRecipeRow(ctx, recipe, y, hovered) {
    const x    = this._px + this.panelPad;
    const w    = this.panelW - this.panelPad * 2;
    const rh   = this.rowH;

    const unlocked    = recipe.isUnlocked(this.skillManager);
    const canCraft    = unlocked && recipe.canCraft(this.inventory, this.skillManager);
    const missingMat  = unlocked && !canCraft;

    // Row background
    let bgColor = 'rgba(255,255,255,0.03)';
    if (hovered && canCraft)   bgColor = 'rgba(100,200,100,0.12)';
    if (hovered && missingMat) bgColor = 'rgba(255,200,80,0.10)';
    ctx.fillStyle = bgColor;
    this._rrect(ctx, x - 4, y, w + 8, rh - 2, 4);
    ctx.fill();

    // Row border
    let borderColor = '#ffffff11';
    if (canCraft)   borderColor = '#66bb6a55';
    if (missingMat) borderColor = '#ffa72655';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = 1;
    this._rrect(ctx, x - 4, y, w + 8, rh - 2, 4);
    ctx.stroke();

    const alpha = unlocked ? 1.0 : 0.38;
    ctx.globalAlpha = alpha;

    // Recipe name
    let nameColor = '#ffffff';
    if (canCraft)   nameColor = '#a5d6a7';
    if (missingMat) nameColor = '#ffcc80';
    if (!unlocked)  nameColor = '#888888';
    ctx.fillStyle    = nameColor;
    ctx.font         = 'bold 12px sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(recipe.name, x, y + 4);

    // Lock icon + required level (if locked)
    if (!unlocked) {
      const req = recipe.requiredSkills[0];
      ctx.font      = '11px sans-serif';
      ctx.fillStyle = '#ff6b6b';
      ctx.textAlign = 'right';
      ctx.fillText(`🔒 Lv.${req.level} ${req.skillId}`, x + w, y + 4);
    }

    // Inputs → Outputs line
    const inputStr  = recipe.inputs.map(i => {
      const item = ItemRegistry.get(i.itemId);
      const have = this.inventory.countItem(i.itemId);
      const col  = (have >= i.qty) ? '#aaaaaa' : '#ff7070';
      return `{${col}}${i.qty}x ${item?.name ?? i.itemId}`;
    });
    const outputStr = recipe.outputs.map(o => {
      const item = ItemRegistry.get(o.itemId);
      return `${o.qty}x ${item?.name ?? o.itemId}`;
    });

    // Draw inputs
    let tx = x;
    ctx.textBaseline = 'top';
    ctx.font         = '11px sans-serif';
    for (const seg of inputStr) {
      const match = seg.match(/^\{(#[a-f0-9]+)\}(.+)$/i);
      if (match) {
        ctx.fillStyle = match[1];
        ctx.fillText(match[2], tx, y + 20);
        tx += ctx.measureText(match[2]).width + 4;
      }
    }

    // Arrow
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(' → ', tx, y + 20);
    tx += ctx.measureText(' → ').width;

    // Outputs
    ctx.fillStyle = '#c8e6c9';
    ctx.fillText(outputStr.join(', '), tx, y + 20);

    // XP granted
    if (recipe.grantXP.length > 0) {
      const xpStr = recipe.grantXP.map(x => `+${x.amount} ${x.skillId} XP`).join(', ');
      ctx.fillStyle = '#81c784';
      ctx.font      = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(xpStr, x + w, y + 20);
    }

    // "Craft" button hint
    if (canCraft) {
      ctx.fillStyle = '#66bb6a';
      ctx.font      = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('[ CRAFT ]', x + w, y + rh - 16);
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

  _rowIndexAt(sx, sy, type) {
    for (let i = 0; i < this._rows.length; i++) {
      const row = this._rows[i];
      if (row.type !== type) continue;
      const ry = row._screenY;
      if (!ry) continue;
      const rh = type === 'recipe' ? this.rowH : this.catH;
      if (sx >= this._px && sx <= this._px + this.panelW &&
          sy >= ry && sy < ry + rh) return i;
    }
    return -1;
  }

  _drawPanel(ctx, x, y, w, h) {
    ctx.fillStyle   = 'rgba(18,12,6,0.96)';
    ctx.strokeStyle = '#c8a45a';
    ctx.lineWidth   = 2;
    this._rrect(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
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
    if (w <= 0) return;
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
