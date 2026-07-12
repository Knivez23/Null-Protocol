import type { GearItem, ItemStat, Schematic, ElementalEffect, WeaponElement } from '../types';
import { RARITY_META, RARITY_IDS } from '../data/rarity';
import { GEAR_TYPES } from '../data/gearTypes';
import { STAT_DEFS, RESISTANCE_TYPES, getResistanceStatDef, type StatDef, type ResistanceType } from '../data/itemStats';
import { ITEM_PREFIXES, MANUFACTURERS, ELEMENT_NAME_PREFIXES } from '../data/itemNames';

function generateItemId(): string {
  return `gear-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// Manufacturer naming ("{Manufacturer} {BaseType}") replaces the generic
// Prefix-N pattern at the top two rarities, for a more "named unique" feel
// on the items that matter most. Judgment call, not explicitly locked —
// easy to adjust the threshold or drop entirely if it doesn't land right.
const MANUFACTURER_NAME_RARITIES = new Set(['legendary', 'mythic']);

export function generateItemName(rarityId: string, gearTypeLabel: string, rng: () => number = Math.random, element?: WeaponElement): string {
  if (MANUFACTURER_NAME_RARITIES.has(rarityId)) {
    // Manufacturer naming already conveys "special" on its own — not
    // layering element flavor on top of it for v1, keeps naming simple.
    const manufacturer = MANUFACTURERS[Math.floor(rng() * MANUFACTURERS.length)];
    return `${manufacturer.name} ${gearTypeLabel}`;
  }
  if (element) {
    // "Searing Rifle," not "Rifle of Heat" — element flavor words replace
    // the generic prefix pool entirely when a weapon actually rolled one.
    const flavorPool = ELEMENT_NAME_PREFIXES[element];
    const prefix = flavorPool[Math.floor(rng() * flavorPool.length)];
    return `${prefix} ${gearTypeLabel}`;
  }
  const prefix = ITEM_PREFIXES[Math.floor(rng() * ITEM_PREFIXES.length)];
  const suffix = Math.floor(rng() * 9) + 1; // 1-9
  return `${prefix}-${suffix} ${gearTypeLabel}`;
}

export function rollPowerLevel(rarityId: string, rng: () => number = Math.random): number {
  const meta = RARITY_META[rarityId as keyof typeof RARITY_META];
  return meta.plMin + Math.floor(rng() * (meta.plMax - meta.plMin + 1));
}

/** A "slot" here is either a regular stat id or a resistance-slot marker — treated uniformly when randomly selecting which stats an item gets. */
type StatSlot = { kind: 'regular'; statId: string } | { kind: 'resistance' };

function buildSlotPool(gearTypeId: string): StatSlot[] {
  const typeMeta = GEAR_TYPES[gearTypeId];
  const slots: StatSlot[] = typeMeta.statPool.map(statId => ({ kind: 'regular', statId }));
  for (let i = 0; i < typeMeta.resistanceSlots; i++) slots.push({ kind: 'resistance' });
  return slots;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Rolls a stat's final value. Multiplicative by construction
 * (coefficient * PL * randomFactor, all strictly positive terms) — this
 * cannot go negative, no clamping-below-zero logic needed. Small hard
 * floor still applied as a belt-and-suspenders safety net.
 */
function rollStatValue(statDef: StatDef, powerLevel: number, rng: () => number): number {
  const randomFactor = 0.85 + rng() * 0.30; // 0.85 - 1.15
  const raw = statDef.coefficient * powerLevel * randomFactor;
  const floor = statDef.isPercentage ? 0.1 : 1;
  const value = Math.max(floor, raw);
  return Math.round(value * 10) / 10; // 1 decimal place — holds both flat numbers and percentages cleanly
}

export function rollItemStats(gearTypeId: string, rarityId: string, powerLevel: number, rng: () => number = Math.random): ItemStat[] {
  const rarityMeta = RARITY_META[rarityId as keyof typeof RARITY_META];
  const slotPool = buildSlotPool(gearTypeId);

  const statCount = rarityMeta.statCountMax === null
    ? slotPool.length // legendary/mythic — all stats in the pool
    : rarityMeta.statCountMin + Math.floor(rng() * (rarityMeta.statCountMax - rarityMeta.statCountMin + 1));

  const chosenSlots = shuffle(slotPool, rng).slice(0, Math.min(statCount, slotPool.length));

  // Resistance slots resolve to random DISTINCT resistance types — no duplicates within one item.
  const availableResistances = shuffle([...RESISTANCE_TYPES], rng) as ResistanceType[];
  let resistanceIndex = 0;

  const stats: ItemStat[] = [];
  for (const slot of chosenSlots) {
    if (slot.kind === 'regular') {
      const def = STAT_DEFS[slot.statId];
      stats.push({ name: def.label, value: rollStatValue(def, powerLevel, rng) });
    } else {
      const resistanceType = availableResistances[resistanceIndex++];
      const def = getResistanceStatDef(resistanceType);
      stats.push({ name: def.label, value: rollStatValue(def, powerLevel, rng) });
    }
  }
  return stats;
}

/** Placeholder sell-value formula — no real economy/balance pass has happened yet, same as everywhere else this has come up. */
function rollMarketPrice(powerLevel: number): number {
  return Math.round(powerLevel * 2.5);
}

const WEAPON_ELEMENTS: WeaponElement[] = ['fire', 'cold', 'lightning'];

/** 3% base, +5% per rarity step (Common=0 -> Mythic=5), per locked design: Common 3% ... Mythic 28%. */
export function getElementalRollChance(rarityId: string): number {
  const index = RARITY_IDS.indexOf(rarityId as (typeof RARITY_IDS)[number]);
  return 0.03 + 0.05 * Math.max(0, index);
}

/**
 * Rolls whether a WEAPON gets an elemental effect — independent of, and on
 * top of, its normal stat roll (doesn't consume a stat slot). Only weapons
 * can roll one; everything else always returns undefined. What the element
 * actually DOES in combat is intentionally left blank — see ElementalEffect.
 */
export function rollElementalEffect(gearTypeId: string, rarityId: string, rng: () => number = Math.random): ElementalEffect | undefined {
  const typeMeta = GEAR_TYPES[gearTypeId];
  if (typeMeta.category !== 'weapon') return undefined;

  const chance = getElementalRollChance(rarityId);
  if (rng() >= chance) return undefined;

  const element = WEAPON_ELEMENTS[Math.floor(rng() * WEAPON_ELEMENTS.length)];
  return { element }; // bonusDamage/statusEffectId/statusChance/statusDuration deliberately left undefined
}

/**
 * The actual craft-time generator. Per the locked design: items are
 * generated randomly WHEN Craft is clicked, not before — the Schematic
 * only determines type and rarity, everything else (name, PL, stats) rolls
 * fresh here.
 */
export function craftItem(schematic: Schematic, rng: () => number = Math.random): GearItem {
  const typeMeta = GEAR_TYPES[schematic.type];
  const powerLevel = rollPowerLevel(schematic.rarity, rng);
  const stats = rollItemStats(schematic.type, schematic.rarity, powerLevel, rng);
  const elementalEffect = rollElementalEffect(schematic.type, schematic.rarity, rng);
  const name = generateItemName(schematic.rarity, typeMeta.label, rng, elementalEffect?.element);

  return {
    id: generateItemId(),
    schematicId: schematic.id,
    type: schematic.type,
    slot: typeMeta.category,
    rarity: schematic.rarity,
    artAsset: schematic.artAsset,
    name,
    powerLevel,
    stats,
    marketPrice: rollMarketPrice(powerLevel),
    elementalEffect,
  };
}