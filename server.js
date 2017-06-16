//import class
var User = require('./game').User;
var GameRoom = require('./game').GameRoom;

//server code
var port = 8000;
var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({port: port});

var room1 = new GameRoom();
server.on('connection', function(socket)
{
	var user = new User(socket);
	room1.addUser(user);
	console.log("A connection established");
	var message = "Welcome " + user.id + " joining the party. Total connection: " + room1.users.length;
});

console.log("WebSocket server is running.");
console.log("Listening to port " + port + ".");

//te amo mucho