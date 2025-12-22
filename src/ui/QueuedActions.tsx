import React from 'react';
import { GameState, Player } from '@/game/types';
import { removeQueuedAction } from '@/game/actions';

interface Props {
  gameState: GameState;
  setGameState: (s: GameState) => void;
  player: Player;
}

export default function QueuedActions({ gameState, setGameState, player }: Props) {
  if (player.queuedActions.length === 0) return null;

  return (
    <div style={{ margin: '16px 0' }}>
      <strong>Queued Orders ({player.queuedActions.length})</strong>
      {player.queuedActions.map((action, i) => (
        <div
          key={i}
          style={{
            padding: '4px 8px',
            background: '#444',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {action.unitId.split('-')[2]} → {action.type}
            {action.target && ` (${action.target.x},${action.target.y})`}
          </span>
          <button onClick={() => {
            const newState = { ...gameState };
            removeQueuedAction(newState, player.index, i);
            setGameState(newState);
          }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
