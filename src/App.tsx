import { useEffect, useState } from 'react';
import { createInitialGameState, GameState, loadGame, saveGame } from '@/game/gameState';
import { resolveRound } from '@/game/resolution';
import CanvasMap from '@/ui/CanvasMap';
import ControlPanel from '@/ui/ControlPanel';
import Modal from '@/ui/Modal';
import { runAIPlanning } from '@/game/ai';

const GRID_WIDTH = 24;
const GRID_HEIGHT = 16;

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [showNewGameModal, setShowNewGameModal] = useState(true);
  const [seedInput, setSeedInput] = useState<string>(Math.floor(Math.random() * 1e9).toString());
  const [playerCount, setPlayerCount] = useState(2);
  const [aiPlayers, setAiPlayers] = useState<number[]>([1]);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setGameState(saved);
      setShowNewGameModal(false);
    }
  }, []);

  const startNewGame = () => {
    const seed = parseInt(seedInput) || Math.floor(Math.random() * 1e9);
    const state = createInitialGameState({
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      seed,
      playerCount,
      aiPlayerIndices: aiPlayers,
    });
    setGameState(state);
    setShowNewGameModal(false);
    saveGame(state);
  };

  const handleLockOrders = (currentPlayer: any) => {
    if (!gameState) return;
    const updated = { ...gameState };
    updated.players[currentPlayer.index].hasLocked = true;
    setGameState(updated);
    saveGame(updated);

    const allLocked = updated.players.every(p => p.hasLocked || p.isAI);
    if (allLocked) {
      let stateWithAI = { ...updated };
      for (const player of stateWithAI.players) {
        if (player.isAI && !player.hasLocked) {
          runAIPlanning(stateWithAI, player.index);
          player.hasLocked = true;
        }
      }
      const resolved = resolveRound(stateWithAI);
      resolved.currentRound += 1;
      resolved.players.forEach(p => (p.hasLocked = false));
      setGameState(resolved);
      saveGame(resolved);
    }
  };

  if (!gameState) {
    return (
      <Modal isOpen={showNewGameModal}>
        <h2>New Game Setup</h2>
        <label>
          Seed:
          <input type="text" value={seedInput} onChange={e => setSeedInput(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label style={{ display: 'block', marginTop: '16px' }}>
          Players:
          <select value={playerCount} onChange={e => setPlayerCount(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>
        <label style={{ display: 'block', marginTop: '16px' }}>
          AI players (Player 1 human):
          <div>
            {Array.from({ length: playerCount - 1 }, (_, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={aiPlayers.includes(i + 1)}
                  onChange={e => {
                    if (e.target.checked) setAiPlayers([...aiPlayers, i + 1]);
                    else setAiPlayers(aiPlayers.filter(p => p !== i + 1));
                  }}
                />
                Player {i + 2}
              </label>
            ))}
          </div>
        </label>
        <button onClick={startNewGame} style={{ marginTop: '24px' }}>Start Game</button>
      </Modal>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <CanvasMap
        gameState={gameState}
        selectedTile={selectedTile}
        setSelectedTile={setSelectedTile}
        selectedUnitId={selectedUnitId}
        setSelectedUnitId={setSelectedUnitId}
      />
      <ControlPanel
        gameState={gameState}
        setGameState={setGameState}
        selectedTile={selectedTile}
        selectedUnitId={selectedUnitId}
        onLockOrders={handleLockOrders}
      />
    </div>
  );
}
