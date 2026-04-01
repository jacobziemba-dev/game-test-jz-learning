/**
 * XPTable — authentic RuneScape XP curve.
 *
 * XPTable.XP_FOR_LEVEL[L] = minimum total XP required to reach level L (1-indexed).
 * Level 1 = 0 XP, Level 2 = 83 XP, Level 99 = 13,034,431 XP.
 *
 * Formula (per RS wiki): cumulate floor(L + 300 * 2^(L/7)) for L = 1..98, divide by 4.
 */
const XPTable = (() => {
  const XP_FOR_LEVEL = [0, 0]; // index 0 unused; index 1 = 0 XP (level 1 base)
  let sum = 0;
  for (let L = 1; L <= 98; L++) {
    sum += Math.floor(L + 300 * Math.pow(2, L / 7));
    XP_FOR_LEVEL[L + 1] = Math.floor(sum / 4);
  }
  // XP_FOR_LEVEL[1]=0 ... XP_FOR_LEVEL[99]=13,034,431

  function levelForXP(xp) {
    for (let L = 99; L >= 1; L--) {
      if (xp >= XP_FOR_LEVEL[L]) return L;
    }
    return 1;
  }

  return { XP_FOR_LEVEL, levelForXP };
})();

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Skill — runtime state for one player skill (e.g. Woodcutting).
 *
 * Public API:
 *   gainXP(amount)        Add XP; returns { levelled, level }
 *   level                 Current level (1–99)
 *   xp                    Total accumulated XP
 *   progressToNextLevel   0..1 fraction through current level
 *   xpToNextLevel         Raw XP gap until the next level (0 at level 99)
 */
class Skill {
  constructor(id, name, color = '#a5d6a7') {
    this.id    = id;
    this.name  = name;
    this.color = color; // accent color used in UI
    this.xp    = 0;
    this.level = 1;
  }

  gainXP(amount) {
    this.xp += amount;
    const newLevel = XPTable.levelForXP(this.xp);
    const levelled = newLevel > this.level;
    this.level = newLevel;
    return { levelled, level: this.level };
  }

  /** XP earned inside the current level (resets appearance at each level). */
  get xpInCurrentLevel() {
    return this.xp - XPTable.XP_FOR_LEVEL[this.level];
  }

  /** Total XP needed to clear the current level. 0 at level 99. */
  get xpToNextLevel() {
    if (this.level >= 99) return 0;
    return XPTable.XP_FOR_LEVEL[this.level + 1] - XPTable.XP_FOR_LEVEL[this.level];
  }

  /** Progress 0..1 through current level. 1.0 at level 99. */
  get progressToNextLevel() {
    if (this.level >= 99) return 1;
    return this.xpInCurrentLevel / this.xpToNextLevel;
  }
}
