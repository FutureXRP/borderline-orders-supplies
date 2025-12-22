import React from 'react';
import { GameState, Position, Player } from '@/game/types';
import { queueAction } from '@/game/actions';

interface Props {
  gameState: GameState;
  setGameState: (s: GameState) => void;
  selectedUnitId: string | null;
  selectedTile: Position | null;
  currentPlayer: Player;
}

export default function ActionButtons({
  gameState,
  setGameState,
  selectedUnitId,
  selectedTile,
  currentPlayer,
}: Props) {
  if (!selectedUnitId || !selectedTile) return null;

  const unit = gameState.units.find(u => u.id === selectedUnitId);
  if (!unit || unit.player !== currentPlayer.index) return null;

  const handleAction = (type: any) => {
    const action = {
      type,
      unitId: unit.id,
      target: selectedTile,
    };
    const newState = { ...gameState };
    queueAction(newState, currentPlayer.index, action);
    setGameState(newState);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
      <button onClick={() => handleAction('move')}>Move Here</button>
      <button onClick={() => handleAction('attack')}>Attack</button>
      <button onClick={() => handleAction('fortify')}>Fortify</button>
      <button onClick={() => handleAction('recon')}>Recon</button>
      {unit.type === 'convoy' && <button onClick={() => handleAction('buildRoad')}>Build Road</button>}
      {unit.type === 'engineer' && <button onClick={() => handleAction('buildDepot')}>Build Depot</button>}
    </div>
  );
}
