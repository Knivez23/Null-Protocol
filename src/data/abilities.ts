import type { Ability } from '../types';

export const abilities: Ability[] = [
  { id: 1, name: 'Shadow Dash',       icon: '➹', cost: 20, cooldownSec: 2.4, color: 'var(--text-hi)' },
  { id: 2, name: 'Phase Strike',      icon: '⟁', cost: 30, cooldownSec: 3.6, color: 'var(--text-hi)' },
  { id: 3, name: 'Null Field',        icon: '⬡', cost: 25, cooldownSec: 6.1, color: 'var(--cyan)' },
  { id: 4, name: 'Execute Protocol',  icon: '◎', cost: 40, cooldownSec: 8.2, color: 'var(--text-hi)' },
  { id: 5, name: 'Vanish',            icon: '≋', cost: 20, cooldownSec: 4.2, color: 'var(--text-hi)' },
  { id: 6, name: 'Overload',          icon: '▲', cost: 35, cooldownSec: 7.5, color: 'var(--red)' },
];