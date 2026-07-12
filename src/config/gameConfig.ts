/**
 * GAME CONFIG — single source of truth for every tunable number in Null // Protocol.
 *
 * Rule of thumb: if a formula or system needs a number, that number lives here,
 * not hardcoded inline. Balancing passes should mean editing this file, not
 * hunting through combat/economy logic.
 *
 * Each block is annotated with which Game Bible section it comes from, and
 * flagged PROVISIONAL if the Bible marks it as pending confirmation, or TBD
 * if no number has been locked yet (placeholder value, needs a real pass).
 */

// ─────────────────────────────────────────────────────────────
// OLD COMBAT FORMULAS — REMOVED. Speed/attacks-per-round, the asymmetric
// Player/Monster hit-chance base, flat-subtraction damage, and binary
// resistance were all fully superseded by Combat System Design Revision 5.
// See src/config/combatFormulas.ts for the current, locked implementation.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// TRACE LEVELS — Bible §03 // TRACE LEVELS (locked)
// ─────────────────────────────────────────────────────────────
export const TRACE_LEVELS = [1, 2, 3, 4, 5] as const;
export type TraceLevel = typeof TRACE_LEVELS[number];

export const TRACE_STATUS: Record<TraceLevel, string> = {
  1: "ANOMALY DETECTED",
  2: "PRESENCE CONFIRMED",
  3: "ACTIVE PURSUIT",
  4: "LOCKDOWN INITIATED",
  5: "TERMINATE ON SIGHT",
};

// ─────────────────────────────────────────────────────────────
// TRACE & COMBAT INITIATIVE — Bible §03 // TRACE & COMBAT INITIATIVE (locked v0.7)
// Rolled ONCE before combat begins; fixed for the whole encounter.
// ─────────────────────────────────────────────────────────────
export const TRACE_INITIATIVE_PLAYER_FIRST_CHANCE: Record<TraceLevel, number> = {
  1: 0.90,
  2: 0.70,
  3: 0.50,
  4: 0.30,
  5: 0.10,
};

/** Roll ONCE at combat start. Do not call again mid-encounter. */
export function rollPlayerActsFirst(traceLevel: TraceLevel, rng: () => number = Math.random): boolean {
  return rng() < TRACE_INITIATIVE_PLAYER_FIRST_CHANCE[traceLevel];
}

// ─────────────────────────────────────────────────────────────
// TRACE TRIGGERS — Bible §03 // WHAT RAISES TRACE (shape locked, exact thresholds TBD)
// ─────────────────────────────────────────────────────────────
export const TRACE_TRIGGERS = {
  BACKTRACK: 1,                    // flat TRACE +1 per backtrack action
  MISSED_OPTIONAL_OBJECTIVE: 1,    // flat TRACE +1 per missed objective, per room
  IDLE_TICK_SECONDS: 30,           // TBD — seconds of idle before TRACE +1 ticks
  IDLE_TICK_AMOUNT: 1,
  LONG_ENCOUNTER_ROUND_THRESHOLD: 8, // TBD — TRACE +1 if an encounter exceeds this many rounds
  LONG_ENCOUNTER_TICK_AMOUNT: 1,
  ROOM_TYPE_PASSIVE_TICK: 1,       // certain room types tick this flat amount on entry
} as const;

// ─────────────────────────────────────────────────────────────
// MAP TIERS — difficulty/PL-requirement brackets for MAPS specifically.
// Was formerly GEAR_TIERS and also drove gear Power Level via ptsPerSlot —
// that gear-tier system was fully dropped in favor of Rarity (items now
// roll individual Power Level directly, see engine/itemGeneration.ts).
// This table survives because Map difficulty gating is a genuinely
// separate concept (Bible §02/§08) that still needs a PL-requirement range
// per tier — just stripped down to only what maps still need.
// ─────────────────────────────────────────────────────────────
export const MAP_TIERS = [
  { tier: 1, name: "SCRAP",     mapPLRange: [50, 149] },
  { tier: 2, name: "STREET",    mapPLRange: [150, 349] },
  { tier: 3, name: "RUNNER",    mapPLRange: [350, 699] },
  { tier: 4, name: "CHROME",    mapPLRange: [700, 1199] },
  { tier: 5, name: "GHOST",     mapPLRange: [1200, 1999] },
  { tier: 6, name: "SOVEREIGN", mapPLRange: [2000, Infinity] },
] as const;

// ─────────────────────────────────────────────────────────────
// ROM PL CONTRIBUTION — Bible §08 // ROM PL CONTRIBUTION — PROVISIONAL, likely replaced
// by per-ROM bespoke values. Do not treat these constants as final.
// ─────────────────────────────────────────────────────────────
export const ROM_PL_PROVISIONAL = {
  ENCOUNTER_ROM: 10,
  GLOBAL_ROM: 25,
  NORMAL_ATTACK: 0,
} as const;

