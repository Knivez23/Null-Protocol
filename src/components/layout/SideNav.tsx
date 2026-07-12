import type { SectionId } from '../../types';

interface SideNavProps {
  open: boolean;
  activeSection: SectionId;
  onOpen: () => void;
  onClose: () => void;
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

export default function SideNav({ open, activeSection, onOpen, onClose, onSelectSection }: SideNavProps) {
  return (
    <>
      <div className="nav-rail" onClick={onOpen}>
        <div className="nav-toggle">{open ? '««' : '»»'}</div>
      </div>
      <div className={`nav-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <div className={`sidenav ${open ? 'open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSelectSection(item.id)}
          >
            // {item.label}
          </div>
        ))}
      </div>
    </>
  );
}