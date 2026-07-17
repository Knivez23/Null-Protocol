/**
 * Empty shell — no real Status Effect / Active Effect system exists yet
 * (same boundary as everywhere else this has come up: Player/Hostile
 * panels deliberately don't show invented buff/debuff data either). This
 * is correctly shaped and positioned now so it's ready to receive real
 * icons the moment that system lands, without another layout pass.
 */
export default function ActiveEffectsBanner() {
  return (
    <div className="effects-banner">
      <div className="section-title center">// ACTIVE EFFECTS</div>
      <div className="effects-strip">
        <div className="effects-wing left">
          <span className="effects-empty">No active effects</span>
        </div>
        <div className="effects-hex">◈</div>
        <div className="effects-wing right">
          <span className="effects-empty">No active effects</span>
        </div>
      </div>
    </div>
  );
}