/** romScore = (encounterRomCount × 10) + (globalRomCount × 25) — PROVISIONAL FORMULA */
export function getRomScoreProvisional(encounterRomCount: number, globalRomCount: number): number {
  return (encounterRomCount * ROM_PL_PROVISIONAL.ENCOUNTER_ROM) + (globalRomCount * ROM_PL_PROVISIONAL.GLOBAL_ROM);
}

export function getTotalPL(gearScore: number, romScore: number): number {
  return gearScore + romScore;
}

// ─────────────────────────────────────────────────────────────
// UNDERLEVELED REWARD SCALING — Bible §08 // PL GATE PHILOSOPHY — PROPOSED, pending sign-off
// ─────────────────────────────────────────────────────────────
export const COMPONENT_YIELD_BY_TIER_GAP: Record<number, number> = {
  0: 1.0,   // at or above your current PL tier: full yield
  1: 0.5,   // one tier below: 50% yield
  // 2+ tiers below: 0 (see function below)
};

/** tierGap = playerCurrentTier - mapTier (0 = same tier, positive = map is below player) */
export function getComponentYieldMultiplier(tierGap: number): number {
  if (tierGap <= 0) return 1.0;
  return COMPONENT_YIELD_BY_TIER_GAP[tierGap] ?? 0;
}

// ─────────────────────────────────────────────────────────────
// NULL SCAVENGER — Engine tick speed, upgrade ranks (locked)
// ─────────────────────────────────────────────────────────────
export const NULL_ENGINE = {
  BASE_TICK_SECONDS: 5,     // rank 0 — reduced from 8 (yield collapsed to flat 1, so ticks needed to speed up)
  SECONDS_REDUCTION_PER_RANK: 1,
  MAX_RANK: 5,
  MIN_TICK_SECONDS: 1,      // explicit floor — prevents a degenerate 0s/instant tick at max rank
} as const;

/** engineSpeed = max(MIN_TICK_SECONDS, BASE - rank) */
export function getNullEngineSpeed(engineRank: number): number {
  const clampedRank = Math.max(0, Math.min(NULL_ENGINE.MAX_RANK, engineRank));
  const raw = NULL_ENGINE.BASE_TICK_SECONDS - (clampedRank * NULL_ENGINE.SECONDS_REDUCTION_PER_RANK);
  return Math.max(NULL_ENGINE.MIN_TICK_SECONDS, raw);
}

/** effective tick interval = Null's current engine speed + the Node's tier modifier */
export function getEffectiveTickInterval(engineRank: number, nodeModifierSec: number): number {
  return getNullEngineSpeed(engineRank) + nodeModifierSec;
}

export const NULL_UPGRADE_MAX_RANK = 5; // applies to all 4 tracks: Engine, Cargo, Scanner, Storage

/** Null Level = sum of all ranks purchased across all 4 upgrade tracks (0-20) */
export function getNullLevel(engineRank: number, yieldRank: number, scannerRank: number, storageRank: number): number {
  return engineRank + yieldRank + scannerRank + storageRank;
}

// ─────────────────────────────────────────────────────────────
// NULL — YIELD BONUS (chance-based) — LOCKED. Replaces the old flat-multiplier
// "Cargo" formula entirely. Base tick yield is flat 1 for every component
// (see data/components.ts); this rank table creates growth on top of that.
// ─────────────────────────────────────────────────────────────
export interface YieldBonusRank {
  chance: number;
  bonus: number;
}

export const YIELD_BONUS_BY_RANK: Record<number, YieldBonusRank> = {
  0: { chance: 0,    bonus: 0 },
  1: { chance: 0.25, bonus: 1 },
  2: { chance: 0.25, bonus: 2 },
  3: { chance: 0.30, bonus: 2 },
  4: { chance: 0.30, bonus: 3 },
  5: { chance: 0.35, bonus: 3 },
};

/** Rolls whether this tick gets the bonus yield for the given rank. Returns the bonus amount (0 if the roll fails). */
export function rollYieldBonus(rank: number, rng: () => number = Math.random): number {
  const entry = YIELD_BONUS_BY_RANK[rank] ?? YIELD_BONUS_BY_RANK[0];
  return rng() < entry.chance ? entry.bonus : 0;
}

// ─────────────────────────────────────────────────────────────
// NULL — SCANNER UPGRADE (rare find %) — first-pass numbers
// ─────────────────────────────────────────────────────────────
export const NULL_SCANNER = {
  BONUS_CHANCE_PER_RANK: 0.01, // +1%/rank, rank 5 = 5%
} as const;

