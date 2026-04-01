// ShopUI and CraftingUI both have `onWheel(deltaY)` which expects a number.
// In InputHandler _onTouchMove, I did:
// const deltaY = this._lastTouchPos.sy - pos.sy;
// Which acts exactly like a deltaY wheel event.
// Let's ensure CraftingUI also has onWheel.
