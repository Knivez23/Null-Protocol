import type { CombatantStats } from '../../types';
import { resistanceMeta } from '../../data/resistances';

interface PlayerPanelProps {
  characterName: string;
  stats: CombatantStats;
  powerLevel: number;
}

export default function PlayerPanel({ characterName, stats, powerLevel }: PlayerPanelProps) {
  return (
    <div className="panel">
      <div className="panel-head">// Player</div>
      <div className="panel-body">
        <div className="player-top">
          <div className="portrait">🪖</div>
          <div className="player-id">
            <div className="lvl-badge">32</div>
            <div className="player-name">{characterName}</div>
            <div className="player-class">Netrunner</div>
          </div>
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>HP</span><b>{stats.hp} / {stats.hp}</b></div>
          <div className="bar-track"><div className="bar-fill hp" style={{ width: '100%' }} /></div>
        </div>
        <div className="bar-row">
          <div className="bar-label"><span>Shield</span><b>842 / 1,000</b></div>
          <div className="bar-track"><div className="bar-fill shield" style={{ width: '84.2%' }} /></div>
        </div>

        <div className="power-row">
          <div className="power-value">◈ {powerLevel.toLocaleString()}</div>
          <div className="power-label">Power Level</div>
        </div>

        <div className="stat-grid">
          <div className="stat-line"><span>◎ Accuracy</span><b>{Math.round(stats.accuracy * 100)}%</b></div>
          <div className="stat-line"><span>✦ Attack Power</span><b>{stats.attackPower}</b></div>
          <div className="stat-line"><span>◉ Defense</span><b>{stats.defense}</b></div>
          <div className="stat-line"><span>✧ Crit Chance</span><b>{Math.round(stats.critChance * 100)}%</b></div>
          <div className="stat-line"><span>✺ Crit Damage</span><b>{Math.round(stats.critDamageMultiplier * 100)}%</b></div>
          <div className="stat-line"><span>◐ Dodge Chance</span><b>{Math.round(stats.dodgeChance * 100)}%</b></div>
          <div className="stat-line"><span>⟡ Speed</span><b>{stats.speed}</b></div>
          <div className="stat-line"><span>✚ Regen</span><b>{stats.regen}</b></div>
        </div>

        <div className="resist-section">
          <div className="resist-section-label">// Resistances</div>
          {resistanceMeta.map(r => {
            const value = stats.resistances[r.key];
            const filledSegments = Math.round(value * 20);
            return (
              <div className="resist-row" key={r.key}>
                <div className={`resist-hex ${r.key}`}>{r.icon}</div>
                <div className="resist-body">
                  <div className="resist-head">
                    <span className="resist-name">{r.label}</span>
                    <span className="resist-pct">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="resist-bar">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span key={i} className={`resist-segment ${r.key} ${i < filledSegments ? 'filled' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fx-row">
          <div className="fx-chip"><div className="fx-circle" style={{ borderColor: 'var(--amber)', color: 'var(--amber-bright)' }}>⚔</div><div className="fx-time">02:15</div></div>
          <div className="fx-chip"><div className="fx-circle" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>🛡</div><div className="fx-time">01:07</div></div>
          <div className="fx-chip"><div className="fx-circle" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>✦</div><div className="fx-time">00:49</div></div>
          <div className="fx-chip"><div className="fx-circle" style={{ borderColor: 'var(--text-mid)', color: 'var(--text-mid)' }}>◈</div><div className="fx-time">00:24</div></div>
        </div>
      </div>
    </div>
  );
}