export interface Ability {
  id: number;
  name: string;
  icon: string;
  cost: number;
  cooldownSec: number;
  color: string;
}

export type SectionId = 'character' | 'armory' | 'expedition' | 'salvage-ops' | 'map-room' | 'market' | 'codex';

export interface SectionMeta {
  id: SectionId;
  label: string;
  background: string;
}

export type ComponentTier = 'common' | 'rare' | 'epic';

export interface ComponentMeta {
  id: string;
  name: string;
  tier: ComponentTier;
  description: string;
  icon: string;
  nodeModifierSec: number;
  baseTickYieldMin: number;
  baseTickYieldMax: number;
  globalCap: number;
  overflowRatio: number;
  unlockedFromStart: boolean;
}

export type ResistanceType = 'heat' | 'cold' | 'shock' | 'poison' | 'bleed' | 'rot';

/**
 * The 10 Main Stats — Combat System Design Revision 5 (locked).
 * IMPORTANT — unit conventions, easy to get silently wrong:
 *  - accuracy / dodgeChance: RAW totals summed from gear (e.g. 118), NOT a
 *    0-1 fraction and NOT usable directly in the hit formula. Must pass
 *    through effectiveValue() first (config/combatFormulas.ts) before use.
 *  - critChance: a PLAIN PERCENTAGE NUMBER (e.g. 3.5 means 3.5%), flat
 *    additive from gear, NO curve. Roll: rng()*100 < critChance.
 *  - armor: a PLAIN PERCENTAGE NUMBER (e.g. 35 means 35% physical damage
 *    reduction), clamped at 75. No raw-to-% curve specified in the design
 *    doc beyond the cap — treated as directly usable. Flagged as an
 *    implementation judgment call, not an explicitly locked conversion.
 *  - resistances: 0-1 fraction (e.g. 0.10 = 10%), UNCHANGED from before —
 *    this is the one stat whose stored format didn't change in the redesign.
 *  - defense, attackPower, speed, regen: flat raw numbers, feed their own
 *    named formulas (Sections 6/5/12/13 of the design doc).
 */
export interface CombatantStats {
  hp: number;
  accuracy: number;                // RAW total — see note above, needs effectiveValue()
  attackPower: number;
  defense: number;
  armor: number;                   // percentage number, 0-75 — NEW stat, Revision 5
  critChance: number;              // percentage number, e.g. 3.5 = 3.5%, flat additive, 0-75 cap
  critDamageMultiplier: number;    // e.g. 1.5 = 150%
  dodgeChance: number;             // RAW total — see note above, needs effectiveValue()
  speed: number;
  regen: number;                   // now used mid-combat per-round too (testing placeholder — Revision 5 §13)
  resistances: Record<ResistanceType, number>; // 0-1 chance, UNCHANGED format
}

// NOTE: the old Combatant/AttackResult/RoundResult/EncounterResult types that
// used to live here (sequential-round combat model) were removed — fully
// superseded by CombatUnit/CombatSession/CombatEvent in engine/combat.ts,
// which model the new ATB system instead.

/**
 * A lightweight, unexpanded map entry shown in the Maps sidebar list.
 * Deliberately does NOT contain the actual room tree — that's generated
 * on-demand from `seed` only when the player selects and loads the map.
 * See engine/mapListings.ts.
 */
export interface MapListing {
  id: string;
  seed: number;
  tier: number;             // 1-6, matches MAP_TIERS in gameConfig
  name: string;              // derived deterministically from the seed
  requiredPL: number;        // specific PL requirement for THIS map, rolled within its tier's range
  minPL: number;
  maxPL: number | null;      // null = uncapped (Tier 6 / endgame)
  roomCount: number;
  availableComponents: string[]; // component ids from data/components.ts
  availableSchematics: Schematic[];
  modifiers: MapModifier[];  // 0-2 ambient effects intrinsic to this generated map
  rarity?: MapRarity;        // structurally reserved — Map Rarity is an open idea, not yet locked
}

