import type { NullUpgradeTrackMeta } from '../types';

export const nullUpgradeTracks: NullUpgradeTrackMeta[] = [
  { id: 'engine', name: 'Engine', description: 'Reduces tick interval — Null harvests more often.', icon: '⚡' },
  { id: 'yield', name: 'Yield', description: 'Chance per tick to harvest bonus components, scaling with rank.', icon: '📈' },
  { id: 'scanner', name: 'Scanner', description: 'Chance per tick for a Double Drop or a discovery pull from one tier up.', icon: '📡' },
  { id: 'storage', name: 'Storage', description: "Expands Null's onboard cargo hold before a Recall is required.", icon: '🛢️' },
];