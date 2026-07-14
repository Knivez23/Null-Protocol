import type { RarityId } from '../types';

export interface StatRange { min: number; max: number; }

export interface StatDef {
  id: string;
  label: string;
  isPercentage: boolean; // display convention — Combat and Systems Design v2.0 §5's Rating-vs-Percentage split
  ranges: Record<RarityId, StatRange>;
}

/**
 * Per-item value ranges by rarity — Combat and Systems Design v2.0 §19.
 * This REPLACES the old coefficient-based system entirely: there is no
 * more "coefficient x PowerLevel" scaling. A stat's value is rolled
 * directly from its own rarity range; Power Level gets computed FROM that
 * roll afterward (see engine/itemGeneration.ts §20), not the other way
 * around — this is the actual fix for the PL bug found early in the
 * project (two items of the same rarity/stat-count, where the worse one
 * had higher PL).
 *
 * Three stats below (meleeReductionBonus, rangedReductionBonus,
 * elementalDamage) have NO range defined anywhere in the design doc —
 * these are placeholder numbers, flagged for review, not locked values.
 */
export const STAT_DEFS: Record<string, StatDef> = {
  attackPower: {
    id: 'attackPower', label: 'Attack Power', isPercentage: false,
    ranges: { common: {min:45,max:80}, uncommon: {min:90,max:145}, rare: {min:155,max:225}, epic: {min:250,max:315}, legendary: {min:325,max:395}, mythic: {min:405,max:450} },
  },
  meleeAccuracy: {
    id: 'meleeAccuracy', label: 'Melee Accuracy', isPercentage: false,
    ranges: { common: {min:30,max:55}, uncommon: {min:60,max:95}, rare: {min:105,max:150}, epic: {min:165,max:210}, legendary: {min:215,max:265}, mythic: {min:270,max:300} },
  },
  rangedAccuracy: {
    id: 'rangedAccuracy', label: 'Ranged Accuracy', isPercentage: false,
    ranges: { common: {min:30,max:55}, uncommon: {min:60,max:95}, rare: {min:105,max:150}, epic: {min:165,max:210}, legendary: {min:215,max:265}, mythic: {min:270,max:300} },
  },
  defensePower: {
    id: 'defensePower', label: 'Defense Power', isPercentage: false,
    ranges: { common: {min:30,max:55}, uncommon: {min:60,max:95}, rare: {min:105,max:150}, epic: {min:165,max:210}, legendary: {min:215,max:265}, mythic: {min:270,max:300} },
  },
  armorRating: {
    id: 'armorRating', label: 'Armor Rating', isPercentage: false,
    ranges: { common: {min:30,max:55}, uncommon: {min:60,max:95}, rare: {min:105,max:150}, epic: {min:165,max:210}, legendary: {min:215,max:265}, mythic: {min:270,max:300} },
  },
  dodgeRating: {
    id: 'dodgeRating', label: 'Dodge Rating', isPercentage: false,
    ranges: { common: {min:25,max:45}, uncommon: {min:50,max:80}, rare: {min:90,max:125}, epic: {min:140,max:175}, legendary: {min:180,max:220}, mythic: {min:225,max:250} },
  },
  evasionRating: {
    id: 'evasionRating', label: 'Evasion Rating', isPercentage: false,
    ranges: { common: {min:25,max:45}, uncommon: {min:50,max:80}, rare: {min:90,max:125}, epic: {min:140,max:175}, legendary: {min:180,max:220}, mythic: {min:225,max:250} },
  },
  speed: {
    id: 'speed', label: 'Speed', isPercentage: false,
    ranges: { common: {min:15,max:27}, uncommon: {min:30,max:48}, rare: {min:52,max:75}, epic: {min:82,max:105}, legendary: {min:108,max:132}, mythic: {min:135,max:150} },
  },
  armorPierce: {
    id: 'armorPierce', label: 'Armor Pierce', isPercentage: false,
    ranges: { common: {min:22,max:40}, uncommon: {min:44,max:70}, rare: {min:77,max:110}, epic: {min:121,max:154}, legendary: {min:158,max:194}, mythic: {min:198,max:220} },
  },
  resistancePierce: {
    id: 'resistancePierce', label: 'Resistance Pierce', isPercentage: false,
    ranges: { common: {min:22,max:40}, uncommon: {min:44,max:70}, rare: {min:77,max:110}, epic: {min:121,max:154}, legendary: {min:158,max:194}, mythic: {min:198,max:220} },
  },
  regenRating: {
    id: 'regenRating', label: 'Regen Rating', isPercentage: false,
    ranges: { common: {min:15,max:27}, uncommon: {min:30,max:48}, rare: {min:52,max:75}, epic: {min:82,max:105}, legendary: {min:108,max:132}, mythic: {min:135,max:150} },
  },
  critChance: {
    id: 'critChance', label: 'Crit Chance', isPercentage: true,
    ranges: { common: {min:1,max:3}, uncommon: {min:3,max:5}, rare: {min:6,max:8}, epic: {min:9,max:12}, legendary: {min:13,max:16}, mythic: {min:16,max:18} },
  },
  critDamage: {
    id: 'critDamage', label: 'Crit Damage', isPercentage: true,
    ranges: { common: {min:8,max:14}, uncommon: {min:16,max:24}, rare: {min:26,max:36}, epic: {min:38,max:48}, legendary: {min:50,max:60}, mythic: {min:60,max:65} },
  },
  maxHp: {
    id: 'maxHp', label: 'Max HP', isPercentage: false,
    ranges: { common: {min:120,max:220}, uncommon: {min:240,max:420}, rare: {min:460,max:700}, epic: {min:760,max:1050}, legendary: {min:1100,max:1350}, mythic: {min:1400,max:1500} },
  },
  statusChance: {
    id: 'statusChance', label: 'Status Chance', isPercentage: true,
    ranges: { common: {min:1,max:2}, uncommon: {min:2,max:4}, rare: {min:4,max:6}, epic: {min:6,max:9}, legendary: {min:9,max:13}, mythic: {min:13,max:16} },
  },
  statusPower: {
    id: 'statusPower', label: 'Status Power', isPercentage: false,
    ranges: { common: {min:22,max:40}, uncommon: {min:44,max:70}, rare: {min:77,max:110}, epic: {min:121,max:154}, legendary: {min:158,max:194}, mythic: {min:198,max:220} },
  },

  // PLACEHOLDER — no range defined anywhere in the design doc. Small
  // percentages since these stack ON TOP of the Armor-derived Melee/Ranged
  // Reduction (which already caps at 75%) — flagged for review, not locked.
  meleeReductionBonus: {
    id: 'meleeReductionBonus', label: 'Melee Reduction Bonus', isPercentage: true,
    ranges: { common: {min:0.5,max:1}, uncommon: {min:1,max:2}, rare: {min:2,max:3}, epic: {min:3,max:4.5}, legendary: {min:4.5,max:6}, mythic: {min:6,max:8} },
  },
  rangedReductionBonus: {
    id: 'rangedReductionBonus', label: 'Ranged Reduction Bonus', isPercentage: true,
    ranges: { common: {min:0.5,max:1}, uncommon: {min:1,max:2}, rare: {min:2,max:3}, epic: {min:3,max:4.5}, legendary: {min:4.5,max:6}, mythic: {min:6,max:8} },
  },
  // PLACEHOLDER — no range defined, and mechanical effect is entirely
  // undesigned (no Ability system exists yet). Reused Status Power's scale
  // as a reasonable starting guess since both are CyberDeck ratings.
  elementalDamage: {
    id: 'elementalDamage', label: 'Elemental Damage', isPercentage: false,
    ranges: { common: {min:22,max:40}, uncommon: {min:44,max:70}, rare: {min:77,max:110}, epic: {min:121,max:154}, legendary: {min:158,max:194}, mythic: {min:198,max:220} },
  },
};

/** The 6 resistance types a resistance roll can resolve to — exactly 1 per item now (down from up to 2 before), see gearTypes.ts's hasResistanceSlot. */
export const RESISTANCE_TYPES = ['heat', 'cold', 'shock', 'poison', 'bleed', 'rot'] as const;
export type ResistanceType = typeof RESISTANCE_TYPES[number];

const RESISTANCE_LABELS: Record<ResistanceType, string> = {
  heat: 'Heat Resistance', cold: 'Cold Resistance', shock: 'Shock Resistance',
  poison: 'Poison Resistance', bleed: 'Bleed Resistance', rot: 'Rot Resistance',
};

// Resistance Rating — same range for all 6 types, per §19's single "Resistance Rating" row.
const RESISTANCE_RANGES: Record<RarityId, StatRange> = {
  common: {min:18,max:32}, uncommon: {min:36,max:58}, rare: {min:63,max:90}, epic: {min:99,max:126}, legendary: {min:130,max:158}, mythic: {min:162,max:180},
};

export function getResistanceStatDef(type: ResistanceType): StatDef {
  return { id: `resistance:${type}`, label: RESISTANCE_LABELS[type], isPercentage: false, ranges: RESISTANCE_RANGES };
}