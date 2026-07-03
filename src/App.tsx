import { useState, useRef, useEffect } from 'react';
import Topbar from './components/layout/Topbar';
import SideNav from './components/layout/SideNav';
import BackgroundLayer from './components/layout/BackgroundLayer';
import SectionPlaceholder from './components/layout/SectionPlaceholder';
import PlayerPanel from './components/combat/PlayerPanel';
import EncounterStage from './components/combat/EncounterStage';
import AbilityBar from './components/combat/AbilityBar';
import HostilePanel from './components/combat/HostilePanel';
import SectorMap from './components/map/SectorMap';
import { useCombatState } from './hooks/useCombatState';
import { sections } from './data/sections';
import type { SectionId } from './types';
import './styles/global.css';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('encounter');
  const topbarRef = useRef<HTMLDivElement>(null);
  const combat = useCombatState();

  // measure topbar height -> CSS var, same role as setTopbarHeight() in the old script.js
  useEffect(() => {
    const setH = () => {
      if (topbarRef.current) {
        document.documentElement.style.setProperty('--topbar-h', `${topbarRef.current.offsetHeight}px`);
      }
    };
    setH();
    window.addEventListener('resize', setH);
    return () => window.removeEventListener('resize', setH);
  }, []);

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);
    setNavOpen(false);
  };

  return (
    <div className="app">
      <BackgroundLayer image={sections[activeSection].background} />

      <div ref={topbarRef}>
        <Topbar />
      </div>

      <div className="main">
        <SideNav
          open={navOpen}
          activeSection={activeSection}
          onToggle={() => setNavOpen(o => !o)}
          onClose={() => setNavOpen(false)}
          onSelectSection={handleSelectSection}
        />

        <div className="content">
          {activeSection === 'encounter' && (
            <>
              <PlayerPanel />
              <div className="panel-stack">
                <EncounterStage round={combat.round} />
                <AbilityBar
                  energy={combat.energy}
                  maxEnergy={combat.maxEnergy}
                  cooldowns={combat.cooldowns}
                  onUseAbility={combat.useAbility}
                  onEndTurn={combat.endTurn}
                />
              </div>
              <div className="right-col">
                <HostilePanel
                  bossHpPct={combat.bossHpPct}
                  bossHpCurrent={combat.bossHpCurrent}
                  maxBossHp={combat.maxBossHp}
                />
                <SectorMap />
              </div>
            </>
          )}

          {activeSection !== 'encounter' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <SectionPlaceholder section={activeSection} />
            </div>
          )}
        </div>
      </div>

      <div className="footer-note">// Combat Log — click an ability to fire, energy regenerates each round</div>
    </div>
  );
}