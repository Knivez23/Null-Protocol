import type { CombatantStats } from '../../types';
import { statBarPct } from '../../data/statBarReference';
import ResistanceGrid from './ResistanceGrid';

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

/**
 * Combat and Systems Design v2.0 §5's Rating-vs-Percentage split — Ratings
 * display as flat numbers (no % sign); only Crit Chance/Crit Damage/Status
 * Chance show a % sign here, matching ItemDetailsPanel's formatting.
 */
function formatRating(value: number): string {
  return `${Math.round(value)}`;
}
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface StatBarProps { statId: string; label: string; value: number; isPercentage: boolean; }
function StatBar({ statId, label, value, isPercentage }: StatBarProps) {
  return (
    <div className="stat-bar-row">
      <div className="stat-bar-label"><span>{label}</span><b>{isPercentage ? formatPercent(value) : formatRating(value)}</b></div>
      <div className="stat-bar-track"><div className="stat-bar-fill" style={{ width: `${statBarPct(statId, value) * 100}%` }} /></div>
    </div>
  );
}

export default function PlayerPanel({ characterName, stats, powerLevel, combat }: PlayerPanelProps) {
  const currentHp = combat?.currentHp ?? stats.maxHp;
  const hpPct = Math.max(0, Math.min(100, (currentHp / stats.maxHp) * 100));

  return (
    <div className="panel">
      <div className="panel-head">// Player</div>
      <div className="panel-body">
        <div className="player-top">
          <div className="portrait">🪖</div>
          <div className="player-id">
            <div className="lvl-badge">◈</div>
            <div className="player-name">{characterName}</div>
            <div className="player-class">Netrunner</div>
          </div>
        </div>

        <div className="bar-row">
          <div className="bar-label"><span>HP</span><b>{Math.round(currentHp).toLocaleString()} / {Math.round(stats.maxHp).toLocaleString()}</b></div>
          <div className="bar-track"><div className="bar-fill hp" style={{ width: `${hpPct}%` }} /></div>
        </div>

        {combat && (
          <div className="bar-row">
            <div className="bar-label"><span>ATB</span><b>{combat.gaugeSeconds.toFixed(1)} / {combat.intervalSeconds.toFixed(1)}s</b></div>
            <div className="bar-track"><div className="bar-fill atb-bar-fill" style={{ width: `${Math.min(100, (combat.gaugeSeconds / combat.intervalSeconds) * 100)}%` }} /></div>
          </div>
        )}

        <div className="power-row">
          <div className="power-value">◈ {powerLevel.toLocaleString()}</div>
          <div className="power-label">Power Level</div>
        </div>

        <div className="stat-grid">
          <StatBar statId="attackPower" label="Attack Power" value={stats.attackPower} isPercentage={false} />
          <StatBar statId="meleeAccuracy" label="Melee Accuracy" value={stats.meleeAccuracy} isPercentage={false} />
          <StatBar statId="rangedAccuracy" label="Ranged Accuracy" value={stats.rangedAccuracy} isPercentage={false} />
          <StatBar statId="critChance" label="Crit Chance" value={stats.critChance} isPercentage={true} />
          <StatBar statId="critDamage" label="Crit Damage" value={stats.critDamage} isPercentage={true} />
          <StatBar statId="defensePower" label="Defense Power" value={stats.defensePower} isPercentage={false} />
          <StatBar statId="armorRating" label="Armor Rating" value={stats.armorRating} isPercentage={false} />
          <StatBar statId="dodgeRating" label="Dodge Rating" value={stats.dodgeRating} isPercentage={false} />
          <StatBar statId="evasionRating" label="Evasion Rating" value={stats.evasionRating} isPercentage={false} />
          <StatBar statId="speed" label="Speed" value={stats.speed} isPercentage={false} />
          <StatBar statId="regenRating" label="Regen Rating" value={stats.regenRating} isPercentage={false} />
          {stats.armorPierce > 0 && <StatBar statId="armorPierce" label="Armor Pierce" value={stats.armorPierce} isPercentage={false} />}
          {stats.resistancePierce > 0 && <StatBar statId="resistancePierce" label="Resistance Pierce" value={stats.resistancePierce} isPercentage={false} />}
          {stats.statusPower > 0 && <StatBar statId="statusPower" label="Status Power" value={stats.statusPower} isPercentage={false} />}
          {stats.statusChance > 0 && <StatBar statId="statusChance" label="Status Chance" value={stats.statusChance} isPercentage={true} />}
        </div>

        <ResistanceGrid resistances={stats.resistances} showValues={true} />
      </div>
    </div>
  );
}