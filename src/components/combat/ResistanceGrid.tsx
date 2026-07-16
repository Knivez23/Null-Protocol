import type { ResistanceType } from '../../types';
import { resistanceMeta } from '../../data/resistances';

interface ResistanceGridProps {
  resistances: Record<ResistanceType, number>;
  /** Player shows the real number under each icon; Hostile never does (hidden-enemy-stats rule). */
  showValues: boolean;
}

const PIP_COUNT = 5;

/**
 * Compact 3-column icon+pip grid — replaces the old one-per-row, 20-segment
 * full-width bars, which were the actual cause of both PlayerPanel and
 * HostilePanel taking up far more vertical space than intended.
 */
export default function ResistanceGrid({ resistances, showValues }: ResistanceGridProps) {
  return (
    <div className="resist-section">
      <div className="resist-section-label">// Resistances</div>
      <div className="combat-resist-grid">
        {resistanceMeta.map(r => {
          const value = resistances[r.key];
          const filledPips = Math.min(PIP_COUNT, Math.round((value / 300) * PIP_COUNT));
          return (
            <div className="combat-resist-cell" key={r.key}>
              <div className={`resist-hex ${r.key}`}>{r.icon}</div>
              <div className="combat-resist-name">{r.label}</div>
              {showValues && <div className="combat-resist-pct">{Math.round(value)}</div>}
              <div className="combat-resist-pips">
                {Array.from({ length: PIP_COUNT }).map((_, i) => (
                  <span key={i} className={`combat-resist-pip ${r.key} ${i < filledPips ? 'filled' : ''}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
