import type { Loadout, GearItem, EquipSlotId, ItemStat } from '../../types';
import { RARITY_COLORS, assetIcon } from '../../data/equipmentVisuals';
import { RARITY_META } from '../../data/rarity';
import { GEAR_TYPES } from '../../data/gearTypes';
import { STAT_DEFS, RESISTANCE_TYPES, getResistanceStatDef } from '../../data/itemStats';
import { unequipSlot } from '../../engine/equipment';
import GearIcon from './GearIcon';

interface ItemDetailsPanelProps {
  loadout: Loadout;
  onChange: (loadout: Loadout) => void;
  selectedItemId: string | null;
  onClearSelection: () => void;
}

function findSelectedItem(loadout: Loadout, id: string | null): { item: GearItem; equippedSlot: EquipSlotId | null } | null {
  if (!id) return null;
  const invItem = loadout.inventory.find(i => i.id === id);
  if (invItem) return { item: invItem, equippedSlot: null };
  for (const slotId of Object.keys(loadout.equippedGear) as EquipSlotId[]) {
    const item = loadout.equippedGear[slotId];
    if (item?.id === id) return { item, equippedSlot: slotId };
  }
  return null;
}

// Reverse label -> Mythic max-value lookup, used only to compute a
// reasonable bar-fill percentage (cosmetic). Rebuilt against the range-based
// StatDef (Combat and Systems Design v2.0) — the old coefficient-based
// version of this table no longer applies, coefficient doesn't exist on
// StatDef anymore.
const STAT_LABEL_TO_MYTHIC_MAX: Record<string, number> = {};
for (const def of Object.values(STAT_DEFS)) STAT_LABEL_TO_MYTHIC_MAX[def.label] = def.ranges.mythic.max;
for (const type of RESISTANCE_TYPES) {
  const def = getResistanceStatDef(type);
  STAT_LABEL_TO_MYTHIC_MAX[def.label] = def.ranges.mythic.max;
}

function estimateBarPct(statName: string, value: number): number {
  const mythicMax = STAT_LABEL_TO_MYTHIC_MAX[statName];
  if (!mythicMax) return 0.5; // unknown stat — shouldn't happen, but don't crash the bar
  return Math.min(1, value / mythicMax);
}

/**
 * Canonical stat display order — Combat and Systems Design v2.0 §4's
 * Offensive/Defensive/Utility/Resistance categorization. Restores a
 * principle from the original item system (two comparable items should
 * always show stats in the same order, or they're hard to compare at a
 * glance) that lapsed when Phase 3 introduced an entirely new stat set
 * with no order carried forward. Unknown names sort last rather than
 * crashing.
 */
const STAT_DISPLAY_ORDER = [
  'Attack Power', 'Melee Accuracy', 'Ranged Accuracy', 'Crit Chance', 'Crit Damage', 'Armor Pierce', 'Resistance Pierce', 'Status Power',
  'Max HP', 'Defense Power', 'Armor Rating', 'Melee Reduction Bonus', 'Ranged Reduction Bonus', 'Dodge Rating', 'Evasion Rating', 'Regen Rating',
  'Speed', 'Status Chance', 'Elemental Damage',
  'Heat Resistance', 'Cold Resistance', 'Shock Resistance', 'Poison Resistance', 'Bleed Resistance', 'Rot Resistance',
];

function sortedStats(stats: ItemStat[]): ItemStat[] {
  return [...stats].sort((a, b) => {
    const ai = STAT_DISPLAY_ORDER.indexOf(a.name);
    const bi = STAT_DISPLAY_ORDER.indexOf(b.name);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

/** isPercentage is set directly on the stat at roll time (Combat and Systems Design v2.0 §5's Rating-vs-Percentage split) — no more guessing from the stat's name. */
function formatStatValue(stat: ItemStat): string {
  return stat.isPercentage ? `+${stat.value}%` : `${stat.value}`;
}

export default function ItemDetailsPanel({ loadout, onChange, selectedItemId, onClearSelection }: ItemDetailsPanelProps) {
  const resolved = findSelectedItem(loadout, selectedItemId);

  if (!resolved) {
    return (
      <div className="panel">
        <div className="panel-head">// Item Details</div>
        <div className="panel-body">
          <p className="item-details-empty">Select an item from your Inventory or Loadout to inspect it.</p>
        </div>
      </div>
    );
  }

  const { item, equippedSlot } = resolved;
  const rarityMeta = RARITY_META[item.rarity];
  const typeMeta = GEAR_TYPES[item.type];
  const rarityColor = RARITY_COLORS[item.rarity];

  const handleUnequip = () => { if (equippedSlot) onChange(unequipSlot(loadout, equippedSlot)); };

  return (
    <div className="panel">
      <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>// Item Details</span>
        <button className="info-modal-close" onClick={onClearSelection} title="Clear selection">✕</button>
      </div>
      <div className="panel-body">
        <div className="item-details-header">
          <div>
            <div className="item-details-name" style={{ color: rarityColor }}>{item.name}</div>
            <div className="item-details-subtitle" style={{ color: rarityColor }}>
              {rarityMeta.label.toUpperCase()} • {typeMeta.label.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="power-value" style={{ fontSize: '17px' }}>◈ {item.powerLevel.toLocaleString()}</div>
            <div className="power-label">Power Level</div>
          </div>
        </div>

        <div className="item-details-columns">
          <div className="item-details-art">
            <div className="item-details-art-frame" style={{ borderColor: rarityColor }}>
              <GearIcon icon={assetIcon(item.artAsset)} size={80} />
            </div>
            <p className="item-details-desc">
              {rarityMeta.label} {typeMeta.label.toLowerCase()}. Sell value: <b style={{ color: 'var(--amber-bright)' }}>{item.marketPrice} cr</b>
            </p>
            {item.elementalEffect && (
              <p className="item-details-desc" style={{ textTransform: 'capitalize', color: 'var(--amber-bright)' }}>
                ⚡ {item.elementalEffect.element} Element
              </p>
            )}
          </div>

          <div className="item-details-stats">
            {item.stats.length === 0 && (
              <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No stat bonuses rolled on this item.</p>
            )}
            {sortedStats(item.stats).map((stat, i) => (
              <div className="item-details-stat-row" key={`${stat.name}-${i}`}>
                <div className="item-details-stat-label"><span>{stat.name}</span><b>{formatStatValue(stat)}</b></div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${estimateBarPct(stat.name, stat.value) * 100}%`, background: rarityColor }} /></div>
              </div>
            ))}
          </div>
        </div>

        {equippedSlot && (
          <div className="item-details-actions">
            <button className="end-turn-btn" style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }} onClick={handleUnequip}>
              Unequip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}