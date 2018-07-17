import { createReducer } from '../utils';

function addPlayer(state, action) {
  const playerId = action.playerId;
  state.common.names.push(null);
  state.player[playerId] = {
    id: playerId
  };
  state.secret.ids.push(playerId);
  return state;
}

function setName(state, action) {
  const playerId = action.playerId;
  const name = action.name;
  if (state.common.names.includes(name)) {
    return state;
  }

  const index = state.secret.ids.findIndex(id => id === playerId);
  if (action.name === '') {
    state.common.names[index] = null;
    delete state.player[playerId].name;
    delete state.secret.idsToNames[playerId];
  } else {
    state.common.names[index] = name;
    state.player[playerId].name = name;
    state.secret.idsToNames[playerId] = name;
  }
  return state;
}

// close off game from new players
function start(state) {
  if (state.common.names.some(el => el === null)) {
    state.common.errors['all players must have a name'] = true;
  } else if (state.secret.ids.length < state.secret.minPlayers) {
    state.common.errors['not enough players'] = true;
  } else {
    state.common.started = true;
  }
  return state;
}

// initialize game state
function init(state) {
  state.common.finished = false;
  return state;
}

// mark game as finished
function finished(state) {
  state.common.finished = true;
  return state;
}

// send players back to room
function replay(state) {
  if (state.common.finished) {
    state.common.started = false;
  }
  return state;
}

function removeError(state, action) {
  if (state.common.errors && state.common.errors[action.error] === null) {
    delete state.common.errors[action.error];
  }
  
  if (state.common.errors && action.error in state.common.errors) {
    state.common.errors[action.error] = null;
  }

  return state;
}

const gameAdminReducer = createReducer({}, {
  ADD_PLAYER: addPlayer,
  FINISHED: finished,
  INIT: init,
  REPLAY: replay,
  SET_NAME: setName,
  START: start,
  REMOVE_ERROR: removeError
});

export default gameAdminReducer;
