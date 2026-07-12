import type { ResourceBank, ResourceBankUpgrades } from '../../types';
import { components } from '../../data/components';
import { getResourceBankCapacity } from '../../config/gameConfig';

interface ResourcesPanelProps {
  credits: number;
  bank: ResourceBank;
  bankUpgrades: ResourceBankUpgrades;
}

export default function ResourcesPanel({ credits, bank, bankUpgrades }: ResourcesPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">// Resources</div>
      <div className="panel-body">
        <div className="resource-credits-row">
          <div className="resource-credits-icon">◎</div>
          <div>
            <div className="resource-credits-label">Credits</div>
          </div>
          <div className="resource-credits-value">{credits.toLocaleString()}</div>
        </div>

        <div className="resource-materials-label">— Materials —</div>

        {components.map(c => {
          const amount = bank[c.id] ?? 0;
          const cap = getResourceBankCapacity(c.globalCap, bankUpgrades[c.id] ?? 0);
          const pct = cap > 0 ? Math.min(100, (amount / cap) * 100) : 0;
          return (
            <div className="resource-row" key={c.id}>
              <img src={c.icon} alt="" className="resource-row-icon" />
              <div className="resource-row-body">
                <div className="resource-row-head">
                  <span>{c.name}</span>
                  <b>{amount.toLocaleString()} / {cap.toLocaleString()}</b>
                </div>
                <div className="bar-track" style={{ height: '4px' }}>
                  <div className="bar-fill hp" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}

        <button className="end-turn-btn" style={{ width: '100%', marginTop: '14px' }} disabled title="Not yet implemented">
          View Market 🔒
        </button>
      </div>
    </div>
  );
}