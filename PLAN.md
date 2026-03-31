# Game Plan — RuneScape-like (JS/HTML5 Canvas)

## Broader Vision
- **Skills, not classes** — one character can level multiple combat and non-combat skills.
- **Gather → Craft → Fight loop** — resources feed equipment, and equipment improves combat progression.
- **Point-and-click interactions** — movement, gathering, combat, and loot pickup all via mouse.
- **Persistent progression** — keep character growth and world continuity between sessions.

---

## Milestone Status Snapshot (2026-03-31)

### Milestone 1 (DONE) — Movement + Woodcutting Core
- World, camera, A* movement, tree chopping, woodcutting XP, baseline HUD.

### Milestone 2 (DONE) — Inventory + Panels + Equipment
- Inventory grid, tooltip UI, crafting/skills/character/help panels, equip/unequip flow.

### Milestone 3 (DONE baseline) — Combat + Monsters + Loot
- Monster spawns, click-to-target melee combat, hit/miss rolls, combat XP.
- Weighted loot drops, coins, ground loot entities, pickup flow and pickup toasts.

### Milestone 4 (DONE) — Save/Load V1 Stabilization
- Implemented: schema-based localStorage save/load, load-on-start, periodic autosave.
- Completed polish: manual save/load controls, save-state HUD feedback, combat-level readout.

---

## Next Milestone Recommendation

### Milestone 5 — Mining + Smithing Starter Loop

**Why this next:**
- It is the highest-value expansion of the current gameplay loop.
- It reuses systems already built (inventory, equipment, XP, persistence).
- It creates meaningful gear progression beyond loot RNG.

**Definition of done:**
1. Mining nodes spawn in-world and can be harvested with XP gain.
2. At least 2 ore types and 2 bar recipes exist.
3. Smithing can produce at least 1 weapon and 1 armor item.
4. New items integrate with existing equipment bonuses.
5. New resources/items persist through save/load.

**Execution order:**
1. Add `Mining` skill registration and panel display.
2. Implement ore node entity + spawn/update/render in world.
3. Add ore items + bar items in item registry.
4. Add smelting/smithing recipes in recipe registry.
5. Add first smithable weapon/armor and equip bonuses.
6. Extend save/load serialization for mining nodes.
7. Playtest balance pass: XP rate, resource respawn, recipe costs.

---

## Milestone 5 Readiness Gate

1. Manual smoke test complete: save while idle, in combat, and with ground loot nearby.
2. Load validation complete: position, inventory, equipment, skills, trees, monsters, and loot restore correctly.
3. Failure path validated: corrupted save does not crash game and falls back safely.

## Immediate Next Actions

1. Start Milestone 5 step 1: add `Mining` skill registration and Skills panel visibility.
2. Add first ore node entity and world spawn/update/render integration.
3. Add copper/tin ore items and first smelting recipe pair.
