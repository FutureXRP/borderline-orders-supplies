import { GameState, Action, Unit, Position } from './types';
import { SeededRNG } from './rng';
import { distributeSupply } from './supply';
import { resolveCombat } from './combat';
import { updateMaxOrders } from './gameState';
import { UNIT_STATS } from './constants';

function getUnitById(state: GameState, id: string): Unit | undefined {
  return state.units.find(u => u.id === id);
}

function posKey(p: Position) {
  return `${p.x},${p.y}`;
}

export function resolveRound(state: GameState): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState; // deep copy
  const rng = new SeededRNG(newState.seed + newState.currentRound * 1000);

  // 1. Recon (just increases vision for this round - handled in UI)
  // 2. Supply distribution
  distributeSupply(newState);

  // 3. Movement
  const moveActions = newState.players.flatMap(p => p.queuedActions.filter(a => a.type === 'move'));
  const intendedPositions = new Map<string, string[]>(); // tile key -> unit ids wanting to move there

  moveActions.forEach(action => {
    const unit = getUnitById(newState, action.unitId);
    if (unit && action.target) {
      const key = posKey(action.target);
      if (!intendedPositions.has(key)) intendedPositions.set(key, []);
      intendedPositions.get(key)!.push(unit.id);
    }
  });

  // Resolve conflicts: highest supply + rng tiebreaker stays, others bounce back
  intendedPositions.forEach((unitIds, key) => {
    if (unitIds.length > 1) {
      unitIds.sort((aId, bId) => {
        const a = getUnitById(newState, aId)!;
        const b = getUnitById(newState, bId)!;
        const diff = b.currentSupply - a.currentSupply;
        if (diff !== 0) return diff;
        return rng.next() > 0.5 ? 1 : -1;
      });
      // First unit gets the tile, others stay
      const winnerId = unitIds[0];
      const winner = getUnitById(newState, winnerId)!;
      const target = moveActions.find(a => a.unitId === winnerId)?.target!;
      winner.position = target;

      // Others stay at origin
    } else if (unitIds.length === 1) {
      const unit = getUnitById(newState, unitIds[0])!;
      const target = moveActions.find(a => a.unitId === unitIds[0])?.target!;
      if (target) unit.position = target;
    }
  });

  // 4. Combat
  const attackActions = newState.players.flatMap(p => p.queuedActions.filter(a => a.type === 'attack'));
  attackActions.forEach(action => {
    const attacker = getUnitById(newState, action.unitId);
    if (!attacker || !action.target) return;
    const defender = newState.units.find(
      u => u.player !== attacker.player && posKey(u.position) === posKey(action.target!)
    );
    if (defender) {
      const aTerrain = newState.tiles[attacker.position.y][attacker.position.x].terrain;
      const dTerrain = newState.tiles[defender.position.y][defender.position.x].terrain;
      resolveCombat(attacker, defender, aTerrain, dTerrain, rng);
    }
  });

  // 5. Construction
  newState.players.forEach(player => {
    player.queuedActions.forEach(action => {
      if (action.type === 'buildRoad' || action.type === 'buildBridge') {
        const unit = getUnitById(newState, action.unitId);
        if (unit && action.target) {
          const tile = newState.tiles[action.target.y][action.target.x];
          tile.terrain = action.type === 'buildBridge' ? 'bridge' : 'road';
        }
      } else if (action.type === 'buildDepot') {
        const unit = getUnitById(newState, action.unitId);
        if (unit && action.target) {
          const tile = newState.tiles[action.target.y][action.target.x];
          tile.terrain = 'depot';
          tile.owner = player.index;
        }
      } else if (action.type === 'fortify') {
        const unit = getUnitById(newState, action.unitId);
        if (unit) {
          const tile = newState.tiles[unit.position.y][unit.position.x];
          tile.hasFortification = true;
        }
      }
    });
  });

  // 6. Attrition & Cleanup
  newState.units = newState.units.filter(unit => {
    if (unit.currentSupply === 0) {
      unit.hp -= 2;
    }
    unit.currentSupply = Math.max(0, unit.currentSupply - UNIT_STATS[unit.type].supplyPerTurn);
    return unit.hp > 0;
  });

  // Update tile ownership
  const ownerCount = new Map<string, number>();
  newState.units.forEach(unit => {
    const key = posKey(unit.position);
    ownerCount.set(key, (ownerCount.get(key) || 0) + 1);
  });
  for (let y = 0; y < newState.tiles.length; y++) {
    for (let x = 0; x < newState.tiles[0].length; x++) {
      const key = posKey({ x, y });
      const unit = newState.units.find(u => posKey(u.position) === key);
      if (unit && ownerCount.get(key) === 1) {
        newState.tiles[y][x].owner = unit.player;
      }
    }
  }

  // Clear queued actions and update orders
  newState.players.forEach(p => {
    p.queuedActions = [];
    p.ordersUsed = 0;
  });
  updateMaxOrders(newState);

  return newState;
}
