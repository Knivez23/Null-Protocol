import { useState, useMemo } from 'react';
import type { Loadout, GearItem, GearSlotType, EquipSlotId } from '../../types';
import { deleteInventoryItem, unequipSlot } from '../../engine/equipment';
import { RARITY_COLORS, assetIcon } from '../../data/equipmentVisuals';
import { RARITY_IDS } from '../../data/rarity';
import { INVENTORY_BASE_CAPACITY } from '../../config/gameConfig';
import GearIcon from './GearIcon';

interface InventoryPanelProps {
  loadout: Loadout;
  onChange: (loadout: Loadout) => void;
  draggedItem: GearItem | null;
  setDraggedItem: (item: GearItem | null) => void;
  draggedFromSlot: EquipSlotId | null;
  setDraggedFromSlot: (slotId: EquipSlotId | null) => void;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
}

type FilterId = 'all' | 'weapons' | 'armor' | 'accessories' | 'consumables';
type SortMode = 'rarity-desc' | 'rarity-asc' | 'gear-type';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'weapons', label: 'Weapons' },
  { id: 'armor', label: 'Armor' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'consumables', label: 'Consumables' },
];

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'rarity-desc', label: 'Rarity — Descending' },
  { id: 'rarity-asc', label: 'Rarity — Ascending' },
  { id: 'gear-type', label: 'Gear Type' },
];

const ARMOR_TYPES: GearSlotType[] = ['head', 'chest', 'legs', 'hands', 'feet'];
const WEAPON_TYPES: GearSlotType[] = ['weapon', 'offhand'];
const ACCESSORY_TYPES: GearSlotType[] = ['ring', 'amulet'];
const GEAR_TYPE_ORDER: GearSlotType[] = ['head', 'chest', 'legs', 'hands', 'feet', 'weapon', 'offhand', 'ring', 'amulet'];

export default function InventoryPanel({ loadout, onChange, draggedItem, setDraggedItem, draggedFromSlot, setDraggedFromSlot, selectedItemId, onSelect }: InventoryPanelProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [sortMode, setSortMode] = useState<SortMode>('rarity-desc');
  const [trashHover, setTrashHover] = useState(false);

  const handleDragStart = (e: React.DragEvent, item: GearItem) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromSlot(null);
  };

  // Dropping ANYWHERE in the grid (not just an empty cell) unequips, if the
  // drag originated from a Loadout slot. Dropping an inventory item back on
  // itself/another inventory cell is a no-op — draggedFromSlot is null then.
  const handleGridDragOver = (e: React.DragEvent) => {
    if (!draggedItem) return;
    e.preventDefault();
  };

  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedFromSlot) onChange(unequipSlot(loadout, draggedFromSlot));
    setDraggedItem(null);
    setDraggedFromSlot(null);
  };

  const handleTrashDragOver = (e: React.DragEvent) => {
    if (!draggedItem) return;
    e.preventDefault();
    setTrashHover(true);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setTrashHover(false);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) onChange(deleteInventoryItem(loadout, itemId));
    setDraggedItem(null); // same unmount-on-drop risk as equipping — clear explicitly
    setDraggedFromSlot(null);
  };

  const filteredItems = useMemo(() => {
    let items = loadout.inventory;
    if (filter === 'weapons') items = items.filter(i => WEAPON_TYPES.includes(i.slot));
    else if (filter === 'armor') items = items.filter(i => ARMOR_TYPES.includes(i.slot));
    else if (filter === 'accessories') items = items.filter(i => ACCESSORY_TYPES.includes(i.slot));
    else if (filter === 'consumables') items = []; // no consumable items exist yet

    const sorted = [...items];
    if (sortMode === 'rarity-desc') sorted.sort((a, b) => RARITY_IDS.indexOf(b.rarity) - RARITY_IDS.indexOf(a.rarity));
    else if (sortMode === 'rarity-asc') sorted.sort((a, b) => RARITY_IDS.indexOf(a.rarity) - RARITY_IDS.indexOf(b.rarity));
    else if (sortMode === 'gear-type') sorted.sort((a, b) => GEAR_TYPE_ORDER.indexOf(a.slot) - GEAR_TYPE_ORDER.indexOf(b.slot));

    return sorted;
  }, [loadout.inventory, filter, sortMode]);

  const capacityUsed = loadout.inventory.length;
  const capacityPct = Math.min(100, (capacityUsed / INVENTORY_BASE_CAPACITY) * 100);
  const emptySlotCount = Math.max(0, 48 - filteredItems.length); // pad grid with empty placeholders

  return (
    <div className="panel" style={{ minHeight: '500px' }}>
      <div className="panel-head">// Inventory</div>
      <div className="panel-body">
        <div className="inventory-toolbar">
          <div className="inventory-filters">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`inventory-filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select className="schematic-tier-select" value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}>
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        <div className="inventory-grid-scroll" onDragOver={handleGridDragOver} onDrop={handleGridDrop}>
          <div className="inventory-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`inventory-cell filled ${item.id === selectedItemId ? 'selected' : ''}`}
                draggable
                onDragStart={e => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                onClick={() => onSelect(item.id)}
                title={`${item.name} — ${item.rarity} — click to inspect, or drag to a slot`}
                style={{ borderColor: RARITY_COLORS[item.rarity], color: RARITY_COLORS[item.rarity], '--tier-glow': RARITY_COLORS[item.rarity] } as React.CSSProperties}
              >
                <div className="equip-slot-pip" style={{ background: RARITY_COLORS[item.rarity] }} />
                <div className="inventory-cell-icon"><GearIcon icon={assetIcon(item.artAsset)} size={45} /></div>
              </div>
            ))}
            {Array.from({ length: emptySlotCount }).map((_, i) => (
              <div key={`empty-${i}`} className="inventory-cell">+</div>
            ))}
          </div>
        </div>

        <div className="inventory-footer">
          <div className="inventory-capacity-label">
            <span>Inventory Capacity</span>
            <b>{capacityUsed} / {INVENTORY_BASE_CAPACITY}</b>
          </div>
          <div className="bar-track"><div className="bar-fill hp" style={{ width: `${capacityPct}%` }} /></div>
          <div className="inventory-footer-actions">
            <button className="end-turn-btn" style={{ flex: 1 }} disabled title="Not yet implemented">
              Expand Storage 🔒
            </button>
            <div
              className={`inventory-trash ${trashHover ? 'hover' : ''}`}
              onDragOver={handleTrashDragOver}
              onDragLeave={() => setTrashHover(false)}
              onDrop={handleTrashDrop}
              title="Drag an item here to delete it"
            >
              🗑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}