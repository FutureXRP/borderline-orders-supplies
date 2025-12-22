import React from 'react';
import { GameState, Position } from '@/game/types';

interface Props {
  gameState: GameState;
  tilePos: Position;
}

export default function TileInfo({ gameState, tilePos }: Props) {
  const tile = gameState.tiles[tilePos.y][tilePos.x];
  return (
    <div style={{ padding: '8px', background: '#333', borderRadius: '4px', marginBottom: '12px' }}>
      <strong>Tile ({tilePos.x}, {tilePos.y})</strong>
      <div>Terrain: {tile.terrain}</div>
      <div>Owner: {tile.owner !== null ? `Player ${tile.owner + 1}` : 'Neutral'}</div>
      <div>Supply: {tile.supplyLevel}</div>
      {tile.hasFortification && <div>Fortified</div>}
    </div>
  );
}
