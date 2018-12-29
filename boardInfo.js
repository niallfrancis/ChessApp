$(document).ready(function() {

  whitePieces = [];
  blackPieces = [];
  var whiteKing = null;
  var blackKing = null;
  var enPassantSpace = null;

  boardData = CreateNewBoardData(whitePieces, blackPieces);

});

function Piece(currentPos, colour) {
  this.currentPos = currentPos;
  this.previousPos = null;
  this.colour = colour;
  this.pieceVal;
  Piece.prototype.ShowMoves = function(board) {};
  Piece.prototype.ShowAttacks = function(board){};
  Piece.prototype.Move = function(targetSpace, board) {
    var tempPos = this.currentPos;
    enPassantSpace = null;
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
    if (SpaceIsEmpty(board, this, searchSpace) && SpaceIsEmpty(board, this, searchSpace - (moveDir * 10)) && this.previousPos == undefined) {
      movableSpaces.push(searchSpace);
    }
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) + 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) - 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    return movableSpaces;
  };

  Pawn.prototype.ShowAttacks = function(board) {
    var movableSpaces = [];
    var moveDir = ((this.colour == "white") ? -1 : 1);

    searchSpace = parseInt(this.currentPos) + (moveDir * 10) + 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) - 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    return movableSpaces;
  };
  Pawn.prototype.Move = function(targetSpace, board) {
    var moveDir = ((this.colour == "white") ? -1 : 1);
    var movedPiece;
    if (SpaceContainsEnemy(board, this, targetSpace - (moveDir * 10))) {
      movedPiece = board[targetSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        board[enPassantSpace] = 0;
        enPassantSpace = null;
      }
    }

    var tempPos = this.currentPos;
    this.currentPos = targetSpace;
    if (this.previousPos == undefined) {
      enPassantSpace = this.currentPos;
    }
    if (targetSpace <= 29 || targetSpace >= 91) {
      console.log("test");
      board[targetSpace] = new Queen(targetSpace, this.colour);
    } else {
      board[targetSpace] = this;
    }
    this.previousPos = tempPos;
    board[tempPos] = 0;
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
  Knight.prototype.ShowAttacks = Knight.prototype.ShowMoves;
}

function Bishop(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Bishop";

  Bishop.prototype.ShowMoves = function(board) {
    return DiagonalMovement(board, this);
  };
  Bishop.prototype.ShowAttacks = Bishop.prototype.ShowMoves;
}

function Rook(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Rook";

  Rook.prototype.ShowMoves = function(board) {
    return HorizontalVerticalMovement(board, this);
  };
  Rook.prototype.ShowAttacks = Rook.prototype.ShowMoves;
}

function Queen(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "Queen";

  Queen.prototype.ShowMoves = function(board) {
    var movableSpaces = [];

    movableSpaces = DiagonalMovement(board, this).concat(HorizontalVerticalMovement(board, this));

    return movableSpaces;
  };
  Queen.prototype.ShowAttacks = Queen.prototype.ShowMoves;
}

