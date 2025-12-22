import React from 'react';
import { GameState, Player } from '@/game/types';

interface Props {
  gameState: GameState;
  currentPlayer: Player;
}

export default function PlayerInfo({ gameState, currentPlayer }: Props) {
  return (
    <div style={{ marginBottom: '16px', padding: '8px', background: '#333', borderRadius: '4px' }}>
      <div style={{ fontSize: '20px' }}>Current Planning: Player {currentPlayer.index + 1}</div>
      <div>Orders: {currentPlayer.queuedActions.length} / {currentPlayer.maxOrders}</div>
      <div style={{ marginTop: '8px' }}>
        Status:{' '}
        {gameState.players
          .map(p => (
            <span key={p.index} style={{ color: p.color, marginRight: '12px' }}>
              P{p.index + 1}: {p.hasLocked ? 'Locked' : p.isAI ? 'AI Ready' : 'Planning'}
            </span>
          ))}
      </div>
    </div>
  );
}
