import type { SectionMeta } from '../types';

export const sections: Record<string, SectionMeta> = {
  encounter: { id: 'encounter', label: 'Encounter',  background: '/backgrounds/null-corridor.webp' },
  abilities: { id: 'abilities', label: 'Abilities',  background: '/backgrounds/null-lab.webp' },
  equipment: { id: 'equipment', label: 'Equipment',  background: '/backgrounds/null-engineering.webp' },
  inventory: { id: 'inventory', label: 'Inventory',  background: '/backgrounds/null-cargo.webp' },
  map:       { id: 'map',       label: 'Sector Map', background: '/backgrounds/null-navroom.webp' },
};