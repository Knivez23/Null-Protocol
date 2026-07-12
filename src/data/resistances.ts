import type { ResistanceType } from '../types';

export interface ResistanceMeta {
  key: ResistanceType;
  label: string;
  icon: string;
}

// Icons are literal emoji for instant recognizability (flame, snowflake, etc).
// NOTE: emoji render in their own fixed native colors and can't be recolored
// via CSS — the per-resistance color coding lives on the hex badge itself
// (see .resist-hex.<key> in global.css), not on the icon glyph.
export const resistanceMeta: ResistanceMeta[] = [
  { key: 'heat', label: 'Heat', icon: '🔥' },
  { key: 'cold', label: 'Cold', icon: '❄️' },
  { key: 'shock', label: 'Shock', icon: '⚡' },
  { key: 'poison', label: 'Poison', icon: '☣️' },
  { key: 'bleed', label: 'Bleed', icon: '🩸' },
  { key: 'rot', label: 'Rot', icon: '💀' },
];