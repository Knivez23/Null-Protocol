import type { NullState } from '../../types';
import { nodes } from '../../data/nodes';
import { components } from '../../data/components';
import { getNullOnboardCapacity, getNullLevel } from '../../config/gameConfig';

interface NullStatusPanelProps {
  nullState: NullState;
  onRecall: () => void;
}

export default function NullStatusPanel({ nullState, onRecall }: NullStatusPanelProps) {
  const currentNode = nodes.find(n => n.id === nullState.currentNodeId);
  const currentComponent = currentNode ? components.find(c => c.id === currentNode.componentId) : undefined;
  const onboardTotal = Object.values(nullState.onboardCargo).reduce((s, q) => s + q, 0);
  const onboardCap = getNullOnboardCapacity(nullState.upgradeRanks.storage);
  const fillPct = onboardCap > 0 ? Math.min(100, (onboardTotal / onboardCap) * 100) : 0;
  const level = getNullLevel(
    nullState.upgradeRanks.engine,
    nullState.upgradeRanks.yield,
    nullState.upgradeRanks.scanner,
    nullState.upgradeRanks.storage,
  );

  return (
    <div className="panel">
      <div className="panel-head">// Null</div>
      <div className="panel-body">
        <div className="player-top">
          <div className="portrait">🛰️</div>
          <div className="player-id">
            <div className="lvl-badge">{level}</div>
            <div className="player-name">NULL</div>
          </div>
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>Currently Collecting</span></div>
          {currentComponent ? (
            <div className="null-collecting">
              <img src={currentComponent.icon} alt={currentComponent.name} className="null-collecting-icon" />
              <b>{currentComponent.name}</b>
            </div>
          ) : (
            <b>— Unassigned —</b>
          )}
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>Onboard Cargo</span><b>{onboardTotal} / {onboardCap}</b></div>
          <div className="bar-track"><div className="bar-fill shield" style={{ width: `${fillPct}%` }} /></div>
        </div>

        <button
          className="end-turn-btn"
          style={{ width: '100%', marginTop: '14px' }}
          onClick={onRecall}
          disabled={onboardTotal === 0}
        >
          Recall &amp; Unload
        </button>
      </div>
    </div>
  );
}