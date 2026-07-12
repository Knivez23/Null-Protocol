import type { NodeMeta } from '../types';

export const nodes: NodeMeta[] = [
  {
    id: 'scrapfield', name: 'Scrapfield', componentId: 'salvage', unlockedFromStart: true,
    flavorText: "A derelict junk sector littered with the wreckage of failed system purges. Null sifts through the debris for anything still worth salvaging.",
  },
  {
    id: 'ironvein', name: 'Ironvein', componentId: 'ferracite', unlockedFromStart: true,
    flavorText: "Corroded structural framework runs through this sector like exposed veins — rich in raw, rugged metal.",
  },
  {
    id: 'loomworks', name: 'Loomworks', componentId: 'nanoweave', unlockedFromStart: false,
    flavorText: "An abandoned textile fabrication line, its automated looms still weaving high-tech fiber long after the operators vanished.",
  },
  {
    id: 'circuit-well', name: 'Circuit Well', componentId: 'corvex', unlockedFromStart: false,
    flavorText: "A vertical shaft lined with dead server racks, plunging deep into the netscape's oldest infrastructure. Advanced circuitry, if you can reach it.",
  },
  {
    id: 'resin-vault', name: 'Resin Vault', componentId: 'plasmite', unlockedFromStart: false,
    flavorText: "A sealed storage bay of half-cured synthetic resin, still soft enough to mold — for now.",
  },
  {
    id: 'fracture', name: 'Fracture', componentId: 'nyxium', unlockedFromStart: false,
    flavorText: "A rupture in the System's bedrock code, bleeding unstable, exotic material into the surrounding sector. Handle with caution.",
  },
  {
    id: 'foundry', name: 'Foundry', componentId: 'synthex-6', unlockedFromStart: false,
    flavorText: "The heavy-industry heart of a long-dead manufacturing block. Structural alloys, forged under conditions nothing modern can replicate.",
  },
  {
    id: 'neural-core', name: 'Neural Core', componentId: 'synapsium', unlockedFromStart: false,
    flavorText: "The System's original cognition array, still faintly pulsing. Extracting from it is delicate, dangerous work.",
  },
];