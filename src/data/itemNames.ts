/** Prefixes for the standard "Prefix-N BaseType" naming pattern, e.g. "Vector-9 Rifle". Add/remove freely. */
export const ITEM_PREFIXES: string[] = [
  'Ghost', 'Fracture', 'Static', 'Wraith', 'Glitch', 'Overclock', 'Backdoor', 'Phantom',
  'Cinder', 'Shard', 'Rogue', 'Havoc', 'Widow', 'Vector', 'Reaper', 'Cascade',
  'Warden', 'Echo', 'Corrupted', 'Blacklight',
];

/**
 * Weapon element -> flavor word bank, used INSTEAD of the generic Prefix
 * pattern when a weapon actually rolls an element — "Searing Rifle," not
 * "Rifle of Heat." Physical (no element rolled) uses the standard
 * ITEM_PREFIXES pool as normal, nothing changes for it.
 */
export const ELEMENT_NAME_PREFIXES: Record<'fire' | 'cold' | 'lightning' | 'bleed' | 'poison' | 'rot', string[]> = {
  fire: ['Searing', 'Scorched', 'Ember', 'Blazing'],
  cold: ['Frost', 'Glacial', 'Rimed', 'Frozen'],
  lightning: ['Voltaic', 'Arcing', 'Storm', 'Fulgent'],
  bleed: ['Rending', 'Serrated', 'Gashing', 'Ripping'],
  poison: ['Venomous', 'Toxic', 'Noxious', 'Caustic'],
  rot: ['Decaying', 'Corroded', 'Blighted', 'Festering'],
};

export interface ManufacturerMeta {
  name: string;
  flavor: string;
}

/**
 * Manufacturer names — used for the "{Manufacturer} {BaseType}" naming
 * pattern on higher-rarity items instead of the generic Prefix-N pattern.
 * `flavor` is descriptive only (not mechanically wired to stat bias yet —
 * that'd be a nice future layer, not part of the current roll formula).
 */
export const MANUFACTURERS: ManufacturerMeta[] = [
  { name: 'Nexus-9', flavor: 'Clean corporate precision engineering.' },
  { name: 'Blackroot', flavor: 'Underground hacker collective, back-alley mods.' },
  { name: 'Ironveil', flavor: 'Heavy industrial armor fabrication.' },
  { name: 'Redline Forge', flavor: 'Aggressive, overclocked, built to hit hard.' },
  { name: 'Spectre Dynamics', flavor: 'Stealth and speed-focused boutique manufacturer.' },
  { name: 'Voidworks', flavor: 'Salvaged from anomalous Fissure-zone tech, unpredictable.' },
  { name: 'Cipher Arms', flavor: 'Precision weaponry for those who work in the dark.' },
  { name: 'Obsidian Systems', flavor: 'Corrupted-tech recyclers, wildcard reliability.' },
];