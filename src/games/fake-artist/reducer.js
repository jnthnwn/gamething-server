import { createReducer, shuffle } from '../../utils';

const initializeState = (state) => {
  state.secret.ids = shuffle(state.secret.ids);
  state.common.names = state.secret.ids.map(id => state.secret.idsToNames[id]);
  state.common.currentLine = [];
  state.common.drawnLines = [];
  state.common.round = 1;
  state.common.numRounds = 2;
  state.common.accused = null;
  state.common.caught = false;
  state.common.turnInProgress = false;
  state.common.voting = false;

  for (let playerId of state.secret.ids) {
    state.player[playerId].isTurn = false;
    state.player[playerId].hasVoted = false;
    state.player[playerId].isFakeArtist = false;
    state.player[playerId].topic= 'dog';
  }
  const activeArtistIndex = 0;
  state.secret.activeArtistIndex = activeArtistIndex;
  state.secret.activeArtistId = state.secret.ids[activeArtistIndex];
  state.common.activeArtistName = state.common.names[activeArtistIndex];
  state.player[state.secret.activeArtistId].isTurn = true;

  const fakeArtistId = state.secret.ids[Math.floor(Math.random() * state.secret.ids.length)];
  state.secret.fakeArtistId = fakeArtistId;
  state.player[fakeArtistId].isFakeArtist = true;
  delete state.player[fakeArtistId].topic;

  state.secret.votes = {};
  state.secret.numVotes = 0;

  return state;
};

const startTurn = (state, action) => {
  if (action.playerId === state.secret.activeArtistId) {
    state.common.turnInProgress = true;
  }
  return state;
};

const draw = (state, action) => {
  if (action.playerId === state.secret.activeArtistId && state.common.turnInProgress) {
    state.common.currentLine.push({
      x: action.x,
      y: action.y
    });
  }
  return state;
};

const stopDraw = (state, action) => {
  if (action.playerId === state.secret.activeArtistId) {
    if (state.common.currentLine.length > 2) {
      state.common.drawnLines.push(state.common.currentLine);
      state.common.currentLine = [];
    }
  }
  return state;
};

const endTurn = (state) => {
  state.common.turnInProgress = false;
  state.player[state.secret.activeArtistId].isTurn = false;

  if (state.secret.activeArtistIndex === state.secret.ids.length - 1) {
    state.common.round++;
    if (state.common.round > state.common.numRounds) {
      return state;
    }
  }

  state.secret.activeArtistIndex = ++state.secret.activeArtistIndex % state.secret.ids.length;
  state.secret.activeArtistId = state.secret.ids[state.secret.activeArtistIndex];
  state.common.activeArtistName = state.common.names[state.secret.activeArtistIndex];

  state.player[state.secret.activeArtistId].isTurn = true;

  return state;
};

const startVoting = (state) => {
  state.common.voting = true;
  return state;
};

const vote = (state, action) => {
  if (!state.player[action.playerId].hasVoted) {
    if (action.playerId !== state.secret.fakeArtistId) {
      state.secret.votes[action.name] = action.name in state.secret.votes ? state.secret.votes[action.name]+1 : 1;
    }
    state.player[action.playerId].hasVoted = true;
    state.secret.numVotes++;
  }
  return state;
};

const endVoting = (state) => {
  const winningVotes = Math.ceil((state.secret.ids.length-1)/2);
  for (let name in state.secret.votes) {
    if (state.secret.votes[name] > winningVotes) {
      state.common.accused = name;
    }
  }
  state.common.fakeArtistName = state.secret.idsToNames[state.secret.fakeArtistId];
  if (state.common.accused === state.common.fakeArtistName) {
    state.common.caught = true;
  }
  state.common.voting = false;
  state.common.finished = true;
  return state;
};

const reducer = createReducer({}, {
  INIT: initializeState,
  START_TURN: startTurn,
  DRAW: draw,
  STOP_DRAW: stopDraw,
  END_TURN: endTurn,
  START_VOTING: startVoting,
  VOTE: vote,
  END_VOTING: endVoting
});

export default reducer;
