/**
 * SkillManager — owns all of the player's skills.
 *
 * Adding a new skill later is one line:
 *   player.skills.register('mining', 'Mining', '#90a4ae');
 *
 * Public API:
 *   register(id, name, color)          Create and store a new Skill
 *   gainXP(skillId, amount)            Award XP; queues a level-up toast if level changes
 *   getLevel(skillId)                  Current level (1–99), or 1 if skill not found
 *   getSkill(skillId)                  Returns Skill instance or null
 *   all()                              Array of all registered Skill instances
 *   meetsRequirements(requirements)    [{skillId, level}] → boolean
 *   popLevelUps()                      Drain and return pending level-up events [{skillId, skillName, level}]
 */
class SkillManager {
  constructor() {
    this._skills      = {}; // id → Skill
    this._levelUpQueue = [];
  }

  register(id, name, color) {
    this._skills[id] = new Skill(id, name, color);
  }

  gainXP(skillId, amount) {
    const skill = this._skills[skillId];
    if (!skill) { console.warn(`SkillManager: unknown skill '${skillId}'`); return; }
    const result = skill.gainXP(amount);
    if (result.levelled) {
      this._levelUpQueue.push({ skillId, skillName: skill.name, level: result.level });
    }
    return result;
  }

  getLevel(skillId) {
    return this._skills[skillId]?.level ?? 1;
  }

  getSkill(skillId) {
    return this._skills[skillId] ?? null;
  }

  all() {
    return Object.values(this._skills);
  }

  /** Returns true only if every requirement is met. */
  meetsRequirements(requirements) {
    return requirements.every(req => this.getLevel(req.skillId) >= req.level);
  }

  /** Returns all pending level-up events and clears the queue. */
  popLevelUps() {
    return this._levelUpQueue.splice(0);
  }
}
