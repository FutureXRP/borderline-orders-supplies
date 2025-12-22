import { PLAYER_COLORS, BASE_ORDERS, CITY_ORDER_BONUS, MAX_ORDER_BONUS } from './constants';
import { GameState, Player } from './types';
import { SeededRNG } from './rng';
import { generateRandomMap, placeStartingUnits } from './mapGenerator';

export function createInitialGameState({
  width,
  height,
  seed,
  playerCount,
  aiPlayerIndices,
}: {
  width: number;
  height: number;
  seed: number;
  playerCount: number;
  aiPlayerIndices: number[];
}): GameState {
  const rng = new SeededRNG(seed);
  const tiles = generateRandomMap(rng, width, height);

  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    index: i,
    color: PLAYER_COLORS[i],
    ordersUsed: 0,
    maxOrders: BASE_ORDERS,
    queuedActions: [],
    hasLocked: false,
    isAI: aiPlayerIndices.includes(i),
  }));

  const state: GameState = {
    tiles,
    units: [],
    players,
    currentRound: 1,
    seed,
    fogOfWar: true,
  };

  placeStartingUnits(state, rng);

  updateMaxOrders(state);

  return state;
}

export function updateMaxOrders(state: GameState) {
  state.players.forEach(player => {
    const controlledCities = state.tiles.flat().filter(t => t.terrain === 'city' && t.owner === player.index).length;
    const bonus = Math.min(controlledCities * CITY_ORDER_BONUS, MAX_ORDER_BONUS);
    player.maxOrders = BASE_ORDERS + bonus;
    player.ordersUsed = 0;
  });
}

export function saveGame(state: GameState) {
  localStorage.setItem('borderline-save', JSON.stringify(state));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem('borderline-save');
  if (!raw) return null;
  return JSON.parse(raw) as GameState;
}
