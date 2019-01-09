

$(document).ready(function () {
  var selectedPiece = null;
  var whiteTurn = true;

  var content = $('#content');
  var users = $('#users');
  var input = $('#input');
  var status = $('#status');
  var myId = null;
  var myOpp = null;
  var iAmWhite = false;
  // my color assigned by the server
  var myColor = false;
  // my name sent to the server
  var myName = false;



  // open connection
  var connection = new WebSocket('ws://localhost:1337');
  connection.onopen = function () {
    // first we want users to enter their names
    input.removeAttr('disabled');
    status.text('Choose name:');
  };

  connection.onmessage = function (message) {
    var json = JSON.parse(message.data);
    //New user connected to lobby
    if (json.type === 'colour') {
      status.text(myName + ': ').css('color', json.data.colour);
      updateUsers(json.data.users);
      myId = json.data.id;

    } else if (json.type === 'updateUsers') {
      var obj = json.data;
      updateUsers(obj.users);
    } else if (json.type === 'newGame') {

      if (json.data.player1 != myId) {
        myOpp = json.data.player1;
        iAmWhite = false;
      } else {
        myOpp = json.data.player2;
        iAmWhite = true;
      }
      InitBoard();
      DrawPieces(boardData);
    } else if (json.type === 'updateGame') {
      console.log(json.data.fen);
      boardData = GenerateFenBoard(json.data.fen);
      DrawPieces(boardData);
      DrawCheck(boardData);
      whiteTurn = !whiteTurn;
    }

  };

  function updateUsers(userList) {
    users.empty();
    for (var i = 0; i < userList.length; i++) {
      users.append('<li class="player" id="' + userList[i].id + '"><a href="#">' + userList[i].username + '</a></li>')
    }
  }


  input.keydown(function(e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      // send the message as an ordinary text
      connection.send(msg);
      $(this).val('');
      // disable the input field to make the user wait until server
      // sends back response
      input.attr('disabled', 'disabled');
      // we know that the first message sent from a user their name
      if (myName === false) {
        myName = msg;
      }
    }
  });



  $("#users").on("click", ".player", function(event) {
    myOpp = $(this).attr('id');
    connection.send("newGame" + myOpp);
  });

  $("#board").on("click", ".square", function(event) {
    var boardId = $(this).attr('id');
    var moved = false;

    if (selectedPiece != null) {
      if ($(this).hasClass('movable')) {
        selectedPiece.Move(boardId,boardData);
        DrawPieces(boardData);
        moved = true;
        DrawCheck(boardData);
        whiteTurn = !whiteTurn;
        SendBoardData(boardData);
      }
      selectedPiece = null;
      ResetBoard();
    }
    if (this.hasChildNodes() && !moved) {
      selectedPiece = boardData[parseInt(boardId)];
      if (((selectedPiece.colour == "white") == whiteTurn) && ((selectedPiece.colour == "white") == iAmWhite)) {
        var moveableSpaces = selectedPiece.ShowMoves(boardData);
        for (var i = 0; i < moveableSpaces.length; i++) {
          var tempSpace = $(".square#" + moveableSpaces[i] +"");
          tempSpace.addClass('movable');
        }
      } else {
        selectedPiece = null;
      }
    }
  });

  function SendBoardData(boardData) {
    //Turn board data to fen
    var fen = GetBoardFen(boardData);
    connection.send(fen + "|" + myOpp);
  }

  function DrawCheck(boardData) {
    if (whiteTurn) {
      if (SpaceIsAttacked(boardData, "white", blackKing.currentPos).length > 0) {
        $(".square#" + blackKing.currentPos + " img").addClass('check');
        if (CheckForCheckmate(boardData, "white", blackKing)) {
          $(".square#" + blackKing.currentPos + " img").addClass('mate');
        }
      } else {
        $(".square#" + blackKing.currentPos + " img").removeClass('check');
      }
    } else {
      if (SpaceIsAttacked(boardData, "black", whiteKing.currentPos).length > 0) {
        $(".square#" + whiteKing.currentPos + " img").addClass('check');
        if (CheckForCheckmate(boardData,"black", whiteKing)) {
          $(".square#" + blackKing.currentPos + " img").addClass('mate');
        }
      } else {
        $(".square#" + whiteKing.currentPos + " img").removeClass('check');
      }
    }
  }
});



 function DrawPieces(boardData) {
   var squares = $(".square");
   var currentSquare = 0;

   for (var i = 0; i < boardData.length; i++) {
     if (boardData[i] != 99) {
       $(".square").eq(currentSquare).empty()
       if (boardData[i] != 0) {
         image = "<img class=\"piece " + boardData[i].colour + " " + boardData[i].pieceVal  + "\"/>";
         $(".square").eq(currentSquare).append(image);
       }
       currentSquare++;
     }
   }
 }

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
        $(".square:eq("+currentSquare+")").attr('id', ''+ i + '');
        currentSquare++;
      }
    }
}

function ResetBoard() {
  var allSquares = $(".square");

  for (var i = 0; i < allSquares.length; i++) {
    $(".square:eq("+i+")").removeClass('movable');
  }
}