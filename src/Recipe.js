/**
 * Recipe — defines one craftable item combination.
 *
 * Properties:
 *   id              {string}   Unique key
 *   name            {string}   Display name
 *   category        {string}   Groups recipes in the crafting UI (e.g. 'Woodcutting', 'Smithing')
 *   inputs          [{itemId, qty}]           Items consumed on craft
 *   outputs         [{itemId, qty}]           Items produced on craft
 *   requiredSkills  [{skillId, level}]        Minimum levels needed to see/use the recipe
 *   grantXP         [{skillId, amount}]       XP awarded on a successful craft
 *
 * Methods:
 *   canCraft(inventory, skillManager)  → boolean
 *   execute(inventory, skillManager)   → boolean (false if requirements not met)
 */
class Recipe {
  constructor({ id, name, category = 'General', inputs, outputs, requiredSkills = [], grantXP = [] }) {
    this.id             = id;
    this.name           = name;
    this.category       = category;
    this.inputs         = inputs;         // [{itemId, qty}]
    this.outputs        = outputs;        // [{itemId, qty}]
    this.requiredSkills = requiredSkills; // [{skillId, level}]
    this.grantXP        = grantXP;       // [{skillId, amount}]
  }

  /** True if the player meets level requirements AND has all input items. */
  canCraft(inventory, skillManager) {
    return skillManager.meetsRequirements(this.requiredSkills) &&
           this.inputs.every(inp => inventory.hasItem(inp.itemId, inp.qty));
  }

  /** True if player meets level requirements (even without items). */
  isUnlocked(skillManager) {
    return skillManager.meetsRequirements(this.requiredSkills);
  }

  /**
   * Attempt to craft. Consumes inputs, produces outputs, grants XP.
   * Returns true on success, false if requirements not met.
   */
  execute(inventory, skillManager) {
    if (!this.canCraft(inventory, skillManager)) return false;
    for (const inp of this.inputs)  inventory.removeItem(inp.itemId, inp.qty);
    for (const out of this.outputs) inventory.addItem(out.itemId, out.qty);
    for (const xp  of this.grantXP) skillManager.gainXP(xp.skillId, xp.amount);
    return true;
  }

  /** Minimum level required across all skills (used for display sorting). */
  get minLevel() {
    return this.requiredSkills.reduce((max, r) => Math.max(max, r.level), 1);
  }
}
