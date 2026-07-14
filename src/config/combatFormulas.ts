import type { CombatantStats, ResistanceType } from '../types';

// ─────────────────────────────────────────────────────────────
// Combat and Systems Design v2.0 (Attributes removed). Fully replaces
// Revision 5's combatFormulas.ts — every formula shape changed, not just
// constants. Section numbers below refer to that doc.
// ─────────────────────────────────────────────────────────────

// ---- §7: Effective Rating Formula ----
// Replaces Revision 5's `Raw x Raw/(Raw+K)` (no ceiling) entirely with a
// bounded-ceiling curve. This is a deliberate, discussed tradeoff — a fixed
// ceiling does compress large raw differences near the top of the curve,
// but at THIS doc's actual stacking-target scale (hundreds to low
// thousands raw) that's an accepted, known cost, not an oversight.

export const RATING_SCALE = 300; // shared by Accuracy, Dodge, Evasion, Armor
export const RATING_CEILING = 100;

/** EffectiveValue = 100 x (RawRating / (RawRating + scale)). */
export function effectiveValue(rawRating: number, scale: number = RATING_SCALE): number {
  if (rawRating <= 0) return 0;
  return RATING_CEILING * (rawRating / (rawRating + scale));
}

// ---- §8: Hit Chance ----

export const HIT_CHANCE_BASE = 50;
export const HIT_CHANCE_MIN = 5;
export const HIT_CHANCE_MAX = 95;

function clampHitChance(raw: number): number {
  return Math.max(HIT_CHANCE_MIN, Math.min(HIT_CHANCE_MAX, raw));
}

/** MeleeHitChance = clamp(50 + EffectiveMeleeAccuracy - EffectiveDodge, 5, 95). */
export function computeMeleeHitChance(attackerMeleeAccuracy: number, defenderDodgeRating: number): number {
  const raw = HIT_CHANCE_BASE + effectiveValue(attackerMeleeAccuracy) - effectiveValue(defenderDodgeRating);
  return clampHitChance(raw);
}

/** RangedHitChance = clamp(50 + EffectiveRangedAccuracy - EffectiveEvasion, 5, 95). */
export function computeRangedHitChance(attackerRangedAccuracy: number, defenderEvasionRating: number): number {
  const raw = HIT_CHANCE_BASE + effectiveValue(attackerRangedAccuracy) - effectiveValue(defenderEvasionRating);
  return clampHitChance(raw);
}

// ---- §9.1: Raw Damage ----

export const DAMAGE_VARIANCE_MIN = 0.85;
export const DAMAGE_VARIANCE_MAX = 1.15;

/** RawDamage = AttackPower x random(0.85, 1.15). */
export function rollRawDamage(attackPower: number, rng: () => number = Math.random): number {
  const variance = DAMAGE_VARIANCE_MIN + rng() * (DAMAGE_VARIANCE_MAX - DAMAGE_VARIANCE_MIN);
  return attackPower * variance;
}

// ---- §9.2: Defense Power ----

export const DEFENSE_SCALE = 750; // raised from Revision 5's 300 to support this doc's larger stat values
export const MAX_DEFENSE_MITIGATION = 0.80;

/** DefenseMitigation = min(DefensePower / (DefensePower + DefenseScale), MaxDefenseMitigation). */
export function computeDefenseMitigation(defensePower: number): number {
  if (defensePower <= 0) return 0;
  return Math.min(defensePower / (defensePower + DEFENSE_SCALE), MAX_DEFENSE_MITIGATION);
}

// ---- §9.3: Armor Rating ----

export const ARMOR_SCALE = 750;
export const MAX_ARMOR_REDUCTION = 0.75;
export const MELEE_ARMOR_RATIO = 1.00;
export const RANGED_ARMOR_RATIO = 0.75;

