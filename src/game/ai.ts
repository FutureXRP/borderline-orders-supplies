import { GameState, Player, Action, Position } from './types';
import { SeededRNG } from './rng';
import { UNIT_STATS } from './constants';

function getUnitByPlayer(state: GameState, playerIndex: number) {
  return state.units.filter(u => u.player === playerIndex);
}

function findNearestCity(state: GameState, unitPos: Position, playerIndex: number) {
  let best: Position | null = null;
  let bestDist = Infinity;
  state.tiles.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile.terrain === 'city' && tile.owner !== playerIndex) {
        const dist = Math.abs(x - unitPos.x) + Math.abs(y - unitPos.y);
        if (dist < bestDist) {
          bestDist = dist;
          best = { x, y };
        }
      }
    })
  );
  return best;
}

function findPathTo(state: GameState, from: Position, to: Position): Position | null {
  // Very simple greedy path - just move closer
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: from.x + Math.sign(dx), y: from.y };
  } else {
    return { x: from.x, y: from.y + Math.sign(dy) };
  }
}

export function runAIPlanning(state: GameState, playerIndex: number) {
  const rng = new SeededRNG(state.seed + state.currentRound * 1337 + playerIndex);
  const player = state.players[playerIndex];
  if (!player.isAI) return;

  const myUnits = getUnitByPlayer(state, playerIndex);
  let ordersLeft = player.maxOrders;

  myUnits.forEach(unit => {
    if (ordersLeft <= 0) return;

    // Prioritize capturing cities
    const nearestCity = findNearestCity(state, unit.position, playerIndex);
    if (nearestCity) {
      const nextStep = findPathTo(state, unit.position, nearestCity);
      if (nextStep) {
        player.queuedActions.push({
          type: 'move',
          target: nextStep,
          unitId: unit.id,
        });
        ordersLeft--;
      }
    }

    // If low supply, try to move toward own supply
    if (unit.currentSupply < 3) {
      // find nearest own depot/city
      // simplified: just stay or fortify
      player.queuedActions.push({
        type: 'fortify',
        unitId: unit.id,
      });
      ordersLeft--;
    }

    // Occasionally attack if favorable
    if (ordersLeft > 0 && rng.next() < 0.4) {
      const enemies = state.units.filter(u => u.player !== playerIndex);
      const closeEnemy = enemies.find(
        u => Math.abs(u.position.x - unit.position.x) + Math.abs(u.position.y - unit.position.y) <= 2
      );
      if (closeEnemy) {
        player.queuedActions.push({
          type: 'attack',
          target: closeEnemy.position,
          unitId: unit.id,
        });
        ordersLeft--;
      }
    }
  });
}
