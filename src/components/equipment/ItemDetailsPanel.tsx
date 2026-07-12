import type { Loadout, GearItem, EquipSlotId } from '../../types';
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

// Reverse label -> coefficient lookup, used only to compute a reasonable
// bar-fill percentage (cosmetic). Built once from the same stat defs the
// roll logic itself uses, so it can't drift out of sync with real balance
// changes — no separately-maintained cap table to go stale.
const STAT_LABEL_TO_COEFFICIENT: Record<string, number> = {};
for (const def of Object.values(STAT_DEFS)) STAT_LABEL_TO_COEFFICIENT[def.label] = def.coefficient;
for (const type of RESISTANCE_TYPES) {
  const def = getResistanceStatDef(type);
  STAT_LABEL_TO_COEFFICIENT[def.label] = def.coefficient;
}
const MYTHIC_MAX_PL = RARITY_META.mythic.plMax;

function estimateBarPct(statName: string, value: number): number {
  const coefficient = STAT_LABEL_TO_COEFFICIENT[statName];
  if (!coefficient) return 0.5; // unknown stat — shouldn't happen, but don't crash the bar
  const theoreticalMax = coefficient * MYTHIC_MAX_PL * 1.15; // top of the random-factor range at max possible PL
  return Math.min(1, value / theoreticalMax);
}

function formatStatValue(statName: string, value: number): string {
  // Percentage stats all end in "Bonus", "Resistance", or "Chance" in their
  // labels — flat stats (Attack Power, Speed, Regen, Defense) don't carry %.
  const isFlat = /^(Attack Power|Speed|Defense|Regen)/.test(statName) && !statName.includes('Bonus');
  return isFlat ? `${value}` : `+${value}%`;
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
            {item.stats.map((stat, i) => (
              <div className="item-details-stat-row" key={`${stat.name}-${i}`}>
                <div className="item-details-stat-label"><span>{stat.name}</span><b>{formatStatValue(stat.name, stat.value)}</b></div>
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