function King(currentPos, colour) {
  Piece.call(this, currentPos, colour);
  this.pieceVal = "King";
  this.check = false;
  this.checkmate = false;

  King.prototype.ShowMoves = function(board) {
    var movableSpaces = [];

    searchSpace = [1, -1, 10, -10, 9, -11, -9, 11];

    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = parseInt(this.currentPos) + searchSpace[i];
      if (SpaceIsEmpty(board, this, moveSpace) || SpaceContainsEnemy(board, this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }

    var leftRook = ((this.colour == "white") ? 91 : 21);
    var rightRook = ((this.colour == "white") ? 98 : 28);

    if (this.previousPos == null) {
      if (board[leftRook].pieceVal == "Rook" && board[leftRook].previousPos == null) {
        if (SpaceIsEmpty(board, this, this.currentPos - 1) && SpaceIsEmpty(board, this, this.currentPos - 2)) {
          movableSpaces.push(this.currentPos - 2);
        }
      }
      if (board[rightRook].pieceVal == "Rook" && board[rightRook].previousPos == null) {
        if (SpaceIsEmpty(board, this, this.currentPos + 1) && SpaceIsEmpty(board, this, this.currentPos + 2)) {
          movableSpaces.push(this.currentPos + 2);
        }
      }
    }

    var nonCheckSpaces = [];

    var enemyColour = ((this.colour == "white") ? "black" : "white");
    var tempBoard = board.slice();
    tempBoard[this.currentPos] = 0;
    for (var i = 0; i < movableSpaces.length; i++) {
      if (!SpaceIsAttacked(tempBoard, enemyColour, movableSpaces[i])) {
        nonCheckSpaces.push(movableSpaces[i]);
      }
    }
    return nonCheckSpaces;
  };
  King.prototype.ShowAttacks = King.prototype.ShowMoves;

  King.prototype.Move = function(targetSpace, board) {
    if (targetSpace - this.currentPos == 2) {
      //Castle Kingside
      board[this.currentPos + 1] = new Rook(this.currentPos + 1, this.colour);
      board[this.currentPos + 3] = 0;
    } else if (targetSpace - this.currentPos == -2) {
      //Castle Queenside
      board[this.currentPos - 1] = new Rook(this.currentPos - 1, this.colour);
      board[this.currentPos - 4] = 0;
    }
    var tempPos = this.currentPos;
    enPassantSpace = null;
    this.currentPos = targetSpace;
    this.previousPos = tempPos;
    board[targetSpace] = this;
    board[tempPos] = 0;
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
      if (SpaceIsEmpty(board, piece, tempSpace)) {
        movableSpaces.push(tempSpace);
      } else if (SpaceContainsEnemy(board, piece, tempSpace)) {
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
      if (SpaceIsEmpty(board, piece, tempSpace)) {
        movableSpaces.push(tempSpace);
      } else if (SpaceContainsEnemy(board, piece, tempSpace)) {
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

function SpaceIsAttacked(board, colour, space) {

  var moveDir = ((this.colour == "white") ? -1 : 1);
  //Check Pawn
  var pawnSpaces = [1, -1];
  for (var i = 0; i < pawnSpaces.length; i++) {
    var targetPiece = board[space + (moveDir * 10) + pawnSpaces[i]];
    if (targetPiece instanceof Piece) {
      if (targetPiece.pieceVal == "Pawn" && targetPiece.colour == colour) {
        console.log("pawn check");
        return true;
      }
    }
  }
  //Check Knights
  var knightSpaces = [-21, -19, 21, 19, 12, -8, -12, 8];
  for (var i = 0; i < knightSpaces.length; i++) {
    targetPiece = board[space + (knightSpaces[i])];
    if (targetPiece instanceof Piece) {
      if (targetPiece.pieceVal == "Knight" && targetPiece.colour == colour) {
        console.log("knight check");
        return true;
      }
    }
  }

  //Check diagonal
  var diagSpaces = [11, 9, -11, -9];
  for (var i = 0; i < diagSpaces.length; i++) {
    searching = true;
    var tempSpace = space;
    while (searching) {
      tempSpace -= diagSpaces[i];
      targetPiece = board[tempSpace];
      if (targetPiece instanceof Piece) {
        if (targetPiece.colour == colour && (targetPiece.pieceVal == "Queen" || targetPiece.pieceVal == "Bishop")) {
          console.log("diag check");
          return true;
        } else {
          searching = false;
        }
      } else if (targetPiece == 99) {
        searching = false;
      }
    }
  }

  //Check Horizontal and vertical
  var horizontalSpaces = [1, 10, -1, -10];

  for (var i = 0; i < horizontalSpaces.length; i++) {
    searching = true;
    var tempSpace = space;
    while (searching) {
      tempSpace -= horizontalSpaces[i];
      targetPiece = board[tempSpace];
      if (targetPiece instanceof Piece) {
        if (targetPiece.colour == colour && (targetPiece.pieceVal == "Queen" || targetPiece.pieceVal == "Rook")) {
          console.log("vert/horiz check");
          return true;
        } else {
          searching = false;
        }
      } else if (targetPiece == 99) {
        searching = false;
      }
    }
  }

  //Check King
  var kingSpaces = [1, -1, 10, -10, 11, -11, 9, -9];
  for (var i = 0; i < kingSpaces.length; i++) {
    targetPiece = board[space + (kingSpaces[i])];
    if (targetPiece instanceof Piece) {
      if (targetPiece.pieceVal == "King" && targetPiece.colour == colour) {
        console.log("king check");
        return true;
      }
    }
  }

  return false;
}

function CheckForCheckmate(board, colour, king) {

  var kingMoves = king.ShowMoves(board);
  var tempBoard = board.slice();
  tempBoard[king.currentPos] = 0;
  for (var i = 0; i < kingMoves.length; i++) {
    if (!SpaceIsAttacked(tempBoard, colour, kingMoves[i])) {
      return false;
    }
  }
  console.log("checkmate");
  return true;
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
            var temp = new Pawn(currentSquare, "black");
            boardSpace[currentSquare] = temp;
            blackPieces.push(temp);
            break;
          case "P":
            var temp = new Pawn(currentSquare, "white");
            boardSpace[currentSquare] = temp;
            whitePieces.push(temp);
            break;
          case "n":
            var temp = new Knight(currentSquare, "black");
            boardSpace[currentSquare] = temp;
            blackPieces.push(temp);
            break;
          case "N":
            var temp = new Knight(currentSquare, "white");
            boardSpace[currentSquare] = temp;
            whitePieces.push(temp);
            break;
          case "b":
            var temp = new Bishop(currentSquare, "black");
            boardSpace[currentSquare] = temp;
            blackPieces.push(temp);
            break;
          case "B":
            var temp = new Bishop(currentSquare, "white");
            boardSpace[currentSquare] = temp;
            whitePieces.push(temp);
            break;
          case "r":
            var temp = new Rook(currentSquare, "black");
            boardSpace[currentSquare] = temp;
            blackPieces.push(temp);
            break;
          case "R":
            var temp = new Rook(currentSquare, "white");
            boardSpace[currentSquare] = temp;
            whitePieces.push(temp);
            break;
          case "q":
            var temp = new Queen(currentSquare, "black");
            boardSpace[currentSquare] = temp;
            blackPieces.push(temp);
            break;
          case "Q":
            var temp = new Queen(currentSquare, "white");
            boardSpace[currentSquare] = temp;
            whitePieces.push(temp);
            break;
          case "k":
            var tempKing = new King(currentSquare, "black");
            boardSpace[currentSquare] = tempKing;
            blackKing = tempKing;
            blackPieces.push(tempKing);
            break;
          case "K":
            var tempKing = new King(currentSquare, "white");
            boardSpace[currentSquare] = tempKing;
            whiteKing = tempKing;
            whitePieces.push(tempKing);
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