/** ArmorReduction = min(ArmorRating / (ArmorRating + ArmorScale), MaxArmorReduction). Armor is now a RATING, not a direct percentage (changed from Revision 5). */
export function computeArmorReduction(armorRating: number): number {
  if (armorRating <= 0) return 0;
  return Math.min(armorRating / (armorRating + ARMOR_SCALE), MAX_ARMOR_REDUCTION);
}

export function computeMeleeReduction(armorRating: number): number {
  return computeArmorReduction(armorRating) * MELEE_ARMOR_RATIO;
}

export function computeRangedReduction(armorRating: number): number {
  return computeArmorReduction(armorRating) * RANGED_ARMOR_RATIO;
}

// ---- §10: Armor Pierce and Resistance Pierce ----

export const ARMOR_PIERCE_SCALE = 600;
export const MAX_ARMOR_PIERCE = 0.60;
export const RESISTANCE_PIERCE_SCALE = 600;
export const MAX_RESISTANCE_PIERCE = 0.60;

/** ArmorPiercePercent = min(ArmorPierceRating / (ArmorPierceRating + 600), 0.60). */
export function computeArmorPiercePercent(armorPierceRating: number): number {
  if (armorPierceRating <= 0) return 0;
  return Math.min(armorPierceRating / (armorPierceRating + ARMOR_PIERCE_SCALE), MAX_ARMOR_PIERCE);
}

/** ResistancePiercePercent = min(ResistancePierceRating / (ResistancePierceRating + 600), 0.60). */
export function computeResistancePiercePercent(resistancePierceRating: number): number {
  if (resistancePierceRating <= 0) return 0;
  return Math.min(resistancePierceRating / (resistancePierceRating + RESISTANCE_PIERCE_SCALE), MAX_RESISTANCE_PIERCE);
}

/** EffectiveMeleeReduction / EffectiveRangedReduction = Reduction x (1 - ArmorPiercePercent). */
export function computeEffectiveMeleeReduction(armorRating: number, attackerArmorPierceRating: number): number {
  return computeMeleeReduction(armorRating) * (1 - computeArmorPiercePercent(attackerArmorPierceRating));
}

export function computeEffectiveRangedReduction(armorRating: number, attackerArmorPierceRating: number): number {
  return computeRangedReduction(armorRating) * (1 - computeArmorPiercePercent(attackerArmorPierceRating));
}

// ---- §11: Critical Hits ----

export const MAX_CRIT_CHANCE = 75; // percentage points
export const BASE_CRIT_DAMAGE = 150; // percentage points — the floor every crit starts from before gear bonuses
export const CRIT_DAMAGE_SOFT_CAP = 250; // percentage points — diminishing returns begin here
export const CRIT_DAMAGE_HARD_CAP = 400; // percentage points

/** TotalCritChance = min(sum of gear bonuses, 75). Flat additive, NO curve — unchanged from before. */
export function rollIsCrit(totalCritChance: number, rng: () => number = Math.random): boolean {
  const clamped = Math.max(0, Math.min(totalCritChance, MAX_CRIT_CHANCE));
  return rng() * 100 < clamped;
}

/**
 * Applies the soft/hard cap to a raw (BaseCritDamage + gear bonuses) total.
 * Below 250%: unaffected. Above 250%: half of everything past 250 counts,
 * hard-capped at 400% regardless.
 */
export function computeEffectiveCritDamage(rawCritDamage: number): number {
  if (rawCritDamage <= CRIT_DAMAGE_SOFT_CAP) return rawCritDamage;
  const softened = CRIT_DAMAGE_SOFT_CAP + (rawCritDamage - CRIT_DAMAGE_SOFT_CAP) * 0.5;
  return Math.min(softened, CRIT_DAMAGE_HARD_CAP);
}

/** Converts a percentage crit damage value (e.g. 250) into the actual multiplier (2.5) used against damage. */
export function critDamageToMultiplier(effectiveCritDamage: number): number {
  return effectiveCritDamage / 100;
}

// ---- §12: Resistances and Status Effects ----

