import type { RomMeta } from '../types';

/**
 * PLACEHOLDER catalog — just enough real ROMs to make the Equipment page's
 * equip-slot UI functional. Real "ROM Archetypes" design (effects, Accuracy/
 * Power/Duration/Type stat blocks) is still an open Bible question — these
 * are names/flavor only, no mechanical effect wired to any of them yet.
 */
export const roms: RomMeta[] = [
  { id: 'shadow-dash', name: 'Shadow Dash', tier: 'encounter', icon: '➹', description: 'A short-range burst that closes distance instantly.' },
  { id: 'phase-strike', name: 'Phase Strike', tier: 'encounter', icon: '⟁', description: 'A phased attack that briefly ignores incoming counters.' },
  { id: 'null-field', name: 'Null Field', tier: 'encounter', icon: '⬡', description: 'Projects a dampening field, dulling enemy Accuracy nearby.' },
  { id: 'vanish', name: 'Vanish', tier: 'encounter', icon: '≋', description: 'Drops out of System detection for a brief window.' },
  { id: 'execute-protocol', name: 'Execute Protocol', tier: 'global', icon: '◎', description: 'A run-limited finishing strike against critically wounded targets.' },
  { id: 'overload', name: 'Overload', tier: 'global', icon: '▲', description: 'Overdraws power for a devastating single burst — costly, run-limited.' },
];