/**
 * Recipe — defines one craftable item combination.
 *
 * Properties:
 *   id              {string}   Unique key
 *   name            {string}   Display name
 *   category        {string}   Groups recipes in the crafting UI (e.g. 'Woodcutting', 'Smithing')
 *   station         {string}   Required crafting station id ('any', 'furnace', 'spinning_wheel', etc.)
 *   tools           [{itemId}] Non-consumed tools required in inventory
 *   inputs          [{itemId, qty}]           Items consumed on craft
 *   outputs         [{itemId, qty}]           Items produced on craft
 *   onFailOutputs   [{itemId, qty}]           Items produced when craft fails (optional)
 *   requiredSkills  [{skillId, level}]        Minimum levels needed to see/use the recipe
 *   grantXP         [{skillId, amount}]       XP awarded on a successful craft
 *   grantXPOnFail   [{skillId, amount}]       XP awarded on failed attempt (optional)
 *   successChance   {number|function}         0..1 chance to succeed; function receives skillManager
 *
 * Methods:
 *   canCraft(inventory, skillManager, station)             → boolean
 *   canCraftDetailed(inventory, skillManager, station)     → rich requirement state
 *   maxCraftable(inventory, skillManager, station)         → max attempts possible
 *   execute(inventory, skillManager, station)              → boolean (false if requirements not met)
 *   executeBatch(inventory, skillManager, options)         → crafting summary
 */
class Recipe {
  constructor({
    id,
    name,
    category = 'General',
    station = 'any',
    tools = [],
    inputs,
    outputs,
    onFailOutputs = [],
    requiredSkills = [],
    grantXP = [],
    grantXPOnFail = [],
    successChance = 1,
  }) {
    this.id             = id;
    this.name           = name;
    this.category       = category;
    this.station        = station;
    this.tools          = tools;         // [{itemId}]
    this.inputs         = inputs;         // [{itemId, qty}]
    this.outputs        = outputs;        // [{itemId, qty}]
    this.onFailOutputs  = onFailOutputs;  // [{itemId, qty}]
    this.requiredSkills = requiredSkills; // [{skillId, level}]
    this.grantXP        = grantXP;       // [{skillId, amount}]
    this.grantXPOnFail  = grantXPOnFail; // [{skillId, amount}]
    this.successChance  = successChance;
  }

  /** True if the player meets level requirements AND has all input items. */
  canCraft(inventory, skillManager, station = 'any') {
    const state = this.canCraftDetailed(inventory, skillManager, station);
    return state.canCraft;
  }

  /** True if player meets level requirements (even without items). */
  isUnlocked(skillManager) {
    return skillManager.meetsRequirements(this.requiredSkills);
  }

  canCraftDetailed(inventory, skillManager, station = 'any') {
    const missingSkills = this.requiredSkills.filter(req => skillManager.getLevel(req.skillId) < req.level);
    const missingTools = this.tools.filter(tool => !inventory.hasItem(tool.itemId, 1));
    const missingInputs = this.inputs
      .filter(inp => !inventory.hasItem(inp.itemId, inp.qty))
      .map(inp => ({
        itemId: inp.itemId,
        requiredQty: inp.qty,
        availableQty: inventory.countItem(inp.itemId),
      }));

    const stationRequired = this.station !== 'any';
    const stationBlocked = stationRequired && station !== this.station;

    return {
      canCraft: missingSkills.length === 0 && missingTools.length === 0 && missingInputs.length === 0 && !stationBlocked,
      missingSkills,
      missingTools,
      missingInputs,
      stationBlocked,
      requiredStation: this.station,
    };
  }

  maxCraftable(inventory, skillManager, station = 'any') {
    const state = this.canCraftDetailed(inventory, skillManager, station);
    if (state.missingSkills.length > 0 || state.missingTools.length > 0 || state.stationBlocked) return 0;
    if (this.inputs.length === 0) return 999;

    let max = Infinity;
    for (const inp of this.inputs) {
      const available = inventory.countItem(inp.itemId);
      max = Math.min(max, Math.floor(available / Math.max(1, inp.qty)));
    }
    return Number.isFinite(max) ? Math.max(0, max) : 0;
  }

  _getSuccessChance(skillManager) {
    const raw = typeof this.successChance === 'function'
      ? this.successChance(skillManager, this)
      : this.successChance;
    return Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 1));
  }

  /**
   * Attempt to craft. Consumes inputs, produces outputs, grants XP.
   * Returns true on success, false if requirements not met.
   */
  execute(inventory, skillManager, station = 'any') {
    const result = this.executeBatch(inventory, skillManager, { times: 1, station });
    return result.attempted > 0;
  }

  executeBatch(inventory, skillManager, { times = 1, station = 'any' } = {}) {
    const requested = Math.max(1, Math.floor(times));
    const maxCraftable = this.maxCraftable(inventory, skillManager, station);
    const targetAttempts = Math.min(requested, maxCraftable);

    const result = {
      requested,
      attempted: 0,
      crafted: 0,
      failed: 0,
      outputsCreated: {},
      failOutputsCreated: {},
      blockedReason: null,
    };

    if (targetAttempts <= 0) {
      result.blockedReason = this.canCraftDetailed(inventory, skillManager, station);
      return result;
    }

    for (let i = 0; i < targetAttempts; i++) {
      if (!this.canCraft(inventory, skillManager, station)) {
        break;
      }

      for (const inp of this.inputs) inventory.removeItem(inp.itemId, inp.qty);

      const success = Math.random() <= this._getSuccessChance(skillManager);
      if (success) {
        result.crafted++;
        for (const out of this.outputs) {
          inventory.addItem(out.itemId, out.qty);
          result.outputsCreated[out.itemId] = (result.outputsCreated[out.itemId] ?? 0) + out.qty;
        }
        for (const xp of this.grantXP) skillManager.gainXP(xp.skillId, xp.amount);
      } else {
        result.failed++;
        for (const out of this.onFailOutputs) {
          inventory.addItem(out.itemId, out.qty);
          result.failOutputsCreated[out.itemId] = (result.failOutputsCreated[out.itemId] ?? 0) + out.qty;
        }
        for (const xp of this.grantXPOnFail) skillManager.gainXP(xp.skillId, xp.amount);
      }

      result.attempted++;
    }

    return result;
  }

  /** Minimum level required across all skills (used for display sorting). */
  get minLevel() {
    return this.requiredSkills.reduce((max, r) => Math.max(max, r.level), 1);
  }
}
