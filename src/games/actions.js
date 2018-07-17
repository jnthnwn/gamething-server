export const ADD_PLAYER = 'ADD_PLAYER';
export const INIT = 'INIT';
export const REPLAY = 'REPLAY';
export const SET_NAME = 'SET_NAME';
export const START = 'START';
export const REMOVE_ERROR = 'REMOVE_ERROR';

export function addPlayer(playerId) {
  return {
    type: ADD_PLAYER,
    playerId
  };
}

export function init() {
  return {
    type: INIT
  };
}

export function removeError(errorMsg) {
  return {
    type: REMOVE_ERROR,
    error: errorMsg
  };
}
