$(document).ready(function () {
    InitBoard();
    console.log(boardData);
    DrawPieces(boardData);
});

 function DrawPieces(boardData) {
   var squares = $(".square");
   var currentSquare = 0;

   for (var i = 0; i < boardData.length; i++) {
     if (boardData[i] != 99) {
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
}
