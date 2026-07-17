import { useState, useEffect } from 'react';
import Topbar from './components/layout/Topbar';
import BackgroundLayer from './components/layout/BackgroundLayer';
import SectionPlaceholder from './components/layout/SectionPlaceholder';
import PlayerPanel from './components/combat/PlayerPanel';
import EncounterStage from './components/combat/EncounterStage';
import ActiveEffectsBanner from './components/combat/ActiveEffectsBanner';
import HostilePanel from './components/combat/HostilePanel';
import ExpeditionDetails from './components/combat/ExpeditionDetails';
import CombatLog from './components/combat/CombatLog';
import SectorMap from './components/map/SectorMap';
import MapsScreen from './components/map/MapsScreen';
import IdleScreen from './components/idle/IdleScreen';
import EquipmentScreen from './components/equipment/EquipmentScreen';
import LandingScreen from './components/landing/LandingScreen';
import { useCombatState } from './hooks/useCombatState';
import { getGaugeInfo } from './engine/combat';
import { sections } from './data/sections';
import { nodes } from './data/nodes';
import { components } from './data/components';
import { saveStorage } from './engine/saveStorage';
import { computePowerLevel } from './engine/equipment';
import { computeCombatantStatsFromLoadout } from './engine/combatant';
import { processTick } from './engine/nullScavenger';
import { getEffectiveTickInterval } from './config/gameConfig';
import { emptyLoadout } from './types';
import type {
  SectionId, PlaythroughMeta, PlaythroughSaveData,
  CombatantStats, NullState, ResourceBank, ResourceBankUpgrades, Loadout,
} from './types';
import './styles/global.css';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'game'>('landing');

  // Active playthrough state — null until a save is loaded/created via LandingScreen.
  const [meta, setMeta] = useState<PlaythroughMeta | null>(null);
  const [playerStats, setPlayerStats] = useState<CombatantStats | null>(null);
  const [bank, setBank] = useState<ResourceBank>({});
  const [bankUpgrades, setBankUpgrades] = useState<ResourceBankUpgrades>({});
  const [nullState, setNullState] = useState<NullState | null>(null);
  const [credits, setCredits] = useState(0);
  const [loadout, setLoadout] = useState<Loadout>(emptyLoadout());
  const [nodesUnlocked, setNodesUnlocked] = useState<string[]>([]);
  const [schematicsUnlocked, setSchematicsUnlocked] = useState<string[]>([]);

  const [activeSection, setActiveSection] = useState<SectionId>('armory');
  const combat = useCombatState(loadout);

  // Null's tick loop lives HERE, not inside IdleScreen — App.tsx never
  // unmounts while the player is in the 'game' screen, so this keeps running
  // no matter which section (Expedition, Map Room, Armory, etc.) is active.
  // IdleScreen unmounting on navigation used to kill this loop entirely.
  useEffect(() => {
    if (!nullState || nullState.status !== 'farming' || !nullState.currentNodeId) return;

    const node = nodes.find(n => n.id === nullState.currentNodeId);
    const component = node ? components.find(c => c.id === node.componentId) : undefined;
    if (!node || !component) return;

    const intervalSec = getEffectiveTickInterval(nullState.upgradeRanks.engine, component.nodeModifierSec);
    const timer = setInterval(() => {
      setNullState(prev => (prev ? processTick(prev) : prev));
    }, intervalSec * 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nullState?.status, nullState?.currentNodeId, nullState?.upgradeRanks.engine]);

  // Auto-save whenever hub state changes, once a playthrough is actually loaded.
  // Only persists hub state (see PlaythroughSaveData) — an in-progress map run
  // isn't part of this and is abandoned if the player leaves mid-run.
  // meta.powerLevel is recomputed fresh here too, so the Landing Page card
  // always reflects the real current loadout, not a stale onboarding value.
  useEffect(() => {
    if (!meta || !playerStats || !nullState) return;
    const save: PlaythroughSaveData = {
      meta: { ...meta, lastPlayedAt: Date.now(), powerLevel: computePowerLevel(loadout) },
      playerStats,
      resourceBank: bank,
      resourceBankUpgrades: bankUpgrades,
      nullState,
      credits,
      loadout,
      nodesUnlocked,
      schematicsUnlocked,
    };
    saveStorage.savePlaythrough(save);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, bankUpgrades, nullState, credits, playerStats, loadout]);

  const handleEnterGame = (save: PlaythroughSaveData) => {
    setMeta(save.meta);
    setPlayerStats(save.playerStats);
    setBank(save.resourceBank);
    setBankUpgrades(save.resourceBankUpgrades);
    setNullState(save.nullState);
    setCredits(save.credits);
    setLoadout(save.loadout ?? emptyLoadout());
    setNodesUnlocked(save.nodesUnlocked);
    setSchematicsUnlocked(save.schematicsUnlocked);
    setScreen('game');
  };

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);
  };

  if (screen === 'landing' || !meta || !playerStats || !nullState) {
    return <LandingScreen onEnterGame={handleEnterGame} />;
  }

  // setNullState is typed against `NullState | null` (its useState declaration),
  // but IdleScreen only ever deals in non-null NullState — this narrows the
  // setter to match, since TS can't infer that from the guard above alone.
  const setNullStateNonNull: React.Dispatch<React.SetStateAction<NullState>> = (action) => {
    setNullState(prev => {
      if (!prev) return prev;
      return typeof action === 'function' ? (action as (p: NullState) => NullState)(prev) : action;
    });
  };

  const powerLevel = computePowerLevel(loadout);
  const liveStats = computeCombatantStatsFromLoadout(loadout);

  return (
    <div className="app">
      <BackgroundLayer image={sections[activeSection].background} />

      <Topbar activeSection={activeSection} onSelectSection={handleSelectSection} />

      <div className="main">
        <div className="content">
          {activeSection === 'expedition' && (
            <>
              <PlayerPanel
                characterName={meta.characterName}
                stats={liveStats}
                powerLevel={powerLevel}
                combat={(() => {
                  const playerUnit = combat.session?.units.find(u => u.isPlayer);
                  if (!combat.hasEngaged || !playerUnit) return undefined;
                  const gauge = getGaugeInfo(playerUnit);
                  return { currentHp: playerUnit.currentHp, gaugeSeconds: gauge.elapsed, intervalSeconds: gauge.interval };
                })()}
              />
              <div className="panel-stack">
                <EncounterStage
                  session={combat.session}
                  hasEngaged={combat.hasEngaged}
                  onStartCombat={combat.startCombat}
                  onResetEncounter={combat.resetEncounter}
                />
                <ActiveEffectsBanner />
              </div>
              <div className="right-col">
                <HostilePanel session={combat.session} />
                <SectorMap />
                <ExpeditionDetails session={combat.session} characterPL={powerLevel} />
                <CombatLog session={combat.session} />
              </div>
            </>
          )}

          {activeSection === 'map-room' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <MapsScreen />
            </div>
          )}

          {activeSection === 'salvage-ops' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <IdleScreen
                nullState={nullState}
                setNullState={setNullStateNonNull}
                bank={bank}
                setBank={setBank}
                bankUpgrades={bankUpgrades}
                setBankUpgrades={setBankUpgrades}
              />
            </div>
          )}

          {activeSection === 'armory' && (
            <div style={{ gridColumn: '1 / -1' }}>
              <EquipmentScreen
                loadout={loadout}
                setLoadout={setLoadout}
                bank={bank}
                bankUpgrades={bankUpgrades}
                credits={credits}
              />
            </div>
          )}

          {activeSection !== 'expedition' && activeSection !== 'map-room' && activeSection !== 'salvage-ops' && activeSection !== 'armory' && (
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