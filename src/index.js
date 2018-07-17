import dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import https from 'https';
import Lobby from './lobby';

dotenv.config();

let server;

if (process.env.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH)
  };

  server = https.createServer(options);
} else {
  server = http.createServer();
}

const lobby = new Lobby();

server.on('upgrade', (request, socket, chunk) => {
  const url = new URL(request.url, 'placeholder:///');
  const roomCode = url.searchParams.get('roomCode');
  const gameSlug = url.searchParams.get('gameSlug');

  let room;
  if (roomCode) {
    room = lobby.getRoom(roomCode);
  } else {
    room = lobby.createRoom(gameSlug);
  }

  if (room === null) {
    request.destroy();
    return;
  }

  room.server.handleUpgrade(request, socket, chunk, (sock) => {
    room.server.emit('connection', sock, request);
  });
});

server.on('request', (request, response) => {
  response.end(JSON.stringify(
    lobby.getRooms().reduce((acc, room) => {
      acc[room.code] = room.game.getState();
      return acc;
    }, {}),
    null, 2
  ));
});

server.listen(process.env.PORT);
