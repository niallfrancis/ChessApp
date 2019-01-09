var WebSocketServer = require("websocket").server;
var http = require("http");
const uuidv4 = require('uuid-v4');

var server = http.createServer(function(request, response) {
  console.log(new Date() + " Received request");
});
server.listen(1337, function() {
  console.log(new Date() + " listening on port 1337");
});

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
// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );


wsServer.on("request", function(request) {
  var connection = request.accept(null, request.origin);
  var id = uuidv4();
  connection.id = id;

  var userName = false;
  var userColor = false;

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
          var updateUserJson = JSON.stringify({type:'updateUsers', data: obj});
          var colourJson = JSON.stringify({type:'colour', data: obj});
          connection.sendUTF(colourJson);
          for (var id in connections) {
            connections[id].sendUTF(updateUserJson);
          }
          console.log((new Date()) + ' User is known as: ' + userName
                      + ' with ' + obj.colour + ' color.');
        }

      } else {
        var type = messageJson.type;

        if (type === "newGame") {
          var player1Id = messageJson.player1;

          var obj = {
            player1: player1Id,
            player2: connection.id
          };

          for (var i = 0; i < users.length; i++) {
            if (users[i].id === player1Id || users[i].id === connection.id) {
              users.splice(i, 1);
              break;
            }
          }

          pairs.push(obj);
          for (var i = 0; i < pairs.length; i++) {
            console.log(pairs[i].player1 + " " + pairs[i].player2);
          }
          var newGameJson = JSON.stringify({type:'newGame', data: obj});
          connections[player1Id].sendUTF(newGameJson);
          connections[connection.id].sendUTF(newGameJson);
        } else {
          console.log("Move Sent");
          var obj = {
            fen: messageJson.fen,
            pass: messageJson.passSpace
          };
          var updateGameJson = JSON.stringify({type:'updateGame', data: obj});
          connections[messageJson.opponent].sendUTF(updateGameJson);
        }
      }
    }
  });

  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log("Closing a connection " + connections[id].id+ "");
      colors.push(userColor);

      for (var i = 0; i < users.length; i++) {
        if (users[i].id === id) {
          users.splice(i, 1);
          break;
        }
      }

      var obj = {
        users: users
      };
      var opponentLeft = JSON.stringify({type:'opponentLeft', data: obj});

      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].player1 === id) {
          connections[pairs[i].player2].sendUTF(opponentLeft);
          pairs.splice(i, 1);
          break;
        }
        if (pairs[i].player2 === id) {
          connections[pairs[i].player1].sendUTF(opponentLeft);
          pairs.splice(i, 1);
          break;
        }
      }

      delete connections[id];
      var obj = {
        users: users
      };
      var updateUserJson = JSON.stringify({type:'updateUsers', data: obj});
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