/** Reserved for the Map Rarity open idea (color-coded tiers) — not yet implemented. */
export type MapRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic' | 'unique';

export type GearSlotType = 'head' | 'chest' | 'legs' | 'hands' | 'feet' | 'weapon' | 'offhand' | 'ring' | 'amulet';

/**
 * Rarity is the SOLE power/quality axis — "Tier" was fully dropped per
 * design lock-in. A schematic's rarity IS the rarity of what it crafts;
 * there's no separate roll. Gates PL range and stat count at craft time.
 */
export type RarityId = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** A single rolled stat bonus on a crafted item. Value is a float — holds both flat numbers and percentages. */
export interface ItemStat {
  name: string;
  value: number;
}

/** One crafting-component requirement on a Schematic. */
export interface SchematicComponentCost {
  componentId: string;
  amount: number;
}

/**
 * A craftable Gear blueprint. Unlocked by finding it, not by crafting it.
 * `type` is fine-grained (e.g. "pistol", "rifle", "helmet") — it doubles as
 * both the equip-slot lookup key AND the art/stat-pool lookup key, via the
 * GEAR_TYPES registry. Two different weapon Types (pistol vs rifle) both
 * map to the same GearSlotType ('weapon') for equip purposes, but resolve
 * to different art and are found as fully separate schematics.
 */
export interface Schematic {
  id: string;
  name: string;           // generic — e.g. "Rare Pistol"
  type: string;            // GearTypeId — see data/gearTypes.ts
  rarity: RarityId;
  artAsset: string;         // the Type's current default art, snapshotted onto crafted items
  components: SchematicComponentCost[];
  creditsToCraft: number;
  marketPrice: number;       // SELL value only — schematics/items are never bought, only sold or traded
}

/**
 * An owned, crafted instance of gear — distinct from Schematic (the
 * blueprint that made it). Generated randomly at craft time, not before:
 * name, powerLevel, and stats are all rolled fresh per the locked
 * item-generation spec, not copied verbatim from the schematic.
 */
/**
 * A weapon's damage element — rolled independently at craft time, low
 * chance, NOT a schematic identity (any Pistol/Rifle/Shotgun can roll one).
 * 'physical' isn't itself rollable — it's just the implicit default when no
 * element rolls (elementalEffect is undefined).
 */
export type WeaponElement = 'fire' | 'cold' | 'lightning';

/**
 * What an elemental roll actually DOES in combat is intentionally
 * undesigned — these fields exist as real scaffolding (the roll itself is
 * fully implemented) but are left empty/undefined on purpose, pending the
 * Ability system where status effects/damage typing gets figured out.
 * `element` is the only field actually populated right now.
 */
export interface ElementalEffect {
  element: WeaponElement;
  bonusDamage?: number;
  statusEffectId?: string;
  statusChance?: number;
  statusDuration?: number;
}

export interface GearItem {
  id: string; // unique owned-instance id
  schematicId: string;
  type: string;         // GearTypeId — fine-grained (e.g. "pistol"), see data/gearTypes.ts
  slot: GearSlotType;    // coarse equip-compat category, derived from type at craft time — kept as its own field so existing equip/drag-drop logic doesn't need to re-derive it every check
  rarity: RarityId;
  artAsset: string;       // snapshotted from the Schematic at craft time — stays frozen even if that Type's default art changes later
  name: string;
  powerLevel: number;      // rolled within the rarity's PL range
  stats: ItemStat[];        // 1-6 entries depending on rarity — see data/gearTypes.ts stat pools
  marketPrice: number;       // SELL value only
  elementalEffect?: ElementalEffect; // weapons only — see ElementalEffect above
}

/**
 * An ambient effect intrinsic to a specific generated map — NOT the same as a
 * player-equipped Global ROM. Named "Map Modifier" specifically to avoid
 * colliding with the existing "Global ROM" tier and the ROM Type="Global"
 * property, both of which already mean something different.
 */
export interface MapModifier {
  id: string;
  name: string;
  description: string;
}

