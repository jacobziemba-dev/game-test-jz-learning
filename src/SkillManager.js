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
    this._unlockQueue = [];
    this._unlockedMilestones = {};
  }

  register(id, name, color) {
    this._skills[id] = new Skill(id, name, color);
    if (!this._unlockedMilestones[id]) this._unlockedMilestones[id] = [];
  }

  gainXP(skillId, amount) {
    this.lastGainedSkill = skillId;
    const skill = this._skills[skillId];
    if (!skill) { console.warn(`SkillManager: unknown skill '${skillId}'`); return; }
    const result = skill.gainXP(amount);
    if (result.levelled) {
      this._levelUpQueue.push({ skillId, skillName: skill.name, level: result.level });

      const milestones = SkillUnlockRegistry.milestonesFor(skillId);
      for (const milestone of milestones) {
        if (milestone.level > result.level) continue;
        if (this.isUnlockMilestoneReached(skillId, milestone.level)) continue;
        this._markMilestoneUnlocked(skillId, milestone.level);
        this._unlockQueue.push({
          skillId,
          skillName: skill.name,
          level: milestone.level,
          title: milestone.title,
          desc: milestone.desc,
        });
      }
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

  popUnlocks() {
    return this._unlockQueue.splice(0);
  }

  isUnlockMilestoneReached(skillId, level) {
    const levels = this._unlockedMilestones[skillId] ?? [];
    return levels.includes(level);
  }

  _markMilestoneUnlocked(skillId, level) {
    if (!this._unlockedMilestones[skillId]) this._unlockedMilestones[skillId] = [];
    if (!this._unlockedMilestones[skillId].includes(level)) {
      this._unlockedMilestones[skillId].push(level);
      this._unlockedMilestones[skillId].sort((a, b) => a - b);
    }
  }

  serialize() {
    const skills = {};
    for (const [id, skill] of Object.entries(this._skills)) {
      skills[id] = { xp: skill.xp };
    }

    const unlockedMilestones = {};
    for (const [skillId, levels] of Object.entries(this._unlockedMilestones)) {
      unlockedMilestones[skillId] = levels.slice();
    }

    return { skills, unlockedMilestones };
  }

  deserialize(data) {
    if (!data || typeof data !== 'object' || !data.skills) return;

    for (const [id, saved] of Object.entries(data.skills)) {
      const skill = this._skills[id];
      if (!skill) continue;
      const xp = Math.max(0, Math.floor(saved?.xp ?? 0));
      skill.xp = xp;
      skill.level = XPTable.levelForXP(xp);

      const milestones = SkillUnlockRegistry.milestonesFor(id);
      for (const milestone of milestones) {
        if (skill.level >= milestone.level) {
          this._markMilestoneUnlocked(id, milestone.level);
        }
      }
    }

    if (data.unlockedMilestones && typeof data.unlockedMilestones === 'object') {
      for (const [skillId, levels] of Object.entries(data.unlockedMilestones)) {
        if (!Array.isArray(levels)) continue;
        for (const level of levels) {
          const safeLevel = Math.max(1, Math.floor(level));
          this._markMilestoneUnlocked(skillId, safeLevel);
        }
      }
    }

    // Loaded state should not trigger retroactive level-up toasts.
    this._levelUpQueue = [];
    this._unlockQueue = [];
  }
}
