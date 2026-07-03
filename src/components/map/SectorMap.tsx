const nodes = [
  { icon: '?', state: '',      left: 0,   top: 60 },
  { icon: '⚒', state: 'done',  left: 80,  top: 10 },
  { icon: '⚔', state: '',      left: 160, top: 60 },
  { icon: '🎁', state: 'done', left: 60,  top: 110 },
  { icon: '🛡', state: 'now',  left: 140, top: 110 },
  { icon: '⚡', state: '',     left: 110, top: 70 },
  { icon: '✦', state: '',      left: 220, top: 110 },
  { icon: '☠', state: 'boss',  left: 290, top: 60 },
];

export default function SectorMap() {
  return (
    <div className="panel">
      <div className="panel-head">// Sector Map</div>
      <div className="map-body">
        <div className="map-grid">
          {nodes.map((n, i) => (
            <div key={i} className={`node ${n.state}`} style={{ left: n.left, top: n.top }}>{n.icon}</div>
          ))}
        </div>
      </div>
    </div>
  );
}