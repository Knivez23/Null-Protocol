import type { SectionId } from '../../types';

interface TopbarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: 'character', label: 'Character' },
  { id: 'armory', label: 'Armory' },
  { id: 'expedition', label: 'Expedition' },
  { id: 'salvage-ops', label: 'Salvage Ops' },
  { id: 'map-room', label: 'Map Room' },
  { id: 'market', label: 'Market' },
  { id: 'codex', label: 'Codex' },
];

export default function Topbar({ activeSection, onSelectSection }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark"></div>
        <div className="brand-name">NULL <span>//</span> PROTOCOL</div>
      </div>
      <nav className="nav-tabs">
        {NAV_ITEMS.map(item => (
          <a
            key={item.id}
            className={activeSection === item.id ? 'active' : ''}
            onClick={() => onSelectSection(item.id)}
          >
            {item.label.toUpperCase()}
          </a>
        ))}
      </nav>
    </div>
  );
}