/** A fixed farming location Null can be deployed to — one per Component. */
export interface NodeMeta {
  id: string;
  name: string;
  componentId: string; // references ComponentMeta.id
  unlockedFromStart: boolean;
  flavorText: string;
}

export type NullUpgradeTrackId = 'engine' | 'yield' | 'scanner' | 'storage';

export interface NullUpgradeTrackMeta {
  id: NullUpgradeTrackId;
  name: string;
  description: string;
  icon: string;
}

export type NullStatus = 'idle' | 'farming' | 'cargoFull';

/** Live runtime state for Null — not static data, this changes during play. */
export interface NullState {
  status: NullStatus;
  currentNodeId: string | null;
  onboardCargo: Record<string, number>; // component id -> quantity currently held
  upgradeRanks: Record<NullUpgradeTrackId, number>;
  lastTickAt: number; // timestamp (ms) of the last processed tick
}

/** The player's global storage — the "Resource Bank." */
export type ResourceBank = Record<string, number>; // component id -> quantity banked

/** Per-component Resource Bank capacity upgrade ranks (0-10, see gameConfig). */
export type ResourceBankUpgrades = Record<string, number>; // component id -> rank

// ─────────────────────────────────────────────────────────────
// EQUIPMENT — Gear, ROMs, Loadout
// ─────────────────────────────────────────────────────────────

/**
 * The 12 actual equip slots — distinct from GearSlotType (the 9 item
 * CATEGORIES a Schematic can craft). Ring items fit either ring1 or ring2.
 * cyberdeck/consumable are Utility slots — excluded from PL, per Bible §08.
 */
export type EquipSlotId =
  | 'head' | 'chest' | 'legs' | 'hands' | 'feet'
  | 'weapon' | 'offhand' | 'ring1' | 'ring2' | 'amulet'
  | 'cyberdeck' | 'consumable';

/** The 10 slots that actually count toward Power Level (excludes cyberdeck/consumable). */
export const PL_EQUIP_SLOTS: EquipSlotId[] = [
  'head', 'chest', 'legs', 'hands', 'feet', 'weapon', 'offhand', 'ring1', 'ring2', 'amulet',
];

export type RomTier = 'encounter' | 'global';

/** Placeholder ROM catalog entry — real "ROM Archetypes" design is still an open Bible question. */
export interface RomMeta {
  id: string;
  name: string;
  tier: RomTier;
  icon: string;
  description: string;
}

/** Persistent hub loadout — equipped gear, equipped ROMs, and unequipped inventory. */
export interface Loadout {
  equippedGear: Partial<Record<EquipSlotId, GearItem>>;
  equippedRomIds: string[];
  inventory: GearItem[];
}

export function emptyLoadout(): Loadout {
  return { equippedGear: {}, equippedRomIds: [], inventory: [] };
}

// ─────────────────────────────────────────────────────────────
// PLAYTHROUGHS / SAVE DATA
// ─────────────────────────────────────────────────────────────

/** Lightweight metadata shown on the Landing Page playthrough selector — doesn't require loading the full save. */
export interface PlaythroughMeta {
  id: string;
  characterName: string;
  createdAt: number;
  lastPlayedAt: number;
  powerLevel: number;
}

/**
 * Full save data for one playthrough. Only persists HUB state between
 * sessions (character, Resource Bank, Null, currency, unlocks) — an
 * in-progress map run is NOT persisted; closing mid-run abandons it.
 * Real mid-run persistence is a much harder problem, deferred until
 * room-tree generation exists at all.
 */
export interface PlaythroughSaveData {
  meta: PlaythroughMeta;
  playerStats: CombatantStats;
  resourceBank: ResourceBank;
  resourceBankUpgrades: ResourceBankUpgrades;
  nullState: NullState;
  credits: number;
  loadout: Loadout;
  // Forward-looking fields — schema is ready, but neither is wired into
  // actual gameplay logic yet (Node unlocks are still static data). Populated
  // with sensible defaults on creation; not yet consulted anywhere at runtime.
  nodesUnlocked: string[];
  schematicsUnlocked: string[];
}