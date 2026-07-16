/**
 * Static layout data, same caveat as ExpeditionDetails — no real map/node
 * system exists yet (Random Map Generator is future work), so this is
 * illustrative structure, not live data. What IS real here: the actual
 * branching-path rendering approach itself, which the flat percentage-grid
 * version before this didn't have at all.
 */
const NODES = [
  { x: 25, y: 62, icon: '?', type: 'unknown' },
  { x: 75, y: 25, icon: '?', type: 'unknown' },
  { x: 132, y: 25, icon: '⚔', type: 'combat' },
  { x: 105, y: 92, icon: '▣', type: 'loot' },
  { x: 193, y: 62, icon: '⚔', type: 'current' },
  { x: 253, y: 25, icon: '?', type: 'unknown' },
  { x: 226, y: 98, icon: '?', type: 'unknown' },
  { x: 313, y: 62, icon: '◈', type: 'rest' },
  { x: 374, y: 61, icon: '☣', type: 'boss' },
];

const PATHS = [
  'M35 75 L85 38 L145 38 L205 75 L265 38 L325 75 L385 75',
  'M85 38 L115 105 L205 75 L235 112 L325 75',
];

export default function SectorMap() {
  return (
    <section className="panel sector-panel corner-accent">
      <div className="panel-row-title"><span>// SECTOR MAP</span><b>Sector 04</b></div>
      <svg className="sector-map" viewBox="0 0 420 150" role="img" aria-label="Sector room map">
        <defs>
          <filter id="glowAmber"><feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#e8963c" floodOpacity="0.8" /></filter>
          <filter id="glowRed"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#e04b45" floodOpacity="0.8" /></filter>
        </defs>
        <g className="paths">
          {PATHS.map((d, i) => <path key={i} d={d} />)}
        </g>
        <g className="nodes">
          {NODES.map((n, i) => (
            <g key={i}>
              <use href="#hex" x={n.x} y={n.y} className={`node ${n.type}`} filter={n.type === 'current' ? 'url(#glowAmber)' : n.type === 'boss' ? 'url(#glowRed)' : undefined} />
              <text x={n.x + 18} y={n.y + 22}>{n.icon}</text>
            </g>
          ))}
        </g>
        <polygon id="hex" points="18,0 36,10 36,30 18,40 0,30 0,10" />
      </svg>
      <div className="map-legend">
        <span><i className="amber-dot"></i>YOU ARE HERE</span>
        <span>⊗ COMBAT</span>
        <span>? EVENT</span>
        <span>◈ REST</span>
        <span className="red">☣ BOSS</span>
      </div>
    </section>
  );
}