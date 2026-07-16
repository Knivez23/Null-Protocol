import type { CombatantStats, ResistanceType } from '../types';
import { computeMonsterMaxHp, type MonsterRole } from '../config/combatFormulas';

/**
 * Monster content for the alpha's "2-3 hostile enemies" goal.
 *
 * IMPORTANT SCOPE NOTE: the design doc (Combat and Systems Design v2.0)
 * only specifies a formula for Monster HP (§6/§13 — MapRecommendedPL x 5 x
 * RoleMultiplier). It never specified how a monster's OTHER stats (Attack
 * Power, Accuracy, Defense, etc.) should scale with Map PL — this was
 * explicitly named as still-unsolved ("Hostile Stats/PL" in the project's
 * own list of important-but-open mechanics). HP below uses the real,
 * locked formula. Every other stat uses a placeholder linear-in-mapPL
 * scaling with hand-picked per-role multipliers, chosen to feel
 * archetype-appropriate (Swarm fast/fragile, Elite slow/tanky) — NOT
 * derived from anything locked. Treat every non-HP number here as a
 * starting point for actual balance testing, not a designed value.
 */

export interface MonsterArchetype {
  id: string;
  name: string;
  role: MonsterRole;
  description: string;
  attackType: 'melee' | 'ranged';
  element?: ResistanceType;
}

export const MONSTER_ARCHETYPES: Record<string, MonsterArchetype> = {
  corruptedDrone: {
    id: 'corruptedDrone', name: 'Corrupted Drone', role: 'swarm',
    description: 'Fast, fragile, low individual threat — meant to be fought in numbers.',
    attackType: 'ranged',
  },
  corruptedSentinel: {
    id: 'corruptedSentinel', name: 'Corrupted Sentinel', role: 'standard',
    description: 'Balanced baseline enemy — no strong skew in any direction.',
    attackType: 'melee',
  },
  corruptedEnforcer: {
    id: 'corruptedEnforcer', name: 'Corrupted Enforcer', role: 'elite',
    description: 'Tanky, hard-hitting single-target fight — slower, meant to be fought carefully.',
    attackType: 'melee',
    element: 'shock',
  },
};

/** Cosmetic-only threat label per role — for the Encounter Stage header and Hostile Panel, no mechanical meaning. */
export const ROLE_THREAT_LABEL: Record<MonsterRole, string> = {
  swarm: 'Low', standard: 'Moderate', heavy: 'Elevated', elite: 'High', miniBoss: 'Very High', boss: 'Extreme',
};

/**
 * Placeholder per-role multipliers against a common baseline magnitude
 * (mapRecommendedPL / 5 — chosen so mapPL=500 gives a round baseline of
 * 100, roughly matching a single Rare/Epic-tier gear roll from Phase 3's
 * ranges, a reasonable order-of-magnitude anchor). NOT a locked formula.
 */
const ROLE_STAT_MULTIPLIERS: Record<MonsterRole, {
  attackPower: number; accuracy: number; defensePower: number; armorRating: number;
  dodgeEvasion: number; speed: number; critChance: number; critDamage: number; resistance: number;
}> = {
  swarm:     { attackPower: 0.6, accuracy: 0.8, defensePower: 0.5, armorRating: 0.4, dodgeEvasion: 0.3, speed: 1.3, critChance: 0.5, critDamage: 1.0, resistance: 0.4 },
  standard:  { attackPower: 1.0, accuracy: 1.0, defensePower: 1.0, armorRating: 1.0, dodgeEvasion: 0.6, speed: 1.0, critChance: 1.0, critDamage: 1.0, resistance: 1.0 },
  heavy:     { attackPower: 1.3, accuracy: 0.9, defensePower: 1.4, armorRating: 1.4, dodgeEvasion: 0.5, speed: 0.9, critChance: 0.8, critDamage: 1.1, resistance: 1.2 },
  elite:     { attackPower: 1.6, accuracy: 1.3, defensePower: 1.8, armorRating: 1.7, dodgeEvasion: 0.9, speed: 0.8, critChance: 1.3, critDamage: 1.3, resistance: 1.5 },
  miniBoss:  { attackPower: 2.2, accuracy: 1.5, defensePower: 2.4, armorRating: 2.2, dodgeEvasion: 1.0, speed: 0.9, critChance: 1.5, critDamage: 1.5, resistance: 1.8 },
  boss:      { attackPower: 3.0, accuracy: 1.8, defensePower: 3.2, armorRating: 2.8, dodgeEvasion: 1.1, speed: 1.0, critChance: 1.8, critDamage: 1.8, resistance: 2.2 },
};

const BASE_CRIT_DAMAGE = 150; // matches combatFormulas.ts's BASE_CRIT_DAMAGE — monsters carry the same 150% floor as players

/**
 * Builds a live CombatantStats block for an archetype at a given Map
 * Recommended PL. HP is the real, locked formula. Everything else is the
 * placeholder scaling described above. Monsters never regen (regenRating
 * always 0) and don't equip gear, so there's no separate "gear bonus" path
 * the way players have — this IS the monster's final stat block.
 */
export function createMonsterStats(archetypeId: string, mapRecommendedPL: number, bossMultiplierOverride?: number): CombatantStats {
  const archetype = MONSTER_ARCHETYPES[archetypeId];
  const mult = ROLE_STAT_MULTIPLIERS[archetype.role];
  const baseline = mapRecommendedPL / 5;

  const meleeAcc = archetype.attackType === 'melee' ? baseline * mult.accuracy : 0;
  const rangedAcc = archetype.attackType === 'ranged' ? baseline * mult.accuracy : 0;

  const resistanceValue = Math.round(baseline * mult.resistance * 0.35); // resistances scale gentler than primary stats, same spirit as Phase 3's authored ranges being smaller than Accuracy/Defense
  const resistances: Record<ResistanceType, number> = {
    heat: resistanceValue, cold: resistanceValue, shock: resistanceValue,
    poison: resistanceValue, bleed: resistanceValue, rot: resistanceValue,
  };

  return {
    maxHp: computeMonsterMaxHp(mapRecommendedPL, archetype.role, bossMultiplierOverride),
    attackPower: Math.round(baseline * mult.attackPower),
    meleeAccuracy: Math.round(meleeAcc),
    rangedAccuracy: Math.round(rangedAcc),
    defensePower: Math.round(baseline * mult.defensePower),
    armorRating: Math.round(baseline * mult.armorRating),
    critChance: Math.round(10 * mult.critChance * 10) / 10,
    critDamage: BASE_CRIT_DAMAGE + Math.round(baseline * 0.15 * mult.critDamage),
    dodgeRating: Math.round(baseline * mult.dodgeEvasion),
    evasionRating: Math.round(baseline * mult.dodgeEvasion),
    speed: Math.round(baseline * 0.8 * mult.speed),
    regenRating: 0, // monsters never regen (Combat and Systems Design v2.0 — Player-only mechanic)
    armorPierce: 0,
    resistancePierce: 0,
    statusPower: 0,
    statusChance: 0,
    resistances,
  };
}