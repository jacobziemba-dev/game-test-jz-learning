class ShopUI {
  constructor(player, onMessage = null) {
    this.player = player;
    this.onMessage = onMessage;

    this.isOpen = false;
    this.vendor = null;

    // W/H are dynamic based on screen size now
    this.panelW = 760;
    this.panelH = 500;
    this.headerH = 36;
    this.tabH = 30;
    this.footerH = 40;

    this.mode = 'buy';
    this.quantityOptions = [1, 5, 10, 'ALL'];
    this.quantityIndex = 0;

    this.selectedIndex = 0;
    this.scrollY = 0;

    this.entries = [];
    this._feedback = null;

    this._px = 0;
    this._py = 0;
    this._listBounds = null;
    this._detailBounds = null;
  }

  openForVendor(vendor) {
    this.vendor = vendor;
    this.isOpen = !!vendor;
    this.mode = 'buy';
    this.quantityIndex = 0;
    this.selectedIndex = 0;
    this.scrollY = 0;
    this._feedback = null;
    this._rebuild();
  }

  close() {
    this.isOpen = false;
    this.vendor = null;
    this._feedback = null;
  }

  onMouseMove() {}

  onWheel(deltaY) {
    if (!this.isOpen || !this._listBounds) return false;
    const maxScroll = Math.max(0, this.entries.length * 44 - this._listBounds.h);
    this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollY + (deltaY > 0 ? 28 : -28)));
    return true;
  }

  onClick(sx, sy) {
    if (!this.isOpen || !this.vendor) return false;
    if (!this._inside(sx, sy, this._px, this._py, this.panelW, this.panelH)) return false;

    const tabY = this._py + this.headerH;
    const bodyY = tabY + this.tabH;

    if (this._inside(sx, sy, this._px + 10, tabY + 4, 84, this.tabH - 8)) {
      this.mode = 'buy';
      this.selectedIndex = 0;
      this.scrollY = 0;
      this._rebuild();
      return true;
    }

    if (this._inside(sx, sy, this._px + 100, tabY + 4, 84, this.tabH - 8)) {
      this.mode = 'sell';
      this.selectedIndex = 0;
      this.scrollY = 0;
      this._rebuild();
      return true;
    }

    if (this._listBounds && this._inside(sx, sy, this._listBounds.x, this._listBounds.y, this._listBounds.w, this._listBounds.h)) {
      const idx = Math.floor((sy - this._listBounds.y + this.scrollY) / 44);
      if (idx >= 0 && idx < this.entries.length) this.selectedIndex = idx;
      return true;
    }

    if (!this._detailBounds || !this._inside(sx, sy, this._detailBounds.x, this._detailBounds.y, this._detailBounds.w, this._detailBounds.h)) {
      return true;
    }

    const qtyY = bodyY + 218;
    for (let i = 0; i < this.quantityOptions.length; i++) {
      const x = this._detailBounds.x + 12 + i * 64;
      if (this._inside(sx, sy, x, qtyY, 56, 24)) {
        this.quantityIndex = i;
        return true;
      }
    }

    const actionY = bodyY + 262;
    const actionLabel = this.mode === 'buy' ? 'Buy' : 'Sell';
    if (this._inside(sx, sy, this._detailBounds.x + 12, actionY, 120, 30)) {
      this._tradeSelected();
      return true;
    }

    if (this._inside(sx, sy, this._detailBounds.x + 142, actionY, 120, 30)) {
      this.mode = this.mode === 'buy' ? 'sell' : 'buy';
      this.selectedIndex = 0;
      this.scrollY = 0;
      this._rebuild();
      this._setFeedback(`${actionLabel} mode changed.`, '#90caf9');
      return true;
    }

    return true;
  }

  update(dt) {
    if (!this.isOpen || !this.vendor) return;

    this._rebuild();

    if (this._feedback) {
      this._feedback.ttl -= dt;
      if (this._feedback.ttl <= 0) this._feedback = null;
    }
  }

  render(ctx, canvasW, canvasH) {
    if (!this.isOpen || !this.vendor) return;

    // Dynamic sizing for mobile
    this.panelW = Math.min(canvasW - 16, 760);
    this.panelH = Math.min(canvasH - 16, 500);
    if (!this.isOpen || !this.vendor) return;

    this._px = Math.round((canvasW - this.panelW) / 2);
    this._py = Math.round((canvasH - this.panelH) / 2);

    const tabY = this._py + this.headerH;
    const bodyY = tabY + this.tabH;
    const bodyH = this.panelH - this.headerH - this.tabH - this.footerH;
    const footerY = bodyY + bodyH;

    const listW = Math.min(320, this.panelW * 0.45);
    const detailX = this._px + listW + 8;
    const detailW = this.panelW - listW - 16;

    this._listBounds = { x: this._px + 8, y: bodyY + 8, w: listW - 16, h: bodyH - 16 };
    this._detailBounds = { x: detailX, y: bodyY + 8, w: detailW, h: bodyH - 16 };

    const selected = this.entries[this.selectedIndex] ?? null;
    const nearVendor = this._isNearVendor();

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
    ctx.fillText(`${this.vendor.name} - ${this.vendor.shopType} shop`, this._px + this.panelW / 2, this._py + this.headerH / 2);

    this._divider(ctx, this._py + this.headerH);

    this._drawTab(ctx, this._px + 10, tabY + 4, 84, this.mode === 'buy', 'Buy');
    this._drawTab(ctx, this._px + 100, tabY + 4, 84, this.mode === 'sell', 'Sell');

    this._divider(ctx, tabY + this.tabH);

    this._drawList(ctx);
    this._drawDetail(ctx, selected, nearVendor, bodyY);

    this._divider(ctx, footerY);
    this._drawFooter(ctx, footerY, nearVendor);

    ctx.restore();
  }

  _drawList(ctx) {
    const b = this._listBounds;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    DrawingUtils.rrect(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.fill();

    const rowH = 44;
    const start = Math.floor(this.scrollY / rowH);
    const offset = -(this.scrollY % rowH);
    const visible = Math.ceil(b.h / rowH) + 1;

    for (let i = 0; i < visible; i++) {
      const idx = start + i;
      if (idx >= this.entries.length) break;

      const entry = this.entries[idx];
      const y = b.y + offset + i * rowH;

      if (idx === this.selectedIndex) {
        ctx.fillStyle = 'rgba(200,164,90,0.22)';
        ctx.fillRect(b.x + 2, y + 2, b.w - 4, rowH - 4);
      }

      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(entry.item.name, b.x + 10, y + 17);

      ctx.fillStyle = '#b0bec5';
      const each = this.mode === 'buy' ? entry.buyPrice : entry.sellPrice;
      ctx.fillText(`${each} gp`, b.x + 10, y + 31);

      ctx.fillStyle = '#ffcc80';
      ctx.textAlign = 'right';
      const qtyLabel = this.mode === 'buy' ? `Stock ${entry.stock}` : `You ${entry.owned}`;
      ctx.fillText(qtyLabel, b.x + b.w - 10, y + 24);
    }
  }

  _drawDetail(ctx, entry, nearVendor, bodyY) {
    const b = this._detailBounds;

    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    DrawingUtils.rrect(ctx, b.x, b.y, b.w, b.h, 6);
    ctx.fill();

    if (!entry) {
      ctx.fillStyle = '#aaa';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('No items available for this mode.', b.x + 12, b.y + 24);
      return;
    }

    const each = this.mode === 'buy' ? entry.buyPrice : entry.sellPrice;
    const desiredQty = this._selectedQuantity(entry);
    const total = each * desiredQty;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(entry.item.name, b.x + 12, bodyY + 34);

    ctx.fillStyle = '#b0bec5';
    ctx.font = '12px sans-serif';
    ctx.fillText(entry.item.description || 'No description.', b.x + 12, bodyY + 58);

    ctx.fillStyle = '#ffcc80';
    ctx.fillText(`Price each: ${each} gp`, b.x + 12, bodyY + 94);

    if (this.mode === 'buy') {
      ctx.fillText(`Shop stock: ${entry.stock}`, b.x + 12, bodyY + 114);
    } else {
      ctx.fillText(`You own: ${entry.owned}`, b.x + 12, bodyY + 114);
    }

    ctx.fillStyle = '#81c784';
    ctx.fillText(`Your coins: ${this.player.inventory.countItem('coins')}`, b.x + 12, bodyY + 134);

    ctx.fillStyle = '#c8a45a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Quantity', b.x + 12, bodyY + 202);

    const qtyY = bodyY + 218;
    for (let i = 0; i < this.quantityOptions.length; i++) {
      const x = b.x + 12 + i * 64;
      const active = i === this.quantityIndex;
      ctx.fillStyle = active ? 'rgba(200,164,90,0.28)' : 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = active ? '#c8a45a' : '#ffffff1a';
      DrawingUtils.rrect(ctx, x, qtyY, 56, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? '#ffe082' : '#ddd';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(this.quantityOptions[i]), x + 28, qtyY + 12);
    }

    ctx.fillStyle = '#90caf9';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Selected: ${desiredQty}  Total: ${total} gp`, b.x + 12, bodyY + 252);

    const actionY = bodyY + 262;
    const canTrade = nearVendor && desiredQty > 0;
    const actionLabel = this.mode === 'buy' ? 'Buy selected' : 'Sell selected';

    this._drawActionButton(ctx, b.x + 12, actionY, 120, 30, actionLabel, canTrade ? '#81c784' : '#666');
    this._drawActionButton(ctx, b.x + 142, actionY, 120, 30, 'Swap mode', '#90caf9');

    if (this._feedback) {
      ctx.fillStyle = this._feedback.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(this._feedback.text, b.x + 12, bodyY + 312);
    }

    if (!nearVendor) {
      ctx.fillStyle = '#ffab91';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Move next to the vendor to trade.', b.x + 12, bodyY + 332);
    }
  }

  _drawFooter(ctx, y, nearVendor) {
    const coins = this.player.inventory.countItem('coins');

    ctx.fillStyle = '#b0bec5';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Coins: ${coins}`, this._px + 12, y + this.footerH / 2);

    ctx.textAlign = 'right';
    ctx.fillStyle = nearVendor ? '#81c784' : '#ffab91';
    ctx.fillText(nearVendor ? 'Vendor in range' : 'Out of range', this._px + this.panelW - 12, y + this.footerH / 2);
  }

  _tradeSelected() {
    if (!this.vendor) return;
    if (!this._isNearVendor()) {
      this._setFeedback('Move next to vendor first.', '#ffab91');
      return;
    }

    const entry = this.entries[this.selectedIndex] ?? null;
    if (!entry) {
      this._setFeedback('Nothing selected.', '#ffab91');
      return;
    }

    const qty = this._selectedQuantity(entry);
    if (qty <= 0) {
      this._setFeedback('Quantity is zero.', '#ffab91');
      return;
    }

    const result = this.mode === 'buy'
      ? ShopService.buyFromVendor(this.vendor, this.player.inventory, entry.item.id, qty)
      : ShopService.sellToVendor(this.vendor, this.player.inventory, entry.item.id, qty);

    if (!result.ok) {
      this._setFeedback(result.reason ?? 'Trade failed.', '#ffab91');
      this.onMessage?.(result.reason ?? 'Trade failed.', '#ffab91');
      return;
    }

    const actionWord = this.mode === 'buy' ? 'Bought' : 'Sold';
    const text = `${actionWord} ${result.quantity}x ${result.item.name} for ${result.total} gp`;
    this._setFeedback(text, '#81c784');
    this.onMessage?.(text, '#81c784');

    this._rebuild();
  }

  _selectedQuantity(entry) {
    const picked = this.quantityOptions[this.quantityIndex];
    if (picked !== 'ALL') return Number(picked) || 1;
    return this.mode === 'buy' ? entry.stock : entry.owned;
  }

  _isNearVendor() {
    if (!this.vendor) return false;
    return Math.abs(this.player.col - this.vendor.col) <= 1 &&
           Math.abs(this.player.row - this.vendor.row) <= 1;
  }

  _rebuild() {
    if (!this.vendor) {
      this.entries = [];
      this.selectedIndex = 0;
      this.scrollY = 0;
      return;
    }

    const next = [];
    if (this.mode === 'buy') {
      const buyEntries = this.vendor.getBuyEntries();
      for (const entry of buyEntries) {
        next.push({
          item: entry.item,
          stock: entry.quantity,
          owned: this.player.inventory.countItem(entry.itemId),
          buyPrice: ShopPricing.buyPrice(entry.itemId, this.vendor.shopType),
          sellPrice: ShopPricing.sellPrice(entry.itemId, this.vendor.shopType),
        });
      }
    } else {
      for (const slot of this.player.inventory.slots) {
        if (slot.isEmpty) continue;
        const item = slot.item;
        if (!ShopPricing.canShopBuyItem(this.vendor.shopType, item)) continue;

        const existing = next.find(e => e.item.id === item.id);
        if (existing) {
          existing.owned += slot.quantity;
        } else {
          next.push({
            item,
            stock: this.vendor.getStockQuantity(item.id),
            owned: slot.quantity,
            buyPrice: ShopPricing.buyPrice(item.id, this.vendor.shopType),
            sellPrice: ShopPricing.sellPrice(item.id, this.vendor.shopType),
          });
        }
      }
      next.sort((a, b) => a.item.name.localeCompare(b.item.name));
    }

    this.entries = next;

    if (this.entries.length === 0) {
      this.selectedIndex = 0;
      this.scrollY = 0;
      return;
    }

    if (this.selectedIndex >= this.entries.length) {
      this.selectedIndex = this.entries.length - 1;
    }

    const maxScroll = this._listBounds
      ? Math.max(0, this.entries.length * 44 - this._listBounds.h)
      : 0;
    this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollY));
  }

  _drawTab(ctx, x, y, w, active, label) {
    ctx.fillStyle = active ? 'rgba(200,164,90,0.28)' : 'rgba(255,255,255,0.04)';
    ctx.strokeStyle = active ? '#c8a45a' : '#ffffff1f';
    DrawingUtils.rrect(ctx, x, y, w, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = active ? '#ffe082' : '#ccc';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + 11);
  }

  _drawActionButton(ctx, x, y, w, h, label, color) {
    ctx.fillStyle = `${color}33`;
    ctx.strokeStyle = color;
    DrawingUtils.rrect(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  }

  _setFeedback(text, color) {
    this._feedback = { text, color, ttl: 2.8 };
  }

  _divider(ctx, y) {
    ctx.strokeStyle = '#c8a45a55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this._px + 8, y);
    ctx.lineTo(this._px + this.panelW - 8, y);
    ctx.stroke();
  }

  _inside(sx, sy, x, y, w, h) {
    return sx >= x && sx <= x + w && sy >= y && sy <= y + h;
  }
}
