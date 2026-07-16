import type { CombatSession } from '../../engine/combat';

interface ExpeditionDetailsProps {
  session: CombatSession | null;
  characterPL: number;
}

/**
 * "Recommended PL" here is genuinely real — encounterSetup.ts intentionally
 * matches the monster's Map Recommended PL to the player's own Character PL
 * (no map generator exists yet to source a real, independent value from).
 * Everything else on this panel (map name, room progress, modifiers,
 * rewards, faction/biome) has no real system behind it yet — labeled
 * explicitly rather than filled with invented flavor text that could be
 * mistaken for actual content.
 */
export default function ExpeditionDetails({ session, characterPL }: ExpeditionDetailsProps) {
  if (!session) return null;

  return (
    <div className="panel">
      <div className="panel-head">// Expedition Details</div>
      <div className="expedition-details-body">
        <div className="expedition-details-title">Hand-Crafted Test Encounter</div>
        <div className="expedition-details-sub">No map system yet — fixed test fight</div>

        <div className="expedition-pl-row">
          <div><span className="expedition-pl-label">Recommended PL</span><b>{characterPL.toLocaleString()}</b></div>
          <div><span className="expedition-pl-label">Your PL</span><b className="you">{characterPL.toLocaleString()}</b></div>
        </div>

        <div className="expedition-stub-note">Room Progress, Map Modifiers, Rewards Preview, and Faction/Biome tags all depend on the Random Map Generator, which doesn't exist yet — intentionally omitted rather than shown with invented placeholder content.</div>
      </div>
    </div>
  );
}