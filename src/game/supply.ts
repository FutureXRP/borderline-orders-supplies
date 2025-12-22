import { GameState, Position } from './types';
import { Terrain } from './constants';

function manhattan(a: Position, b: Position) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(x: number, y: number, width: number, height: number) {
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  return dirs
    .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
    .filter(p => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height);
}

export function distributeSupply(state: GameState) {
  const width = state.tiles[0].length;
  const height = state.tiles.length;

  // Reset supply levels
  state.tiles.forEach(row => row.forEach(tile => (tile.supplyLevel = 0)));

  // Find sources (cities + depots) per player
  state.players.forEach(player => {
    const sources: Position[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = state.tiles[y][x];
        if (tile.owner === player.index && (tile.terrain === 'city' || tile.terrain === 'depot')) {
          sources.push({ x, y });
          tile.supplyLevel = 10; // high base
        }
      }
    }

    // Simple flood fill with decay
    const visited = new Set<string>();
    const queue: { pos: Position; supply: number }[] = sources.map(p => ({ pos: p, supply: 10 }));

    while (queue.length > 0) {
      const { pos, supply } = queue.shift()!;
      const key = `${pos.x},${pos.y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const tile = state.tiles[pos.y][pos.x];
      if (tile.owner === player.index || tile.terrain === 'road' || tile.terrain === 'bridge') {
        tile.supplyLevel = Math.max(tile.supplyLevel, supply);
      }

      if (supply <= 1) continue;

      for (const nb of getNeighbors(pos.x, pos.y, width, height)) {
        const nbTile = state.tiles[nb.y][nb.x];
        if (nbTile.owner === player.index || ['road', 'bridge'].includes(nbTile.terrain)) {
          queue.push({ pos: nb, supply: supply - 1 });
        }
      }
    }
  });

  // Apply to units
  state.units.forEach(unit => {
    const tile = state.tiles[unit.position.y][unit.position.x];
    unit.currentSupply = Math.max(unit.currentSupply, tile.supplyLevel);
  });
}
