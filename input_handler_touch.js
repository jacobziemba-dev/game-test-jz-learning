const fs = require('fs');

let inputHandler = fs.readFileSync('src/core/InputHandler.js', 'utf8');

const touchLogic = `
    // Touch Events
    this._touchTimer = null;
    this._lastTouchPos = null;
    this._isLongPress = false;
    this._touchStartPos = null;

    canvas.addEventListener('touchstart',  (e) => this._onTouchStart(e), { passive: false });
    canvas.addEventListener('touchmove',   (e) => this._onTouchMove(e), { passive: false });
    canvas.addEventListener('touchend',    (e) => this._onTouchEnd(e), { passive: false });
    canvas.addEventListener('touchcancel', (e) => this._onTouchCancel(e), { passive: false });
`;

inputHandler = inputHandler.replace(
    /canvas\.addEventListener\('wheel',\s+\(e\) => this\._onWheel\(e\), \{ passive: false \}\);/g,
    `canvas.addEventListener('wheel',       (e) => this._onWheel(e), { passive: false });\n${touchLogic}`
);

const touchMethods = `
  _screenPosFromTouch(touch) {
    const rect = this.canvas.getBoundingClientRect();
    return { sx: touch.clientX - rect.left, sy: touch.clientY - rect.top };
  }

  _onTouchStart(e) {
    if (e.touches.length > 1) return; // Ignore multi-touch for now
    e.preventDefault();

    const pos = this._screenPosFromTouch(e.touches[0]);
    this._lastTouchPos = pos;
    this._touchStartPos = pos;
    this._isLongPress = false;

    // Simulate mouse move for hover effects
    this._onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });

    this._touchTimer = setTimeout(() => {
      this._isLongPress = true;
      if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
      this._onRightClick({ preventDefault: () => {}, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }, 500); // 500ms for long press
  }

  _onTouchMove(e) {
    e.preventDefault();
    if (!this._lastTouchPos) return;

    const pos = this._screenPosFromTouch(e.touches[0]);

    // If finger moves more than 10 pixels, cancel long press
    if (this._touchStartPos) {
      const dx = pos.sx - this._touchStartPos.sx;
      const dy = pos.sy - this._touchStartPos.sy;
      if (Math.sqrt(dx*dx + dy*dy) > 10) {
        clearTimeout(this._touchTimer);
      }
    }

    // Pass scroll delta to panels
    if (this.craftingUI.isOpen || this.shopUI.isOpen) {
      const deltaY = this._lastTouchPos.sy - pos.sy;
      if (this.shopUI.isOpen) {
        this.shopUI.onWheel(deltaY);
      } else {
        this.craftingUI.onWheel(deltaY);
      }
    }

    this._lastTouchPos = pos;
    this._onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
  }

  _onTouchEnd(e) {
    e.preventDefault();
    clearTimeout(this._touchTimer);

    if (!this._isLongPress && this._lastTouchPos) {
      // Simulate click
      const touch = e.changedTouches[0];
      this._onClick({ clientX: touch.clientX, clientY: touch.clientY });
    }

    this._lastTouchPos = null;
    this._touchStartPos = null;
    this._isLongPress = false;
  }

  _onTouchCancel(e) {
    clearTimeout(this._touchTimer);
    this._lastTouchPos = null;
    this._touchStartPos = null;
    this._isLongPress = false;
  }
`;

inputHandler = inputHandler.replace(
    /  _screenPos\(e\) \{/g,
    `${touchMethods}\n  _screenPos(e) {`
);

// We also need to fix context menu boundary checking so it uses logicW and logicH on resize.
// Pass logical canvas size to open() instead of actual canvas size in pixels.
inputHandler = inputHandler.replace(
    /this\.menu\.open\(sx, sy, items, this\.canvas\.width, this\.canvas\.height\);/g,
    `
    const logicW = parseInt(this.canvas.style.width, 10) || this.canvas.width;
    const logicH = parseInt(this.canvas.style.height, 10) || this.canvas.height;
    this.menu.open(sx, sy, items, logicW, logicH);`
);

fs.writeFileSync('src/core/InputHandler.js', inputHandler);
console.log('Done!');
