import type { CombatantStats, ResistanceType } from '../../types';
import { resistanceMeta } from '../../data/resistances';
import { statBarPct } from '../../data/statBarReference';
import { computeResistancePercent } from '../../config/combatFormulas';
import { SegmentBar, DiamondBar } from './SegmentBar';

interface PlayerPanelProps {
  characterName: string;
  stats: CombatantStats;
  powerLevel: number;
  /** Live fight data — omit for a bare character-sheet view (full HP, no ATB bar). Provided by useCombatState during an actual encounter. */
  combat?: {
    currentHp: number;
    gaugeSeconds: number;
    intervalSeconds: number;
  };
}

function formatRating(value: number): string {
  return `${Math.round(value)}`;
}
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

const RES_DOT_COUNT = 5; // each dot = 20% of the REAL effective resistance % (post-formula, capped at 75%) — same convention as HostilePanel, so a dot means the same thing on both sides of a fight

function resDotsFilled(rawRating: number): number {
  const effectivePct = computeResistancePercent(rawRating); // 0-0.75
  return Math.min(RES_DOT_COUNT, Math.round(effectivePct / 0.20));
}

export default function PlayerPanel({ characterName, stats, powerLevel, combat }: PlayerPanelProps) {
  const currentHp = combat?.currentHp ?? stats.maxHp;
  const hpPct = Math.max(0, Math.min(100, (currentHp / stats.maxHp) * 100));
  const atbPct = combat ? Math.min(1, combat.gaugeSeconds / combat.intervalSeconds) : 0;

  return (
    <aside className="panel player-panel corner-accent">
      <div className="panel-title">// PLAYER</div>

      <section className="player-header">
        <div className="portrait css-portrait"><div className="visor"></div></div>
        <div className="player-id">
          <div className="level-badge">◈</div><span className="loadout-pl-badge">◈ {powerLevel.toLocaleString()} <small>PL</small></span>
          <h2>{characterName.toUpperCase()}</h2>
          <p>NETRUNNER</p>
        </div>
        <div className="rank-chevron"></div>
      </section>

      <section className="vitals">
        <div className="meter-row">
          <div className="meter-label"><span>HP</span><span>{Math.round(currentHp).toLocaleString()} / {Math.round(stats.maxHp).toLocaleString()}</span></div>
          <div className="meter hp"><span style={{ width: `${hpPct}%` }} /></div>
        </div>
        {combat && (
          <div className="meter-row">
            <div className="meter-label"><span>ATB</span><span>{combat.gaugeSeconds.toFixed(1)}s / {combat.intervalSeconds.toFixed(1)}s</span></div>
            <SegmentBar pct={atbPct} />
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-title">// STATS</div>
        <div className="stat-list player-stats">
          <div className="stat-line"><span>ATTACK POWER</span><SegmentBar pct={statBarPct('attackPower', stats.attackPower)} /><b>{formatRating(stats.attackPower)}</b></div>
          <div className="stat-line"><span>MELEE ACCURACY</span><SegmentBar pct={statBarPct('meleeAccuracy', stats.meleeAccuracy)} /><b>{formatRating(stats.meleeAccuracy)}</b></div>
          <div className="stat-line"><span>RANGED ACCURACY</span><SegmentBar pct={statBarPct('rangedAccuracy', stats.rangedAccuracy)} /><b>{formatRating(stats.rangedAccuracy)}</b></div>
          <div className="stat-line"><span>DEFENSE POWER</span><SegmentBar pct={statBarPct('defensePower', stats.defensePower)} /><b>{formatRating(stats.defensePower)}</b></div>
          <div className="stat-line"><span>ARMOR RATING</span><SegmentBar pct={statBarPct('armorRating', stats.armorRating)} /><b>{formatRating(stats.armorRating)}</b></div>
          <div className="stat-line"><span>DODGE RATING</span><SegmentBar pct={statBarPct('dodgeRating', stats.dodgeRating)} /><b>{formatRating(stats.dodgeRating)}</b></div>
          <div className="stat-line"><span>EVASION RATING</span><SegmentBar pct={statBarPct('evasionRating', stats.evasionRating)} /><b>{formatRating(stats.evasionRating)}</b></div>
          <div className="stat-line"><span>SPEED</span><SegmentBar pct={statBarPct('speed', stats.speed)} /><b>{formatRating(stats.speed)}</b></div>
          <div className="stat-line"><span>REGEN RATING</span><SegmentBar pct={statBarPct('regenRating', stats.regenRating)} /><b>{formatRating(stats.regenRating)}</b></div>
          <div className="stat-line"><span>CRIT CHANCE</span><DiamondBar pct={statBarPct('critChance', stats.critChance)} /><b>{formatPercent(stats.critChance)}</b></div>
          <div className="stat-line"><span>CRIT DAMAGE</span><DiamondBar pct={statBarPct('critDamage', stats.critDamage)} /><b>{formatPercent(stats.critDamage)}</b></div>
          {stats.armorPierce > 0 && <div className="stat-line"><span>ARMOR PIERCE</span><SegmentBar pct={statBarPct('armorPierce', stats.armorPierce)} /><b>{formatRating(stats.armorPierce)}</b></div>}
          {stats.resistancePierce > 0 && <div className="stat-line"><span>RESISTANCE PIERCE</span><SegmentBar pct={statBarPct('resistancePierce', stats.resistancePierce)} /><b>{formatRating(stats.resistancePierce)}</b></div>}
          {stats.statusPower > 0 && <div className="stat-line"><span>STATUS POWER</span><SegmentBar pct={statBarPct('statusPower', stats.statusPower)} /><b>{formatRating(stats.statusPower)}</b></div>}
          {stats.statusChance > 0 && <div className="stat-line"><span>STATUS CHANCE</span><DiamondBar pct={statBarPct('statusChance', stats.statusChance)} /><b>{formatPercent(stats.statusChance)}</b></div>}
        </div>
      </section>

      <section className="section-block resistance-block">
        <div className="section-title">// RESISTANCES</div>
        <div className="res-grid">
          {resistanceMeta.map(r => {
            const value = stats.resistances[r.key as ResistanceType];
            const filled = resDotsFilled(value);
            return (
              <div className={`res-item ${r.key}`} key={r.key}>
                <i>{r.icon}</i>
                <span>{r.label.toUpperCase()}</span>
                <div className="micro-dots">
                  {Array.from({ length: RES_DOT_COUNT }).map((_, i) => (
                    <em key={i} className={i < filled ? 'filled' : ''}>◆</em>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* No "Active Effects" section — Status Effects aren't a real system yet.
          The original reference showed hardcoded fake buff/debuff icons here;
          same call as removing the fake Shield bar/buff timers earlier —
          don't display invented data with nothing real behind it. */}

      <button className="ghost-button">VIEW LOADOUT <span>›</span></button>
    </aside>
  );
}