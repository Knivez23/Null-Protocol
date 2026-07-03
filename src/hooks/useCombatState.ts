import { useState, useEffect, useCallback } from 'react';

const MAX_ENERGY = 120;
const MAX_BOSS_HP = 6800;

export function useCombatState() {
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [bossHpPct, setBossHpPct] = useState(67);
  const [round, setRound] = useState(2);
  const [cooldowns, setCooldowns] = useState<Record<number, boolean>>({});

  // energy regen tick
  useEffect(() => {
    const t = setInterval(() => {
      setEnergy(e => Math.min(MAX_ENERGY, e + 5));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const useAbility = useCallback((abilityId: number, cost: number, cooldownSec: number) => {
    setEnergy(prev => {
      if (prev < cost || cooldowns[abilityId]) return prev;
      return prev - cost;
    });

    setCooldowns(prev => ({ ...prev, [abilityId]: true }));
    setTimeout(() => {
      setCooldowns(prev => ({ ...prev, [abilityId]: false }));
    }, cooldownSec * 1000);

    setBossHpPct(prev => Math.max(0, prev - (Math.random() * 4 + 2)));
  }, [cooldowns]);

  const endTurn = useCallback(() => setRound(r => r + 1), []);

  return {
    energy, maxEnergy: MAX_ENERGY,
    bossHpPct, bossHpCurrent: Math.round(MAX_BOSS_HP * bossHpPct / 100), maxBossHp: MAX_BOSS_HP,
    round, cooldowns, useAbility, endTurn,
  };
}