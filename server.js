var WebSocketServer = require("websocket").server;
var http = require("http");
const uuidv4 = require('uuid-v4');

//Create server
var server = http.createServer(function(request, response) {
  console.log(new Date() + " Received request");
});
server.listen(1337, function() {
  console.log(new Date() + " listening on port 1337");
});

//Create WebSocketServer
wsServer = new WebSocketServer({
  httpServer: server
});

var users = [];
var pairs = [];
var connections = {};

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];

colors.sort(function(a, b) {
  return Math.random() > 0.5;
});


wsServer.on("request", function(request) {
  var connection = request.accept(null, request.origin);
  var id = uuidv4();
  connection.id = id;

  var userName = false;
  var userColor = false;

  //When receiving a message
  connection.on('message', function(message) {
    var messageJson = JSON.parse(message.utf8Data);
    if (message.type === 'utf8') {
      // first message sent by user is their name
      if (userName === false) {
        var validName = true;
        // remember user name
        for (var i = 0; i < users.length; i++) {
          if (users[i].username == messageJson.message) {
            validName = false;
            break;
          }
        }
        //Check name is valid
        if (validName) {
          userName = htmlEntities(messageJson.message);
          var tempUser = {
            username: userName,
            id: connection.id
          };
          users.push(tempUser);

          // get random color and send it back to the user
          userColor = colors.shift();
          var obj = {
            users: users,
            user: userName,
            colour: userColor,
            id: connection.id
          };

          var colourJson = JSON.stringify({
            type: 'colour',
            data: obj
          });
          //Send back json to the connection that added it's username
          connection.sendUTF(colourJson);
          //Tell all other connections that a new user has joined
          UpdateUsers();
          console.log((new Date()) + ' User is known as: ' + userName + ' with ' + obj.colour + ' color.');
        }

      } else {
        var type = messageJson.type;

        //New game message
        if (type === "newGame") {
          var player1Id = messageJson.player1;
          var obj = {
            player1: player1Id,
            player2: connection.id
          };

          //Remove user from list of users who are ready to play
          for (var i = 0; i < users.length; i++) {
            if (users[i].id === player1Id) {
              users.splice(i, 1);
            }
          }

          //Second loop is needed for player 2 because users has been changed during last loop
          for (var i = 0; i < users.length; i++) {
            if (users[i].id === connection.id) {
              users.splice(i, 1);
            }
          }

          UpdateUsers();
          //Push pair of players to pairs array
          pairs.push(obj);
          var newGameJson = JSON.stringify({
            type: 'newGame',
            data: obj
          });
          //Tell player 1 new game has started
          connections[player1Id].sendUTF(newGameJson);
          //Tell player 2 new game has started
          connections[connection.id].sendUTF(newGameJson);
        } else {
          //Move has been made
          var obj = {
            fen: messageJson.fen,
            pass: messageJson.passSpace
          };
          var updateGameJson = JSON.stringify({
            type: 'updateGame',
            data: obj
          });
          //Send board to opponent
          connections[messageJson.opponent].sendUTF(updateGameJson);
        }
      }
    }
  });

  function UpdateUsers() {
    var obj = {
      users: users
    };
    var updateUserJson = JSON.stringify({
      type: 'updateUsers',
      data: obj
    });
    for (var id in connections) {
      connections[id].sendUTF(updateUserJson);
    }
  }
  //When connection is closed
  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log("Closing a connection " + connections[id].id + "");
      colors.push(userColor);

      //Remove disconnecting user from user list
      for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
          users.splice(i, 1);
          break;
        }
      }

      var obj = {
        users: users
      };
      var opponentLeft = JSON.stringify({
        type: 'opponentLeft',
        data: obj
      });

      //Loop through pairs to find leaving player's opponent
      for (var i = 0; i < pairs.length; i++) {
        //If player 1 has left
        if (pairs[i].player1 === id) {
          //Tell player 2 and remove from pairs
          connections[pairs[i].player2].sendUTF(opponentLeft);
          pairs.splice(i, 1);
          break;
        }
        //If player 2 has left
        if (pairs[i].player2 === id) {
          //Tell player 1 and remove from pairs
          connections[pairs[i].player1].sendUTF(opponentLeft);
          pairs.splice(i, 1);
          break;
        }
      }

      //Delete connection
      delete connections;
      delete connections[id];
      var obj = {
        users: users
      };
      var updateUserJson = JSON.stringify({
        type: 'updateUsers',
        data: obj
      });
      //Tell all other conenctions a user has disconnected
      for (var ids in connections) {
        connections[ids].sendUTF(updateUserJson);
      }
    }
  });

  // Add the new connection to the array of connections.
  connections[id] = connection;
  for (var id in connections) {
    connections[id].sendUTF("A new connection was made - now " + Object.keys(connections).length + " connected clients (" + connection.id + ")");
  }
});
