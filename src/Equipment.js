/**
 * Equipment — tracks which items are worn in each equipment slot.
 *
 * Slot IDs match RuneScape's equipment screen layout:
 *   head, cape, neck, ammo, weapon, body, offhand, hands, legs, boots, ring
 *
 * Usage:
 *   const displaced = equipment.equip(item);   // returns old item in that slot (or null)
 *   const removed   = equipment.unequip(slotId); // returns the item (or null)
 *   equipment.getBonuses();                     // aggregated stat bonuses from all worn items
 */

const EQUIP_SLOT_IDS = [
  'head', 'cape', 'neck', 'ammo',
  'weapon', 'body', 'offhand',
  'hands', 'legs', 'boots', 'ring',
];

const EQUIP_SLOT_LABELS = {
  head: 'Head', cape: 'Cape', neck: 'Neck', ammo: 'Ammo',
  weapon: 'Weapon', body: 'Body', offhand: 'Off-hand',
  hands: 'Hands', legs: 'Legs', boots: 'Boots', ring: 'Ring',
};

class Equipment {
  constructor() {
    this._slots = {};
    for (const s of EQUIP_SLOT_IDS) this._slots[s] = null;
  }

  /**
   * Equip an item into its designated slot.
   * Returns the previously equipped item (or null) so the caller can return it to the inventory.
   */
  canEquip(item, skillManager = null) {
    if (!item) return { ok: false, reason: 'No item selected.' };
    const slotId = item.equipSlot;
    if (!slotId || !(slotId in this._slots)) {
      return { ok: false, reason: 'Item is not equippable.' };
    }

    if (!skillManager || !Array.isArray(item.requiredSkills) || item.requiredSkills.length === 0) {
      return { ok: true };
    }

    const unmet = item.requiredSkills.find(req => skillManager.getLevel(req.skillId) < req.level);
    if (!unmet) return { ok: true };

    const skillName = unmet.skillId.charAt(0).toUpperCase() + unmet.skillId.slice(1);
    return { ok: false, reason: `${skillName} level ${unmet.level} required.` };
  }

  equip(item, skillManager = null) {
    const slotId = item.equipSlot;

    const canEquip = this.canEquip(item, skillManager);
    if (!canEquip.ok) {
      return { ok: false, displaced: null, reason: canEquip.reason };
    }

    if (!slotId || !(slotId in this._slots)) {
      return { ok: false, displaced: null, reason: 'Invalid equipment slot.' };
    }

    const displaced = this._slots[slotId];
    this._slots[slotId] = item;
    return { ok: true, displaced, reason: null };
  }

  /**
   * Remove whatever is in the given slot.
   * Returns the item (or null if slot was empty).
   */
  unequip(slotId) {
    const item = this._slots[slotId] ?? null;
    if (item) this._slots[slotId] = null;
    return item;
  }

  /** Returns the item in a slot, or null. */
  getSlot(slotId) {
    return this._slots[slotId] ?? null;
  }

  /** Returns true if anything is equipped in this slot. */
  hasItem(slotId) {
    return this._slots[slotId] !== null;
  }

  /**
   * Aggregates bonus stats from all equipped items.
   * Returns { attack, strength, defence, ranged, magic, prayer }.
   */
  getBonuses() {
    const bonuses = { attack: 0, strength: 0, defence: 0, ranged: 0, magic: 0, prayer: 0 };
    for (const item of Object.values(this._slots)) {
      if (!item || !item.bonuses) continue;
      for (const [key, val] of Object.entries(item.bonuses)) {
        if (key in bonuses) bonuses[key] += val;
      }
    }
    return bonuses;
  }

  serialize() {
    const out = {};
    for (const slotId of EQUIP_SLOT_IDS) {
      out[slotId] = this._slots[slotId]?.id ?? null;
    }
    return out;
  }

  deserialize(data) {
    for (const slotId of EQUIP_SLOT_IDS) {
      this._slots[slotId] = null;
    }
    if (!data || typeof data !== 'object') return;

    for (const slotId of EQUIP_SLOT_IDS) {
      const itemId = data[slotId];
      if (!itemId) continue;
      const item = ItemRegistry.get(itemId);
      if (!item) continue;
      if (item.equipSlot !== slotId) continue;
      this._slots[slotId] = item;
    }
  }
}
