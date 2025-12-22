import { describe, it, expect } from 'vitest';
import { distributeSupply } from '@/game/supply';
import { createInitialGameState } from '@/game/gameState';

describe('supply distribution', () => {
  it('propagates supply from city', () => {
    const state = createInitialGameState({ width: 10, height: 10, seed: 999, playerCount: 2, aiPlayerIndices: [] });
    distributeSupply(state);
    // Find a city and check nearby tiles have supply > 0
    let hasSupply = false;
    state.tiles.forEach(row =>
      row.forEach(tile => {
        if (tile.supplyLevel > 0) hasSupply = true;
      })
    );
    expect(hasSupply).toBe(true);
  });
});
