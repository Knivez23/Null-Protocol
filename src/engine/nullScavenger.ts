import type { NullState, ResourceBank, ResourceBankUpgrades, NullUpgradeTrackId } from '../types';
import { components } from '../data/components';
import { nodes } from '../data/nodes';
import {
  rollYieldBonus,
  getScannerBonusChance,
  getNullOnboardCapacity,
  getResourceBankCapacity,
  RESOURCE_BANK_UPGRADE,
} from '../config/gameConfig';

export function initNullState(): NullState {
  return {
    status: 'idle',
    currentNodeId: null,
    onboardCargo: {},
    upgradeRanks: { engine: 0, yield: 0, scanner: 0, storage: 0 },
    lastTickAt: Date.now(),
  };
}

function getTotalOnboardCargo(state: NullState): number {
  return Object.values(state.onboardCargo).reduce((sum, qty) => sum + qty, 0);
}

/** Deploy Null to a Node. Does NOT auto-recall existing cargo — see redeployToNode for that. */
export function deployToNode(state: NullState, nodeId: string): NullState {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) throw new Error(`Unknown node: ${nodeId}`);

  return {
    ...state,
    status: 'farming',
    currentNodeId: nodeId,
    lastTickAt: Date.now(),
  };
}

/**
 * Processes a single tick: rolls yield (Cargo-boosted), rolls a Scanner bonus,
 * adds to onboard cargo, and flips to 'cargoFull' if the onboard cap is hit.
 * Call this from a setInterval/game-loop tick, not per-render.
 */
export function processTick(state: NullState, rng: () => number = Math.random): NullState {
  if (state.status !== 'farming' || !state.currentNodeId) return state;

  const node = nodes.find(n => n.id === state.currentNodeId);
  const component = node ? components.find(c => c.id === node.componentId) : undefined;
  if (!node || !component) return state;

  const onboardCap = getNullOnboardCapacity(state.upgradeRanks.storage);
  const currentTotal = getTotalOnboardCargo(state);
  if (currentTotal >= onboardCap) {
    return { ...state, status: 'cargoFull' };
  }

  const yieldBonus = rollYieldBonus(state.upgradeRanks.yield, rng);
  const baseYield = component.baseTickYieldMin + yieldBonus; // baseTickYieldMin is flat 1 for every component

  // Scanner bonus: chance to double the WHOLE tick's yield (base + Yield-rank bonus).
  // (Discovery-pull-from-one-tier-up is a richer feature — flagged as a
  // follow-up once cross-tier "which component" selection logic is designed.)
  const scannerRoll = rng() < getScannerBonusChance(state.upgradeRanks.scanner);
  const tickYield = scannerRoll ? baseYield * 2 : baseYield;

  const roomLeft = onboardCap - currentTotal;
  const actualYield = Math.min(tickYield, roomLeft);

  const newOnboard = {
    ...state.onboardCargo,
    [component.id]: (state.onboardCargo[component.id] ?? 0) + actualYield,
  };

  const newTotal = currentTotal + actualYield;

  return {
    ...state,
    onboardCargo: newOnboard,
    status: newTotal >= onboardCap ? 'cargoFull' : 'farming',
    lastTickAt: Date.now(),
  };
}

export interface RecallResult {
  nullState: NullState;
  bank: ResourceBank;
  creditsGained: number;
  haul: Record<string, number>; // what was actually banked, per component (post-overflow)
}

/**
 * Transfers Null's onboard cargo into the Resource Bank. Per component:
 * fills up to that component's EFFECTIVE capacity (base globalCap + Resource
 * Bank upgrade rank — see getResourceBankCapacity); anything that doesn't
 * fit converts to Credits at the component's locked overflowRatio.
 */
export function recallAndUnload(state: NullState, bank: ResourceBank, bankUpgrades: ResourceBankUpgrades = {}): RecallResult {
  const newBank: ResourceBank = { ...bank };
  const haul: Record<string, number> = {};
  let creditsGained = 0;

  for (const [componentId, amount] of Object.entries(state.onboardCargo)) {
    if (amount <= 0) continue;
    const component = components.find(c => c.id === componentId);
    if (!component) continue;

    const effectiveCap = getResourceBankCapacity(component.globalCap, bankUpgrades[componentId] ?? 0);
    const currentBankAmount = newBank[componentId] ?? 0;
    const spaceAvailable = Math.max(0, effectiveCap - currentBankAmount);
    const transferred = Math.min(amount, spaceAvailable);
    const overflow = amount - transferred;

    newBank[componentId] = currentBankAmount + transferred;
    haul[componentId] = transferred;

    if (overflow > 0) {
      creditsGained += Math.floor(overflow / component.overflowRatio);
    }
  }

  const nullState: NullState = {
    ...state,
    status: 'idle',
    onboardCargo: {},
  };

  return { nullState, bank: newBank, creditsGained, haul };
}

/** Redeploy to a different Node — auto-recalls current cargo first, per the "instant and free" design. */
export function redeployToNode(state: NullState, nodeId: string, bank: ResourceBank, bankUpgrades: ResourceBankUpgrades = {}): { nullState: NullState; bank: ResourceBank; creditsGained: number; haul: Record<string, number> } {
  const recalled = recallAndUnload(state, bank, bankUpgrades);
  const redeployed = deployToNode(recalled.nullState, nodeId);
  return { ...recalled, nullState: redeployed };
}

export function upgradeTrack(state: NullState, track: NullUpgradeTrackId): NullState {
  return {
    ...state,
    upgradeRanks: {
      ...state.upgradeRanks,
      [track]: Math.min(5, state.upgradeRanks[track] + 1),
    },
  };
}

/** Upgrade a single component's Resource Bank capacity by 1 rank (max RESOURCE_BANK_UPGRADE.MAX_RANK). */
export function upgradeResourceBank(bankUpgrades: ResourceBankUpgrades, componentId: string): ResourceBankUpgrades {
  const currentRank = bankUpgrades[componentId] ?? 0;
  return {
    ...bankUpgrades,
    [componentId]: Math.min(RESOURCE_BANK_UPGRADE.MAX_RANK, currentRank + 1),
  };
}