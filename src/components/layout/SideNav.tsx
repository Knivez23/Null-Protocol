import type { SectionId } from '../../types';

interface SideNavProps {
  open: boolean;
  activeSection: SectionId;
  onToggle: () => void;
  onClose: () => void;
  onSelectSection: (section: SectionId) => void;
}

export default function SideNav({ open, activeSection, onToggle, onClose, onSelectSection }: SideNavProps) {
  const isCombat = activeSection === 'encounter' || activeSection === 'abilities';

  return (
    <>
      <div className="nav-rail">
        <div className="nav-toggle" onClick={onToggle}>{open ? '««' : '»»'}</div>
      </div>
      <div className={`nav-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <div className={`sidenav ${open ? 'open' : ''}`}>
        <div className="nav-item"><span className="ic">▤</span> Overview</div>
        <div
          className={`nav-item ${activeSection === 'equipment' ? 'active' : ''}`}
          onClick={() => onSelectSection('equipment')}
        >
          <span className="ic">🛡</span> Equipment
        </div>
        <div className={`nav-item ${isCombat ? 'active' : ''}`}>
          <span className="ic">⚔</span> Combat
        </div>
        <div className="nav-sub">
          <div
            className={`nav-sub-item ${activeSection === 'encounter' ? 'on' : ''}`}
            onClick={() => onSelectSection('encounter')}
          >
            Encounter
          </div>
          <div
            className={`nav-sub-item ${activeSection === 'abilities' ? 'on' : ''}`}
            onClick={() => onSelectSection('abilities')}
          >
            Abilities
          </div>
          <div className="nav-sub-item">ROMs</div>
          <div className="nav-sub-item">Logs</div>
        </div>
        <div
          className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
          onClick={() => onSelectSection('inventory')}
        >
          <span className="ic">🎒</span> Inventory
        </div>
        <div
          className={`nav-item ${activeSection === 'map' ? 'active' : ''}`}
          onClick={() => onSelectSection('map')}
        >
          <span className="ic">🗺</span> Map
        </div>
        <div className="nav-item"><span className="ic">⚑</span> Faction</div>
        <div className="nav-item"><span className="ic">🏪</span> Market</div>
        <div className="nav-item"><span className="ic">📖</span> Codex</div>
      </div>
    </>
  );
}