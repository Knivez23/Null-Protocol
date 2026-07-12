/**
 * Deterministic seeded random number generator (mulberry32).
 *
 * JS's Math.random() cannot be seeded, so anywhere we need "same seed always
 * produces the same result" (map structure generation, map listing names),
 * we use this instead. Math.random() itself is still fine to use for genuinely
 * fresh, session-to-session randomness (e.g. assigning a NEW seed to a map
 * listing slot) — see generateSeed() below.
 */

/** Returns a self-contained RNG function. Same seed -> same infinite sequence, always. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Assigns a fresh, genuinely random seed — used when a new map listing slot needs to be filled. */
export function generateSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/** Convenience: deterministic integer in [min, max] from a seeded RNG instance. */
export function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Convenience: deterministic pick from an array using a seeded RNG instance. */
export function seededPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}