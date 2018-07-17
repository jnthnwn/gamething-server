import Game from '../game';
import { endTurn, startVoting, endVoting } from './actions';
import { createWatcher } from '../../utils';
import reducer from './reducer';

class FakeArtist extends Game {
  constructor(...args) {
    const gameProps = {
      gameSlug: 'fake-artist',
      minPlayers: 3,
      maxPlayers: 6,
      rules: [
        'In this game, you are either a real artist or a fake artist.',
        'Real artists are given a topic to draw, and the fake artist is the only one who doesn\'t know the topic.',
        'Every one has two turns to draw on the canvas. When you start your turn, you have 5 seconds to draw.',
        'The real artists depict the drawing without making the topic too obvious.',
        'The fake artist tries to blend in and guess the topic!',
        'If more than half of the real artists correctly determine the fake artist, they win!',
        'If they don\'t, the fake artist has evaded suspicion and wins!',
        'This game requires between three and six players inclusive.',
      ]
    };
    super(gameProps, ...args);
  }

  setWatchers() {
    super.setWatchers();

    createWatcher(this.store, 'common.turnInProgress', (newVal) => {
      if (newVal === true) {
        setTimeout(() => {
          this.dispatch(endTurn());
        }, 5000);
      }
    });

    createWatcher(this.store, 'common.round', (newVal) => {
      if (newVal > this.getState().common.numRounds) {
        this.dispatch(startVoting());
      }
    });

    createWatcher(this.store, 'secret.numVotes', (newVal) => {
      if (newVal === this.getState().secret.ids.length) {
        this.dispatch(endVoting());
      }
    });
  }
}

FakeArtist.prototype.gameLogicReducer = reducer;

export default FakeArtist;
