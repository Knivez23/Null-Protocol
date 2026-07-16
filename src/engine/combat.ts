import type { CombatantStats, ResistanceType } from '../types';
import {
  computeAttackInterval, resolveMeleeAttack, resolveRangedAttack, resolveElementalAttack,
  computeRegenHeal, REGEN_TICK_SECONDS,
  type AttackOutcome, type ElementalAttackOutcome,
} from '../config/combatFormulas';

/**
 * ATB combat engine — Combat and Systems Design v2.0. The gauge/session
 * mechanics themselves are unchanged from Revision 5 (independent
 * continuously-filling action gauges, no discrete rounds, no pre-combat
 * initiative roll) — what changed is what happens INSIDE a resolved
 * action, and how Regen is timed.
 *
 * Regen timing changed materially from Revision 5: it no longer fires on
 * each unit's own action ("per round" reinterpreted as "per actor turn").
 * The design doc locks it to a genuine fixed 8-second global clock,
 * player-only — monsters carry regenRating=0 and never heal this way
 * (they can only sustain through Ability effects later, which cost their
 * action — not modeled here, no Ability system exists yet).
 */

export interface CombatUnit {
  id: string;
  name: string;
  isPlayer: boolean;
  stats: CombatantStats;
  currentHp: number;
  gaugeProgress: number; // seconds accumulated toward this unit's own AttackInterval
  attackType: 'melee' | 'ranged'; // determines which hit-chance/reduction formula this unit's attacks use
  element?: ResistanceType; // if set, this unit's attacks resolve via the elemental 70/30 split instead of a pure physical attack
}

export type CombatEvent =
  | { type: 'attack'; attackerId: string; defenderId: string; outcome: AttackOutcome | ElementalAttackOutcome; timestamp: number }
  | { type: 'regen'; unitId: string; healAmount: number; hpAfter: number; timestamp: number };

export interface CombatSession {
  units: CombatUnit[];
  elapsedTime: number;
  events: CombatEvent[];
  isOver: boolean;
  winnerIsPlayer: boolean | null; // null = not over, or a draw (shouldn't normally happen)
  regenTimer: number; // seconds accumulated toward the next fixed 8s regen tick
}

export function createUnit(
  id: string, name: string, isPlayer: boolean, stats: CombatantStats,
  attackType: 'melee' | 'ranged' = 'melee', element?: ResistanceType,
): CombatUnit {
  return { id, name, isPlayer, stats, currentHp: stats.maxHp, gaugeProgress: 0, attackType, element };
}

export function createSession(units: CombatUnit[]): CombatSession {
  return { units, elapsedTime: 0, events: [], isOver: false, winnerIsPlayer: null, regenTimer: 0 };
}

/** Elapsed-seconds-toward-next-action and the full interval, for a UI gauge bar. Shared here (not combatFormulas.ts) to avoid a circular import, since CombatUnit is defined in this file. */
export function getGaugeInfo(unit: CombatUnit): { elapsed: number; interval: number } {
  return { elapsed: unit.gaugeProgress, interval: computeAttackInterval(unit.stats.speed) };
}

function checkVictory(units: CombatUnit[]): boolean | null {
  const playersAlive = units.some(u => u.isPlayer && u.currentHp > 0);
  const enemiesAlive = units.some(u => !u.isPlayer && u.currentHp > 0);
  if (playersAlive && !enemiesAlive) return true;
  if (enemiesAlive && !playersAlive) return false;
  return null; // still ongoing (or, in a degenerate case, both wiped simultaneously)
}

/** Dispatches to the right resolver based on the attacker's attack type and whether they carry an element. */
function resolveUnitAttack(attacker: CombatUnit, defender: CombatUnit, rng: () => number): AttackOutcome | ElementalAttackOutcome {
  if (attacker.element) {
    return resolveElementalAttack(attacker.stats, defender.stats, defender.currentHp, attacker.element, attacker.attackType === 'ranged', rng);
  }
  return attacker.attackType === 'ranged'
    ? resolveRangedAttack(attacker.stats, defender.stats, defender.currentHp, rng)
    : resolveMeleeAttack(attacker.stats, defender.stats, defender.currentHp, rng);
}

/**
 * Advances the session by deltaSeconds.
 *
 * Action gauges: any unit whose gauge fills during this tick acts once —
 * leftover progress carries over rather than being lost, so fast attackers
 * don't lose value to a coarse tick rate.
 *
 * Regen: a single SESSION-WIDE timer (not per-unit) accumulates toward the
 * fixed 8-second tick. When it fires, every living PLAYER unit heals —
 * monsters are skipped entirely, matching the design doc.
 */
export function advanceSession(session: CombatSession, deltaSeconds: number, rng: () => number = Math.random): CombatSession {
  if (session.isOver) return session;

  const units = session.units.map(u => ({ ...u }));
  const events: CombatEvent[] = [...session.events];
  const elapsedTime = session.elapsedTime + deltaSeconds;
  let regenTimer = session.regenTimer + deltaSeconds;

  // Action gauges
  for (const unit of units) {
    if (unit.currentHp <= 0) continue;
    unit.gaugeProgress += deltaSeconds;

    const interval = computeAttackInterval(unit.stats.speed);
    if (unit.gaugeProgress < interval) continue;

    unit.gaugeProgress -= interval; // carry over leftover progress, don't discard it

    const target = units.find(u => u.isPlayer !== unit.isPlayer && u.currentHp > 0);
    if (!target) continue;

    const outcome = resolveUnitAttack(unit, target, rng);
    target.currentHp = outcome.defenderHpAfter;
    events.push({ type: 'attack', attackerId: unit.id, defenderId: target.id, outcome, timestamp: elapsedTime });

    if (target.currentHp <= 0) break; // no point resolving further actions this tick against a dead session
  }

  // Regen — fixed 8s global tick, player-only. Runs independently of the
  // action-gauge loop above; a unit can regen on a tick where they didn't act.
  while (regenTimer >= REGEN_TICK_SECONDS) {
    regenTimer -= REGEN_TICK_SECONDS;
    for (const unit of units) {
      if (!unit.isPlayer || unit.currentHp <= 0 || unit.stats.regenRating <= 0) continue;
      const heal = computeRegenHeal(unit.stats.maxHp, unit.stats.regenRating);
      if (heal <= 0) continue;
      const hpAfter = Math.min(unit.stats.maxHp, unit.currentHp + heal);
      unit.currentHp = hpAfter;
      events.push({ type: 'regen', unitId: unit.id, healAmount: heal, hpAfter, timestamp: elapsedTime });
    }
  }

  const winner = checkVictory(units);
  const isOver = winner !== null;

  return { units, elapsedTime, events, isOver, winnerIsPlayer: winner, regenTimer };
}

/** Runs a full session to completion using fixed time steps — for headless simulation/testing, not real-time UI use. */
export function runToCompletion(units: CombatUnit[], rng: () => number = Math.random, stepSeconds: number = 0.1, maxSeconds: number = 300): CombatSession {
  let session = createSession(units);
  let elapsed = 0;
  while (!session.isOver && elapsed < maxSeconds) {
    session = advanceSession(session, stepSeconds, rng);
    elapsed += stepSeconds;
  }
  return session;
}