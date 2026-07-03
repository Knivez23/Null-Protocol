export default function PlayerPanel() {
  return (
    <div className="panel">
      <div className="panel-head">// Player</div>
      <div className="panel-body">
        <div className="player-top">
          <div className="portrait">🪖</div>
          <div className="player-id">
            <div className="lvl-badge">32</div>
            <div className="player-name">VOIDSTRIDER</div>
            <div className="player-class">Netrunner</div>
          </div>
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>HP</span><b>1,248 / 1,248</b></div>
          <div className="bar-track"><div className="bar-fill hp" style={{ width: '100%' }} /></div>
        </div>
        <div className="bar-row">
          <div className="bar-label"><span>Shield</span><b>842 / 1,000</b></div>
          <div className="bar-track"><div className="bar-fill shield" style={{ width: '84.2%' }} /></div>
        </div>

        <div className="power-row">
          <div className="power-value">◈ 5,620</div>
          <div className="power-label">Power Level</div>
        </div>

        <div className="stat-grid">
          <div className="stat-line"><span>✦ ATK PWR</span><b>1,256</b></div>
          <div className="stat-line"><span>◉ DEF PWR</span><b>812</b></div>
          <div className="stat-line"><span>✧ CRIT %</span><b>24.7%</b></div>
          <div className="stat-line"><span>⟡ SPEED</span><b>18.3%</b></div>
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