/**
 * Resistance scale is presented in the design doc as an explicit CHOICE
 * (300 for stronger resistance, 400 for a slower ramp), not a single locked
 * value. Defaulting to 300 for consistency with every other rating stat —
 * flagging this as a judgment call, not something the doc itself locked.
 */
export const RESISTANCE_SCALE = 300;
export const MAX_RESISTANCE = 0.75;

/** ResistancePercent = min(ResistanceRating / (ResistanceRating + scale), MaxResistance). Resistances are now RATINGS (changed from Revision 5's stored 0-1 fractions). */
export function computeResistancePercent(resistanceRating: number): number {
  if (resistanceRating <= 0) return 0;
  return Math.min(resistanceRating / (resistanceRating + RESISTANCE_SCALE), MAX_RESISTANCE);
}

/** EffectiveResistance = ResistancePercent x (1 - ResistancePiercePercent). Resistance Pierce reduces BOTH the negation roll AND the deterministic reduction below — confirmed from how the doc reuses this same term in both stages. */
export function computeEffectiveResistance(defenderResistanceRating: number, attackerResistancePierceRating: number): number {
  const resistancePercent = computeResistancePercent(defenderResistanceRating);
  const piercePercent = computeResistancePiercePercent(attackerResistancePierceRating);
  return resistancePercent * (1 - piercePercent);
}

export interface ResistanceResult {
  negated: boolean;
  damageMultiplier: number;   // (1 - EffectiveResistance) if not negated
  statusChanceMultiplier: number; // same value, named separately per §12's two parallel formulas
}

/** Stage 1: negation roll using EffectiveResistance (post-pierce). Stage 2 (if not negated): deterministic reduction, also post-pierce. */
export function rollResistance(defenderResistanceRating: number, attackerResistancePierceRating: number, rng: () => number = Math.random): ResistanceResult {
  const effectiveResistance = computeEffectiveResistance(defenderResistanceRating, attackerResistancePierceRating);
  if (rng() * 100 < effectiveResistance * 100) {
    return { negated: true, damageMultiplier: 0, statusChanceMultiplier: 0 };
  }
  const remaining = 1 - effectiveResistance;
  return { negated: false, damageMultiplier: remaining, statusChanceMultiplier: remaining };
}

// ---- §13.1: Speed / ATB ----

export const ATB_BASE_INTERVAL = 3.0;
export const ATB_SPEED_SCALE = 400; // raised from Revision 5's 300
export const ATB_MIN_INTERVAL = 1.0;

/** AttackInterval = max(BaseInterval / (1 + Speed/scale), MinimumInterval). */
export function computeAttackInterval(speed: number): number {
  const raw = ATB_BASE_INTERVAL / (1 + speed / ATB_SPEED_SCALE);
  return Math.max(ATB_MIN_INTERVAL, raw);
}

// ---- §13.2: Regen ----
// Player-only mechanically — monsters carry regenRating=0. Tick timing
// (every 8 seconds, per project correction — the doc text says 3s but
// that was a documentation slip the designer corrected verbally) is an
// ENGINE concern, not a formula concern; this function only computes the
// heal amount for a single tick.

export const REGEN_SCALE = 3000;
export const MAX_REGEN_PERCENT = 0.05;
export const REGEN_TICK_SECONDS = 8;

/** RegenPercent = min(RegenRating / (RegenRating + 3000), 0.05). Heal = MaxHP x RegenPercent, applied once per REGEN_TICK_SECONDS. */
export function computeRegenHeal(maxHp: number, regenRating: number): number {
  if (regenRating <= 0) return 0;
  const regenPercent = Math.min(regenRating / (regenRating + REGEN_SCALE), MAX_REGEN_PERCENT);
  return maxHp * regenPercent;
}

// ---- Health Pool — Player/Monster MaxHP by Power Level ----

export const PLAYER_HP_FACTOR = 2.5;
export const MONSTER_HP_FACTOR = 5;

export type MonsterRole = 'swarm' | 'standard' | 'heavy' | 'elite' | 'miniBoss' | 'boss';

