import type { CombatantStats } from '../types';

/**
 * Baseline stats for a newly created character (~PL 50, T1 Scrap loadout).
 *
 * PLACEHOLDER numbers — Stat Scaling (how gear tiers actually translate into
 * exact stat values) is still an open Bible question. These are round,
 * sensible defaults so the Player Panel has real data to render.
 *
 * Updated for Combat System Design Revision 5 — several units genuinely
 * changed meaning here, not just added a field:
 *  - accuracy/dodgeChance: now RAW totals (were 0-1 fractions before). A
 *    small nonzero value here represents the T1 Scrap starting loadout
 *    already contributing a little, not a bare/ungeared character.
 *  - critChance: now a plain percentage number (was a 0-1 fraction).
 *  - armor: NEW stat, didn't exist before this revision.
 *  - speed: same raw number as before, but its role changed — it no longer
 *    represents "minimum needed for 1 attack/round" (that mechanic is
 *    gone), it's just a small ATB interval bonus now (see combatFormulas.ts).
 */
export const playerStartStats: CombatantStats = {
  hp: 120,
  accuracy: 5,
  attackPower: 18,
  defense: 6,
  armor: 5,
  critChance: 2,
  critDamageMultiplier: 1.5,
  dodgeChance: 5,
  speed: 10,
  regen: 12,
  resistances: {
    heat: 0.10,
    cold: 0.10,
    shock: 0.10,
    poison: 0.10,
    bleed: 0.10,
    rot: 0.10,
  },
};