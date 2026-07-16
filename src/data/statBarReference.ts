/**
 * Cosmetic-only bar-fill reference ceilings, derived from actual gear pool
 * data (source count per stat x that stat's own Mythic per-item max) —
 * NOT a game rule, purely "how full does this look" for a stat bar, same
 * spirit as ItemDetailsPanel's estimateBarPct. A value exceeding its
 * reference just shows a maxed bar, nothing more.
 *
 * Shared between PlayerPanel and HostilePanel specifically so "100% full"
 * means the same thing on both sides of a fight — a monster's Attack Power
 * bar and the player's Attack Power bar are measured against the identical
 * ceiling, even though only one side ever shows the number next to it.
 */
export const STAT_BAR_MAX: Record<string, number> = {
  attackPower: 2700, meleeAccuracy: 1800, rangedAccuracy: 1800, defensePower: 1200,
  armorRating: 1500, dodgeRating: 750, evasionRating: 750, speed: 900,
  regenRating: 450, armorPierce: 1100, resistancePierce: 880,
  critChance: 54, critDamage: 390, statusPower: 440, statusChance: 16,
};

export function statBarPct(statId: string, value: number): number {
  const max = STAT_BAR_MAX[statId];
  if (!max) return 0;
  return Math.min(1, value / max);
}