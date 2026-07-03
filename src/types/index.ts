export interface Ability {
  id: number;
  name: string;
  icon: string;
  cost: number;
  cooldownSec: number;
  color: string;
}

export type SectionId = 'encounter' | 'abilities' | 'equipment' | 'inventory' | 'map';

export interface SectionMeta {
  id: SectionId;
  label: string;
  background: string;
}

export type ComponentTier = 'common' | 'rare' | 'epic';

export interface ComponentMeta {
  id: string;
  name: string;
  tier: ComponentTier;
  description: string;
  icon: string;
  nodeModifierSec: number;
  baseTickYieldMin: number;
  baseTickYieldMax: number;
  globalCap: number;
  overflowRatio: number;
  unlockedFromStart: boolean;
}