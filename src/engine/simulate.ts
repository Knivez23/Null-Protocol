/**
 * SIMULATION HARNESS — Combat and Systems Design v2.0 (ATB engine)
 *
 * Run with: npx tsx src/engine/simulate.ts
 *
 * Runs batches of headless ATB encounters and prints aggregate results.
 *
 * IMPORTANT: player stats below are hand-picked, not from real crafted
 * gear — see engine/combatant.ts for the real Loadout-to-CombatantStats
 * path. Monster content is real (data/monsters.ts) but its non-HP stat
 * scaling is explicitly flagged there as placeholder, not a locked
 * formula — this exercises the engine mechanics, it is not a balance pass.
 */
import type { CombatantStats } from '../types';
import { createUnit, runToCompletion } from './combat';
import { computePlayerMaxHp } from '../config/combatFormulas';
import { createMonsterStats, MONSTER_ARCHETYPES } from '../data/monsters';

function freshPlayer(characterPL: number): CombatantStats {
  return {
    maxHp: computePlayerMaxHp(characterPL, 0), attackPower: 300, meleeAccuracy: 0, rangedAccuracy: 250,
    defensePower: 100, armorRating: 80, critChance: 12, critDamage: 150, dodgeRating: 0, evasionRating: 120,
    speed: 150, regenRating: 40, armorPierce: 0, resistancePierce: 0, statusPower: 0, statusChance: 0,
    resistances: { heat: 40, cold: 40, shock: 40, poison: 40, bleed: 40, rot: 40 },
  };
}

function runBatch(n: number, mapPL: number, archetypeId: string) {
  const archetype = MONSTER_ARCHETYPES[archetypeId];
  let playerWins = 0, monsterWins = 0, timeouts = 0;
  let totalDuration = 0, totalPlayerHpOnWin = 0, totalActions = 0, totalRegenTicks = 0;

  for (let i = 0; i < n; i++) {
    const units = [
      createUnit('player', 'Voidstrider', true, freshPlayer(mapPL), 'ranged'),
      createUnit('monster', archetype.name, false, createMonsterStats(archetypeId, mapPL), archetype.attackType, archetype.element),
    ];
    const session = runToCompletion(units);
    totalDuration += session.elapsedTime;
    totalActions += session.events.filter(e => e.type === 'attack').length;
    totalRegenTicks += session.events.filter(e => e.type === 'regen').length;

    if (session.winnerIsPlayer === true) {
      playerWins++;
      totalPlayerHpOnWin += session.units.find(u => u.id === 'player')!.currentHp;
    } else if (session.winnerIsPlayer === false) {
      monsterWins++;
    } else {
      timeouts++; // hit the 300s safety cap without resolving
    }
  }

  const playerMaxHp = computePlayerMaxHp(mapPL, 0);
  console.log(`\n--- Map PL ${mapPL} [${archetype.name}, ${archetype.role}] — ${n} encounters ---`);
  console.log(`Player win rate:  ${((playerWins / n) * 100).toFixed(1)}%`);
  console.log(`Monster win rate: ${((monsterWins / n) * 100).toFixed(1)}%`);
  console.log(`Timeouts (300s safety cap): ${timeouts}`);
  console.log(`Avg encounter duration: ${(totalDuration / n).toFixed(1)}s`);
  console.log(`Avg attacks per encounter: ${(totalActions / n).toFixed(1)}`);
  console.log(`Avg regen ticks per encounter: ${(totalRegenTicks / n).toFixed(1)}`);
  if (playerWins > 0) {
    console.log(`Avg player HP remaining on win: ${(totalPlayerHpOnWin / playerWins).toFixed(0)} / ${playerMaxHp.toFixed(0)}`);
  }
}

const BATCH_SIZE = 1000;
console.log(`Simulating ${BATCH_SIZE} encounters per Map PL using the ATB engine (Combat and Systems Design v2.0).`);

for (const mapPL of [500, 2000, 6000]) {
  runBatch(BATCH_SIZE, mapPL, 'corruptedSentinel');
}

console.log('\n\n========== ELITE VARIANT ==========');
for (const mapPL of [500, 2000, 6000]) {
  runBatch(BATCH_SIZE, mapPL, 'corruptedEnforcer');
}