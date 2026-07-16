import type { Loadout, CombatantStats, ResistanceType, WeaponElement } from '../types';
import { PL_EQUIP_SLOTS } from '../types';
import { computePlayerMaxHp, BASE_CRIT_DAMAGE } from '../config/combatFormulas';
import { computePowerLevel } from './equipment';

/**
 * Connects item generation (Phase 3) to combat (Phase 2) — sums every
 * equipped item's rolled stats into one CombatantStats block usable by the
 * ATB engine. This didn't exist before Phase 4; without it there was no
 * path from "here's a player's gear" to "here's what they fight with."
 */

const STAT_LABEL_TO_FIELD: Record<string, keyof CombatantStats> = {
  'Attack Power': 'attackPower',
  'Melee Accuracy': 'meleeAccuracy',
  'Ranged Accuracy': 'rangedAccuracy',
  'Defense Power': 'defensePower',
  'Armor Rating': 'armorRating',
  'Dodge Rating': 'dodgeRating',
  'Evasion Rating': 'evasionRating',
  'Speed': 'speed',
  'Regen Rating': 'regenRating',
  'Armor Pierce': 'armorPierce',
  'Resistance Pierce': 'resistancePierce',
  'Status Power': 'statusPower',
};

const RESISTANCE_LABEL_TO_TYPE: Record<string, ResistanceType> = {
  'Heat Resistance': 'heat', 'Cold Resistance': 'cold', 'Shock Resistance': 'shock',
  'Poison Resistance': 'poison', 'Bleed Resistance': 'bleed', 'Rot Resistance': 'rot',
};

function emptyStats(): CombatantStats {
  return {
    maxHp: 0, attackPower: 0, meleeAccuracy: 0, rangedAccuracy: 0, defensePower: 0,
    armorRating: 0, critChance: 0, critDamage: BASE_CRIT_DAMAGE, dodgeRating: 0, evasionRating: 0,
    speed: 0, regenRating: 0, armorPierce: 0, resistancePierce: 0, statusPower: 0, statusChance: 0,
    resistances: { heat: 0, cold: 0, shock: 0, poison: 0, bleed: 0, rot: 0 },
  };
}

/**
 * Sums every equipped item's rolled stats (10 PL-contributing slots —
 * CyberDeck/Consumable excluded, same as Character PL itself) into one
 * CombatantStats block. critDamage starts at BASE_CRIT_DAMAGE (150) and
 * gear bonuses add on top, matching §11's "Total = Base + gear bonuses"
 * framing — never summed from zero like every other stat. maxHp is NOT a
 * simple sum; it's computed via computePlayerMaxHp(characterPL,
 * gearMaxHpBonus), so a level of PL is doing real work there, not just gear.
 * Melee/Ranged Reduction bonuses (Chest/Shield) are summed but not applied
 * here — combatFormulas.ts's resolver only reads Armor Rating today; those
 * two stats have nowhere to plug in yet (same placeholder-range caveat
 * flagged in Phase 3 applies here too).
 */
export function computeCombatantStatsFromLoadout(loadout: Loadout): CombatantStats {
  const stats = emptyStats();
  let gearMaxHpBonus = 0;

  for (const slotId of PL_EQUIP_SLOTS) {
    const item = loadout.equippedGear[slotId];
    if (!item) continue;

    for (const stat of item.stats) {
      if (stat.name === 'Max HP') {
        gearMaxHpBonus += stat.value;
        continue;
      }
      if (stat.name === 'Crit Chance') { stats.critChance += stat.value; continue; }
      if (stat.name === 'Crit Damage') { stats.critDamage += stat.value; continue; }
      if (stat.name === 'Status Chance') { stats.statusChance += stat.value; continue; }

      const resistanceType = RESISTANCE_LABEL_TO_TYPE[stat.name];
      if (resistanceType) { stats.resistances[resistanceType] += stat.value; continue; }

      const field = STAT_LABEL_TO_FIELD[stat.name];
      if (field && typeof stats[field] === 'number') {
        (stats[field] as number) += stat.value;
      }
      // Melee/Ranged Reduction Bonus, Elemental Damage: rolled and summed
      // nowhere useful yet — no field to add them to (see doc comment above).
    }
  }

  const characterPL = computePowerLevel(loadout);
  stats.maxHp = computePlayerMaxHp(characterPL, gearMaxHpBonus);

  return stats;
}

/**
 * Melee if the equipped weapon rolled Melee Accuracy, Ranged if it rolled
 * Ranged Accuracy (the exclusive either/or roll from Phase 3). Defaults to
 * melee if no weapon is equipped at all, or a weapon somehow rolled
 * neither (statCount=1 can produce a weapon with no accuracy stat at all
 * on some rarities — a real, if narrow, possibility).
 */
export function getAttackTypeFromLoadout(loadout: Loadout): 'melee' | 'ranged' {
  const weapon = loadout.equippedGear.weapon;
  if (!weapon) return 'melee';
  if (weapon.stats.some(s => s.name === 'Ranged Accuracy')) return 'ranged';
  return 'melee';
}

/**
 * WeaponElement and ResistanceType are DIFFERENT unions with different
 * names for the same underlying damage type on two of six entries (Fire
 * weapon damage is mitigated by Heat Resistance, Lightning by Shock — the
 * flavor-naming split established earlier in the project). A blind cast
 * between them would silently produce the wrong element for exactly those
 * two cases — this is the real, explicit mapping.
 */
const WEAPON_ELEMENT_TO_RESISTANCE_TYPE: Record<WeaponElement, ResistanceType> = {
  fire: 'heat', lightning: 'shock',
  cold: 'cold', bleed: 'bleed', poison: 'poison', rot: 'rot',
};

/** Surfaces the equipped weapon's elemental roll, if any, converted to the matching ResistanceType — undefined for no weapon or a weapon that didn't roll one. */
export function getElementFromLoadout(loadout: Loadout): ResistanceType | undefined {
  const weapon = loadout.equippedGear.weapon;
  const element = weapon?.elementalEffect?.element;
  return element ? WEAPON_ELEMENT_TO_RESISTANCE_TYPE[element] : undefined;
}