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
        selectedPiece.Move(boardId);
        DrawPieces(boardData);
        moved = true;
        whiteTurn = !whiteTurn;
      }
      selectedPiece = null;
      ResetBoard();
    }
    if (this.hasChildNodes() && !moved) {
      selectedPiece = boardData[boardId];
      if ((selectedPiece.colour == "white") == whiteTurn) {
        moveableSpaces = selectedPiece.ShowMoves();
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
