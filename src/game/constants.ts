export const GRID_WIDTH = 24;
export const GRID_HEIGHT = 16;
export const TILE_SIZE = 32;

export enum Terrain {
  Plains = 'plains',
  Forest = 'forest',
  Mountain = 'mountain',
  City = 'city',
  River = 'river',
}

export enum UnitType {
  Squad = 'squad',
  Convoy = 'convoy',
  Engineer = 'engineer',
}

export const UNIT_STATS = {
  [UnitType.Squad]: { hp: 10, move: 3, vision: 3, attack: 5, defense: 4, supplyPerTurn: 1 },
  [UnitType.Convoy]: { hp: 8, move: 2, vision: 2, attack: 2, defense: 3, supplyPerTurn: 1, carryCapacity: 10 },
  [UnitType.Engineer]: { hp: 6, move: 2, vision: 3, attack: 1, defense: 2, supplyPerTurn: 1 },
};

export const PLAYER_COLORS = ['#ff5555', '#55ff55', '#5555ff', '#ffff55'];

export const BASE_ORDERS = 6;
export const CITY_ORDER_BONUS = 1;
export const MAX_ORDER_BONUS = 4;
