//import class
var User = require('./game').User;
var GameRoom = require('./game').GameRoom;

//server code
const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'public/index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const serverr = new SocketServer({ server });

var room1 = new GameRoom();
serverr.on('connection', function(socket)
{
	var user = new User(socket);
	room1.addUser(user);
	console.log("A connection established");
	var message = "Welcome " + user.id + " joining the party. Total connection: " + room1.users.length;
});

console.log("WebSocket server is running.");
console.log("Listening to port " + PORT + ".");

//te amo mucho