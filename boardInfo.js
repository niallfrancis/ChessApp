$(document).ready(function() {

  whitePieces = [];
  blackPieces = [];

  boardData = CreateNewBoardData(whitePieces, blackPieces);


});

function Piece(currentPos, colour) {
  this.currentPos = currentPos;
  this.colour = colour;
  this.pieceVal;
  Piece.prototype.ShowMoves = function() {};
}

function Pawn(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Pawn";

  Pawn.prototype.ShowMoves = function() {
    var movableSpaces = [];
    var moveDir = ((this.colour == "white") ? -1 : 1);
    var searchSpace = this.currentPos + (moveDir * 10);

    if (SpaceIsEmpty(this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }
    searchSpace = this.currentPos + (moveDir * 10) + 1;
    if (SpaceContainsEnemy(this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }
    searchSpace = this.currentPos + (moveDir * 10) - 1;
    if (SpaceContainsEnemy(this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }
    return movableSpaces;
  };
}

function Knight(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Knight";

  Knight.prototype.ShowMoves = function() {
    var movableSpaces = [];
    var searchSpace = [-21, -19, 21, 19, 12, -8, -12, 8];

    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = this.currentPos + searchSpace[i];
      if (SpaceIsEmpty(this, moveSpace) || SpaceContainsEnemy(this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }
    return movableSpaces;
  };
}

function Bishop(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Bishop";

  Bishop.prototype.ShowMoves = function() {
    return DiagonalMovement(this);
  };
}

function Rook(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Rook";

  Rook.prototype.ShowMoves = function() {
    return HorizontalVerticalMovement(this);
  };
}

function Queen(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Queen";

  Queen.prototype.ShowMoves = function() {
    var movableSpaces = [];

    movableSpaces = DiagonalMovement(this).concat(HorizontalVerticalMovement(this));

    return movableSpaces;
  };
}

function King(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "King";

  King.prototype.ShowMoves = function() {
    var movableSpaces = [];

    searchSpace = [1, -1, 10, -10, 9, -11, -9, 11];

    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = this.currentPos + searchSpace[i];
      if (SpaceIsEmpty(this, moveSpace) || SpaceContainsEnemy(this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }
    return movableSpaces;
  };
}

//Set parent class for all pieces
Pawn.prototype = new Piece();
Knight.prototype = new Piece();
Bishop.prototype = new Piece();
Rook.prototype = new Piece();
Queen.prototype = new Piece();
King.prototype = new Piece();

//Helper class for Bishop and Queen movement
function DiagonalMovement(piece) {
  var movableSpaces = [];
  var searchSpace = [];

  for (var i = 0; i < boardData.length; i++) {
    if (((i - piece.currentPos) % 11 == 0) || ((i - piece.currentPos) % 9 == 0)) {
      searchSpace.push(i);
    }
  }

  for (var i = 0; i < searchSpace.length; i++) {
    moveSpace = searchSpace[i];
    if (SpaceIsEmpty(piece, moveSpace) || SpaceContainsEnemy(piece, moveSpace)) {
      movableSpaces.push(moveSpace);
    }
  }
  return movableSpaces;
}

//Helper class for Rook and Queen movement
function HorizontalVerticalMovement(piece) {
  var movableSpaces = [];
  var searchSpace = [];

  for (var i = 0; i < boardData.length; i++) {
    if (((i - piece.currentPos) % 10 == 0) || (Math.floor(i / 10) == Math.floor(piece.currentPos / 10))) {
      searchSpace.push(i);
    }
  }

  for (var i = 0; i < searchSpace.length; i++) {
    moveSpace = searchSpace[i];
    if (SpaceIsEmpty(piece, moveSpace) || SpaceContainsEnemy(piece, moveSpace)) {
      movableSpaces.push(moveSpace);
    }
  }
  return movableSpaces;
}

function SpaceIsEmpty(movingPiece, targetSpace) {
  if (boardData[targetSpace] == 0) {
    return true;
  } else {
    return false;
  }
}

function SpaceContainsEnemy(movingPiece, targetSpace) {
  enemySpace = false;
  //Needs to check if space is not empty
  if (boardData[targetSpace] instanceof Piece) {
    if (boardData[targetSpace].colour != movingPiece.colour) {
      enemySpace = true;
    }
  }

  return enemySpace;
}

function CreateNewBoardData(whitePieces, blackPieces) {

  boardData = GenerateFenBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  return boardData;
}

function GenerateFenBoard(fen) {

  var boardSize = 120;
  var boardSpace = [];
  var currentSquare = 21;

  for (var i = 0; i < boardSize; i++) {
    boardSpace[i] = 99;
  }

  for (var i = 0; i < fen.length; i++) {
    var currentChar = fen.charAt(i);

    if (currentChar != "/") {
      if (!isNaN(currentChar)) {
        for (var j = 0; j < parseInt(currentChar, 10); j++) {
          boardSpace[currentSquare] = 0;
          currentSquare++;
        }
      } else {
        switch (currentChar) {
          case "p":
            boardSpace[currentSquare] = new Pawn(currentSquare, "black");
            break;
          case "P":
            boardSpace[currentSquare] = new Pawn(currentSquare, "white");
            break;
          case "n":
            boardSpace[currentSquare] = new Knight(currentSquare, "black");
            break;
          case "N":
            boardSpace[currentSquare] = new Knight(currentSquare, "white");
            break;
          case "b":
            boardSpace[currentSquare] = new Bishop(currentSquare, "black");
            break;
          case "B":
            boardSpace[currentSquare] = new Bishop(currentSquare, "white");
            break;
          case "r":
            boardSpace[currentSquare] = new Rook(currentSquare, "black");
            break;
          case "R":
            boardSpace[currentSquare] = new Rook(currentSquare, "white");
            break;
          case "q":
            boardSpace[currentSquare] = new Queen(currentSquare, "black");
            break;
          case "Q":
            boardSpace[currentSquare] = new Queen(currentSquare, "white");
            break;
          case "k":
            boardSpace[currentSquare] = new King(currentSquare, "black");
            break;
          case "K":
            boardSpace[currentSquare] = new King(currentSquare, "white");
            break;
          default:

        }
        currentSquare++;
      }
    } else {
      currentSquare += 2;
    }
  }

  return boardSpace;
}
