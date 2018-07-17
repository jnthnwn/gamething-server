import { diff } from 'deep-object-diff';
import gameAdminReducer from './reducer';
import { init, removeError } from './actions';
import { createStore } from 'redux';
import { createWatcher } from '../utils';

class Game {
  constructor(gameProps, roomCode, send) {
    if (this.constructor === Game) {
      throw new Error('cannot instantiate Game directly');
    }

    if (typeof this.gameLogicReducer !== 'function') {
      throw new Error('gameLogicReducer must be implemented');
    }

    const reducer = (prevState, action) => {
      const state = gameAdminReducer(JSON.parse(JSON.stringify(prevState)), action);
      return this.gameLogicReducer(state, action);
    };

    const initialState = {
      common: {
        errors: {},
        roomCode,
        gameSlug: gameProps.gameSlug,
        rules: gameProps.rules,
        names: [],
        started: false,
        finished: false
      },
      player: {
      },
      secret: {
        ids: [],
        idsToNames: {},
        minPlayers: gameProps.minPlayers,
        maxPlayers: gameProps.maxPlayers
      }
    };

    this.store = createStore(
      reducer,
      initialState
    );
    this.dispatch = this.store.dispatch;
    this.getState = this.store.getState;
    this.send = send;

    this.setWatchers();
  }

  setWatchers() {
    // send state.common to players
    createWatcher(this.store, 'common', (newVal, oldVal) => {
      this.send({
        common: diff(oldVal, newVal)
      });
    });

    // send state.player to players
    createWatcher(this.store, 'player', (newVal, oldVal) => {
      let diffObj = diff(oldVal, newVal);
      for (let playerId in diffObj) {
        this.send({
          player: diffObj[playerId]
        }, playerId);
      }
    });

    // watch for start
    createWatcher(this.store, 'common.started', (newVal, oldVal) => {
      if (!oldVal && newVal) {
        this.dispatch(init());
      }
    });

    // delete errors from state after given time
    createWatcher(this.store, 'common.errors', (newVal, oldVal) => {
      let diffObj = diff(oldVal, newVal);
      for (let error in diffObj) {
        if (diffObj[error]) {
          setTimeout(() => {
            this.dispatch(removeError(error));
            setTimeout(() => {
              this.dispatch(removeError(error));
            }, 1000);
          }, 3000);
        }
      }
    });
  }
}

export default Game;
