import type { CombatSession } from '../../engine/combat';
import { getGaugeInfo } from '../../engine/combat';
import { MONSTER_ARCHETYPES, ROLE_THREAT_LABEL } from '../../data/monsters';

interface EncounterStageProps {
  session: CombatSession | null;
  hasEngaged: boolean;
  onStartCombat: () => void;
  onResetEncounter: () => void;
}

export default function EncounterStage({ session, hasEngaged, onStartCombat, onResetEncounter }: EncounterStageProps) {
  if (!session) return null;

  const player = session.units.find(u => u.isPlayer)!;
  const monster = session.units.find(u => !u.isPlayer)!;
  const archetype = MONSTER_ARCHETYPES[monster.id];
  const threatLabel = archetype ? ROLE_THREAT_LABEL[archetype.role] : '—';

  const playerGauge = getGaugeInfo(player);
  const monsterGauge = getGaugeInfo(monster);

  return (
    <div className="panel encounter-panel">
      <div className="encounter-title">
        <div className="encounter-eyebrow">Encounter</div>
        <div className="encounter-name">{monster.name.toUpperCase()}</div>
        <div className="encounter-threat"><span className="threat-label">Threat</span> <span className="threat-value">▲ {threatLabel.toUpperCase()}</span></div>
      </div>

      {/* Generic hostile-machine placeholder visual — not real per-monster art, no art pipeline exists yet */}
      <div className="stage">
        <div className="sentinel">
          <div className="leg l1"></div><div className="leg l2"></div><div className="leg l3"></div>
          <div className="leg l4"></div><div className="leg l5"></div><div className="leg l6"></div>
          <div className="body-hex"></div>
          <div className="core"></div>
        </div>
      </div>

      <div className="atb-vs-row">
        <div className="atb-vs-side">
          <div className="atb-vs-label">Your ATB</div>
          <div className="bar-track"><div className="bar-fill atb-bar-fill" style={{ width: `${Math.min(100, (playerGauge.elapsed / playerGauge.interval) * 100)}%` }} /></div>
          <div className="atb-vs-value">{playerGauge.elapsed.toFixed(1)} / {playerGauge.interval.toFixed(1)}s</div>
        </div>
        <div className="atb-vs-divider">VS</div>
        <div className="atb-vs-side">
          <div className="atb-vs-label">Enemy ATB</div>
          <div className="bar-track"><div className="bar-fill atb-bar-fill enemy" style={{ width: `${Math.min(100, (monsterGauge.elapsed / monsterGauge.interval) * 100)}%` }} /></div>
          <div className="atb-vs-value">{monsterGauge.elapsed.toFixed(1)} / {monsterGauge.interval.toFixed(1)}s</div>
        </div>
      </div>

      <div className="encounter-action-row">
        {!hasEngaged && !session.isOver && (
          <button className="end-turn-btn" onClick={onStartCombat}>Start Combat</button>
        )}
        {session.isOver && (
          <>
            <div className={`encounter-result ${session.winnerIsPlayer ? 'victory' : 'defeat'}`}>
              {session.winnerIsPlayer ? 'VICTORY' : 'DEFEAT'}
            </div>
            <button className="end-turn-btn" onClick={onResetEncounter}>Fight Again</button>
          </>
        )}
      </div>
    </div>
  );
}