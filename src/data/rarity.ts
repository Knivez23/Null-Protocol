import type { RarityId } from '../types';

export const RARITY_IDS: RarityId[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

export interface RarityMeta {
  id: RarityId;
  label: string;
  plMin: number;
  plMax: number;
  statCountMin: number;
  /** null means "all stats in the type's pool" — legendary/mythic. Pool size varies by gear type, so this can't be a fixed number here. */
  statCountMax: number | null;
  color: string; // reuses existing theme vars, same 6-color ramp used everywhere else in the app
}

export const RARITY_META: Record<RarityId, RarityMeta> = {
  common:    { id: 'common',    label: 'Common',    plMin: 5,   plMax: 10,  statCountMin: 1, statCountMax: 2,    color: 'var(--text-dim)' },
  uncommon:  { id: 'uncommon',  label: 'Uncommon',   plMin: 11,  plMax: 25,  statCountMin: 1, statCountMax: 3,    color: 'var(--green)' },
  rare:      { id: 'rare',      label: 'Rare',       plMin: 26,  plMax: 65,  statCountMin: 2, statCountMax: 3,    color: 'var(--cyan)' },
  epic:      { id: 'epic',      label: 'Epic',       plMin: 66,  plMax: 100, statCountMin: 3, statCountMax: 4,    color: 'var(--purple)' },
  legendary: { id: 'legendary', label: 'Legendary',  plMin: 101, plMax: 150, statCountMin: 0, statCountMax: null, color: 'var(--amber)' },
  mythic:    { id: 'mythic',    label: 'Mythic',     plMin: 151, plMax: 200, statCountMin: 0, statCountMax: null, color: 'var(--red)' },
};