import type { CombatantStats, ResistanceType } from '../types';

// ─────────────────────────────────────────────────────────────
// Combat System Design — Revision 5 (locked). This file implements every
// formula in that document exactly as written. Section numbers below refer
// to that doc.
// ─────────────────────────────────────────────────────────────

// ---- §4: Accuracy, Dodge, and Hit Chance ----

export const HIT_CHANCE_BASE = 50;
export const HIT_CHANCE_MIN = 5;
export const HIT_CHANCE_MAX = 95;
export const EFFECTIVE_VALUE_K = 175;

/** EffectiveValue = Raw × (Raw / (Raw + K)). Same curve for Player and Monster, Accuracy and Dodge — no exceptions. */
export function effectiveValue(raw: number, k: number = EFFECTIVE_VALUE_K): number {
  if (raw <= 0) return 0;
  return raw * (raw / (raw + k));
}

/** HitChance = clamp(50 + EffectiveAccuracy - EffectiveDodge, 5, 95). */
export function computeHitChance(attackerAccuracy: number, defenderDodge: number): number {
  const eff = HIT_CHANCE_BASE + effectiveValue(attackerAccuracy) - effectiveValue(defenderDodge);
  return Math.max(HIT_CHANCE_MIN, Math.min(HIT_CHANCE_MAX, eff));
}

// ---- §5: Raw Damage and Damage Variance ----

export const DAMAGE_VARIANCE_MIN = 0.85;
export const DAMAGE_VARIANCE_MAX = 1.15;

/** RawDamage = AttackPower × random(0.85, 1.15). */
export function rollRawDamage(attackPower: number, rng: () => number = Math.random): number {
  const variance = DAMAGE_VARIANCE_MIN + rng() * (DAMAGE_VARIANCE_MAX - DAMAGE_VARIANCE_MIN);
  return attackPower * variance;
}

// ---- §6: Defense Power Mitigation ----

export const DEFENSE_SCALE = 300;
export const MAX_DEFENSE_MITIGATION = 0.80;

/** DefenseMitigation = min(DefensePower / (DefensePower + DefenseScale), MaxDefenseMitigation). */
export function computeDefenseMitigation(defensePower: number): number {
  if (defensePower <= 0) return 0;
  return Math.min(defensePower / (defensePower + DEFENSE_SCALE), MAX_DEFENSE_MITIGATION);
}

// ---- §7: Armor ----

export const MAX_ARMOR_REDUCTION = 75; // percentage points

/**
 * ArmorReduction — Armor stat is used directly as a percentage, clamped at
 * 75. The design doc never specified a raw-to-% curve for Armor (unlike
 * Defense's explicit DP/(DP+300) formula) — this is an implementation
 * judgment call, not an explicitly locked conversion. Flagged in
 * CombatantStats' own doc comment too.
 */
export function computeArmorReduction(armor: number): number {
  return Math.max(0, Math.min(armor, MAX_ARMOR_REDUCTION)) / 100;
}

// ---- §9: Critical Hits ----

export const MAX_CRIT_CHANCE = 75; // percentage points, shares the cap with Section 16.4

/** Crit Chance is flat additive, NO curve — critChance is already a plain percentage number (e.g. 3.5 = 3.5%). */
export function rollIsCrit(critChance: number, rng: () => number = Math.random): boolean {
  const clamped = Math.max(0, Math.min(critChance, MAX_CRIT_CHANCE));
  return rng() * 100 < clamped;
}

// ---- §10: Resistances — two-stage ----

export interface ResistanceResult {
  negated: boolean;       // Stage 1 succeeded — nothing else happens
  damageMultiplier: number; // Stage 2 result if not negated — (1 - Resistance)
}

/**
 * Stage 1: roll < Resistance% fully negates. Stage 2 (only if Stage 1
 * fails): deterministic (not a second roll) damage/effect reduction.
 */
export function rollResistance(resistance: number, rng: () => number = Math.random): ResistanceResult {
  const clamped = Math.max(0, Math.min(1, resistance));
  if (rng() < clamped) {
    return { negated: true, damageMultiplier: 0 };
  }
  return { negated: false, damageMultiplier: 1 - clamped };
}

// ---- §12: Speed / ATB ----

export const ATB_BASE_INTERVAL = 3.0;
export const ATB_SPEED_K = 300;
export const ATB_MIN_INTERVAL = 1.0;

/** AttackInterval = BaseInterval / (1 + Speed/K), floored at 1.0s. */
export function computeAttackInterval(speed: number): number {
  const raw = ATB_BASE_INTERVAL / (1 + speed / ATB_SPEED_K);
  return Math.max(ATB_MIN_INTERVAL, raw);
}

// ---- §13: Regen ----

/** HealingPerRound = MaxHP × (Regen / 1000). Testing placeholder per the design doc — not confirmed final. */
export function computeRegenPerRound(maxHp: number, regen: number): number {
  return maxHp * (regen / 1000);
}

// ---- §8: Full Physical Attack Formula — orchestrates everything above ----

export interface AttackOutcome {
  hitChance: number;
  hit: boolean;
  crit: boolean;
  damage: number;         // 0 if missed
  defenderHpAfter: number;
}

/**
 * Full attack resolution pipeline, exactly matching design doc §8:
 * HitChance -> RawDamage -> DefenseMitigation -> Armor -> Crit -> floor(1).
 * Does NOT touch Resistances (that's a separate elemental/status pipeline,
 * §10-11) or elemental damage typing — this is the physical-attack path.
 */
export function resolveAttack(
  attacker: CombatantStats,
  defender: CombatantStats,
  defenderCurrentHp: number,
  rng: () => number = Math.random,
): AttackOutcome {
  const hitChance = computeHitChance(attacker.accuracy, defender.dodgeChance);
  const hit = rng() * 100 < hitChance;

  if (!hit) {
    return { hitChance, hit: false, crit: false, damage: 0, defenderHpAfter: defenderCurrentHp };
  }

  const crit = rollIsCrit(attacker.critChance, rng);

  const rawDamage = rollRawDamage(attacker.attackPower, rng);
  const defenseMitigation = computeDefenseMitigation(defender.defense);
  const afterDefense = rawDamage * (1 - defenseMitigation);
  const armorReduction = computeArmorReduction(defender.armor);
  let finalDamage = afterDefense * (1 - armorReduction);

  if (crit) finalDamage *= attacker.critDamageMultiplier;

  finalDamage = Math.max(1, Math.floor(finalDamage));
  const defenderHpAfter = Math.max(0, defenderCurrentHp - finalDamage);

  return { hitChance, hit: true, crit, damage: finalDamage, defenderHpAfter };
}

export type { ResistanceType };