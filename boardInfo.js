$(document).ready(function() {

  var whitePieces = [];
  var blackPieces = [];

  boardData = CreateNewBoardData(whitePieces, blackPieces);

});

function Piece(currentPos, colour) {
  this.currentPos = currentPos;
  this.previousPos;
  this.colour = colour;
  this.pieceVal;
  Piece.prototype.ShowMoves = function(board) {};
  Piece.prototype.Move = function(targetSpace, board) {
    var tempPos = this.currentPos;
    this.currentPos = targetSpace;
    this.previousPos = tempPos;
    board[targetSpace] = this;
    board[tempPos] = 0;
  };
}

function Pawn(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Pawn";

  Pawn.prototype.ShowMoves = function(board) {
    var movableSpaces = [];
    var moveDir = ((this.colour == "white") ? -1 : 1);

    var searchSpace = parseInt(this.currentPos) + (moveDir * 10);

    if (SpaceIsEmpty(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }

    var searchSpace = parseInt(this.currentPos) + (moveDir * 20);

    if (SpaceIsEmpty(board, this, searchSpace) && this.previousPos == undefined) {
      movableSpaces.push(searchSpace);
    }
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) + 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) - 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }
    return movableSpaces;
  };
}

function Knight(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Knight";

  Knight.prototype.ShowMoves = function(board) {
    var movableSpaces = [];
    var searchSpace = [-21, -19, 21, 19, 12, -8, -12, 8];

    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = parseInt(this.currentPos) + searchSpace[i];
      if (SpaceIsEmpty(board, this, moveSpace) || SpaceContainsEnemy(board, this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }
    return movableSpaces;
  };
}

function Bishop(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Bishop";

  Bishop.prototype.ShowMoves = function(board) {
    return DiagonalMovement(board, this);
  };
}

function Rook(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Rook";

  Rook.prototype.ShowMoves = function(board) {
    return HorizontalVerticalMovement(board, this);
  };
}

function Queen(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Queen";

  Queen.prototype.ShowMoves = function(board) {
    var movableSpaces = [];

    movableSpaces = DiagonalMovement(board, this).concat(HorizontalVerticalMovement(board, this));

    return movableSpaces;
  };
}

function King(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "King";

  King.prototype.ShowMoves = function(board) {
    var movableSpaces = [];

    searchSpace = [1, -1, 10, -10, 9, -11, -9, 11];

    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = parseInt(this.currentPos) + searchSpace[i];
      if (SpaceIsEmpty(board, this, moveSpace) || SpaceContainsEnemy(board, this, moveSpace)) {
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
function DiagonalMovement(board, piece) {
  var movableSpaces = [];
  var searchSpace = [];
  var directions = [11, 9, -11, -9];

  for (var i = 0; i < directions.length; i++) {
    searching = true;
    var tempSpace = piece.currentPos;
    while (searching) {
      tempSpace -= directions[i];
      if (SpaceIsEmpty(board, piece,tempSpace)) {
        movableSpaces.push(tempSpace);
      }else if (SpaceContainsEnemy(board, piece,tempSpace)) {
        movableSpaces.push(tempSpace);
        searching = false;
      } else {
        searching = false;
      }
    }
  }

  return movableSpaces;
}

//Helper class for Rook and Queen movement
function HorizontalVerticalMovement(board, piece) {
  var movableSpaces = [];
  var searchSpace = [];
  var directions = [1, 10, -1, -10];

  for (var i = 0; i < directions.length; i++) {
    searching = true;
    var tempSpace = piece.currentPos;
    while (searching) {
      tempSpace -= directions[i];
      if (SpaceIsEmpty(board, piece,tempSpace)) {
        movableSpaces.push(tempSpace);
      }else if (SpaceContainsEnemy(board, piece,tempSpace)) {
        movableSpaces.push(tempSpace);
        searching = false;
      } else {
        searching = false;
      }
    }
  }
  return movableSpaces;
}

function SpaceIsEmpty(board, movingPiece, targetSpace) {
  if (board[targetSpace] == 0) {
    return true;
  } else {
    return false;
  }
}

function SpaceContainsEnemy(board, movingPiece, targetSpace) {
  enemySpace = false;
  //Needs to check if space is not empty
  if (board[targetSpace] instanceof Piece) {
    if (board[targetSpace].colour != movingPiece.colour) {
      enemySpace = true;
    }
  }

  return enemySpace;
}

function CreateNewBoardData(whitePieces, blackPieces) {

  boardData = GenerateFenBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  //boardData = GenerateFenBoard("rnbqkbnr/1pp1pppp/3p4/8/2PQ4/p4P2/PP1PN1PP/RNB1KB1R");
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
