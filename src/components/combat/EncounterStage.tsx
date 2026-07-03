interface EncounterStageProps {
  round: number;
}

export default function EncounterStage({ round }: EncounterStageProps) {
  return (
    <div className="panel encounter-panel">
      <div className="encounter-title">
        <div className="encounter-nav"><span>‹</span><span>›</span></div>
        <div className="encounter-eyebrow">Encounter</div>
        <div className="encounter-name">CORRUPTED SENTINEL</div>
      </div>
      <div className="stage">
        <div className="sentinel">
          <div className="leg l1"></div><div className="leg l2"></div><div className="leg l3"></div>
          <div className="leg l4"></div><div className="leg l5"></div><div className="leg l6"></div>
          <div className="body-hex"></div>
          <div className="core"></div>
        </div>
      </div>
      <div className="round-row">Round <b>{String(round).padStart(2, '0')}</b></div>
    </div>
  );
}