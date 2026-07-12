interface HostilePanelProps {
  bossHpPct: number;
  bossHpCurrent: number;
  maxBossHp: number;
}

export default function HostilePanel({ bossHpPct, bossHpCurrent, maxBossHp }: HostilePanelProps) {
  return (
    <div className="panel hostile">
      <div className="panel-head">// Hostile</div>
      <div className="hostile-body">
        <div className="hostile-top">
          <div className="hostile-portrait">🕷</div>
          <div>
            <div className="hostile-name">CORRUPTED SENTINEL</div>
            <div className="hostile-tags">Machine • Elite</div>
          </div>
          <div className="threat"><div className="threat-label">Threat Level</div><div className="threat-value">▲ HIGH</div></div>
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>HP</span><b>{bossHpCurrent.toLocaleString()} / {maxBossHp.toLocaleString()}</b></div>
          <div className="bar-track"><div className="bar-fill hp" style={{ width: `${bossHpPct}%` }} /></div>
        </div>
        <div className="bar-row">
          <div className="bar-label"><span>Shield</span><b>1,200 / 1,200</b></div>
          <div className="bar-track"><div className="bar-fill shield" style={{ width: '100%' }} /></div>
        </div>
        <div className="fx-row hostile-fx">
          <div className="fx-chip"><div className="fx-circle">⊘</div></div>
          <div className="fx-chip"><div className="fx-circle">☠</div></div>
          <div className="fx-chip"><div className="fx-circle">▲</div></div>
          <div className="fx-chip"><div className="fx-circle">◆</div></div>
        </div>
      </div>
    </div>
  );
}