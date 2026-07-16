interface SegmentBarProps {
  /** 0-1 fill fraction */
  pct: number;
  segments?: number;
  color?: 'amber' | 'red';
  large?: boolean;
}

/** The reference's signature skewed-segment bar. Segment count is fixed and consistent everywhere it's used — the original reference had a real bug where script.js always generated 10 segments but one CSS override expected 8, causing uneven widths. Not reproduced here: gridTemplateColumns is set dynamically from the actual segment count, so a mismatch is structurally impossible regardless of what segments value gets passed anywhere in the app. */
export function SegmentBar({ pct, segments = 10, color = 'amber', large = false }: SegmentBarProps) {
  const filled = Math.round(Math.max(0, Math.min(1, pct)) * segments);
  return (
    <div className={`segbar ${color} ${large ? 'large' : ''}`} style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }}>
      {Array.from({ length: segments }).map((_, i) => (
        <span key={i} className={`seg ${i < filled ? 'filled' : ''}`} />
      ))}
    </div>
  );
}

interface DiamondBarProps {
  pct: number;
  segments?: number;
}

export function DiamondBar({ pct, segments = 6 }: DiamondBarProps) {
  const filled = Math.round(Math.max(0, Math.min(1, pct)) * segments);
  return (
    <div className="diamondbar">
      {Array.from({ length: segments }).map((_, i) => (
        <i key={i} className={i < filled ? 'filled' : ''} />
      ))}
    </div>
  );
}