/** Boss is a documented range (8.00-12.00), not a single value — defaulting to 10.00 as the midpoint; callers can override via the optional param for a specific boss's intended weight within that range. */
export const MONSTER_ROLE_MULTIPLIERS: Record<MonsterRole, number> = {
  swarm: 0.45,
  standard: 1.00,
  heavy: 1.40,
  elite: 2.25,
  miniBoss: 4.50,
  boss: 10.00,
};

/** PlayerMaxHP = (CharacterPowerLevel x 2.5) + GearMaxHPBonus. */
export function computePlayerMaxHp(characterPowerLevel: number, gearMaxHpBonus: number): number {
  return characterPowerLevel * PLAYER_HP_FACTOR + gearMaxHpBonus;
}

/** MonsterMaxHP = MapRecommendedPL x 5 x RoleMultiplier. */
export function computeMonsterMaxHp(mapRecommendedPL: number, role: MonsterRole, bossMultiplierOverride?: number): number {
  const multiplier = role === 'boss' && bossMultiplierOverride !== undefined ? bossMultiplierOverride : MONSTER_ROLE_MULTIPLIERS[role];
  return mapRecommendedPL * MONSTER_HP_FACTOR * multiplier;
}

// ---- §14: Full Attack Resolution ----

export interface AttackOutcome {
  hitChance: number;
  hit: boolean;
  crit: boolean;
  damage: number;
  defenderHpAfter: number;
}

/** §14.1 Melee Physical Attack — full pipeline. */
export function resolveMeleeAttack(
  attacker: CombatantStats,
  defender: CombatantStats,
  defenderCurrentHp: number,
  rng: () => number = Math.random,
): AttackOutcome {
  const hitChance = computeMeleeHitChance(attacker.meleeAccuracy, defender.dodgeRating);
  const hit = rng() * 100 < hitChance;
  if (!hit) {
    return { hitChance, hit: false, crit: false, damage: 0, defenderHpAfter: defenderCurrentHp };
  }

  const crit = rollIsCrit(attacker.critChance, rng);

  const rawDamage = rollRawDamage(attacker.attackPower, rng);
  const defenseMitigation = computeDefenseMitigation(defender.defensePower);
  const afterDefense = rawDamage * (1 - defenseMitigation);
  const effectiveMeleeReduction = computeEffectiveMeleeReduction(defender.armorRating, attacker.armorPierce);
  let finalDamage = afterDefense * (1 - effectiveMeleeReduction);

  if (crit) {
    const effectiveCritDamage = computeEffectiveCritDamage(attacker.critDamage);
    finalDamage *= critDamageToMultiplier(effectiveCritDamage);
  }

  finalDamage = Math.max(1, Math.floor(finalDamage));
  const defenderHpAfter = Math.max(0, defenderCurrentHp - finalDamage);
  return { hitChance, hit: true, crit, damage: finalDamage, defenderHpAfter };
}

/** §14.2 Ranged Physical Attack — full pipeline. Identical shape to Melee, different accuracy/avoidance pair and armor ratio. */
export function resolveRangedAttack(
  attacker: CombatantStats,
  defender: CombatantStats,
  defenderCurrentHp: number,
  rng: () => number = Math.random,
): AttackOutcome {
  const hitChance = computeRangedHitChance(attacker.rangedAccuracy, defender.evasionRating);
  const hit = rng() * 100 < hitChance;
  if (!hit) {
    return { hitChance, hit: false, crit: false, damage: 0, defenderHpAfter: defenderCurrentHp };
  }

  const crit = rollIsCrit(attacker.critChance, rng);

  const rawDamage = rollRawDamage(attacker.attackPower, rng);
  const defenseMitigation = computeDefenseMitigation(defender.defensePower);
  const afterDefense = rawDamage * (1 - defenseMitigation);
  const effectiveRangedReduction = computeEffectiveRangedReduction(defender.armorRating, attacker.armorPierce);
  let finalDamage = afterDefense * (1 - effectiveRangedReduction);

  if (crit) {
    const effectiveCritDamage = computeEffectiveCritDamage(attacker.critDamage);
    finalDamage *= critDamageToMultiplier(effectiveCritDamage);
  }

  finalDamage = Math.max(1, Math.floor(finalDamage));
  const defenderHpAfter = Math.max(0, defenderCurrentHp - finalDamage);
  return { hitChance, hit: true, crit, damage: finalDamage, defenderHpAfter };
}

