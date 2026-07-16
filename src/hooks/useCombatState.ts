import { useState, useEffect, useRef, useCallback } from 'react';
import type { Loadout } from '../types';
import { createSession, advanceSession, type CombatSession } from '../engine/combat';
import { buildTestEncounterUnits } from '../engine/encounterSetup';

/**
 * Caps how much simulated time a single animation frame can advance the
 * session by. requestAnimationFrame can deliver a huge delta after the
 * browser tab was backgrounded/throttled (e.g. 30s in one jump) — without
 * this, advanceSession would only ever resolve ONE action per unit per
 * call regardless of how large the delta is, silently "eating" whatever
 * extra time accumulated while the tab was away. Clamping means combat
 * just resumes smoothly on refocus instead of doing something confusing.
 */
const MAX_FRAME_DELTA_SECONDS = 0.2;

export function useCombatState(loadout: Loadout) {
  const [session, setSession] = useState<CombatSession | null>(null);
  const [hasEngaged, setHasEngaged] = useState(false);
  const rafRef = useRef<number | null>(null);

  // (Re)builds the encounter whenever the loadout changes, but only while
  // combat hasn't started yet — once engaged, the fight's stats stay
  // frozen at what they were when it began, even if the player's gear
  // state changes elsewhere in the app.
  useEffect(() => {
    if (hasEngaged) return;
    const { player, monster } = buildTestEncounterUnits(loadout);
    setSession(createSession([player, monster]));
  }, [loadout, hasEngaged]);

  // Real-time tick loop — only runs once combat is actually engaged, and
  // stops itself the instant the session resolves. Gauges are completely
  // frozen before startCombat() is called; nothing advances pre-engagement.
  useEffect(() => {
    if (!hasEngaged || !session || session.isOver) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const rawDelta = (now - lastTime) / 1000;
      lastTime = now;
      const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SECONDS);
      setSession(prev => (prev && !prev.isOver ? advanceSession(prev, delta) : prev));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEngaged, session?.isOver]);

  const startCombat = useCallback(() => setHasEngaged(true), []);

  /** Rebuilds a fresh encounter and un-engages — for "fight again" after a win/loss, or leaving and retrying. */
  const resetEncounter = useCallback(() => {
    setHasEngaged(false);
    const { player, monster } = buildTestEncounterUnits(loadout);
    setSession(createSession([player, monster]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadout]);

  return { session, hasEngaged, startCombat, resetEncounter };
}