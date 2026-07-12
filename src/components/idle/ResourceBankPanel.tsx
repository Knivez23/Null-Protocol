import type { ResourceBank as ResourceBankType, ResourceBankUpgrades } from '../../types';
import { components } from '../../data/components';
import { getResourceBankCapacity } from '../../config/gameConfig';

interface ResourceBankPanelProps {
  bank: ResourceBankType;
  bankUpgrades: ResourceBankUpgrades;
}

export default function ResourceBankPanel({ bank, bankUpgrades }: ResourceBankPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">// Resource Bank</div>
      <div className="panel-body">
        {components.map(c => {
          const amount = bank[c.id] ?? 0;
          const cap = getResourceBankCapacity(c.globalCap, bankUpgrades[c.id] ?? 0);
          const pct = cap > 0 ? Math.min(1, amount / cap) : 0;
          const filledSegments = Math.round(pct * 20);

          return (
            <div className="resist-row" key={c.id}>
              <img src={c.icon} alt={c.name} className="map-card-component-icon" style={{ width: 30, height: 30, borderRadius: 0, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', border: '1px solid var(--line-soft)' }} />
              <div className="resist-body">
                <div className="resist-head">
                  <span className="resist-name">{c.name}</span>
                  <span className="resist-pct">{amount} / {cap}</span>
                </div>
                <div className="resist-bar">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className={`resist-segment bank ${i < filledSegments ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}