// ---- §15: Elemental and Hybrid Damage ----
// Only the damage-SPLIT math is implemented here — the qualitative status
// effects the doc suggests per element (burn DoT, stun, slow gauge, etc.)
// are NOT implemented. Same scaffolding boundary as statusPower/
// statusChance above: there's no status-effect system to plug into yet.

export const ELEMENTAL_PHYSICAL_PORTION = 0.70;
export const ELEMENTAL_ELEMENTAL_PORTION = 0.30;

export interface ElementalAttackOutcome extends AttackOutcome {
  physicalDamage: number;
  elementalDamage: number;
  elementalNegated: boolean;
}

/**
 * Splits a hit's damage 70/30 physical/elemental. Physical portion is
 * mitigated by Defense + Armor/Melee-or-Ranged Reduction (with Armor
 * Pierce), same as a normal attack. Elemental portion is mitigated by
 * Defense + the matching Resistance (with Resistance Pierce) and bypasses
 * Armor entirely — the mechanic that gives elemental weapons real teeth
 * against high-Armor targets.
 */
export function resolveElementalAttack(
  attacker: CombatantStats,
  defender: CombatantStats,
  defenderCurrentHp: number,
  element: ResistanceType,
  isRanged: boolean,
  rng: () => number = Math.random,
): ElementalAttackOutcome {
  const hitChance = isRanged
    ? computeRangedHitChance(attacker.rangedAccuracy, defender.evasionRating)
    : computeMeleeHitChance(attacker.meleeAccuracy, defender.dodgeRating);
  const hit = rng() * 100 < hitChance;
  if (!hit) {
    return { hitChance, hit: false, crit: false, damage: 0, defenderHpAfter: defenderCurrentHp, physicalDamage: 0, elementalDamage: 0, elementalNegated: false };
  }

  const crit = rollIsCrit(attacker.critChance, rng);
  const rawDamage = rollRawDamage(attacker.attackPower, rng);
  const defenseMitigation = computeDefenseMitigation(defender.defensePower);
  const afterDefense = rawDamage * (1 - defenseMitigation);

  const physicalPortion = afterDefense * ELEMENTAL_PHYSICAL_PORTION;
  const elementalPortion = afterDefense * ELEMENTAL_ELEMENTAL_PORTION;

  const armorRatio = isRanged ? RANGED_ARMOR_RATIO : MELEE_ARMOR_RATIO;
  const armorReduction = computeArmorReduction(defender.armorRating) * armorRatio * (1 - computeArmorPiercePercent(attacker.armorPierce));
  let physicalDamage = physicalPortion * (1 - armorReduction);

  const resistanceResult = rollResistance(defender.resistances[element], attacker.resistancePierce, rng);
  let elementalDamage = resistanceResult.negated ? 0 : elementalPortion * resistanceResult.damageMultiplier;

  let finalDamage = physicalDamage + elementalDamage;
  if (crit) {
    const multiplier = critDamageToMultiplier(computeEffectiveCritDamage(attacker.critDamage));
    finalDamage *= multiplier;
    physicalDamage *= multiplier;
    elementalDamage *= multiplier;
  }

  finalDamage = Math.max(1, Math.floor(finalDamage));
  const defenderHpAfter = Math.max(0, defenderCurrentHp - finalDamage);

  return {
    hitChance, hit: true, crit, damage: finalDamage, defenderHpAfter,
    physicalDamage: Math.floor(physicalDamage), elementalDamage: Math.floor(elementalDamage),
    elementalNegated: resistanceResult.negated,
  };
}