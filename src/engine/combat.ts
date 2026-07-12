import type { CombatantStats } from '../types';
import { computeAttackInterval, resolveAttack, computeRegenPerRound, type AttackOutcome } from '../config/combatFormulas';

/**
 * ATB combat engine — Combat System Design Revision 5. Fully replaces the
 * old sequential/TRACE-initiative engine (which this file used to contain):
 * no more pre-combat initiative roll, no more discrete "rounds" with a
 * fixed turn order. Each unit has its own continuously-filling action gauge
 * driven by its own Speed; units act independently whenever their gauge is
 * full, regardless of what the other unit is doing.
 */

export interface CombatUnit {
  id: string;
  name: string;
  isPlayer: boolean;
  stats: CombatantStats;
  currentHp: number;
  gaugeProgress: number; // seconds accumulated toward this unit's own AttackInterval
}

export interface CombatEvent {
  type: 'attack';
  attackerId: string;
  defenderId: string;
  outcome: AttackOutcome;
  timestamp: number; // seconds since combat start
}

export interface CombatSession {
  units: CombatUnit[];
  elapsedTime: number;
  events: CombatEvent[];
  isOver: boolean;
  winnerIsPlayer: boolean | null; // null = not over, or a draw (shouldn't normally happen)
}

export function createUnit(id: string, name: string, isPlayer: boolean, stats: CombatantStats): CombatUnit {
  return { id, name, isPlayer, stats, currentHp: stats.hp, gaugeProgress: 0 };
}

export function createSession(units: CombatUnit[]): CombatSession {
  return { units, elapsedTime: 0, events: [], isOver: false, winnerIsPlayer: null };
}

function pickTarget(units: CombatUnit[], attacker: CombatUnit): CombatUnit | null {
  const aliveOpponents = units.filter(u => u.isPlayer !== attacker.isPlayer && u.currentHp > 0);
  return aliveOpponents[0] ?? null; // simple "first alive opponent" — no multi-target/targeting logic yet
}

function checkVictory(units: CombatUnit[]): boolean | null {
  const playersAlive = units.some(u => u.isPlayer && u.currentHp > 0);
  const enemiesAlive = units.some(u => !u.isPlayer && u.currentHp > 0);
  if (playersAlive && !enemiesAlive) return true;
  if (enemiesAlive && !playersAlive) return false;
  return null; // still ongoing (or, in a degenerate case, both wiped simultaneously)
}

/**
 * Advances the session by deltaSeconds. Any unit whose gauge fills during
 * this tick acts (once — if deltaSeconds is large enough to fill a gauge
 * more than once, only the first action fires this tick; the leftover
 * progress carries over rather than being lost, so fast attackers don't
 * lose value to a coarse tick rate).
 *
 * Regen (§13) fires on EACH unit's own action, not on a fixed global
 * "round" — ATB has no discrete rounds anymore, so "per round" is
 * interpreted as "per that unit's own action cycle." This is an
 * interpretation, not an explicit part of the locked formula — the design
 * doc itself flags Regen's ATB behavior as still being worked out.
 */
export function advanceSession(session: CombatSession, deltaSeconds: number, rng: () => number = Math.random): CombatSession {
  if (session.isOver) return session;

  const units = session.units.map(u => ({ ...u }));
  const events: CombatEvent[] = [...session.events];
  const elapsedTime = session.elapsedTime + deltaSeconds;

  for (const unit of units) {
    if (unit.currentHp <= 0) continue;
    unit.gaugeProgress += deltaSeconds;

    const interval = computeAttackInterval(unit.stats.speed);
    if (unit.gaugeProgress < interval) continue;

    unit.gaugeProgress -= interval; // carry over leftover progress, don't discard it

    const target = pickTarget(units, unit);
    if (!target) continue;

    const outcome = resolveAttack(unit.stats, target.stats, target.currentHp, rng);
    target.currentHp = outcome.defenderHpAfter;
    events.push({ type: 'attack', attackerId: unit.id, defenderId: target.id, outcome, timestamp: elapsedTime });

    // Regen fires on the actor's own turn, per the interpretation above.
    if (unit.currentHp > 0 && unit.stats.regen > 0) {
      const heal = computeRegenPerRound(unit.stats.hp, unit.stats.regen);
      unit.currentHp = Math.min(unit.stats.hp, unit.currentHp + heal);
    }

    if (target.currentHp <= 0) break; // no point resolving further actions this tick against a dead session
  }

  const winner = checkVictory(units);
  const isOver = winner !== null;

  return { units, elapsedTime, events, isOver, winnerIsPlayer: winner };
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