import type { ResourceBankUpgrades } from '../../types';
import { components } from '../../data/components';
import { getResourceBankCapacity, getResourceBankUpgradeCost, RESOURCE_BANK_UPGRADE } from '../../config/gameConfig';

interface ResourceBankUpgradesPanelProps {
  bankUpgrades: ResourceBankUpgrades;
  onUpgrade: (componentId: string) => void;
}

export default function ResourceBankUpgradesPanel({ bankUpgrades, onUpgrade }: ResourceBankUpgradesPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">// Resource Bank Upgrades</div>
      <div className="panel-body">
        {components.map(c => {
          const rank = bankUpgrades[c.id] ?? 0;
          const cap = getResourceBankCapacity(c.globalCap, rank);
          const cost = getResourceBankUpgradeCost(rank);
          const maxed = rank >= RESOURCE_BANK_UPGRADE.MAX_RANK;

          return (
            <div className="bar-row" key={c.id}>
              <div className="bar-label">
                <span>
                  <img src={c.icon} alt="" style={{ width: 14, height: 14, verticalAlign: '-2px', marginRight: '5px', borderRadius: '2px' }} />
                  {c.name} — Rank {rank}/{RESOURCE_BANK_UPGRADE.MAX_RANK}
                </span>
                <b>{cap.toLocaleString()} cap</b>
              </div>
              <div className="bar-track"><div className="bar-fill hp" style={{ width: `${(rank / RESOURCE_BANK_UPGRADE.MAX_RANK) * 100}%` }} /></div>
              <button
                className="end-turn-btn"
                style={{ width: '100%', marginTop: '8px', padding: '8px', fontSize: '10.5px' }}
                onClick={() => onUpgrade(c.id)}
                disabled={maxed}
              >
                {maxed ? 'Maxed' : cost ? `Upgrade — ${cost.credits}cr — +${RESOURCE_BANK_UPGRADE.CAPACITY_PER_RANK.toLocaleString()} cap` : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}