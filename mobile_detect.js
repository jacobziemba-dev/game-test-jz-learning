const fs = require('fs');

// We already added Game.isMobile in Game.js
// Let's use this flag to slightly adjust UI elements if needed.
// For instance, the hotbar slots and inventory slots could be slightly larger or spread out on mobile.

let inventoryUI = fs.readFileSync('src/ui/InventoryUI.js', 'utf8');
if (!inventoryUI.includes('if (window.game?.isMobile)')) {
    inventoryUI = inventoryUI.replace(
        /this\.slotSize    = 44;\s+\/\/ px per slot cell/,
        `this.slotSize    = window.game && window.game.isMobile ? 52 : 44; // Larger on mobile`
    );
    inventoryUI = inventoryUI.replace(
        /this\.slotGap     = 4;\s+\/\/ gap between cells/,
        `this.slotGap     = window.game && window.game.isMobile ? 6 : 4;  // Larger gap on mobile`
    );
    fs.writeFileSync('src/ui/InventoryUI.js', inventoryUI);
}

let hotbarUI = fs.readFileSync('src/ui/HotbarUI.js', 'utf8');
if (!hotbarUI.includes('if (window.game?.isMobile)')) {
    hotbarUI = hotbarUI.replace(
        /this\.slotW = 92;/,
        `this.slotW = window.game && window.game.isMobile ? 110 : 92;`
    );
    hotbarUI = hotbarUI.replace(
        /this\.slotH = 34;/,
        `this.slotH = window.game && window.game.isMobile ? 42 : 34;`
    );
    fs.writeFileSync('src/ui/HotbarUI.js', hotbarUI);
}

// ShopUI and CraftingUI panels are static 760x500 which is too large for phones.
// Let's modify them to fit dynamically on smaller screens.
let shopUI = fs.readFileSync('src/ui/ShopUI.js', 'utf8');
if (!shopUI.includes('Math.min(canvasW - 16, 760)')) {
    shopUI = shopUI.replace(
        /this\.panelW = 760;\s+this\.panelH = 500;/,
        `// W/H are dynamic based on screen size now
    this.panelW = 760;
    this.panelH = 500;`
    );
    shopUI = shopUI.replace(
        /render\(ctx, canvasW, canvasH\) \{/,
        `render(ctx, canvasW, canvasH) {
    if (!this.isOpen || !this.vendor) return;

    // Dynamic sizing for mobile
    this.panelW = Math.min(canvasW - 16, 760);
    this.panelH = Math.min(canvasH - 16, 500);`
    );

    // In shopUI, listW is fixed to 320. Make it proportional on small screens.
    shopUI = shopUI.replace(
        /const listW = 320;/,
        `const listW = Math.min(320, this.panelW * 0.45);`
    );

    fs.writeFileSync('src/ui/ShopUI.js', shopUI);
}

let craftingUI = fs.readFileSync('src/ui/CraftingUI.js', 'utf8');
if (!craftingUI.includes('Math.min(canvasW - 16, 760)')) {
    craftingUI = craftingUI.replace(
        /this\.panelW = 760;\s+this\.panelH = 460;/,
        `// Dynamic sizing
    this.panelW = 760;
    this.panelH = 460;`
    );
    craftingUI = craftingUI.replace(
        /render\(ctx, canvasW, canvasH\) \{/,
        `render(ctx, canvasW, canvasH) {
    if (!this.isOpen) return;

    this.panelW = Math.min(canvasW - 16, 760);
    this.panelH = Math.min(canvasH - 16, 460);`
    );

    // In craftingUI, listW is fixed to 260. Make it proportional.
    craftingUI = craftingUI.replace(
        /const listW = 260;/,
        `const listW = Math.min(260, this.panelW * 0.4);`
    );

    fs.writeFileSync('src/ui/CraftingUI.js', craftingUI);
}

console.log('Mobile detection tweaks applied');
