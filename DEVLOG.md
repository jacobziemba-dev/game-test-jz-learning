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

## Game Math Reference

Keep these formulas here so you don't have to look them up mid-session.

### XP Curve (authentic OSRS formula)

Total XP required to reach level L:

```text
XP(L) = floor( (1/4) * SUM(i=1 to L-1) of [ i + 300 * 2^(i/7) ] )
```

Key checkpoints:

| Level | Total XP needed |
|------:|----------------:|
|     1 |               0 |
|    10 |           1,154 |
|    20 |           4,470 |
|    50 |         101,333 |
|    70 |         737,627 |
|    99 |      13,034,431 |

> **Note:** Check `src/Skill.js` — verify the current XP table matches this formula. If not, update it for authentic feel.

### Combat Level Formula (OSRS)

```js
const base   = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
const melee  = 0.325 * (attack + strength);
const ranged = 0.325 * Math.floor(1.5 * ranged);
const magic  = 0.325 * Math.floor(1.5 * magic);
const combatLevel = Math.floor(base + Math.max(melee, ranged, magic));
```

- Display combat level on the Character panel (next to player name or at the top)
- A level 3 fresh character, level 99 all = 126 (max combat)

### Tick System (for future reference)

Classic RuneScape runs on a **0.6-second tick**. Every action (move, attack, chop) waits for the next tick.

- Walk speed: **1 tile / tick** (walking), **2 tiles / tick** (running)
- Combat: attack speed in ticks (e.g., bronze sword = 5 ticks between hits = 3.0s)
- The current game uses smooth/continuous movement — decide later whether to convert to tick-based or keep smooth

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

---

## All 23 Skills (Full Reference)

Build these in roughly this order. Skills in **bold** are already started.

### Combat (7)

| Skill | What it does | Trained by |
|-------|-------------|-----------|
| **Attack** | Melee accuracy; unlocks weapon tiers | Fighting enemies |
| **Strength** | Melee max hit | Fighting enemies (aggressive/controlled style) |
| **Defence** | Reduces enemy accuracy; unlocks armour tiers | Fighting enemies (defensive style) |
| **Hitpoints** | Total HP pool | Gains automatically alongside combat XP |
| **Ranged** | Ranged accuracy + max hit; unlocks bows/ammo | Shooting enemies |
| **Prayer** | Prayer point pool; unlocks prayers | Burying bones on altar |
| **Magic** | Spell accuracy; unlocks spells; high alchemy | Casting spells |

### Gathering (4 planned)

| Skill | What it does | Trained by |
|-------|-------------|-----------|
| **Woodcutting** | Chops trees → logs (Fletching, Firemaking) | Chopping trees |
| Mining | Mines rocks → ore (Smithing) | Hitting ore rocks with pickaxe |
| Fishing | Catches fish → raw food (Cooking) | Fishing spots with rod/net/harpoon |
| Farming | Grows crops/herbs in patches over time | Planting seeds, watering, harvesting |

### Production (6 planned)

| Skill | What it does | Trained by |
|-------|-------------|-----------|
| Smithing | Smelt ore → bars; smith bars → weapons/armour | Furnace + anvil |
| Cooking | Raw food → edible food (heals HP) | Range or fire |
| Firemaking | Burns logs → fire tiles (XP, Cooking surface) | Tinderbox + logs |
| Fletching | Makes bows + arrows from logs + feathers | Knife + logs / arrowheads |
| Crafting | Leather armour, jewellery, pottery | Needle + thread, furnace (for jewels) |
| Herblore | Herbs + secondaries → potions (stat boosts) | Grinding herbs, mixing vials |

### Support (3 planned)

| Skill | What it does | Trained by |
|-------|-------------|-----------|
| Slayer | Assigned monster kill tasks; unlocks special monsters | Slayer master NPC tasks |
| Agility | Run energy restores faster; unlocks map shortcuts | Agility courses |
| Thieving | Pickpockets NPCs, steals from stalls | Clicking on NPCs/stalls |

