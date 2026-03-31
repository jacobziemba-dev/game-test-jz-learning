const ShopService = (() => {
  function buyFromVendor(vendor, inventory, itemId, quantity) {
    if (!vendor || !inventory || !itemId) {
      return { ok: false, reason: 'Shop unavailable.' };
    }

    const stockQty = vendor.getStockQuantity(itemId);
    const qty = Math.max(1, Math.floor(quantity));
    if (stockQty <= 0) return { ok: false, reason: 'Out of stock.' };

    const item = ItemRegistry.get(itemId);
    if (!item) return { ok: false, reason: 'Unknown item.' };

    const affordableEach = ShopPricing.buyPrice(itemId, vendor.shopType);
    const coins = inventory.countItem('coins');
    const maxAffordable = Math.floor(coins / affordableEach);
    const desired = Math.min(qty, stockQty, maxAffordable);

    if (desired <= 0) {
      return { ok: false, reason: 'Not enough coins.' };
    }

    const overflow = inventory.addItem(itemId, desired);
    const bought = desired - overflow;
    if (bought <= 0) {
      return { ok: false, reason: 'Inventory full.' };
    }

    const total = affordableEach * bought;
    inventory.removeItem('coins', total);
    vendor.adjustStock(itemId, -bought);

    return {
      ok: true,
      quantity: bought,
      total,
      item,
      truncated: bought < qty,
    };
  }

  function sellToVendor(vendor, inventory, itemId, quantity) {
    if (!vendor || !inventory || !itemId) {
      return { ok: false, reason: 'Shop unavailable.' };
    }

    const item = ItemRegistry.get(itemId);
    if (!item) return { ok: false, reason: 'Unknown item.' };

    if (!ShopPricing.canShopBuyItem(vendor.shopType, item)) {
      return { ok: false, reason: `${vendor.name} is not buying that.` };
    }

    const owned = inventory.countItem(itemId);
    const qty = Math.max(1, Math.floor(quantity));
    const sold = Math.min(qty, owned);
    if (sold <= 0) return { ok: false, reason: `No ${item.name.toLowerCase()} to sell.` };

    const each = ShopPricing.sellPrice(itemId, vendor.shopType);
    if (each <= 0) {
      return { ok: false, reason: `${vendor.name} is not buying that.` };
    }

    inventory.removeItem(itemId, sold);
    const total = each * sold;
    inventory.addItem('coins', total);

    vendor.adjustStock(itemId, sold, 1);

    return {
      ok: true,
      quantity: sold,
      total,
      item,
      truncated: sold < qty,
    };
  }

  return {
    buyFromVendor,
    sellToVendor,
  };
})();
