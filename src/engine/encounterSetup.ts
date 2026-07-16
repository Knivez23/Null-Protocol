import type { Loadout } from '../types';
import { createUnit, type CombatUnit } from './combat';
import { computeCombatantStatsFromLoadout, getAttackTypeFromLoadout, getElementFromLoadout } from './combatant';
import { createMonsterStats, MONSTER_ARCHETYPES } from '../data/monsters';
import { computePowerLevel } from './equipment';

/** Builds the player's real CombatUnit from their actual equipped Loadout — real stats, real attack type, real element, all derived from Phase 4's aggregation layer. */
export function buildPlayerUnit(loadout: Loadout): CombatUnit {
  const stats = computeCombatantStatsFromLoadout(loadout);
  const attackType = getAttackTypeFromLoadout(loadout);
  const element = getElementFromLoadout(loadout);
  return createUnit('player', 'Player', true, stats, attackType, element);
}

/** Builds a monster's real CombatUnit from one of Phase 4's archetypes at a given Map Recommended PL. */
export function buildMonsterUnit(archetypeId: string, mapRecommendedPL: number): CombatUnit {
  const archetype = MONSTER_ARCHETYPES[archetypeId];
  const stats = createMonsterStats(archetypeId, mapRecommendedPL);
  return createUnit(archetypeId, archetype.name, false, stats, archetype.attackType, archetype.element);
}

/**
 * The fixed first hand-crafted test encounter: Player vs. Corrupted
 * Sentinel (Standard archetype), at a Map Recommended PL matched to the
 * player's own current Character PL — no map generator exists yet, so
 * "matched to your gear" is achieved directly rather than through a real
 * map-selection flow.
 */
export function buildTestEncounterUnits(loadout: Loadout): { player: CombatUnit; monster: CombatUnit } {
  const characterPL = computePowerLevel(loadout);
  return {
    player: buildPlayerUnit(loadout),
    monster: buildMonsterUnit('corruptedSentinel', characterPL),
  };
}