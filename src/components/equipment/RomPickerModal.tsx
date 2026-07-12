import type { RomMeta } from '../../types';
import { roms } from '../../data/roms';
import InfoModal from '../idle/InfoModal';

interface RomPickerModalProps {
  equippedRomIds: string[];
  onSelect: (rom: RomMeta) => void;
  onClose: () => void;
}

export default function RomPickerModal({ equippedRomIds, onSelect, onClose }: RomPickerModalProps) {
  const available = roms.filter(r => r.tier === 'encounter' && !equippedRomIds.includes(r.id));

  return (
    <InfoModal title="Select a ROM" onClose={onClose}>
      {available.length === 0 && <p style={{ color: 'var(--text-dim)' }}>No unequipped ROMs available.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {available.map(rom => (
          <button
            key={rom.id}
            className="map-card-select-btn"
            style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            onClick={() => onSelect(rom)}
          >
            <span style={{ fontSize: '16px' }}>{rom.icon}</span>
            <span>
              <div style={{ fontWeight: 700 }}>{rom.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 400 }}>{rom.description}</div>
            </span>
          </button>
        ))}
      </div>
    </InfoModal>
  );
}