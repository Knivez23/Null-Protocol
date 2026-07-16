const nodes = [
  { icon: '?', state: '',      left: '0%',    top: 60 },
  { icon: '⚒', state: 'done',  left: '22.6%', top: 10 },
  { icon: '⚔', state: '',      left: '45.2%', top: 60 },
  { icon: '🎁', state: 'done', left: '17.0%', top: 110 },
  { icon: '🛡', state: 'now',  left: '39.6%', top: 110 },
  { icon: '⚡', state: '',     left: '31.1%', top: 70 },
  { icon: '✦', state: '',      left: '62.2%', top: 110 },
  { icon: '☠', state: 'boss',  left: '82.0%', top: 60 },
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