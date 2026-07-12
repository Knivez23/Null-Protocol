import { useState } from 'react';
import type { Loadout, ResourceBank, ResourceBankUpgrades, GearItem, EquipSlotId } from '../../types';
import LoadoutPanel from './LoadoutPanel';
import InventoryPanel from './InventoryPanel';
import ResourcesPanel from './ResourcesPanel';
import SchematicsPanel from './SchematicsPanel';
import ItemDetailsPanel from './ItemDetailsPanel';

interface EquipmentScreenProps {
  loadout: Loadout;
  setLoadout: (loadout: Loadout) => void;
  bank: ResourceBank;
  bankUpgrades: ResourceBankUpgrades;
  credits: number;
}

export default function EquipmentScreen({ loadout, setLoadout, bank, bankUpgrades, credits }: EquipmentScreenProps) {
  // Shared across InventoryPanel (drag source for equipping) and LoadoutPanel
  // (both a drop target for equipping AND, now, a drag source for unequipping) —
  // dragover events can't read dataTransfer payloads for security reasons, so
  // this is how each panel knows what's being dragged in order to highlight
  // valid targets or decide what a drop should do.
  const [draggedItem, setDraggedItem] = useState<GearItem | null>(null);
  // Non-null only when the drag originated from an equip slot (not
  // Inventory) — tells InventoryPanel's drop zone "this is an unequip,"
  // not just an inventory item being dropped back on itself.
  const [draggedFromSlot, setDraggedFromSlot] = useState<EquipSlotId | null>(null);

  // Click-to-select, shared across Inventory and Loadout — selecting an item
  // (from either place) populates the Item Details card below Inventory.
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <div className="maps-screen">
      <div className="app-3col-grid">
        <LoadoutPanel
          loadout={loadout}
          onChange={setLoadout}
          draggedItem={draggedItem}
          setDraggedItem={setDraggedItem}
          setDraggedFromSlot={setDraggedFromSlot}
          selectedItemId={selectedItemId}
          onSelect={setSelectedItemId}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InventoryPanel
            loadout={loadout}
            onChange={setLoadout}
            draggedItem={draggedItem}
            setDraggedItem={setDraggedItem}
            draggedFromSlot={draggedFromSlot}
            setDraggedFromSlot={setDraggedFromSlot}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
          />
          <ItemDetailsPanel
            loadout={loadout}
            onChange={setLoadout}
            selectedItemId={selectedItemId}
            onClearSelection={() => setSelectedItemId(null)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ResourcesPanel credits={credits} bank={bank} bankUpgrades={bankUpgrades} />
          <SchematicsPanel loadout={loadout} onChange={setLoadout} />
        </div>
      </div>
    </div>
  );
}