> Start with the 7 combat skills + Woodcutting (already done). Add Mining + Smithing next (to make better gear). Add Cooking + Fishing after (to sustain HP in combat).

---

## Combat System Reference

### Hit Formula (Two Stages)

Every attack rolls accuracy first, then damage:

```js
// Stage 1 — Accuracy
const atkRoll  = Math.floor(Math.random() * (maxAttackRoll + 1));
const defRoll  = Math.floor(Math.random() * (maxDefenceRoll + 1));
let hit;
if (atkRoll > defRoll) {
  hit = Math.random() < 1 - (defRoll + 2) / (2 * (atkRoll + 1));
} else {
  hit = Math.random() < atkRoll / (2 * (defRoll + 1));
}

// Stage 2 — Damage (only if hit)
const damage = hit ? Math.floor(Math.random() * (maxHit + 1)) : 0;
```

### Max Attack Roll

```js
// effectiveLevel includes +8 always, +style bonus, prayer multiplier
const effectiveLevel = Math.floor(skillLevel * prayerMult) + styleBonus + 8;
const maxAttackRoll  = effectiveLevel * (equipAttackBonus + 64);
```

Style bonuses: Accurate +3 Attack, Aggressive +3 Strength, Controlled +1 each, Defensive +3 Defence.

### Max Melee Hit

```js
const effStr  = Math.floor(strength * prayerMult) + styleBonus + 8;
const maxHit  = Math.floor(0.5 + effStr * (strengthBonus + 64) / 640);
// strengthBonus = sum of Melee Strength stat from all equipped items
```

### Combat Level (display on character panel)

```js
const base        = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
const melee       = 0.325 * (attack + strength);
const rangedCombat = 0.325 * Math.floor(1.5 * ranged);
const magicCombat  = 0.325 * Math.floor(1.5 * magic);
const combatLevel = Math.floor(base + Math.max(melee, rangedCombat, magicCombat));
// Level 3 fresh character. Max = 126 (all 99s)
```

### Attack Styles & XP

| Style | XP Split | Invisible Boost |
|-------|----------|----------------|
| Accurate | 4× Attack XP + HP | +3 Attack |
| Aggressive | 4× Strength XP + HP | +3 Strength |
| Defensive | 4× Defence XP + HP | +3 Defence |
| Controlled | 1.33× Atk/Str/Def/HP each | +1 each |

HP XP rate: 1.33 HP XP per damage dealt, always.

### Tick-Based Attack Timer

```js
// Player attacks once per weapon.speed ticks (1 tick = 0.6s)
// In update(dt): accumulate time, fire attack when timer expires
player.attackTimer -= dt;
if (player.attackTimer <= 0 && playerInRange) {
  doAttack();
  player.attackTimer = weapon.speed * 0.6; // convert ticks to seconds
}
```

---

## Weapons Reference

### Attack Speeds

| Weapon Type | Ticks | Seconds |
|-------------|------:|--------:|
| Scimitar, Dagger, Claws, Whip | 4 | 2.4s |
| Sword, Longsword, Mace, Staff, Crossbow | 5 | 3.0s |
| Battleaxe, War Hammer, Longbow | 6 | 3.6s |
| 2H Sword, Halberd | 7 | 4.2s |

### Equipment Stat Slots

Every item can carry any of these bonuses:

- **Attack bonuses**: Stab / Slash / Crush / Ranged / Magic
- **Defence bonuses**: Stab / Slash / Crush / Ranged / Magic
- **Other**: Melee Strength, Ranged Strength, Magic Damage %, Prayer bonus

### Two-Handed vs 1H + Shield

- 2H weapons occupy both Weapon and Shield slots simultaneously
- Shields add defence + sometimes prayer bonus
- Bows, 2H swords, halberds, most staves = 2H
- Swords, scimitars, daggers, maces, crossbows = 1H (can hold shield)

### Special Attacks (add later)

Special attack bar: 100% max, drains on use, recharges +10% every 30s.

