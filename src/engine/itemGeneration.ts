import type { GearItem, ItemStat, Schematic, ElementalEffect, WeaponElement } from '../types';
import { RARITY_META, RARITY_IDS, hasVariableStatCount } from '../data/rarity';
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
    const manufacturer = MANUFACTURERS[Math.floor(rng() * MANUFACTURERS.length)];
    return `${manufacturer.name} ${gearTypeLabel}`;
  }
  if (element) {
    const flavorPool = ELEMENT_NAME_PREFIXES[element];
    const prefix = flavorPool[Math.floor(rng() * flavorPool.length)];
    return `${prefix} ${gearTypeLabel}`;
  }
  const prefix = ITEM_PREFIXES[Math.floor(rng() * ITEM_PREFIXES.length)];
  const suffix = Math.floor(rng() * 9) + 1; // 1-9
  return `${prefix}-${suffix} ${gearTypeLabel}`;
}

// ─────────────────────────────────────────────────────────────
// Stat rolling — §16/§19. Values roll DIRECTLY from each stat's own
// per-rarity range now, no coefficient/PL-scaling involved at all.
// ─────────────────────────────────────────────────────────────

type StatSlot =
  | { kind: 'regular'; statId: string }
  | { kind: 'resistance' }
  | { kind: 'exclusiveAccuracy' }; // resolves to EITHER meleeAccuracy or rangedAccuracy, 50/50 — Weapon only

