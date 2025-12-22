import React from 'react';
import { GameState } from '@/game/types';
import { saveGame, loadGame } from '@/game/gameState';
import PlayerInfo from './PlayerInfo';
import TileInfo from './TileInfo';
import UnitInfo from './UnitInfo';
import QueuedActions from './QueuedActions';
import ActionButtons from './ActionButtons';

interface Props {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  selectedTile: { x: number; y: number } | null;
  selectedUnitId: string | null;
  onLockOrders: (currentPlayer: any) => void;
}

export default function ControlPanel({
  gameState,
  setGameState,
  selectedTile,
  selectedUnitId,
  onLockOrders,
}: Props) {
  const currentPlayer = gameState.players.find(p => !p.hasLocked && !p.isAI) || gameState.players[0];

  const handleNewGame = () => {
    localStorage.removeItem('borderline-save');
    window.location.reload();
  };

  return (
    <div style={{ width: '360px', background: '#222', padding: '12px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>BORDERLINE</h2>
        <div>
          <button onClick={() => saveGame(gameState)}>Save</button>
          <button onClick={() => setGameState(loadGame()!)}>Load</button>
          <button onClick={handleNewGame}>New Game</button>
        </div>
      </div>

      <PlayerInfo gameState={gameState} currentPlayer={currentPlayer} />

      {selectedTile && <TileInfo gameState={gameState} tilePos={selectedTile} />}

      {selectedUnitId && <UnitInfo gameState={gameState} unitId={selectedUnitId} />}

      <QueuedActions gameState={gameState} setGameState={setGameState} player={currentPlayer} />

      <ActionButtons
        gameState={gameState}
        setGameState={setGameState}
        selectedUnitId={selectedUnitId}
        selectedTile={selectedTile}
        currentPlayer={currentPlayer}
      />

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={() => onLockOrders(currentPlayer)}
          disabled={currentPlayer.hasLocked}
          style={{ width: '100%', padding: '12px', fontSize: '18px' }}
        >
          {currentPlayer.hasLocked ? 'Waiting for others...' : 'Lock Orders'}
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
        Round {gameState.currentRound} | Seed {gameState.seed}
      </div>
    </div>
  );
}
