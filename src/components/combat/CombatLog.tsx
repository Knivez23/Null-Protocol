import { useState, useRef, useEffect } from 'react';
import type { CombatSession, CombatEvent, CombatUnit } from '../../engine/combat';

interface CombatLogProps {
  session: CombatSession | null;
}

interface LogLine {
  key: string;
  text: string;
  kind: 'player' | 'monster';
  timestamp: number;
}

function formatEvent(event: CombatEvent, units: CombatUnit[], key: string): LogLine {
  if (event.type === 'regen') {
    const unit = units.find(u => u.id === event.unitId);
    const isPlayer = unit?.isPlayer ?? true;
    return { key, kind: isPlayer ? 'player' : 'monster', timestamp: event.timestamp, text: `${isPlayer ? 'You' : unit?.name ?? 'Unknown'} regenerated ${Math.round(event.healAmount)} HP.` };
  }

  const attacker = units.find(u => u.id === event.attackerId);
  const defender = units.find(u => u.id === event.defenderId);
  const isPlayerAttacker = attacker?.isPlayer ?? true;
  const attackerLabel = isPlayerAttacker ? 'You' : attacker?.name ?? 'Unknown';
  const defenderLabel = defender?.isPlayer ? 'you' : defender?.name ?? 'unknown';

  if (!event.outcome.hit) {
    return { key, kind: isPlayerAttacker ? 'player' : 'monster', timestamp: event.timestamp, text: `${attackerLabel} missed ${defenderLabel}.` };
  }

  const critSuffix = event.outcome.crit ? ' — CRITICAL HIT' : '';
  return { key, kind: isPlayerAttacker ? 'player' : 'monster', timestamp: event.timestamp, text: `${attackerLabel} hit ${defenderLabel} for ${event.outcome.damage} damage${critSuffix}.` };
}

export default function CombatLog({ session }: CombatLogProps) {
  // Clear hides everything up to the moment it's clicked, without touching
  // the real session — the actual combat event history stays intact
  // underneath, this is purely a display filter.
  const [clearedAt, setClearedAt] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const lines = session
    ? session.events.map((e, i) => formatEvent(e, session.units, `${e.timestamp}-${i}`)).filter(l => l.timestamp >= clearedAt)
    : [];

  // Keep the log pinned to the newest message — fires whenever the visible
  // line count changes, whether from a new combat event or a Clear.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <section className="panel log-panel corner-accent">
      <div className="panel-row-title">
        <span>// COMBAT LOG</span>
        <button onClick={() => setClearedAt(session?.elapsedTime ?? 0)}>CLEAR</button>
      </div>
      <div className="log-list" ref={listRef}>
        {lines.length === 0 && <p className="log-empty">No actions yet.</p>}
        {lines.map(line => (
          <p key={line.key} className={line.kind === 'player' ? 'player-log' : 'enemy-log'}>{line.text}</p>
        ))}
      </div>
    </section>
  );
}