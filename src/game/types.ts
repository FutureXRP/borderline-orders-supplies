import { Terrain, UnitType } from './constants';

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  terrain: Terrain | 'road' | 'depot' | 'bridge';
  owner: number | null; // player index or null
  supplyLevel: number;
  hasFortification: boolean;
}

export interface Unit {
  id: string;
  type: UnitType;
  player: number;
  position: Position;
  hp: number;
  currentSupply: number;
  carriedSupply?: number; // only convoys
  queuedActions: Action[];
}

export type ActionType =
  | 'move'
  | 'attack'
  | 'buildRoad'
  | 'buildDepot'
  | 'buildBridge'
  | 'fortify'
  | 'recon'
  | 'supplyDrop';

export interface Action {
  type: ActionType;
  target?: Position;
  unitId: string;
}

export interface Player {
  index: number;
  color: string;
  ordersUsed: number;
  maxOrders: number;
  queuedActions: Action[];
  hasLocked: boolean;
  isAI: boolean;
}

export interface GameState {
  tiles: Tile[][];
  units: Unit[];
  players: Player[];
  currentRound: number;
  seed: number;
  fogOfWar: boolean;
}
