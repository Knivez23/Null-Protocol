import type { GearSlotType } from '../types';

export interface GearTypeMeta {
  id: string;
  label: string;              // display name AND the base noun used in generated item names (e.g. "...Rifle")
  category: GearSlotType;      // coarse equip-compat category — multiple Types can share one category (pistol/rifle/shotgun all -> 'weapon')
  artAsset: string;
  statPool: string[];           // regular (non-resistance) stat ids this type can roll — see data/itemStats.ts for ranges
  hasResistanceSlot: boolean;    // exactly 1 resistance roll max per item now (Combat and Systems Design v2.0 — down from up to 2 before)
  hasExclusiveAccuracyChoice: boolean; // true = rolls EITHER Melee OR Ranged Accuracy (never both) — Weapon only. Ring lists both as independent pool entries instead (can roll both, or neither, like any other pair of stats).
}

const HELMET_POOL = ['armorRating', 'defensePower', 'maxHp', 'regenRating'];
const CHEST_POOL = ['armorRating', 'defensePower', 'maxHp', 'meleeReductionBonus', 'regenRating'];
const LEGS_POOL = ['armorRating', 'defensePower', 'dodgeRating', 'evasionRating', 'speed', 'maxHp'];
const GLOVES_POOL = ['meleeAccuracy', 'rangedAccuracy', 'attackPower', 'critChance', 'critDamage'];
const BOOTS_POOL = ['speed', 'dodgeRating', 'evasionRating', 'armorRating'];
const WEAPON_POOL = ['attackPower', 'critDamage', 'speed', 'armorPierce']; // Melee/Ranged Accuracy handled separately — see hasExclusiveAccuracyChoice
const SHIELD_POOL = ['armorRating', 'defensePower', 'rangedReductionBonus', 'maxHp'];
const RING_POOL = ['meleeAccuracy', 'rangedAccuracy', 'attackPower', 'critChance', 'critDamage', 'armorPierce', 'resistancePierce'];
const AMULET_POOL = ['regenRating', 'statusPower', 'resistancePierce', 'speed', 'dodgeRating', 'evasionRating'];
const CYBERDECK_POOL = ['statusPower', 'resistancePierce', 'elementalDamage', 'statusChance'];

/**
 * Every craftable Type. This is the single place that determines what art
 * an item gets and what stats it can roll — extending the game with new
 * armor sets or weapon subtypes later is purely additive here.
 *
 * CyberDeck is a genuinely new gear type (Combat and Systems Design v2.0) —
 * it does NOT count toward Character Power Level (confirmed — stays a
 * utility slot like Consumable always was), even though it grants real
 * combat stats now. Its `elementalDamage` stat has no defined mechanical
 * effect yet (no Ability system exists) — scaffolding only, same boundary
 * as statusPower/statusChance elsewhere.
 */
export const GEAR_TYPES: Record<string, GearTypeMeta> = {
  helmet:  { id: 'helmet',  label: 'Helmet',  category: 'head',  artAsset: '/icons/gear/head.webp',  statPool: HELMET_POOL, hasResistanceSlot: true,  hasExclusiveAccuracyChoice: false },
  chest:   { id: 'chest',   label: 'Chest',   category: 'chest', artAsset: '/icons/gear/chest.webp', statPool: CHEST_POOL,  hasResistanceSlot: true,  hasExclusiveAccuracyChoice: false },
  legs:    { id: 'legs',    label: 'Legs',    category: 'legs',  artAsset: '/icons/gear/legs.webp',  statPool: LEGS_POOL,   hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },
  gloves:  { id: 'gloves',  label: 'Gloves',  category: 'hands', artAsset: '/icons/gear/hands.webp', statPool: GLOVES_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },
  boots:   { id: 'boots',   label: 'Boots',   category: 'feet',  artAsset: '/icons/gear/feet.webp',  statPool: BOOTS_POOL,  hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },

  ring:    { id: 'ring',    label: 'Ring',    category: 'ring',   artAsset: '/icons/gear/ring.webp',   statPool: RING_POOL,   hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },
  amulet:  { id: 'amulet',  label: 'Amulet',  category: 'amulet', artAsset: '/icons/gear/amulet.webp', statPool: AMULET_POOL, hasResistanceSlot: true,  hasExclusiveAccuracyChoice: false },

  // Weapon Types are independent of rarity — a schematic locks in the exact
  // subtype (pistol vs rifle vs shotgun), rarity only gates power.
  pistol:  { id: 'pistol',  label: 'Pistol',  category: 'weapon', artAsset: '/icons/gear/weapon-pistol.webp',  statPool: WEAPON_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: true },
  rifle:   { id: 'rifle',   label: 'Rifle',   category: 'weapon', artAsset: '/icons/gear/weapon-rifle.webp',   statPool: WEAPON_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: true },
  shotgun: { id: 'shotgun', label: 'Shotgun', category: 'weapon', artAsset: '/icons/gear/weapon-shotgun.webp', statPool: WEAPON_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: true },

  shield:  { id: 'shield',  label: 'Shield',  category: 'offhand', artAsset: '/icons/gear/offhand.webp', statPool: SHIELD_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },

  cyberdeck: { id: 'cyberdeck', label: 'CyberDeck', category: 'cyberdeck', artAsset: '/icons/gear/cyberdeck.webp', statPool: CYBERDECK_POOL, hasResistanceSlot: false, hasExclusiveAccuracyChoice: false },
};

export const GEAR_TYPE_IDS = Object.keys(GEAR_TYPES);

/** The 10 gear types that count toward Character Power Level — everything except CyberDeck (utility slot, excluded per project decision). */
export const PL_CONTRIBUTING_TYPE_IDS = GEAR_TYPE_IDS.filter(id => GEAR_TYPES[id].category !== 'cyberdeck');