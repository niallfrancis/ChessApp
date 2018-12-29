$(document).ready(function () {
  var selectedPiece = null;
  var whiteTurn = true;
  InitBoard();

  DrawPieces(boardData);



  $(".square").click(function(event) {
    var boardId = $(this).attr('id');
    var moved = false;

    if (selectedPiece != null) {
      if ($(this).hasClass('movable')) {
        selectedPiece.Move(boardId,boardData);
        DrawPieces(boardData);
        moved = true;
        if (whiteTurn) {
          if (SpaceIsAttacked(boardData, "white", blackKing.currentPos)) {
            $(".square#" + blackKing.currentPos + " img").addClass('check');
            if (CheckForCheckmate(boardData, "white", blackKing)) {

            }
          } else {
            $(".square#" + blackKing.currentPos + " img").removeClass('check');
          }
        } else {
          if (SpaceIsAttacked(boardData, "black", whiteKing.currentPos)) {
            $(".square#" + whiteKing.currentPos + " img").addClass('check');
            if (CheckForCheckmate(boardData,"black", whiteKing)) {

            }
          } else {
            $(".square#" + whiteKing.currentPos + " img").removeClass('check');
          }
        }
        whiteTurn = !whiteTurn;
      }
      selectedPiece = null;
      ResetBoard();
    }
    if (this.hasChildNodes() && !moved) {
      selectedPiece = boardData[parseInt(boardId)];
      if ((selectedPiece.colour == "white") == whiteTurn) {
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
