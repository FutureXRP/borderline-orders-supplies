import { GameState, Position } from './types';
import { SeededRNG } from './rng';

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
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { x: from.x + Math.sign(dx), y: from.y };
  } else {
    return { x: from.x, y: from.y + Math.sign(dy) };
  }
}

export function runAIPlanning(state: GameState, _playerIndex: number) {
  const rng = new SeededRNG(state.seed + state.currentRound * 1337 + _playerIndex);
  const player = state.players[_playerIndex];
  if (!player.isAI) return;

  const myUnits = getUnitByPlayer(state, _playerIndex);
  let ordersLeft = player.maxOrders;

  myUnits.forEach(unit => {
    if (ordersLeft <= 0) return;

    const nearestCity = findNearestCity(state, unit.position, _playerIndex);
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

    if (unit.currentSupply < 3) {
      player.queuedActions.push({
        type: 'fortify',
        unitId: unit.id,
      });
      ordersLeft--;
    }

    if (ordersLeft > 0 && rng.next() < 0.4) {
      const enemies = state.units.filter(u => u.player !== _playerIndex);
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
