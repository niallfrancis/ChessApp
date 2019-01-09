$(document).ready(function() {
  var selectedPiece = null;
  var whiteTurn = true;

  //Shortcuts for later reference
  var content = $('#content');
  var users = $('#users');
  var input = $('#input');
  var status = $('#status');
  var board = $('#board');
  var lobby = $('#lobby');
  var infoText = $('#infoText');
  var infoPanel = $('#infoPanel');

  //Details of client
  var myId = null;
  var myOpp = null;
  var iAmWhite = false;
  var myColor = false;
  var myName = false;

  //Hide unused elements to start
  board.hide();
  infoPanel.hide();
  users.hide();


  // open connection
  var connection = new WebSocket('ws://localhost:1337');
  connection.onopen = function() {
    //Users should enter username first
    input.removeAttr('disabled');
    status.text('Choose name:');
  };

  connection.onmessage = function(message) {
    var json = JSON.parse(message.data);

    if (json.type === 'colour') {
      //New user connected to lobby
      //Assing colour and id, refresh users
      input.attr('disabled', 'disabled');
      users.show();
      status.text(myName + ': ').css('color', json.data.colour);
      UpdateUsers(json.data.users);
      myId = json.data.id;
    } else if (json.type === 'updateUsers') {
      //Update users, when a different new player joins
      var obj = json.data;
      UpdateUsers(obj.users);
    } else if (json.type === 'newGame') {
      //New game has started
      //Declare opponent id, and what colour client is
      if (json.data.player1 != myId) {
        myOpp = json.data.player1;
        iAmWhite = false;
      } else {
        myOpp = json.data.player2;
        iAmWhite = true;
      }

      //Show elements that are needed for playing game
      board.show();
      lobby.hide();
      infoPanel.hide();

      //Initalise the chess board
      InitBoard();
      DrawPieces(boardData);
    } else if (json.type === 'updateGame') {
      //Move has been made by opponent
      //Get boardData from FEN given by server
      boardData = GenerateFenBoard(json.data.fen);
      enPassantSpace = json.data.pass; //Assign what space (if any) has en passant
      DrawPieces(boardData); //Update view based on model MVC
      DrawCheck(boardData);
      whiteTurn = !whiteTurn; //Next player's turn
    } else if (json.type === 'opponentLeft') {
      //Declare that opponent has left and show back to lobby panel
      infoText.text("Opponent Left Game. Return to Lobby");
      infoPanel.show();
    }

  };

  //Function to refresh list of players that can be challenged to a game
  function UpdateUsers(userList) {
    users.empty();
    for (var i = 0; i < userList.length; i++) {
      if (userList[i].username != myName) {
        users.append('<li class="player" id="' + userList[i].id + '"><a href="#">' + userList[i].username + '</a></li>')
      }
    }
  }

  function DeclareCheckmate(colour) {
    //Tells players there is a checkmate and prompts them to quit to lobby
    infoText.text("Checkmate for " + colour + "! Please exit to lobby");
    infoPanel.show();
  }

  //Handles using enter to submit name
  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }

      // Convert to JSON
      var jsonMsg = JSON.stringify({
        message: msg
      });

      //Send message
      connection.send(jsonMsg);

      //Clear text field, hide info and set name
      $(this).val('');
      infoPanel.hide();
      myName = msg;
    }
  });


  //Handles clicking on player to challenge them to a game
  $("#users").on("click", ".player", function(event) {
    myOpp = $(this).attr('id');
    var newgameJson = JSON.stringify({
      type: "newGame",
      player1: myOpp
    });
    connection.send(newgameJson);
  });

  //Handler for clicking on a square to move a piece
  $("#board").on("click", ".square", function(event) {
    var boardId = $(this).attr('id');
    var moved = false;

    //If a piece has already been selected (i.e. piece should be moved)
    if (selectedPiece != null) {
      if ($(this).hasClass('movable')) {
        selectedPiece.Move(boardId, boardData);
        DrawPieces(boardData);
        moved = true;
        DrawCheck(boardData);
        whiteTurn = !whiteTurn;
        SendBoardData(boardData);
      }
      selectedPiece = null;
      ResetBoard();
    }

    //If clicked square contains a piece and has not just been moved to this turn
    if (this.hasChildNodes() && !moved) {
      selectedPiece = boardData[parseInt(boardId)];
      //Check it is the correct players turn
      if (((selectedPiece.colour == "white") == whiteTurn) && ((selectedPiece.colour == "white") == iAmWhite)) {
        //Find moveableSpaces for piece, and add class to change their styling
        var moveableSpaces = selectedPiece.ShowMoves(boardData);
        for (var i = 0; i < moveableSpaces.length; i++) {
          var tempSpace = $(".square#" + moveableSpaces[i] + "");
          tempSpace.addClass('movable');
        }
      } else {
        selectedPiece = null;
      }
    }
  });

  //Quits game to lobby
  $("#back").click(function(event) {
    location.reload();
  });

  //Handles sending data to server
  function SendBoardData(boardData) {
    //Turn board data to fen
    var fen = GetBoardFen(boardData);
    var updateJson = JSON.stringify({
      type: "updateGame",
      fen: fen, //Board FEN
      passSpace: enPassantSpace, //which space has enPassantSpace
      opponent: myOpp //Tells server who is the players opponent
    });
    connection.send(updateJson);
  }

  //Adds check/checkmate colour to the appropriate king
  function DrawCheck(boardData) {
    if (whiteTurn) {
      //White have check
      if (SpaceIsAttacked(boardData, "white", blackKing.currentPos).length > 0) {
        $(".square#" + blackKing.currentPos + " img").addClass('check');
        if (CheckForCheckmate(boardData, "white", blackKing)) {
          $(".square#" + blackKing.currentPos + " img").addClass('mate');
          DeclareCheckmate("white");
        }
      } else {
        $(".square#" + blackKing.currentPos + " img").removeClass('check');
      }
    } else {
      //Black have check
      if (SpaceIsAttacked(boardData, "black", whiteKing.currentPos).length > 0) {
        $(".square#" + whiteKing.currentPos + " img").addClass('check');
        if (CheckForCheckmate(boardData, "black", whiteKing)) {
          $(".square#" + blackKing.currentPos + " img").addClass('mate');
          DeclareCheckmate("black");
        }
      } else {
        $(".square#" + whiteKing.currentPos + " img").removeClass('check');
      }
    }
  }
});


