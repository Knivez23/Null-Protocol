import type { GearSlotType } from '../types';

export interface GearTypeMeta {
  id: string;
  label: string;              // display name AND the base noun used in generated item names (e.g. "...Rifle")
  category: GearSlotType;      // coarse equip-compat category — multiple Types can share one category (pistol/rifle/shotgun all -> 'weapon')
  artAsset: string;
  statPool: string[];           // regular (non-resistance) STAT_DEFS ids this type can roll
  resistanceSlots: number;       // how many resistance-variant slots this type can roll (0, 1, or 2)
}

const ARMOR_STAT_POOL = ['defenseBonus', 'dodgeChanceBonus', 'speedBonus'];
const WEAPON_STAT_POOL = ['attackPowerBonus', 'accuracyBonus', 'critChanceBonus', 'critDamageBonus', 'speedBonus'];

/**
 * Every craftable Type. This is the single place that determines what art
 * an item gets and what stats it can roll — extending the game with new
 * armor sets (Nomad, Gunner, ...) or weapon subtypes (melee, ...) later is
 * purely additive here, no restructuring needed elsewhere.
 */
export const GEAR_TYPES: Record<string, GearTypeMeta> = {
  helmet:  { id: 'helmet',  label: 'Helmet',  category: 'head',  artAsset: '/icons/gear/head.webp',  statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },
  chest:   { id: 'chest',   label: 'Chest',   category: 'chest', artAsset: '/icons/gear/chest.webp', statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },
  legs:    { id: 'legs',    label: 'Legs',    category: 'legs',  artAsset: '/icons/gear/legs.webp',  statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },
  gloves:  { id: 'gloves',  label: 'Gloves',  category: 'hands', artAsset: '/icons/gear/hands.webp', statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },
  boots:   { id: 'boots',   label: 'Boots',   category: 'feet',  artAsset: '/icons/gear/feet.webp',  statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },

  ring:    { id: 'ring',    label: 'Ring',    category: 'ring',   artAsset: '/icons/gear/ring.webp',   statPool: ['attackPowerBonus', 'accuracyBonus', 'critChanceBonus', 'speedBonus'], resistanceSlots: 0 },
  amulet:  { id: 'amulet',  label: 'Amulet',  category: 'amulet', artAsset: '/icons/gear/amulet.webp', statPool: ['accuracyBonus', 'critDamageBonus', 'regenBonus'], resistanceSlots: 2 },

  // Weapon Types are independent of rarity — a schematic locks in the exact
  // subtype (pistol vs rifle vs shotgun), rarity only gates power. Adding
  // melee (or any future weapon subtype) later is just another entry here.
  pistol:  { id: 'pistol',  label: 'Pistol',  category: 'weapon', artAsset: '/icons/gear/weapon-pistol.webp',  statPool: WEAPON_STAT_POOL, resistanceSlots: 0 },
  rifle:   { id: 'rifle',   label: 'Rifle',   category: 'weapon', artAsset: '/icons/gear/weapon-rifle.webp',   statPool: WEAPON_STAT_POOL, resistanceSlots: 0 },
  shotgun: { id: 'shotgun', label: 'Shotgun', category: 'weapon', artAsset: '/icons/gear/weapon-shotgun.webp', statPool: WEAPON_STAT_POOL, resistanceSlots: 0 },

  // Offhand/Shield stat pool wasn't specified in the locked design (only
  // Armor/Ring/Amulet/Weapon were) — using the Armor pool as a reasonable
  // default since it reads as defensive. Flag if that's wrong.
  shield:  { id: 'shield',  label: 'Shield',  category: 'offhand', artAsset: '/icons/gear/offhand.webp', statPool: ARMOR_STAT_POOL, resistanceSlots: 1 },
};

export const GEAR_TYPE_IDS = Object.keys(GEAR_TYPES);