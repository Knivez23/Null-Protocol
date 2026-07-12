import type { NullState, NullUpgradeTrackId } from '../../types';
import { nullUpgradeTracks } from '../../data/nullUpgrades';
import { getNullUpgradeCost, NULL_UPGRADE_MAX_RANK } from '../../config/gameConfig';

interface NullUpgradesPanelProps {
  nullState: NullState;
  onUpgrade: (track: NullUpgradeTrackId) => void;
}

export default function NullUpgradesPanel({ nullState, onUpgrade }: NullUpgradesPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">// Null Upgrades</div>
      <div className="panel-body">
        {nullUpgradeTracks.map(track => {
          const rank = nullState.upgradeRanks[track.id];
          const cost = getNullUpgradeCost(rank);
          const maxed = rank >= NULL_UPGRADE_MAX_RANK;

          return (
            <div className="bar-row" key={track.id}>
              <div className="bar-label">
                <span>{track.icon} {track.name} — Rank {rank}/{NULL_UPGRADE_MAX_RANK}</span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginBottom: '6px' }}>{track.description}</div>
              <div className="bar-track"><div className="bar-fill hp" style={{ width: `${(rank / NULL_UPGRADE_MAX_RANK) * 100}%` }} /></div>
              <button
                className="end-turn-btn"
                style={{ width: '100%', marginTop: '8px', padding: '8px', fontSize: '10.5px' }}
                onClick={() => onUpgrade(track.id)}
                disabled={maxed}
              >
                {maxed ? 'Maxed' : cost ? `Upgrade — ${cost.credits}cr + ${Object.entries(cost.components).map(([id, qty]) => `${qty} ${id}`).join(', ')}` : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}