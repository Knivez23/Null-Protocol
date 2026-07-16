import type { CombatSession } from '../../engine/combat';

interface ExpeditionDetailsProps {
  session: CombatSession | null;
  characterPL: number;
}

/**
 * "Recommended PL" is genuinely real — encounterSetup.ts intentionally
 * matches the monster's Map Recommended PL to the player's own Character
 * PL (no map generator exists yet to source a real, independent value
 * from). The stub note that used to sit below this (listing everything
 * NOT yet real — Room Progress, Modifiers, Rewards, Faction/Biome) was
 * removed on request, to shrink this panel and give Combat Log more room.
 */
export default function ExpeditionDetails({ session, characterPL }: ExpeditionDetailsProps) {
  if (!session) return null;

  return (
    <section className="panel details-panel corner-accent">
      <div className="panel-row-title"><span>// EXPEDITION DETAILS</span></div>
      <h3>HAND-CRAFTED TEST ENCOUNTER</h3>
      <p>No map system yet — fixed test fight</p>
      <div className="detail-grid">
        <span>RECOMMENDED PL</span><b>{characterPL.toLocaleString()}</b>
        <span>YOUR PL</span><b className="green">{characterPL.toLocaleString()}</b>
      </div>
    </section>
  );
}
