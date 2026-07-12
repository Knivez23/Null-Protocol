export interface StatDef {
  id: string;
  label: string;
  coefficient: number; // per-PL-point scaling — kept small deliberately, easy to retune later
  isPercentage: boolean;
}

/** Non-resistance stat pool, shared across all gear types (each type only draws from a subset — see gearTypes.ts). */
export const STAT_DEFS: Record<string, StatDef> = {
  attackPowerBonus:  { id: 'attackPowerBonus',  label: 'Attack Power Bonus',  coefficient: 0.6,  isPercentage: false },
  accuracyBonus:     { id: 'accuracyBonus',     label: 'Accuracy Bonus',      coefficient: 0.08, isPercentage: true },
  critChanceBonus:   { id: 'critChanceBonus',   label: 'Crit Chance Bonus',   coefficient: 0.09, isPercentage: true },
  critDamageBonus:   { id: 'critDamageBonus',   label: 'Crit Damage Bonus',   coefficient: 0.22, isPercentage: true },
  speedBonus:        { id: 'speedBonus',        label: 'Speed Bonus',         coefficient: 0.05, isPercentage: false },
  defenseBonus:      { id: 'defenseBonus',      label: 'Defense Bonus',       coefficient: 0.35, isPercentage: false },
  dodgeChanceBonus:  { id: 'dodgeChanceBonus',  label: 'Dodge Chance Bonus',  coefficient: 0.06, isPercentage: true },
  regenBonus:        { id: 'regenBonus',        label: 'Regen Bonus',         coefficient: 0.08, isPercentage: false },
};

/** The 6 resistance types a "resistance slot" can randomly resolve to. Stacks additively on top of the character's existing resistance %. */
export const RESISTANCE_TYPES = ['heat', 'cold', 'shock', 'poison', 'bleed', 'rot'] as const;
export type ResistanceType = typeof RESISTANCE_TYPES[number];

const RESISTANCE_LABELS: Record<ResistanceType, string> = {
  heat: 'Heat Resistance', cold: 'Cold Resistance', shock: 'Shock Resistance',
  poison: 'Poison Resistance', bleed: 'Bleed Resistance', rot: 'Rot Resistance',
};

export function getResistanceStatDef(type: ResistanceType): StatDef {
  return { id: `resistance:${type}`, label: RESISTANCE_LABELS[type], coefficient: 0.15, isPercentage: true };
}