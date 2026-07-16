import type { Loadout, EquipSlotId, GearItem, GearSlotType } from '../../types';
import { RARITY_COLORS, assetIcon } from '../../data/equipmentVisuals';
import { equipItem, isValidDropSlot, computePowerLevel } from '../../engine/equipment';
import GearIcon from './GearIcon';

interface LoadoutPanelProps {
  loadout: Loadout;
  onChange: (loadout: Loadout) => void;
  draggedItem: GearItem | null;
  setDraggedItem: (item: GearItem | null) => void;
  setDraggedFromSlot: (slotId: EquipSlotId | null) => void;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
}

// CyberDeck joins the left column (beneath Boots) purely for 6+6 visual
// symmetry with the right column now that Consumable sits beneath Amulet —
// it's still its own independent equip slot, not actually grouped with
// armor mechanically.
const LEFT_SLOTS: { id: EquipSlotId; label: string; category: GearSlotType }[] = [
  { id: 'head', label: 'Helmet', category: 'head' },
  { id: 'chest', label: 'Chest', category: 'chest' },
  { id: 'legs', label: 'Legs', category: 'legs' },
  { id: 'hands', label: 'Gloves', category: 'hands' },
  { id: 'feet', label: 'Boots', category: 'feet' },
  { id: 'cyberdeck', label: 'Cyberdeck', category: 'cyberdeck' },
];
const RIGHT_SLOTS: { id: EquipSlotId; label: string; category: GearSlotType }[] = [
  { id: 'weapon', label: 'Primary', category: 'weapon' },
  { id: 'offhand', label: 'Secondary', category: 'offhand' },
  { id: 'ring1', label: 'Ring', category: 'ring' },
  { id: 'ring2', label: 'Ring', category: 'ring' },
  { id: 'amulet', label: 'Talisman', category: 'amulet' },
];

interface SlotBoxProps {
  id: EquipSlotId;
  label: string;
  category: GearSlotType;
  loadout: Loadout;
  draggedItem: GearItem | null;
  setDraggedItem: (item: GearItem | null) => void;
  setDraggedFromSlot: (slotId: EquipSlotId | null) => void;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
  onDropEquip: (item: GearItem, slotId: EquipSlotId) => void;
}

function SlotBox({ id, label, loadout, draggedItem, setDraggedItem, setDraggedFromSlot, selectedItemId, onSelect, onDropEquip }: SlotBoxProps) {
  const item = loadout.equippedGear[id];
  const isValidTarget = draggedItem !== null && isValidDropSlot(draggedItem, id);
  const isSelected = item?.id === selectedItemId;
  const tierStyle = item
    ? ({ borderColor: RARITY_COLORS[item.rarity], color: RARITY_COLORS[item.rarity], '--tier-glow': RARITY_COLORS[item.rarity] } as React.CSSProperties)
    : undefined;

  const handleDragStart = (e: React.DragEvent) => {
    if (!item) return;
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(item);
    setDraggedFromSlot(id);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isValidTarget) return;
    e.preventDefault(); // required to allow a drop at all
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !isValidDropSlot(draggedItem, id)) return; // invalid slot — item stays put
    onDropEquip(draggedItem, id);
    // Clear explicitly rather than relying solely on dragend — the equip
    // causes the source cell to unmount (it moves out of inventory), which
    // can silently swallow the native dragend event and leave stale
    // highlight state stuck on whatever slot was last a valid target.
    setDraggedItem(null);
    setDraggedFromSlot(null);
  };

  return (
    <div
      className={`equip-slot-v2 ${item ? 'filled' : ''} ${isValidTarget ? 'valid-drop-target' : ''} ${isSelected ? 'selected' : ''}`}
      draggable={!!item}
      onClick={() => item && onSelect(item.id)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title={item ? `${item.name} — click to inspect, drag to unequip` : `${label} (empty)`}
      style={tierStyle}
    >
      {item && <div className="equip-slot-pip" style={{ background: RARITY_COLORS[item.rarity] }} />}
      {item && <div className="equip-slot-icon"><GearIcon icon={assetIcon(item.artAsset)} size={39} /></div>}
      <div className="equip-slot-v2-label">{label}</div>
    </div>
  );
}

export default function LoadoutPanel({ loadout, onChange, draggedItem, setDraggedItem, setDraggedFromSlot, selectedItemId, onSelect }: LoadoutPanelProps) {
  const powerLevel = computePowerLevel(loadout);

  const handleDropEquip = (item: GearItem, slotId: EquipSlotId) => onChange(equipItem(loadout, item, slotId));

  return (
    <div className="panel">
      <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>// Loadout</span>
        <span className="loadout-pl-badge">◈ {powerLevel.toLocaleString()} <small>PL</small></span>
      </div>
      <div className="panel-body">
        <div className="loadout-stage">
          <div className="loadout-col">
            {LEFT_SLOTS.map(s => (
              <SlotBox key={s.id} {...s} loadout={loadout} draggedItem={draggedItem} setDraggedItem={setDraggedItem} setDraggedFromSlot={setDraggedFromSlot} selectedItemId={selectedItemId} onSelect={onSelect} onDropEquip={handleDropEquip} />
            ))}
          </div>
          <div className="loadout-character">
            <img src="/character/voidstrider.webp" alt="Character" />
          </div>
          <div className="loadout-col">
            {RIGHT_SLOTS.map(s => (
              <SlotBox key={s.id} {...s} loadout={loadout} draggedItem={draggedItem} setDraggedItem={setDraggedItem} setDraggedFromSlot={setDraggedFromSlot} selectedItemId={selectedItemId} onSelect={onSelect} onDropEquip={handleDropEquip} />
            ))}
            <div className="equip-slot-v2" title="Consumable — not yet implemented">
              <div className="equip-slot-v2-label">Consumable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}