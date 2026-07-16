import type { CombatSession } from '../../engine/combat';
import { getGaugeInfo } from '../../engine/combat';
import { statBarPct } from '../../data/statBarReference';
import { MONSTER_ARCHETYPES, ROLE_THREAT_LABEL } from '../../data/monsters';
import { resistanceMeta } from '../../data/resistances';
import { SegmentBar } from './SegmentBar';

interface HostilePanelProps {
  session: CombatSession | null;
}

const RES_DOT_COUNT = 5;
function resDotsFilled(value: number): number {
  return Math.min(RES_DOT_COUNT, Math.round((value / 300) * RES_DOT_COUNT));
}

/**
 * Bars only, no numbers, anywhere on this panel — including HP and ATB.
 * This stays true even though the visual reference this panel is built
 * from actually DOES show HP/ATB as text ("4,556 / 6,800") — that
 * conflicts with "hostile stat values stay hidden from the player," which
 * was locked earlier in the project and takes precedence over the
 * reference's literal content. The reference is the visual language here,
 * not a rule override.
 */
export default function HostilePanel({ session }: HostilePanelProps) {
  if (!session) return null;
  const monster = session.units.find(u => !u.isPlayer);
  if (!monster) return null;

  const archetype = MONSTER_ARCHETYPES[monster.id];
  const threatLabel = archetype ? ROLE_THREAT_LABEL[archetype.role] : '—';
  const hpPct = Math.max(0, Math.min(1, monster.currentHp / monster.stats.maxHp));
  const gauge = getGaugeInfo(monster);
  const atbPct = Math.min(1, gauge.elapsed / gauge.interval);
  const stats = monster.stats;

  return (
    <section className="panel hostile-panel corner-accent red-corner">
      <div className="panel-title">// HOSTILE</div>

      <div className="hostile-head">
        <div className="enemy-emblem">☣</div>
        <div><h3>{monster.name.toUpperCase()}</h3><p>{archetype?.role.toUpperCase() ?? 'UNKNOWN'}</p></div>
        <div className="threat compact">THREAT <b>▲ {threatLabel.toUpperCase()}</b></div>
      </div>

      <div className="meter-row"><div className="meter-label"><span>HP</span></div><div className="meter hp"><span style={{ width: `${hpPct * 100}%` }} /></div></div>
      <div className="meter-row"><div className="meter-label"><span>ATB</span></div><SegmentBar pct={atbPct} color="red" /></div>

      <div className="section-block enemy-stat-block">
        <div className="section-title">// STATS</div>
        <div className="enemy-stats-grid">
          <div className="enemy-stat-row"><span>ATTACK</span><SegmentBar pct={statBarPct('attackPower', stats.attackPower)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>DODGE</span><SegmentBar pct={statBarPct('dodgeRating', stats.dodgeRating)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>MELEE ACC</span><SegmentBar pct={statBarPct('meleeAccuracy', stats.meleeAccuracy)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>EVASION</span><SegmentBar pct={statBarPct('evasionRating', stats.evasionRating)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>RANGED ACC</span><SegmentBar pct={statBarPct('rangedAccuracy', stats.rangedAccuracy)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>SPEED</span><SegmentBar pct={statBarPct('speed', stats.speed)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>DEFENSE</span><SegmentBar pct={statBarPct('defensePower', stats.defensePower)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>ARMOR</span><SegmentBar pct={statBarPct('armorRating', stats.armorRating)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>CRIT %</span><SegmentBar pct={statBarPct('critChance', stats.critChance)} color="red" segments={8} /></div>
          <div className="enemy-stat-row"><span>CRIT DMG</span><SegmentBar pct={statBarPct('critDamage', stats.critDamage)} color="red" segments={8} /></div>
        </div>
      </div>

      <div className="section-block hostile-resistances">
        <div className="section-title">// RESISTANCES</div>
        <div className="res-icons-row">
          {resistanceMeta.map(r => {
            const value = stats.resistances[r.key];
            const filled = resDotsFilled(value);
            return (
              <div key={r.key}>
                {r.icon}
                <span>{r.label.toUpperCase()}</span>
                <b>{'◆'.repeat(filled)}{'◇'.repeat(RES_DOT_COUNT - filled)}</b>
              </div>
            );
          })}
        </div>
      </div>

      {/* No "Active Effects" — same reasoning as Player Panel: no real Status Effect system exists yet. */}
    </section>
  );
}