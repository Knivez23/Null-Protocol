import type { CombatSession, CombatEvent, CombatUnit } from '../../engine/combat';

interface CombatLogProps {
  session: CombatSession | null;
}

interface LogLine {
  key: string;
  text: string;
  kind: 'player' | 'monster';
}

function formatEvent(event: CombatEvent, units: CombatUnit[], key: string): LogLine {
  if (event.type === 'regen') {
    const unit = units.find(u => u.id === event.unitId);
    const isPlayer = unit?.isPlayer ?? true;
    return { key, kind: isPlayer ? 'player' : 'monster', text: `${isPlayer ? 'You' : unit?.name ?? 'Unknown'} regenerated ${Math.round(event.healAmount)} HP.` };
  }

  const attacker = units.find(u => u.id === event.attackerId);
  const defender = units.find(u => u.id === event.defenderId);
  const isPlayerAttacker = attacker?.isPlayer ?? true;
  const attackerLabel = isPlayerAttacker ? 'You' : attacker?.name ?? 'Unknown';
  const defenderLabel = defender?.isPlayer ? 'you' : defender?.name ?? 'unknown';

  if (!event.outcome.hit) {
    return { key, kind: isPlayerAttacker ? 'player' : 'monster', text: `${attackerLabel} missed ${defenderLabel}.` };
  }

  const critSuffix = event.outcome.crit ? ' — CRITICAL HIT' : '';
  return { key, kind: isPlayerAttacker ? 'player' : 'monster', text: `${attackerLabel} hit ${defenderLabel} for ${event.outcome.damage} damage${critSuffix}.` };
}

export default function CombatLog({ session }: CombatLogProps) {
  const lines = session ? session.events.map((e, i) => formatEvent(e, session.units, `${e.timestamp}-${i}`)) : [];

  return (
    <div className="panel">
      <div className="panel-head">// Combat Log</div>
      <div className="combat-log-list">
        {lines.length === 0 && <div className="combat-log-empty">No actions yet.</div>}
        {lines.map(line => (
          <div key={line.key} className={`combat-log-line ${line.kind}`}>{line.text}</div>
        ))}
      </div>
    </div>
  );
}