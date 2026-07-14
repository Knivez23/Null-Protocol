import type { Schematic } from '../types';
import { GEAR_TYPES, GEAR_TYPE_IDS } from './gearTypes';
import { RARITY_META, RARITY_IDS } from './rarity';

/**
 * Full static schematic catalog — every possible craftable Gear blueprint.
 * 12 Types x 6 Rarities = 72 (CyberDeck added — Combat and Systems Design
 * v2.0). Component costs are flat 0 for now, same "revisit at balance
 * time" placeholder decision made for Null/Bank upgrades earlier — this
 * pass is about item-generation mechanics, not economy balancing.
 */
export const schematics: Schematic[] = RARITY_IDS.flatMap(rarityId =>
  GEAR_TYPE_IDS.map(typeId => {
    const typeMeta = GEAR_TYPES[typeId];
    const rarityMeta = RARITY_META[rarityId];
    return {
      id: `${rarityId}-${typeId}`,
      name: `${rarityMeta.label} ${typeMeta.label}`,
      type: typeId,
      rarity: rarityId,
      artAsset: typeMeta.artAsset,
      components: [],
      creditsToCraft: 0,
      marketPrice: 0,
    };
  })
);