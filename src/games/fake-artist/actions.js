export const DRAW = 'DRAW';

export const STOP_DRAW = 'STOP_DRAW';

export const START_TURN = 'START_TURN';

export const END_TURN = 'END_TURN';
export function endTurn() {
  return {
    type: END_TURN
  };
}

export const START_VOTING = 'START_VOTING';
export function startVoting() {
  return {
    type: START_VOTING
  };
}

export const VOTE = 'VOTE';

export const END_VOTING = 'END_VOTING';
export function endVoting() {
  return {
    type: END_VOTING
  };
}
