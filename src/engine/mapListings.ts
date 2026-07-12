import type { MapListing, Schematic, MapModifier } from '../types';
import { MAP_TIERS } from '../config/gameConfig';
import { components } from '../data/components';
import { schematics } from '../data/schematics';
import { mapModifiers } from '../data/mapModifiers';
import { RARITY_IDS } from '../data/rarity';
import { mulberry32, generateSeed, seededInt, seededPick } from './rng';

export const MAP_LIST_SIZE = 6; // how many listings are visible at once — adjustable

// Room count range per tier — floor/ceiling both climb with tier.
const ROOM_COUNT_RANGE: Record<number, [number, number]> = {
  1: [6, 10],
  2: [8, 12],
  3: [10, 14],
  4: [12, 16],
  5: [14, 18],
  6: [16, 20],
};

// Codename word pools — matches the existing "SECTOR 07 — VOID FISSURE" naming
// already established in the Topbar. Deterministically combined per-seed below.
const CODENAME_ADJ = [
  'VOID', 'GHOST', 'NULL', 'STATIC', 'CHROME', 'RUST',
  'SHADOW', 'ECHO', 'BROKEN', 'HOLLOW', 'DEAD', 'COLD',
] as const;

const CODENAME_NOUN = [
  'FISSURE', 'CIRCUIT', 'PROTOCOL', 'SIGNAL', 'CONDUIT', 'ARRAY',
  'BREACH', 'NEXUS', 'VEIN', 'CORE', 'GRID', 'SPIRE',
] as const;

/**
 * Derives a listing's display name and sector number purely from its seed —
 * so the same seed always produces the same name, matching what the eventual
 * generated room tree will be. Name generation costs nothing (no room tree
 * built), which is the whole point of keeping listings lightweight.
 */
function deriveMapName(rng: () => number): string {
  const sector = seededInt(rng, 1, 99);
  const adj = seededPick(rng, CODENAME_ADJ);
  const noun = seededPick(rng, CODENAME_NOUN);
  return `SECTOR ${String(sector).padStart(2, '0')} — ${adj} ${noun}`;
}

/** Picks `count` unique random items from an array using a seeded RNG (no repeats). */
function seededSample<T>(rng: () => number, arr: readonly T[], count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

/**
 * Component availability: higher map tiers are more likely to roll Rare/Epic
 * components into their eligible pool, matching progression expectations.
 */
function deriveAvailableComponents(rng: () => number, tier: number): string[] {
  const eligible = components.filter(c => {
    if (c.tier === 'common') return true;
    if (c.tier === 'rare') return tier >= 2;
    if (c.tier === 'epic') return tier >= 4;
    return false;
  });
  const count = seededInt(rng, 3, Math.min(5, eligible.length));
  return seededSample(rng, eligible, count).map(c => c.id);
}

/**
 * Map Tier -> eligible Schematic Rarities. Simple placeholder mapping (Tier
 * N unlocks rarities up to index N-1 in RARITY_IDS) — both are 6-step
 * ladders so this lines up cleanly, but it's a design placeholder, not a
 * balanced curve. Revisit alongside real economy/progression balancing.
 */
function deriveAvailableSchematics(rng: () => number, tier: number): Schematic[] {
  const maxRarityIndex = Math.min(RARITY_IDS.length - 1, tier - 1);
  const eligibleRarities = new Set(RARITY_IDS.slice(0, maxRarityIndex + 1));
  const eligible = schematics.filter(s => eligibleRarities.has(s.rarity));
  const count = seededInt(rng, 2, Math.min(4, eligible.length));
  return seededSample(rng, eligible, count);
}

function deriveModifiers(rng: () => number): MapModifier[] {
  const count = seededInt(rng, 0, 2);
  if (count === 0) return [];
  return seededSample(rng, mapModifiers, count);
}

/** Builds one fresh map listing for the given gear/map tier. */
export function generateMapListing(tier: number): MapListing {
  const seed = generateSeed();
  const rng = mulberry32(seed);

  const tierData = MAP_TIERS.find(t => t.tier === tier);
  const [minPL, rawMaxPL] = tierData?.mapPLRange ?? [0, null];
  const maxPL = rawMaxPL === Infinity ? null : rawMaxPL;

  // Required PL: specific to this map, rolled within its tier's range —
  // not every Tier 3 map shares the identical 350-699 blanket requirement.
  const requiredPL = seededInt(rng, minPL, maxPL ?? minPL + 299);

  const [roomMin, roomMax] = ROOM_COUNT_RANGE[tier] ?? [6, 10];
  const roomCount = seededInt(rng, roomMin, roomMax);

  return {
    id: `map-${seed}`,
    seed,
    tier,
    name: deriveMapName(rng),
    requiredPL,
    minPL,
    maxPL,
    roomCount,
    availableComponents: deriveAvailableComponents(rng, tier),
    availableSchematics: deriveAvailableSchematics(rng, tier),
    modifiers: deriveModifiers(rng),
    // rarity intentionally omitted — see MapRarity note in types/index.ts
  };
}

/**
 * Builds a full list of map listings across the player's unlocked tiers.
 * Distributes roughly evenly across unlocked tiers, biased toward the
 * player's current (highest unlocked) tier.
 */
export function generateMapList(unlockedTiers: number[], listSize: number = MAP_LIST_SIZE): MapListing[] {
  if (unlockedTiers.length === 0) return [];

  const currentTier = Math.max(...unlockedTiers);
  const listings: MapListing[] = [];

  for (let i = 0; i < listSize; i++) {
    // Bias: ~60% of slots at the player's current tier, remainder spread across
    // other unlocked (typically lower) tiers for deliberate farming choices.
    const useCurrentTier = Math.random() < 0.6 || unlockedTiers.length === 1;
    const tier = useCurrentTier
      ? currentTier
      : unlockedTiers[Math.floor(Math.random() * unlockedTiers.length)];

    listings.push(generateMapListing(tier));
  }

  return listings;
}

/**
 * Replaces a single listing slot — call this when a player selects/completes
 * a map, so a fresh one immediately backfills that spot rather than the whole
 * list refreshing on a timer. Keeps the same tier as the listing it replaces.
 */
export function replaceListing(oldListing: MapListing): MapListing {
  return generateMapListing(oldListing.tier);
}