function buildSlotPool(gearTypeId: string): StatSlot[] {
  const typeMeta = GEAR_TYPES[gearTypeId];
  const slots: StatSlot[] = typeMeta.statPool.map(statId => ({ kind: 'regular', statId }));
  if (typeMeta.hasResistanceSlot) slots.push({ kind: 'resistance' });
  if (typeMeta.hasExclusiveAccuracyChoice) slots.push({ kind: 'exclusiveAccuracy' });
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

interface RolledStat {
  stat: ItemStat;
  rollQuality: number; // (value - rangeMin) / (rangeMax - rangeMin), 0 = worst possible roll, 1 = best
}

function rollStatFromDef(def: StatDef, rarityId: keyof typeof RARITY_META, rng: () => number): RolledStat {
  const range = def.ranges[rarityId];
  const value = Math.round((range.min + rng() * (range.max - range.min)) * 10) / 10;
  const span = range.max - range.min;
  const rollQuality = span <= 0 ? 1 : (value - range.min) / span; // span=0 (single-value range) can't be improved on — treat as a perfect roll
  return { stat: { name: def.label, value, isPercentage: def.isPercentage }, rollQuality };
}

/** Rolls every stat an item gets, WITH each one's roll quality attached — used both to build the displayed stats and to compute Power Level (§20). */
function rollItemStatsWithQuality(gearTypeId: string, rarityId: keyof typeof RARITY_META, rng: () => number): RolledStat[] {
  const rarityMeta = RARITY_META[rarityId];
  const slotPool = buildSlotPool(gearTypeId);

  const statCount = rarityMeta.statCountMin + Math.floor(rng() * (rarityMeta.statCountMax - rarityMeta.statCountMin + 1));
  const chosenSlots = shuffle(slotPool, rng).slice(0, Math.min(statCount, slotPool.length));

  const availableResistances = shuffle([...RESISTANCE_TYPES], rng) as ResistanceType[];
  let resistanceIndex = 0;

  const rolled: RolledStat[] = [];
  for (const slot of chosenSlots) {
    if (slot.kind === 'regular') {
      rolled.push(rollStatFromDef(STAT_DEFS[slot.statId], rarityId, rng));
    } else if (slot.kind === 'resistance') {
      const resistanceType = availableResistances[resistanceIndex++];
      rolled.push(rollStatFromDef(getResistanceStatDef(resistanceType), rarityId, rng));
    } else {
      // exclusiveAccuracy — 50/50 melee or ranged, never both
      const statId = rng() < 0.5 ? 'meleeAccuracy' : 'rangedAccuracy';
      rolled.push(rollStatFromDef(STAT_DEFS[statId], rarityId, rng));
    }
  }
  return rolled;
}

// ─────────────────────────────────────────────────────────────
// Power Level — §20. Computed FROM the rolled stats, not the reverse.
// ─────────────────────────────────────────────────────────────

/**
 * PowerLevel = round(RarityPLMin + FinalQuality x (RarityPLMax - RarityPLMin))
 * FinalQuality = (AverageRollQuality x 0.75) + (StatCountQuality x 0.25) — only when the rarity has a variable stat count.
 * FinalQuality = AverageRollQuality — otherwise (Uncommon/Epic/Mythic, fixed counts, §18).
 */
export function computePowerLevel(rolledStats: RolledStat[], rarityId: keyof typeof RARITY_META, actualStatCount: number): number {
  const rarityMeta = RARITY_META[rarityId];
  const averageRollQuality = rolledStats.reduce((sum, r) => sum + r.rollQuality, 0) / rolledStats.length;

  let finalQuality: number;
  if (hasVariableStatCount(rarityId)) {
    const statCountQuality = (actualStatCount - rarityMeta.statCountMin) / (rarityMeta.statCountMax - rarityMeta.statCountMin);
    finalQuality = averageRollQuality * 0.75 + statCountQuality * 0.25;
  } else {
    finalQuality = averageRollQuality;
  }

  return Math.round(rarityMeta.plMin + finalQuality * (rarityMeta.plMax - rarityMeta.plMin));
}

/** Placeholder sell-value formula — no real economy/balance pass has happened yet, same as everywhere else this has come up. */
function rollMarketPrice(powerLevel: number): number {
  return Math.round(powerLevel * 0.5);
}

// ─────────────────────────────────────────────────────────────
// Elemental weapon roll — §15. Expanded to all 6 elements (was 3), matching
// all 6 Resistance types 1:1. Roll chance formula unchanged from before.
// ─────────────────────────────────────────────────────────────

const WEAPON_ELEMENTS: WeaponElement[] = ['fire', 'cold', 'lightning', 'bleed', 'poison', 'rot'];

/** 3% base, +5% per rarity step (Common=0 -> Mythic=5): Common 3% ... Mythic 28%. */
export function getElementalRollChance(rarityId: string): number {
  const index = RARITY_IDS.indexOf(rarityId as (typeof RARITY_IDS)[number]);
  return 0.03 + 0.05 * Math.max(0, index);
}

/** Rolls whether a WEAPON gets an elemental effect — independent of, and on top of, its normal stat roll. Only weapons can roll one. What the element actually DOES in combat beyond the damage-split math (combatFormulas.ts resolveElementalAttack) is still undesigned. */
export function rollElementalEffect(gearTypeId: string, rarityId: string, rng: () => number = Math.random): ElementalEffect | undefined {
  const typeMeta = GEAR_TYPES[gearTypeId];
  if (typeMeta.category !== 'weapon') return undefined;

  const chance = getElementalRollChance(rarityId);
  if (rng() >= chance) return undefined;

  const element = WEAPON_ELEMENTS[Math.floor(rng() * WEAPON_ELEMENTS.length)];
  return { element };
}

/**
 * The actual craft-time generator. Items are generated randomly WHEN Craft
 * is clicked, not before — the Schematic only determines type and rarity,
 * everything else (name, stats, Power Level) rolls fresh here. Power Level
 * is computed AFTER stats roll, never the other way around.
 */
export function craftItem(schematic: Schematic, rng: () => number = Math.random): GearItem {
  const typeMeta = GEAR_TYPES[schematic.type];
  const rarityId = schematic.rarity as keyof typeof RARITY_META;

  const rolledStats = rollItemStatsWithQuality(schematic.type, rarityId, rng);
  const powerLevel = computePowerLevel(rolledStats, rarityId, rolledStats.length);
  const stats: ItemStat[] = rolledStats.map(r => r.stat);

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