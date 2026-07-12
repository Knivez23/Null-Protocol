import type { Loadout, GearItem, EquipSlotId, Schematic } from '../types';
import { PL_EQUIP_SLOTS } from '../types';
import { roms } from '../data/roms';
import { getRomScoreProvisional, getTotalPL } from '../config/gameConfig';
import { craftItem } from './itemGeneration';

/**
 * Crafts a new GearItem from a Schematic and adds it to inventory. The item
 * is generated randomly HERE, at craft time — not before. The Schematic
 * only determines type and rarity; name, Power Level, and stats all roll
 * fresh per the locked item-generation spec. Cost is currently flat 0 —
 * revisit once a real Credits economy exists.
 */
export function craftFromSchematic(loadout: Loadout, schematic: Schematic): Loadout {
  const newItem = craftItem(schematic);
  return { ...loadout, inventory: [...loadout.inventory, newItem] };
}

/**
 * Equips a gear item into a specific slot. Removes the item from wherever
 * it currently lives — inventory OR another equip slot — before placing it,
 * so dragging directly slot-to-slot (e.g. Ring1 -> Ring2) can't duplicate
 * the item. If the target slot already has something, that item returns to
 * inventory (swap, not a silent overwrite/loss).
 */
export function equipItem(loadout: Loadout, item: GearItem, slotId: EquipSlotId): Loadout {
  const currentInSlot = loadout.equippedGear[slotId];
  const newInventory = loadout.inventory.filter(i => i.id !== item.id);

  const newEquippedGear = { ...loadout.equippedGear };
  for (const key of Object.keys(newEquippedGear) as EquipSlotId[]) {
    if (newEquippedGear[key]?.id === item.id) delete newEquippedGear[key];
  }

  if (currentInSlot && currentInSlot.id !== item.id) newInventory.push(currentInSlot);
  newEquippedGear[slotId] = item;

  return { ...loadout, equippedGear: newEquippedGear, inventory: newInventory };
}

/** Sends an equipped item back to inventory, leaving the slot empty. */
export function unequipSlot(loadout: Loadout, slotId: EquipSlotId): Loadout {
  const current = loadout.equippedGear[slotId];
  if (!current) return loadout;

  const newEquipped = { ...loadout.equippedGear };
  delete newEquipped[slotId];

  return {
    ...loadout,
    equippedGear: newEquipped,
    inventory: [...loadout.inventory, current],
  };
}

/** Whether a given GearItem is a legal fit for a given equip slot — rings fit either ring1 or ring2, everything else maps 1:1. */
export function isValidDropSlot(item: GearItem, slotId: EquipSlotId): boolean {
  if (item.slot === 'ring') return slotId === 'ring1' || slotId === 'ring2';
  return item.slot === slotId;
}

/** Permanently removes an item from inventory — e.g. dropped on the trash target. Does not affect equipped gear. */
export function deleteInventoryItem(loadout: Loadout, itemId: string): Loadout {
  return { ...loadout, inventory: loadout.inventory.filter(i => i.id !== itemId) };
}

/** Equips a ROM into an open slot (does not replace — call unequipRom first if the slots are full). */
export function equipRom(loadout: Loadout, romId: string): Loadout {
  if (loadout.equippedRomIds.includes(romId)) return loadout;
  return { ...loadout, equippedRomIds: [...loadout.equippedRomIds, romId] };
}

export function unequipRom(loadout: Loadout, romId: string): Loadout {
  return { ...loadout, equippedRomIds: loadout.equippedRomIds.filter(id => id !== romId) };
}

/**
 * Computes real Power Level from the current Loadout. Gear Score is now a
 * direct SUM of each equipped item's own rolled powerLevel — no more fixed
 * tier-lookup table, since PL is individually rolled per item now (Tier as
 * a mechanical axis was fully dropped in favor of Rarity).
 */
export function computePowerLevel(loadout: Loadout): number {
  const gearScore = PL_EQUIP_SLOTS
    .map(slot => loadout.equippedGear[slot]?.powerLevel ?? 0)
    .reduce((sum, pl) => sum + pl, 0);

  const equippedRoms = loadout.equippedRomIds
    .map(id => roms.find(r => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const encounterCount = equippedRoms.filter(r => r.tier === 'encounter').length;
  const globalCount = equippedRoms.filter(r => r.tier === 'global').length;
  const romScore = getRomScoreProvisional(encounterCount, globalCount);

  return getTotalPL(gearScore, romScore);
}