| Weapon | Energy Cost | Effect |
|--------|------------:|--------|
| Dragon Dagger | 25% | 2 rapid hits, +15% accuracy each |
| Dragon Longsword | 25% | +25% max hit |
| Dragon Scimitar | 55% | Blocks target's protection prayers |
| Dragon Claws | 50% | 4 rapid hits (complex split formula) |

---

## Magic System Reference

### How Magic Damage Works

Unlike melee, **Magic level does NOT increase max hit** — it only improves accuracy. Base max hit is fixed per spell.

```js
finalMaxHit = Math.floor(spellBaseMaxHit * (1 + magicDamageBonus));
// magicDamageBonus comes from equipment (e.g. Occult Necklace = +0.10)
```

Magic defence of target: `0.7 × Magic level + 0.3 × Defence level`

### Standard Spellbook (Combat Spells)

| Spell | Level | Max Hit | Runes Required |
|-------|------:|--------:|----------------|
| Wind Strike | 1 | 2 | 1 Air, 1 Mind |
| Water Strike | 5 | 4 | 1 Air, 1 Water, 1 Mind |
| Earth Strike | 9 | 6 | 2 Air, 1 Earth, 1 Mind |
| Fire Strike | 13 | 8 | 3 Air, 2 Fire, 1 Mind |
| Wind Bolt | 17 | 9 | 2 Air, 1 Chaos |
| Water Bolt | 23 | 10 | 2 Air, 2 Water, 1 Chaos |
| Earth Bolt | 29 | 11 | 3 Air, 3 Earth, 1 Chaos |
| Fire Bolt | 35 | 12 | 4 Air, 3 Fire, 1 Chaos |
| Wind Blast | 41 | 13 | 3 Air, 1 Death |
| Water Blast | 47 | 14 | 3 Air, 3 Water, 1 Death |
| Earth Blast | 53 | 15 | 4 Air, 3 Earth, 1 Death |
| Fire Blast | 59 | 16 | 5 Fire, 4 Air, 1 Death |
| Wind Wave | 62 | 17 | 5 Air, 1 Blood |
| Water Wave | 65 | 18 | 5 Air, 7 Water, 1 Blood |
| Earth Wave | 70 | 19 | 5 Air, 7 Earth, 1 Blood |
| Fire Wave | 75 | 20 | 5 Air, 7 Fire, 1 Blood |
| Fire Surge | 95 | 24 | 7 Air, 10 Fire, 1 Wrath |

### Elemental Staves (eliminate rune cost)

| Staff | Replaces |
|-------|----------|
| Staff of Air | Unlimited Air runes |
| Staff of Water | Unlimited Water runes |
| Staff of Earth | Unlimited Earth runes |
| Staff of Fire | Unlimited Fire runes |
| Lava Battlestaff | Fire + Earth |
| Steam Battlestaff | Water + Fire |

### Non-Combat Magic (Standard Spellbook)

- **Low Alchemy** (Lvl 21): item → 40% of item value in coins. Cost: 1 Nature + 5 Fire runes
- **High Alchemy** (Lvl 55): item → 60% of item value in coins. Cost: 1 Nature + 5 Fire runes
- **Teleport spells** (Lvl 20+): instant travel to major cities (Lumbridge, Varrock, etc.)
- **Enchant spells**: enchant jewellery with gem + runes → combat amulets/rings

### Magic Attack Speed

- Standard staff autocast: **5 ticks (3.0s)** per spell

---

## Prayer Reference

Max prayer points = Prayer level (e.g. level 43 = 43 pts).

Each +1 prayer bonus on equipment = +3.33% longer prayer duration.

### Key Prayers to Implement

