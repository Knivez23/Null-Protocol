import type { RarityId } from '../types';
import { RARITY_META } from './rarity';

/** Rarity -> accent color, used for rarity pips/borders on gear/schematic cards. Reuses the same 6-color ramp used everywhere else in the app. */
export const RARITY_COLORS: Record<RarityId, string> = {
  common: RARITY_META.common.color,
  uncommon: RARITY_META.uncommon.color,
  rare: RARITY_META.rare.color,
  epic: RARITY_META.epic.color,
  legendary: RARITY_META.legendary.color,
  mythic: RARITY_META.mythic.color,
};

export type SlotIconType = 'image' | 'emoji';

export interface SlotIcon {
  type: SlotIconType;
  value: string;
}

/**
 * Icons for the two Utility slots (Cyberdeck, Consumable) — these live
 * outside the Schematic/GearType system entirely (Cyberdeck is a fixed
 * placeholder, Consumable has no real item system yet), so they're not
 * part of GEAR_TYPES. Everything else now carries its own `artAsset`
 * directly on the Schematic/GearItem — no lookup needed.
 */
export const UTILITY_SLOT_ICONS: Record<'cyberdeck' | 'consumable', SlotIcon> = {
  cyberdeck: { type: 'image', value: '/icons/gear/cyberdeck.webp' },
  consumable: { type: 'image', value: '/icons/gear/consumable-medkit.webp' },
};

/** Wraps a plain art-asset path (from item.artAsset / schematic.artAsset) into the shape GearIcon expects. */
export function assetIcon(path: string): SlotIcon {
  return { type: 'image', value: path };
}