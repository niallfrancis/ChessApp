
$(document).ready(function () {

whitePieces = [];
blackPieces = [];

boardData = CreateNewBoardData(whitePieces, blackPieces);


});



function CreateNewBoardData(whitePieces, blackPieces)
{
  var boardSize = 120;
  var boardSpace = [];
  var squareA8 = 22;
  var squareH1 = 99;

  for (var i = 0; i < boardSize; i++) {
    boardSpace[i] = 99;
  }
  for (var i = 1; i <= boardSize; i++) {
    if (i >= 41 && i <= 78) {
      //Empty starting spots
      boardSpace[i] = 0;
    } else {
      if ((i >= 31 && i <= 38) || (i >= 81 && i <= 88))
      {
        //Pawns
        boardSpace[i] = '1';
      } else if (i == 22 || i == 27 || i == 92 || i == 97) {
        //Knights
        boardSpace[i] = '2';
      } else if (i == 23 || i == 26 || i == 93 || i == 96) {
        //Bishops
        boardSpace[i] = '3';
      } else if (i == 21 || i == 28 || i == 91 || i == 98) {
        //Rooks
        boardSpace[i] = '4';
      } else if (i == 94 || i == 25) {
        //Queens
        boardSpace[i] = '5';
      } else if (i == 95 || i == 24) {
        //Kings
        boardSpace[i] = '6';
      }

      if ((i >= 21 && i <= 28) || (i >= 31 && i <= 38)) {
        //Black starting spots
        boardSpace[i] = 'B' + boardSpace[i];
        blackPieces.push(boardSpace[i]);
      } else if ((i >= 81 && i <= 88) || (i >= 91 && i <= 98)) {
        //White starting spots
        boardSpace[i] = 'W' + boardSpace[i];
        whitePieces.push(boardSpace[i]);
      }


    }
  }
  return boardSpace;
}
