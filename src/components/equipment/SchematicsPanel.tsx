import { useState } from 'react';
import type { Loadout, RarityId } from '../../types';
import { schematics } from '../../data/schematics';
import { RARITY_COLORS, assetIcon } from '../../data/equipmentVisuals';
import { RARITY_META } from '../../data/rarity';
import { craftFromSchematic } from '../../engine/equipment';
import GearIcon from './GearIcon';

interface SchematicsPanelProps {
  loadout: Loadout;
  onChange: (loadout: Loadout) => void;
}

export default function SchematicsPanel({ loadout, onChange }: SchematicsPanelProps) {
  const [rarityFilter, setRarityFilter] = useState<RarityId | 'all'>('all');

  const visible = rarityFilter === 'all' ? schematics : schematics.filter(s => s.rarity === rarityFilter);

  const handleCraft = (schematicId: string) => {
    const schematic = schematics.find(s => s.id === schematicId);
    if (!schematic) return;
    onChange(craftFromSchematic(loadout, schematic));
  };

  return (
    <div className="panel">
      <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>// Schematics</span>
        <select
          className="schematic-tier-select"
          value={rarityFilter}
          onChange={e => setRarityFilter(e.target.value as RarityId | 'all')}
        >
          <option value="all">All Rarities</option>
          {Object.values(RARITY_META).map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>
      <div className="panel-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {visible.map(s => (
          <div className="schematic-row" key={s.id}>
            <div className="schematic-icon" style={{ borderColor: RARITY_COLORS[s.rarity] }}><GearIcon icon={assetIcon(s.artAsset)} size={33} /></div>
            <div className="schematic-info">
              <div className="schematic-name">{s.name}</div>
              <div className="schematic-tier" style={{ color: RARITY_COLORS[s.rarity] }}>{RARITY_META[s.rarity].label}</div>
            </div>
            <button className="schematic-craft-btn" onClick={() => handleCraft(s.id)}>
              Craft
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}