# Game Plan — RuneScape-like (JS/HTML5 Canvas)

## Broader Vision
- **Skills, not classes** — one character can level up woodcutting, mining, fishing, combat, crafting, etc.
- **Gather → Craft → Fight loop** — chop wood / mine ore / catch fish → craft gear/food → fight enemies for loot → repeat
- **Point-and-click everything** — movement, combat, and interactions all via mouse click
- **Progression** — XP in each skill unlocks better resources, gear, and enemies

---

## Milestone 1 (DONE) — MVP: Movement + Woodcutting

### What was built
- 2D top-down tile world (40×40 grass tiles, 48px each)
- Camera that follows the player and clamps to world bounds
- Click-to-move with A* pathfinding around trees
- Animated player character (circle, direction dot, walk bob, chop swing)
- Trees that can be clicked → walked to → chopped → depleted → respawn after 20s
- HUD showing woodcutting level, XP bar, and log count

### File structure
```
index.html
style.css
src/
  main.js          ← entry point
  Game.js          ← game loop, coordinates all systems
  World.js         ← tile grid, tree spawning, rendering
  Camera.js        ← viewport, world↔screen coordinate conversion
  Player.js        ← state machine (IDLE/WALKING/CHOPPING), animation
  Tree.js          ← tree state machine (ALIVE/BEING_CHOPPED/STUMP), chop logic
  Pathfinder.js    ← A* on tile grid
  InputHandler.js  ← mouse click handling, click marker visual
  UI.js            ← HUD panel (XP bar, log count)
```

---

## Milestone 2 — Ideas for next steps

- **Inventory panel** — proper inventory grid (logs, ore, fish, etc.)
- **Mining** — rocks that can be mined for ore, same pattern as trees
- **Fishing** — fishing spots near water tiles
- **Crafting** — combine resources into gear/food
- **NPCs & Combat** — goblins/enemies, melee combat system
- **Map expansion** — different zones (forest, mines, fishing village)
- **Sprite upgrades** — replace canvas shapes with real pixel art sprites
- **Save/load** — persist player skills and inventory to localStorage