| Prayer | Level | Effect | Drain (pts/min) |
|--------|------:|--------|----------------:|
| Thick Skin | 1 | +5% Defence | 5 |
| Burst of Strength | 4 | +5% Strength | 5 |
| Clarity of Thought | 7 | +5% Attack | 5 |
| Rock Skin | 10 | +10% Defence | 10 |
| Superhuman Strength | 13 | +10% Strength | 10 |
| Improved Reflexes | 16 | +10% Attack | 10 |
| Rapid Heal | 22 | 2× HP regen rate | 3.3 |
| Steel Skin | 28 | +15% Defence | 20 |
| Ultimate Strength | 31 | +15% Strength | 20 |
| Incredible Reflexes | 34 | +15% Attack | 20 |
| **Protect from Magic** | **37** | **Block magic damage** | **20** |
| **Protect from Missiles** | **40** | **Block ranged damage** | **20** |
| **Protect from Melee** | **43** | **Block melee damage** | **20** |
| Chivalry | 60 | +20% Def, +18% Str, +15% Atk | 40 |
| **Piety** | **70** | **+25% Def, +23% Str, +20% Atk** | **40** |

Training prayer: bury bones on the ground or on an altar (altar = 3.5× XP).

---

## UI Plan

What to build for the game's interface, in priority order:

### Phase 1 — Combat essentials (build with combat system)

- [ ] **HP / Prayer orbs** — top-left or top-right, always visible; shows current/max values
- [ ] **Combat tab** — attack style selector (Accurate / Aggressive / Defensive / Controlled); shown when in combat
- [ ] **Overhead HP bar on enemies** — green-to-red bar above NPC when in combat
- [ ] **XP drops** — floating text near skill bar when XP is gained ("+87 Woodcutting")
- [ ] **Damage splats** — number above target when hit; "0" splash on miss

### Phase 2 — Expanded UI

- [ ] **Prayer panel** — list of all prayers with checkbox toggles; shows active prayers
- [ ] **Minimap** — circular 100-px canvas in top-right corner; player = white dot, NPCs = yellow/red dots
- [ ] **Spellbook panel** — grid of spell icons; click to select autocast spell; shows rune cost
- [ ] **Run energy orb** — shows current run energy %; toggle run on/off
- [ ] **Special attack bar** — shows special % (arc bar); click to activate special

### Phase 3 — Polish

- [ ] **Overhead text** — player/NPC names above sprites; active prayer icon
- [ ] **Item ground labels** — text label floating above dropped items
- [ ] **Chatbox / game log** — scrollable area showing game messages ("You chop the tree", "You deal 4 damage")
- [ ] **Combat level display** — shown in Character panel header

### Tab Key Layout (for reference)

| Key | Panel |
|-----|-------|
| I | Inventory |
| P | Character (equipment + paperdoll) |
| K | Skills |
| C | Crafting |
| H | Help |
| *(future)* R | Prayer |
| *(future)* M | Spellbook |

---

## Settings Plan

Settings to expose to the player (build a Settings panel or pause menu):

### Display
- [ ] Brightness slider (4 levels)
- [ ] Canvas zoom (mouse scroll wheel — min/max clamp)
- [ ] Show XP drops: on/off
- [ ] Show damage splats: on/off
- [ ] Show overhead names: on/off

### Controls
- [ ] Panel keybinds (rebindable: I/P/K/C/H)
- [ ] Shift+click to drop items (prevents accidental drops)
- [ ] Run toggle (walking vs running)

### Audio *(when sounds are added)*
- [ ] Master volume
- [ ] Sound effects volume
- [ ] Music volume

### Data
- [ ] Save game (button → localStorage)
- [ ] Load game (button → restore from localStorage)
- [ ] Reset / new character (with confirmation dialog)

---

## Drop Table Architecture

Structure monster drop tables like this (for when enemies are built):

```js
const goblinDrops = {
  always:  [{ id: 'bones', qty: 1 }],
  common:  [
    { id: 'coins', qty: [2, 10], weight: 5 },
    { id: 'bronze_sword', qty: 1, weight: 3 },
  ],
  uncommon: [
    { id: 'iron_dagger', qty: 1, weight: 2 },
  ],
  rare: [
    { id: 'gold_ring', qty: 1, weight: 1 },
  ],
};
// Roll: pick random item weighted by 'weight' value
```

Each monster has: always drops + a weighted random table + optional rare/unique table.
