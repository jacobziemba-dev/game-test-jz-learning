const fs = require('fs');

let gameJs = fs.readFileSync('src/core/Game.js', 'utf8');

// 1. Add mobile detection and dpr logic to resize
gameJs = gameJs.replace(/this.lastTime = 0;\s+this.loop = this.loop.bind\(this\);/g, `this.lastTime = 0;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
    this.loop = this.loop.bind(this);`);

gameJs = gameJs.replace(/resize\(\) \{\s+this.canvas.width  = document.body.clientWidth;\s+this.canvas.height = document.body.clientHeight;\s+if \(this.camera\) \{\s+this.camera.width  = this.canvas.width;\s+this.camera.height = this.canvas.height;\s+\}\s+\}/g, `resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = document.body.getBoundingClientRect();

    this.canvas.width  = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.canvas.style.width  = \`\${rect.width}px\`;
    this.canvas.style.height = \`\${rect.height}px\`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    this.ctx.scale(dpr, dpr);

    if (this.camera) {
      this.camera.width  = rect.width;
      this.camera.height = rect.height;
    }
  }`);

// 2. Change render size parameters
gameJs = gameJs.replace(/ctx\.clearRect\(0, 0, this\.canvas\.width, this\.canvas\.height\);/g, `const logicW = parseInt(this.canvas.style.width, 10);
    const logicH = parseInt(this.canvas.style.height, 10);
    ctx.clearRect(0, 0, logicW, logicH);`);

gameJs = gameJs.replace(/this\.canvas\.width, this\.canvas\.height\);/g, `logicW, logicH);`);

fs.writeFileSync('src/core/Game.js', gameJs);
console.log('Done!');
