import WebSocket from 'ws';
import Player from './player';
import { addPlayer } from './games/actions';

class Room {
  constructor(code, gameConstructor) {
    this.players = {};
    this.connectedPlayers = {};
    this.code = code;
    this.game = new gameConstructor(code, this.send.bind(this));
    this.server = new WebSocket.Server({ noServer: true });

    this.server.on('connection', (socket, request) => {
      const url = new URL(request.url, 'placeholder:///');
      const playerId = url.searchParams.get('playerId');

      let player;
      if (playerId && playerId in this.players) {
        player = this.getPlayer(playerId);
      } else {
        const state = this.game.getState();
        if (state.common.started || state.secret.ids.length >= state.secret.maxPlayers) {
          socket.terminate();
          return;
        }
        player = new Player();
        this.players[player.id] = player;
        this.game.dispatch(addPlayer(player.id));
      }

      player.setSocket(socket);
      this.connectedPlayers[player.id] = player;
      socket.on('message', this.getMessageHandler(player));
      socket.on('close', this.getCloseHandler(player));

      const state = this.game.getState();
      this.send({
        common: state.common,
        player: state.player[player.id]
      }, player.id);
    });
  }

  getPlayer(playerId) {
    return this.players[playerId];
  }

  send(obj, recipientId) {
    if (recipientId) {
      const recipient = this.connectedPlayers[recipientId];
      recipient && recipient.send(obj);
    } else {
      for (let recipient of Object.values(this.connectedPlayers)) {
        recipient.send(obj);
      }
    }
  }

  getMessageHandler(player) {
    return (msg) => {
      const action = JSON.parse(msg);
      action.playerId = player.id;

      this.game.dispatch(action);
    };
  }

  getCloseHandler(player) {
    return () => {
      delete this.connectedPlayers[player.id];

      setTimeout(() => {
        if (Object.keys(this.connectedPlayers).length === 0) {
          this.destroy();
        }
      }, 2000);
    };
  }
}

export default Room;
