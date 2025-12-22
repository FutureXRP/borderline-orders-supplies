import { GameState, Action } from './types';

export function canQueueAction(state: GameState, playerIndex: number, _action: Action): boolean {
  const player = state.players[playerIndex];
  if (player.hasLocked) return false;
  if (player.queuedActions.length >= player.maxOrders) return false;
  return true;
}

export function queueAction(state: GameState, playerIndex: number, action: Action) {
  if (canQueueAction(state, playerIndex, action)) {
    state.players[playerIndex].queuedActions.push(action);
  }
}

export function removeQueuedAction(state: GameState, playerIndex: number, index: number) {
  state.players[playerIndex].queuedActions.splice(index, 1);
}