//Changes the images in each square to show what piece is in them
function DrawPieces(boardData) {
  var squares = $(".square");
  var currentSquare = 0;

  for (var i = 0; i < boardData.length; i++) {
    if (boardData[i] != 99) {
      //Set all non-null boardData spaces as empty
      $(".square").eq(currentSquare).empty()
      if (boardData[i] != 0) {
        //Fill the rest of the places with piece images
        image = "<img class=\"piece " + boardData[i].colour + " " + boardData[i].pieceVal + "\"/>";
        $(".square").eq(currentSquare).append(image);
      }
      currentSquare++;
    }
  }
}

//Draw the inital board out of divs
function InitBoard() {
  var light = 1;
  var colour;
  var rank;
  var file;

  for (i = 1; i <= 8; i++) {

    light ^= 1;
    rank = "rank" + i;
    for (j = 1; j <= 8; j++) {
      file = "file" + j;
      if (light == 0) {
        colour = "light";
      } else {
        colour = "dark";
      }
      light ^= 1;
      squareString = "<div class=\"square " + rank + " " + file + " " + colour + "\"/>";
      $("#board").append(squareString);

    }
  }

  var currentSquare = 0;
  for (var i = 0; i < boardData.length; i++) {
    if (boardData[i] != 99) {
      $(".square:eq(" + currentSquare + ")").attr('id', '' + i + '');
      currentSquare++;
    }
  }
}

//Remove movable space promts from each square
function ResetBoard() {
  var allSquares = $(".square");

  for (var i = 0; i < allSquares.length; i++) {
    $(".square:eq(" + i + ")").removeClass('movable');
  }
}
