import { abilities } from '../../data/abilities';

interface AbilityBarProps {
  energy: number;
  maxEnergy: number;
  cooldowns: Record<number, boolean>;
  onUseAbility: (id: number, cost: number, cooldownSec: number) => void;
  onEndTurn: () => void;
}

export default function AbilityBar({ energy, maxEnergy, cooldowns, onUseAbility, onEndTurn }: AbilityBarProps) {
  return (
    <div className="panel abilities-panel">
      <div className="abilities-head">
        <div className="panel-head" style={{ border: 'none', padding: 0 }}>// Abilities</div>
        <div className="energy">⚡ <span>{energy}</span> / {maxEnergy}</div>
        <div className="toggle">Auto Use <div className="toggle-pill"></div></div>
      </div>

      <div className="ability-row">
        {abilities.map(a => {
          const disabled = cooldowns[a.id] || energy < a.cost;
          return (
            <div
              key={a.id}
              className="ability"
              style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
              onClick={() => onUseAbility(a.id, a.cost, a.cooldownSec)}
            >
              <div className="ability-num">{a.id}</div>
              <div className="ability-icon" style={{ color: a.color }}>{a.icon}</div>
              <div className="ability-name">{a.name}</div>
              <div className="ability-cost-row">
                <div className="cost-badge">{a.cost}</div>
                <div className="cd-text">CD {a.cooldownSec}s</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="end-turn-row">
        <span className="chevrons">«</span>
        <button className="end-turn-btn" onClick={onEndTurn}>End Turn</button>
        <span className="chevrons">»</span>
      </div>
    </div>
  );
}