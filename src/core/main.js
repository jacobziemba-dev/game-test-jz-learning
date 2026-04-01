window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  window.game = game; // Make game globally accessible
  game.start();
});
