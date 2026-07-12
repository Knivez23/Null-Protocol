import type { SectionMeta } from '../types';

export const sections: Record<string, SectionMeta> = {
  character:   { id: 'character',   label: 'Character',    background: '/backgrounds/null-lab.webp' }, // freed up from removed 'abilities' section
  armory:      { id: 'armory',      label: 'Armory',        background: '/backgrounds/null-engineering.webp' },
  expedition:  { id: 'expedition',  label: 'Expedition',    background: '/backgrounds/null-corridor.webp' },
  'salvage-ops': { id: 'salvage-ops', label: 'Salvage Ops', background: '/backgrounds/null-cargo.webp' }, // freed up from removed 'inventory' section — better thematic fit than the old reused engineering shot
  'map-room':  { id: 'map-room',    label: 'Map Room',      background: '/backgrounds/null-navroom.webp' },
  market:      { id: 'market',      label: 'Market',        background: '/backgrounds/null-corridor.webp' }, // reused — no dedicated asset yet
  codex:       { id: 'codex',       label: 'Codex',         background: '/backgrounds/null-engineering.webp' }, // reused — no dedicated asset yet
};