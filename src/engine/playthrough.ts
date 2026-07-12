import type { PlaythroughSaveData } from '../types';
import { emptyLoadout } from '../types';
import { playerStartStats } from '../data/playerStart';
import { nodes } from '../data/nodes';
import { initNullState } from './nullScavenger';

const STARTING_CREDITS = 500; // placeholder — real economy/Credits balancing is still TBD

function generatePlaythroughId(): string {
  return `pt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function createNewPlaythrough(characterName: string): PlaythroughSaveData {
  const now = Date.now();
  const trimmedName = characterName.trim() || 'UNNAMED';

  return {
    meta: {
      id: generatePlaythroughId(),
      characterName: trimmedName,
      createdAt: now,
      lastPlayedAt: now,
      powerLevel: 50, // matches the Rags/T1 baseline PL from the Bible onboarding
    },
    playerStats: {
      ...playerStartStats,
      resistances: { ...playerStartStats.resistances },
    },
    resourceBank: {},
    resourceBankUpgrades: {},
    nullState: initNullState(),
    credits: STARTING_CREDITS,
    loadout: emptyLoadout(),
    nodesUnlocked: nodes.filter(n => n.unlockedFromStart).map(n => n.id),
    schematicsUnlocked: [],
  };
}