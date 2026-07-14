import type { RarityId } from '../types';

export const RARITY_IDS: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

export interface RarityMeta {
  id: RarityId;
  label: string;
  plMin: number;
  plMax: number;
  statCountMin: number;
  statCountMax: number;
  color: string; // reuses existing theme vars, same 6-color ramp used everywhere else in the app
}

/**
 * Combat and Systems Design v2.0 §18/§20. A real structural change from
 * before: stat counts are now ABSOLUTE numbers for every rarity, the same
 * regardless of which gear type's pool they're drawn from — the old
 * "Legendary/Mythic = ALL of that type's pool" rule (which made stat count
 * vary 3-6 depending on gear type) is gone. A Mythic item always rolls
 * exactly 4 stats now, whether its own pool has 4 possible stats or 7.
 * Uncommon, Epic, and Mythic are FIXED counts (min=max, zero variance) —
 * this also sidesteps a real bug the old wide-range Uncommon (1-3) caused
 * in the previous PL formula.
 */
export const RARITY_META: Record<RarityId, RarityMeta> = {
  common:    { id: 'common',    label: 'Common',    plMin: 100,  plMax: 199,  statCountMin: 1, statCountMax: 2, color: 'var(--text-dim)' },
  uncommon:  { id: 'uncommon',  label: 'Uncommon',   plMin: 200,  plMax: 349,  statCountMin: 2, statCountMax: 2, color: 'var(--green)' },
  rare:      { id: 'rare',      label: 'Rare',       plMin: 350,  plMax: 549,  statCountMin: 2, statCountMax: 3, color: 'var(--cyan)' },
  epic:      { id: 'epic',      label: 'Epic',       plMin: 550,  plMax: 799,  statCountMin: 3, statCountMax: 3, color: 'var(--purple)' },
  legendary: { id: 'legendary', label: 'Legendary',  plMin: 800,  plMax: 1099, statCountMin: 3, statCountMax: 4, color: 'var(--amber)' },
  mythic:    { id: 'mythic',    label: 'Mythic',     plMin: 1100, plMax: 1500, statCountMin: 4, statCountMax: 4, color: 'var(--red)' },
};

/** True for rarities where stat count varies (Common, Rare, Legendary) — feeds the §20 FinalQuality branch (StatCountQuality only applies when this is true). */
export function hasVariableStatCount(rarityId: RarityId): boolean {
  const meta = RARITY_META[rarityId];
  return meta.statCountMin !== meta.statCountMax;
}