import React from 'react';
import { GameState } from '@/game/types';
import { UNIT_STATS } from '@/game/constants';

interface Props {
  gameState: GameState;
  unitId: string;
}

export default function UnitInfo({ gameState, unitId }: Props) {
  const unit = gameState.units.find(u => u.id === unitId);
  if (!unit) return null;
  const stats = UNIT_STATS[unit.type];

  return (
    <div style={{ padding: '8px', background: '#333', borderRadius: '4px', marginBottom: '12px' }}>
      <strong>{unit.type.toUpperCase()} (Player {unit.player + 1})</strong>
      <div>HP: {unit.hp}</div>
      <div>Supply: {unit.currentSupply}</div>
      <div>Movement: {stats.move}</div>
      {unit.carriedSupply !== undefined && <div>Carried Supply: {unit.carriedSupply}</div>}
    </div>
  );
}