export function getScannerBonusChance(scannerRank: number): number {
  const clampedRank = Math.max(0, Math.min(NULL_UPGRADE_MAX_RANK, scannerRank));
  return clampedRank * NULL_SCANNER.BONUS_CHANCE_PER_RANK;
}

// ─────────────────────────────────────────────────────────────
// NULL — UPGRADE COSTS — first-pass numbers, per rank purchased (1-5)
// Deliberately draws from the same Component pool as Gear crafting —
// real opportunity cost, not a separate currency sink.
// ─────────────────────────────────────────────────────────────
export interface NullUpgradeCost {
  credits: number;
  components: Record<string, number>; // component id -> quantity
}

export const NULL_UPGRADE_COSTS: NullUpgradeCost[] = [
  { credits: 50, components: { salvage: 20 } },
  { credits: 150, components: { salvage: 40, ferracite: 10 } },
  { credits: 400, components: { ferracite: 60, corvex: 15 } },
  { credits: 900, components: { corvex: 30, plasmite: 10 } },
  { credits: 2000, components: { plasmite: 20, nyxium: 5 } },
];

/** Cost to go FROM currentRank TO currentRank+1. Returns null if already maxed. */
export function getNullUpgradeCost(currentRank: number): NullUpgradeCost | null {
  if (currentRank >= NULL_UPGRADE_MAX_RANK) return null;
  return NULL_UPGRADE_COSTS[currentRank]; // rank 0->1 uses index 0, etc.
}

// ─────────────────────────────────────────────────────────────
// CYBERDECK — fixed placeholder, not yet designed as a real progression item.
// Matches the Bible's own "starter Cyberdeck" numbers exactly (§04, §05).
// ─────────────────────────────────────────────────────────────
export const CYBERDECK_PLACEHOLDER = {
  ENCOUNTER_ROM_SLOTS: 2,
  GLOBAL_ROM_SLOTS: 0, // starter deck has none — Bible: "higher tier decks unlock Global ROM slots"
  PROTOCOL_SLOTS: 2,
} as const;

// ─────────────────────────────────────────────────────────────
// INVENTORY CAPACITY — fixed placeholder. "Expand Storage" is a visual stub
// for now; no upgrade-cost system exists for it yet.
// ─────────────────────────────────────────────────────────────
export const INVENTORY_BASE_CAPACITY = 120;

// ─────────────────────────────────────────────────────────────
// RESOURCE BANK — per-component capacity upgrades. Each of the 8 components
// upgrades independently, 10 ranks, flat +1000 capacity per rank.
// Cost is 0 Credits for every rank for now — real balancing is blocked on
// the Credits economy not being designed yet. Revisit once that exists.
// ─────────────────────────────────────────────────────────────
export const RESOURCE_BANK_UPGRADE = {
  MAX_RANK: 10,
  CAPACITY_PER_RANK: 1000,
} as const;

/** effectiveCap = component's base globalCap + (rank * 1000) */
export function getResourceBankCapacity(baseGlobalCap: number, rank: number): number {
  const clampedRank = Math.max(0, Math.min(RESOURCE_BANK_UPGRADE.MAX_RANK, rank));
  return baseGlobalCap + clampedRank * RESOURCE_BANK_UPGRADE.CAPACITY_PER_RANK;
}

export interface ResourceBankUpgradeCost {
  credits: number;
}

/** TODO: currently flat 0 credits at every rank — pending a real Credits economy pass. */
export function getResourceBankUpgradeCost(currentRank: number): ResourceBankUpgradeCost | null {
  if (currentRank >= RESOURCE_BANK_UPGRADE.MAX_RANK) return null;
  return { credits: 0 };
}

// ─────────────────────────────────────────────────────────────
// NULL ONBOARD CARGO HOLD — capacity before "Recall & Unload" is required
// (Distinct from the player's global Resource Bank per-component caps in data/components.ts)
// Base 1000 — large enough for an overnight collection run without babysitting.
// Flat +200 per Storage rank, capping at 2000 at rank 5.
// ─────────────────────────────────────────────────────────────
export const NULL_ONBOARD_CARGO = {
  BASE_CAPACITY: 1000,
  FLAT_INCREASE_PER_RANK: 200, // rank 5 = 1000 + 5*200 = 2000
} as const;

export function getNullOnboardCapacity(storageRank: number): number {
  const clampedRank = Math.max(0, Math.min(NULL_UPGRADE_MAX_RANK, storageRank));
  return NULL_ONBOARD_CARGO.BASE_CAPACITY + clampedRank * NULL_ONBOARD_CARGO.FLAT_INCREASE_PER_RANK;
}