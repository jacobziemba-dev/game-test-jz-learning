# Game Dev Log

A living document. Update "Currently Working On" at the start of each session and check off milestones as they ship.

---

## Controls Reference

### Keyboard
| Key | Action |
|-----|--------|
| `I` | Open / close Inventory |
| `C` | Open / close Crafting |
| `K` | Open / close Skills |
| `P` | Open / close Character (equipment + stats) |
| `H` | Open / close Help (this controls list in-game) |
| `Escape` | Close all open panels |

### Mouse
| Input | Action |
|-------|--------|
| Left click (ground) | Walk to that tile |
| Left click (tree) | Walk to tree and chop it |
| Right click | Context menu — Walk here / Cut tree / Cancel |
| Left click (inventory item) | Equip item (if equippable) |
| Left click (equipment slot) | Unequip item back to inventory |

---

## Completed Milestones

- [x] World rendering — 40×40 tile grid, grass ground
- [x] Camera — follows player, clamps to world bounds
- [x] Player movement — A* pathfinding, smooth walk animation, direction facing
- [x] Trees — chop, deplete, respawn after 20s; walking animation around tree
- [x] Woodcutting skill — XP on chop, levels 1–99 with level-up toasts
- [x] Inventory — 28-slot grid, stackable items, item draw system
- [x] Right-click context menu — Walk here / Cut tree / Cancel
- [x] Crafting UI — recipe list, skill-level gates, produces items from inventory
- [x] Skills panel — all skills listed with XP bars, progress to next level
- [x] Equipment system — 11 named slots (head/cape/neck/ammo/weapon/body/offhand/hands/legs/boots/ring), stat bonuses
- [x] Character panel (`P`) — paperdoll layout left, equipment bonuses + skill levels right; click slot to unequip
- [x] Equippable items — bronze sword, iron sword, bronze shield, full leather armor set (8 pieces)
- [x] Combat skills registered — Attack, Strength, Defence, Hitpoints, Ranged, Prayer, Magic
- [x] In-game Help panel (`H`) — keyboard and mouse controls reference overlay
- [x] DEVLOG — this document

---

## Currently Working On

> Update this section at the start of each session.

- (nothing started yet — pick a roadmap item below)

---

## Roadmap (Solo RuneScape-Inspired Game)

Planning a single-player offline adventure inspired by RuneScape: craft weapons and items, level up multiple skills, explore zones, and fight monsters—all without any online or multiplayer features.

### Core Feature Roadmap (in development order)

1. **NPC Monsters**
   - Hostile NPCs roam the world.
   - Different monster types with unique stats, drop tables, and respawn timers.
   - Some passive, some aggressive.

2. **Combat System**
   - Click monsters to engage in turn-based or real-time combat.
   - Stats: Attack, Strength, Defence, Hitpoints (base skills).
   - Leveling combat skills through fighting.
   - Attack rolls, hit/miss chance, and weapon bonuses.
   - Visual feedback for damage, critical hits, and XP gains.

3. **Loot & Item Drops**
   - Monsters drop items and coins based on rarity.
   - Rare drops, common drops, stackable loot.
   - Drops can include equipment, resources, or coins.
   - Player must walk to loot or auto-pickup for nearby items.

4. **Skill System**
   - Multiple non-combat skills: Woodcutting, Mining, Smithing, Fishing, Cooking, Crafting, Firemaking, Magic, Prayer, Ranged (mirroring RuneScape basics).
   - Each skill has its own XP, levels, unlocks, and in-game effects.
   - Level-up toasts, skill progress bars, visual indicators for new unlocks/recipes.

5. **Mining & Gathering**
   - Ore rocks, fishing spots, trees—resource nodes placed in the world.
   - Each requires a specific tool (pickaxe, hatchet, fishing rod).
   - Resources respawn after a cooldown.
   - Higher-level nodes require better tools/skills.

6. **Smithing & Crafting**
   - Smelt ores into metal bars; smith bars into weapons/armor.
   - Craft items (armor, weapons, consumables) with gathered resources.
   - Recipes unlock as skills level up.
   - Success/failure chance for advanced crafts.

7. **Equipment & Gear**
   - Wearable items with stat bonuses: head, body, legs, boots, gloves, cape, ring, amulet, weapon, shield, arrows (slots similar to RuneScape).
   - Equipment changes player stats and appearance (paperdoll).
   - Durability system (optional).

8. **Shops & Economy**
   - NPC merchants buy/sell items, tools, and consumables.
   - Gold earned from loot or selling items.
   - Basic price fluctuation based on item type/rarity.

9. **World Map & Zones**
   - Multiple regions: forest, mine, town, rivers/lakes, dungeons.
   - Each area contains different enemies, resources, and activities.
   - Map navigation, minimap overlay (optional), transitions between zones.

10. **Quest & Achievement System** (optional for v1)
    - Simple single-player quests and tasks (e.g., kill 10 goblins, smelt 20 bars).
    - Reward with XP, items, or gold.
    - In-game achievement popups or log.

11. **Bank & Inventory**
    - Main inventory plus additional storage (bank or chest).
    - Drag-and-drop or grid-based item management.
    - Stackable items and max stack sizes.

12. **Save/Load System**
    - Persistent single-player progression (localStorage).
    - Restore character, inventory, skills, and settings between sessions.
    - Option for manual or auto-save.

### Additional RuneScape-Inspired Details

- Overhead level-up messages and sounds for skill gains.
- Right-click context menus on items/NPCs.
- Skill requirements for equipping/using certain items.
- Simple day/night world cycles for ambience.
- Basic magic and ranged systems once melee combat is solid.
- Optional: Prayer bonuses, simple pets, collectible costumes.

---

Features are prioritized by dependency/order needed for a basic playable experience, starting from combat/skills/crafting up to shops, advanced features, and polish.
---

## Ideas / Backlog

Unordered — things to consider eventually:

- Fishing (river tiles, fishing rod, fish items, cooking)
- Cooking skill (fire tiles, raw fish → cooked fish, burn chance)
- Firemaking (logs → fire tile, XP)
- Magic combat (spells, runes, ranged magic attacks)
- Bank / chest storage (extra item storage beyond 28 inventory slots)
- Minimap overlay (small canvas rendering top-right)
- Day/night cycle (lighting tint over the world)
- Sound effects (Web Audio API — chop thud, level-up chime)
- Tile variety (dirt paths, water edges, stone floors)
- Multiple tree types (oak, willow, yew — different XP/levels)
