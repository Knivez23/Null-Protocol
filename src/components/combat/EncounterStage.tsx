import type { CombatSession } from '../../engine/combat';
import { MONSTER_ARCHETYPES, ROLE_THREAT_LABEL } from '../../data/monsters';

interface EncounterStageProps {
  session: CombatSession | null;
  hasEngaged: boolean;
  onStartCombat: () => void;
  onResetEncounter: () => void;
}

export default function EncounterStage({ session, hasEngaged, onStartCombat, onResetEncounter }: EncounterStageProps) {
  if (!session) return null;

  const monster = session.units.find(u => !u.isPlayer)!;
  const archetype = MONSTER_ARCHETYPES[monster.id];
  const threatLabel = archetype ? ROLE_THREAT_LABEL[archetype.role] : '—';

  return (
    <div className="panel encounter-panel">
      <div className="encounter-title">
        <div className="encounter-eyebrow">Encounter</div>
        <div className="encounter-name">{monster.name.toUpperCase()}</div>
        <div className="encounter-threat"><span className="threat-label">Threat</span> <span className="threat-value">▲ {threatLabel.toUpperCase()}</span></div>
      </div>

      {/* Real art for Standard/Elite; Drone still uses the generic placeholder shape until it has its own art. */}
      <div className="stage">
        {archetype?.artAsset ? (
          <img className="sentinel-art" src={archetype.artAsset} alt={monster.name} />
        ) : (
          <div className="sentinel">
            <div className="leg l1"></div><div className="leg l2"></div><div className="leg l3"></div>
            <div className="leg l4"></div><div className="leg l5"></div><div className="leg l6"></div>
            <div className="body-hex"></div>
            <div className="core"></div>
          </div>
        )}
      </div>

      {/* No dual ATB row here anymore — Player/Hostile panels already show their own ATB bars, this was redundant. */}

      <div className="encounter-action-row">
        {!session.isOver ? (
          <button className="end-turn-btn" disabled={hasEngaged} onClick={onStartCombat}>Start Combat</button>
        ) : (
          <div className="encounter-result-stack">
            <div className={`encounter-result ${session.winnerIsPlayer ? 'victory' : 'defeat'}`}>
              {session.winnerIsPlayer ? 'VICTORY' : 'DEFEAT'}
            </div>
            <button className="end-turn-btn" onClick={onResetEncounter}>Fight Again</button>
          </div>
        )}
      </div>
    </div>
  );
}