export default function Topbar() {
  const totalPips = 7;
  const activeIndex = 5;

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark"></div>
        <div className="brand-name">NULL // PROTOCOL</div>
        <div className="brand-sub">SECTOR 07<b>VOID FISSURE</b></div>
      </div>

      <div className="run-track">
        <span className="run-label">RUN 18 &nbsp;•&nbsp; DEPTH 3</span>
        <div className="dots">
          {Array.from({ length: totalPips }).map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="dots-line" />}
              <div className={`dot ${i < activeIndex ? 'done' : ''} ${i === activeIndex ? 'active' : ''}`} />
            </span>
          ))}
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="stat-icon credits">◆</div><div><div className="stat-value">24,850</div><div className="stat-label">Credits</div></div></div>
        <div className="stat"><div className="stat-icon origin">◈</div><div><div className="stat-value">1,240</div><div className="stat-label">Components</div></div></div>
        <div className="stat"><div className="stat-icon shards">⬡</div><div><div className="stat-value">385</div><div className="stat-label">ROM Fragments</div></div></div>
        <div className="stat"><div className="stat-icon keys">🔑</div><div><div className="stat-value">65</div><div className="stat-label">Cipher Keys</div></div></div>
        <div className="avatar">32</div>
        <div className="gear-icon">⚙</div>
      </div>
    </div>
  );
}