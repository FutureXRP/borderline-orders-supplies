import { Terrain, GRID_WIDTH, GRID_HEIGHT } from './constants';
import { Tile, GameState } from './types';
import { SeededRNG } from './rng';
import { scenarios } from './scenarios';

export function generateRandomMap(rng: SeededRNG, width: number, height: number): Tile[][] {
  const tiles: Tile[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      terrain: Terrain.Plains,
      owner: null,
      supplyLevel: 0,
      hasFortification: false,
    }))
  );

  // Place rivers
  for (let i = 0; i < 3; i++) {
    let x = rng.int(width);
    let y = rng.int(height);
    for (let j = 0; j < 12 + rng.int(8); j++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[y][x].terrain = Terrain.River;
      }
      const dir = rng.choice([-1, 0, 1]);
      x += dir;
      y += rng.choice([-1, 1]);
    }
  }

  // Place forests
  for (let i = 0; i < 40; i++) {
    const x = rng.int(width);
    const y = rng.int(height);
    tiles[y][x].terrain = Terrain.Forest;
    // small clumps
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (rng.next() < 0.4) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            tiles[ny][nx].terrain = Terrain.Forest;
          }
        }
      }
    }
  }

  // Place mountains
  for (let i = 0; i < 20; i++) {
    const x = rng.int(width);
    const y = rng.int(height);
    tiles[y][x].terrain = Terrain.Mountain;
  }

  // Place cities
  for (let i = 0; i < 5; i++) {
    let x: number, y: number;
    do {
      x = rng.int(width);
      y = rng.int(height);
    } while (tiles[y][x].terrain !== Terrain.Plains);
    tiles[y][x].terrain = Terrain.City;
  }

  return tiles;
}

export function placeStartingUnits(state: GameState, rng: SeededRNG) {
  const corners = [
    { x: 3, y: 3 },
    { x: state.tiles[0].length - 4, y: 3 },
    { x: 3, y: state.tiles.length - 4 },
    { x: state.tiles[0].length - 4, y: state.tiles.length - 4 },
  ];

  state.players.forEach((player, i) => {
    const pos = corners[i % corners.length];
    const unitId = `unit-${player.index}-squad`;
    state.units.push({
      id: unitId,
      type: 'squad' as const,
      player: player.index,
      position: pos,
      hp: 10,
      currentSupply: 5,
      queuedActions: [],
    });
    state.tiles[pos.y][pos.x].owner = player.index;
  });
}
