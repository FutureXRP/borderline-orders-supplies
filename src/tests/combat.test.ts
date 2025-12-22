import { describe, it, expect } from 'vitest';
import { resolveCombat } from '@/game/combat';
import { SeededRNG } from '@/game/rng';
import { UnitType } from '@/game/constants';

describe('combat determinism', () => {
  it('produces same result with same seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    const attacker = { type: UnitType.Squad, currentSupply: 5, hp: 10 } as any;
    const defender = { type: UnitType.Squad, currentSupply: 5, hp: 10 } as any;

    const a1 = { ...attacker };
    const d1 = { ...defender };
    resolveCombat(a1, d1, 'plains', 'plains', rng1);

    const a2 = { ...attacker };
    const d2 = { ...defender };
    resolveCombat(a2, d2, 'plains', 'plains', rng2);

    expect(a1.hp).toBe(a2.hp);
    expect(d1.hp).toBe(d2.hp);
  });
});
