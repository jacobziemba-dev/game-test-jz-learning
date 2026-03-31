class CraftingStation {
  constructor(col, row, world, stationType) {
    this.col = col;
    this.row = row;
    this.world = world;
    this.stationType = stationType;
    this.x = (col + 0.5) * world.tileSize;
    this.y = (row + 0.5) * world.tileSize;
  }

  render(ctx, camera, tileSize) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    const palette = {
      furnace: { fill: '#ff8a65', stroke: '#bf360c', label: 'F' },
      tanner: { fill: '#a1887f', stroke: '#4e342e', label: 'T' },
      spinning_wheel: { fill: '#80cbc4', stroke: '#00695c', label: 'S' },
      pottery_wheel: { fill: '#ce93d8', stroke: '#6a1b9a', label: 'W' },
      pottery_oven: { fill: '#ffb74d', stroke: '#e65100', label: 'O' },
      water_source: { fill: '#64b5f6', stroke: '#0d47a1', label: 'H' },
    };

    const p = palette[this.stationType] ?? { fill: '#b0bec5', stroke: '#37474f', label: '?' };
    const size = Math.max(18, tileSize * 0.52);

    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.42, size * 0.45, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = p.fill;
    ctx.strokeStyle = p.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.label, 0, 0);

    ctx.restore();
  }
}
