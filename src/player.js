import uuidv4 from 'uuid/v4';

class Player {
  constructor() {
    this.id = uuidv4();
    this.socket = null;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  send(obj) {
    if (this.socket) {
      this.socket.send(JSON.stringify(obj));
    }
  }
}

export default Player;
