import type { CombatantStats } from '../types';
import { computePlayerMaxHp, BASE_CRIT_DAMAGE } from '../config/combatFormulas';

/**
 * Baseline stats for a newly created character — Combat and Systems Design
 * v2.0. Represents a fresh, essentially ungeared character (a nominal
 * Character PL of 1000 — roughly what 10 Common-rarity items would sum to
 * — with no gear Max HP bonus yet), not a specific T1 loadout snapshot.
 *
 * PLACEHOLDER numbers for every non-HP stat — same caveat as everywhere
 * else in this project: there's no locked "starting competency" spec, just
 * round, reasonable defaults so the Player Panel has real data to render.
 * maxHp is NOT a placeholder — it's computed via the real, locked formula.
 */
const STARTING_CHARACTER_PL = 1000;

export const playerStartStats: CombatantStats = {
  maxHp: computePlayerMaxHp(STARTING_CHARACTER_PL, 0),
  attackPower: 50,
  meleeAccuracy: 35,
  rangedAccuracy: 0,
  defensePower: 35,
  armorRating: 30,
  critChance: 2,
  critDamage: BASE_CRIT_DAMAGE, // no gear bonus yet — just the 150% floor
  dodgeRating: 25,
  evasionRating: 20,
  speed: 15,
  regenRating: 15,
  armorPierce: 0,
  resistancePierce: 0,
  statusPower: 0,
  statusChance: 0,
  resistances: {
    heat: 15, cold: 15, shock: 15, poison: 15, bleed: 15, rot: 15,
  },
};