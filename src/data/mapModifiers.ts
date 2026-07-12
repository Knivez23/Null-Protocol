import type { MapModifier } from '../types';

/**
 * Starter pool of ambient effects a generated map can roll. Each map
 * listing seed-picks 0-2 of these — see engine/mapListings.ts.
 * Deliberately named "Map Modifier," not "Global Effect," to avoid
 * colliding with the existing Global ROM tier / ROM Type="Global".
 */
export const mapModifiers: MapModifier[] = [
  { id: 'em-storm', name: 'EM Storm', description: 'Electromagnetic interference reduces Accuracy for all combatants.' },
  { id: 'low-gravity', name: 'Low Gravity Sector', description: 'Reduced structural integrity increases Dodge Chance for all combatants.' },
  { id: 'corrupted-signal', name: 'Corrupted Signal', description: 'System noise accelerates TRACE accumulation throughout this map.' },
  { id: 'ghost-window', name: 'Ghost Window', description: 'A dead zone in System coverage slows TRACE accumulation throughout this map.' },
  { id: 'salvage-rich', name: 'Salvage Rich', description: 'Dense wreckage increases Component yield throughout this map.' },
  { id: 'hostile-overclock', name: 'Hostile Overclock', description: 'Local defense systems grant enemies bonus Attack Power.' },
  { id: 'reinforced-walls', name: 'Reinforced Walls', description: 'Hardened infrastructure grants enemies bonus Defense.' },
  { id: 'unstable-core', name: 'Unstable Core', description: 'A damaged reactor applies a random Resistance debuff to all combatants at map start.' },
];