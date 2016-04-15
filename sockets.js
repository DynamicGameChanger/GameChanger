'use strict';
const buildPic = require('./buildPic');
const user = require('./authenticate/userModel');

let roomsObj = {};

function startSocket(nameSpace, io) {
  const nsp = io.of(nameSpace);
  nsp.connections = 0;
  nsp.max_connections = 2;
  if (!roomsObj[nameSpace]) {
    roomsObj[nameSpace] = {
      gameName: 'snake',
      connections: {
        'controller': '',
        'player': ''
      }
    };
  }

  nsp.on('connection', socket => {
    if (nsp.connections > nsp.max_connections) {
      nsp.emit('disconnect', 'Sorry Sucka');
      socket.disconnect();
    } else {
      nsp.connections++;

      if (roomsObj[nameSpace].connections.controller === '') {
        roomsObj[nameSpace].connections.controller = socket.id;

      } else if (roomsObj[nameSpace].connections.player === '') {
        roomsObj[nameSpace].connections.player = socket.id;
      }
    }

    socket.on('obj', val => {
      nsp.emit('obj', val);
    });


    socket.on('changeVariable', val => {
      nsp.emit('changeVariable', val);
    });

    // captures img from game and emits to controller
    socket.on('image', imgObj => {
      nsp.emit('image', imgObj);
    });

    socket.on('chartData', data => {

      nsp.emit('chartData', data);
    });

    socket.on('changeGame', (e) => {
      roomsObj['/' + e[1]].gameName = e[0];
      nsp.emit('changeGame', e[0]);
    });

    socket.on('disconnect', () => {
      let deletedSocketCount = 0;
      for (let key in roomsObj[nameSpace].connections) {

        if(roomsObj[nameSpace].connections[key] === '') {
          deletedSocketCount++;
        }

        if (roomsObj[nameSpace].connections[key] === socket.id) {
          roomsObj[nameSpace].connections[key] = '';
        };
      }

      if (deletedSocketCount === 2) {
        delete roomsObj[nameSpace];
      }
      
      nsp.connections--;
      socket.disconnect();
    });
  });
}

module.exports = {
  roomsObj: roomsObj,
  startSocket: startSocket
}
