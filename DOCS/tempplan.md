Here is your instructional devlog entry! 🛠️ It breaks down the classic RPG features and the math you need to code them.

---

## Devlog Goal: Core Engine & RPG Math 🎯

### ⏱️ The Game Engine (Tick System)
* **The Tick:** The entire game updates on a fixed timer. In classic RuneScape, this happens every 0.6 seconds. This is called a "tick."
* **Action Queue:** Player clicks do not happen instantly. All actions wait for the next tick to process.
* **Why do this?** It keeps the game logic organized. It also creates that classic rhythm for combat and skilling!

### 🗺️ Movement & The Grid
* **Grid Layout:** Build your world as a giant 2D grid. Every tile has an X and Y coordinate.
* **Pathfinding Algorithm:** Use the **A* (A-Star) Algorithm**.
* **How it works:** When a player clicks a tile, A* checks surrounding tiles to find the shortest route. It automatically paths around walls, trees, and water.
* **Speed:** Players move 1 tile per tick when walking. They move 2 tiles per tick when running.

### 🎒 Inventory & Equipment Data
* **The Array:** Create your inventory as a fixed array with 28 slots.
* **Item IDs:** Give every item a unique number. 
    * `0` = Empty slot.
    * `1001` = Bronze Sword.
* **Stacking:** Items like coins or arrows need a "quantity" value attached to their ID.
* **Equipping Logic:** When a player equips an item, your code should remove it from the inventory array. Then, place it into a specific equipment slot variable (like `headSlot` or `weaponSlot`). Finally, add the item's stats to the player's total stats.

### 🧮 Classic Math Formulas

Use these exact math equations in your code to recreate that authentic progression feel!

**1. Experience (XP) Curve**
Every level takes slightly more XP than the last. Use this formula to calculate the total XP needed to reach level $L$:

$$\text{XP} = \lfloor \frac{1}{4} \sum_{i=1}^{L-1} \left( i + 300 \cdot 2^{\frac{i}{7}} \right) \rfloor$$

**2. Combat Level Formula**
Combat level shows the total strength of a player or monster. It combines base defensive stats with the single highest offensive style.

First, calculate the **Base Level** in your code:

$$\text{Base} = 0.25 \times \left( \text{Defence} + \text{Hitpoints} + \lfloor \frac{\text{Prayer}}{2} \rfloor \right)$$

Next, calculate the separate **Combat Style Levels**:

$$\text{Melee} = 0.325 \times (\text{Attack} + \text{Strength})$$

$$\text{Ranged} = 0.325 \times \lfloor 1.5 \times \text{RangedLevel} \rfloor$$

$$\text{Magic} = 0.325 \times \lfloor 1.5 \times \text{MagicLevel} \rfloor$$

Finally, add the Base to the highest style to get the **Total Combat Level**:

$$\text{CombatLevel} = \lfloor \text{Base} + \max(\text{Melee}, \text{Ranged}, \text{Magic}) \rfloor$$

---

Which of these core systems would you like to start building first?