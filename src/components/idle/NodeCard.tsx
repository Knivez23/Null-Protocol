import { useState } from 'react';
import type { NodeMeta, NullState } from '../../types';
import { components } from '../../data/components';
import {
  getEffectiveTickInterval,
  getScannerBonusChance,
  YIELD_BONUS_BY_RANK,
} from '../../config/gameConfig';
import InfoModal from './InfoModal';

interface NodeCardProps {
  node: NodeMeta;
  nullState: NullState;
  onDeploy: (nodeId: string) => void;
}

export default function NodeCard({ node, nullState, onDeploy }: NodeCardProps) {
  const [flashLocked, setFlashLocked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const component = components.find(c => c.id === node.componentId);
  if (!component) return null;

  const isActive = nullState.currentNodeId === node.id && nullState.status !== 'idle';
  const tickInterval = getEffectiveTickInterval(nullState.upgradeRanks.engine, component.nodeModifierSec);
  const yieldEntry = YIELD_BONUS_BY_RANK[nullState.upgradeRanks.yield] ?? YIELD_BONUS_BY_RANK[0];
  const yieldMin = component.baseTickYieldMin;
  const yieldMax = component.baseTickYieldMin + yieldEntry.bonus;
  const scannerChance = getScannerBonusChance(nullState.upgradeRanks.scanner);

  const handleDeployClick = () => {
    if (!node.unlockedFromStart) {
      setFlashLocked(true);
      setTimeout(() => setFlashLocked(false), 650);
      return;
    }
    onDeploy(node.id);
  };

  return (
    <div className="map-card" style={{ position: 'relative', ...(isActive ? { borderImage: 'linear-gradient(135deg, rgba(74,222,128,0.7) 0%, rgba(74,222,128,0.3) 40%, transparent 72%) 1' } : {}) }}>
      <button className="node-info-btn" onClick={() => setShowInfo(true)} aria-label={`Info about ${node.name}`}>i</button>

      <div className="map-card-head">
        <img src={component.icon} alt={component.name} className="map-card-icon" style={{ clipPath: 'none', background: 'rgba(255,255,255,0.03)', objectFit: 'cover' }} />
        <div className="map-card-title-block">
          <div className="map-card-name">{node.name}</div>
          <div className="map-card-pl">Collects <b>{component.name}</b></div>
        </div>
      </div>

      {!node.unlockedFromStart && (
        <div className={`map-card-tag ${flashLocked ? 'flash' : ''}`} style={{ alignSelf: 'flex-start' }}>
          🔒 Locked — earned via map completion
        </div>
      )}

      <div className="map-card-stats">
        <div className="map-card-stat"><span>Tick Rate</span><b>{tickInterval}s</b></div>
        <div className="map-card-stat"><span>Yield/Tick</span><b>{yieldMax > yieldMin ? `${yieldMin}–${yieldMax} (${Math.round(yieldEntry.chance * 100)}%)` : yieldMin}</b></div>
        <div className="map-card-stat"><span>Scanner</span><b>{Math.round(scannerChance * 100)}%</b></div>
        <button
          className="node-deploy-btn-compact"
          onClick={handleDeployClick}
          disabled={isActive}
          style={isActive ? { color: 'var(--green)' } : undefined}
        >
          {isActive ? 'Deployed' : 'Deploy Null'}
        </button>
      </div>

      <div className="node-timer-track">
        {isActive ? (
          <div
            key={nullState.lastTickAt}
            className="node-timer-fill"
            style={{ animation: `tickFill ${tickInterval}s linear forwards` }}
          />
        ) : (
          <div className="node-timer-fill" style={{ width: '0%' }} />
        )}
      </div>

      {showInfo && (
        <InfoModal title={node.name} onClose={() => setShowInfo(false)}>
          <p style={{ marginBottom: '10px' }}>{node.flavorText}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{component.description}</p>
        </InfoModal>
      )}
    </div>
  );
}