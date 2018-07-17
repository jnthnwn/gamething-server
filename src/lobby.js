import { FakeArtist } from './games';
import Room from './room';

class Lobby {
  constructor() {
    this.rooms = {};
  }

  getRooms() {
    return Object.values(this.rooms);
  }

  getRoom(roomCode) {
    if (roomCode in this.rooms) {
      return this.rooms[roomCode];
    }

    return null;
  }

  getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters.charAt(Math.floor(Math.random() * Math.floor(letters.length)));
  }

  getRoomCode() {
    let roomCode;
    do {
      const letters = [];
      [...Array(4).keys()].map(() => {
        letters.push(this.getRandomLetter());
      });

      roomCode = letters.join('');
    } while (roomCode in this.rooms);

    return roomCode;
  }

  createRoom(gameSlug) {
    let game;
    switch(gameSlug) {
      case 'fake-artist': {
        game = FakeArtist;
        break;
      }
      default: {
        return null;
      }
    }
    const room = new Room(this.getRoomCode(), game);
    room.destroy = () => { this.destroyRoom(room.code); };
    this.rooms[room.code] = room;
    return room;
  }

  destroyRoom(roomCode) {
    delete this.rooms[roomCode];
  }
}

export default Lobby;
