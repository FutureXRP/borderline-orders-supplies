import React, { useEffect, useRef } from 'react';
import { GameState, Position } from '@/game/types';
import { PLAYER_COLORS, TILE_SIZE, Terrain } from '@/game/constants';

interface Props {
  gameState: GameState;
  selectedTile: Position | null;
  setSelectedTile: (pos: Position | null) => void;
  selectedUnitId: string | null;
  setSelectedUnitId: (id: string | null) => void;
}

const terrainColors: Record<string, string> = {
  plains: '#90ee90',
  forest: '#228b22',
  mountain: '#808080',
  city: '#ffd700',
  river: '#4169e1',
  road: '#8b4513',
  bridge: '#a0522d',
  depot: '#cd853f',
};

export default function CanvasMap({
  gameState,
  selectedTile,
  setSelectedTile,
  selectedUnitId,
  setSelectedUnitId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = gameState.tiles[0].length * TILE_SIZE;
    const height = gameState.tiles.length * TILE_SIZE;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);

    // Draw tiles
    gameState.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        let color = terrainColors[tile.terrain] || '#aaa';
        if (tile.owner !== null) {
          const base = PLAYER_COLORS[tile.owner];
          ctx.fillStyle = base + '88';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (tile.hasFortification) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3;
          ctx.strokeRect(x * TILE_SIZE + 4, y * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        }

        // Fog of war (simplified - hide if no own unit nearby)
        if (gameState.fogOfWar) {
          const visible = gameState.units.some(
            u =>
              u.player === 0 && // only player 0 for demo
              Math.abs(u.position.x - x) + Math.abs(u.position.y - y) <= 4
          );
          if (!visible) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      });
    });

    // Draw units
    gameState.units.forEach(unit => {
      const { x, y } = unit.position;
      ctx.fillStyle = PLAYER_COLORS[unit.player];
      ctx.beginPath();
      ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(unit.type[0].toUpperCase(), x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    });

    // Selected tile
    if (selectedTile) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selectedTile.x * TILE_SIZE + 2,
        selectedTile.y * TILE_SIZE + 2,
        TILE_SIZE - 4,
        TILE_SIZE - 4
      );
    }
  }, [gameState, selectedTile]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    if (x >= 0 && x < gameState.tiles[0].length && y >= 0 && y < gameState.tiles.length) {
      setSelectedTile({ x, y });
      const unit = gameState.units.find(u => u.position.x === x && u.position.y === y);
      setSelectedUnitId(unit ? unit.id : null);
    }
  };

  return <canvas ref={canvasRef} onClick={handleClick} style={{ background: '#000' }} />;
}
