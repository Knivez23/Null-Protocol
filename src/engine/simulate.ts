/**
 * SIMULATION HARNESS — Combat and Systems Design v2.0 (ATB engine)
 *
 * Run with: npx tsx src/engine/simulate.ts
 *
 * Runs batches of headless ATB encounters and prints aggregate results.
 *
 * IMPORTANT: stat numbers below are NOT balanced values — item generation
 * (Phase 3) and monster content (Phase 4) haven't been rebuilt for this
 * revision yet. These are round, easy-to-reason-about placeholders purely
 * to exercise the engine mechanics end-to-end — not a balance pass.
 */
import type { CombatantStats } from '../types';
import { createUnit, runToCompletion } from './combat';
import { computePlayerMaxHp, computeMonsterMaxHp, type MonsterRole } from '../config/combatFormulas';

function freshPlayer(characterPL: number): CombatantStats {
  return {
    maxHp: computePlayerMaxHp(characterPL, 0), attackPower: 300, meleeAccuracy: 0, rangedAccuracy: 250,
    defensePower: 100, armorRating: 80, critChance: 12, critDamage: 150, dodgeRating: 0, evasionRating: 120,
    speed: 150, regenRating: 40, armorPierce: 0, resistancePierce: 0, statusPower: 0, statusChance: 0,
    resistances: { heat: 40, cold: 40, shock: 40, poison: 40, bleed: 40, rot: 40 },
  };
}

// PLACEHOLDER scaling — real monster content isn't built yet (Phase 4).
// This exists purely to exercise the engine across a range of difficulty.
function freshMonster(mapPL: number, role: MonsterRole): CombatantStats {
  const scale = mapPL / 500; // rough difficulty knob so higher mapPL produces tougher monsters
  return {
    maxHp: computeMonsterMaxHp(mapPL, role),
    attackPower: Math.round(150 * scale), meleeAccuracy: Math.round(200 * scale), rangedAccuracy: 0,
    defensePower: Math.round(80 * scale), armorRating: Math.round(60 * scale), critChance: 10, critDamage: 150,
    dodgeRating: Math.round(50 * scale), evasionRating: 0, speed: Math.round(80 * scale), regenRating: 0,
    armorPierce: 0, resistancePierce: 0, statusPower: 0, statusChance: 0,
    resistances: { heat: 30, cold: 30, shock: 30, poison: 30, bleed: 30, rot: 30 },
  };
}

function runBatch(n: number, mapPL: number, role: MonsterRole) {
  let playerWins = 0, monsterWins = 0, timeouts = 0;
  let totalDuration = 0, totalPlayerHpOnWin = 0, totalActions = 0, totalRegenTicks = 0;

  for (let i = 0; i < n; i++) {
    const units = [
      createUnit('player', 'Voidstrider', true, freshPlayer(mapPL), 'ranged'),
      createUnit('monster', `${role} monster`, false, freshMonster(mapPL, role), 'melee'),
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
  console.log(`\n--- Map PL ${mapPL} [${role}] — ${n} encounters ---`);
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
  runBatch(BATCH_SIZE, mapPL, 'standard');
}

console.log('\n\n========== BOSS VARIANT (10x role multiplier) ==========');
for (const mapPL of [500, 2000, 6000]) {
  runBatch(BATCH_SIZE, mapPL, 'boss');
}