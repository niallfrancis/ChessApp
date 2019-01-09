$(document).ready(function() {

  var whiteKing = null;
  var blackKing = null;
  var enPassantSpace = null;

  boardData = CreateNewBoardData();

});

//Factory Method to create pieces on command
factory = {
  create: function(piece, pos, colour, hasmoved) {
    var p;

    //Set p to different piece depending on given value
    switch (piece) {
      case "Pawn":
        p = new Pawn(pos, colour, hasmoved);
        break;
      case "Knight":
        p = new Knight(pos, colour, hasmoved);
        break;
      case "Bishop":
        p = new Bishop(pos, colour, hasmoved);
        break;
      case "Rook":
        p = new Rook(pos, colour, hasmoved);
        break;
      case "Queen":
        p = new Queen(pos, colour, hasmoved);
        break;
      case "King":
        p = new King(pos, colour, hasmoved);
        break;
      default:
    }
    return p;
  }
}

//Parent Piece class which will be inherited
function Piece(currentPos, colour, hasMoved) {
  this.currentPos = currentPos;
  this.hasMoved = hasMoved;
  this.colour = colour;
  this.pieceVal;
  Piece.prototype.ShowMoves = function(board) {};
  Piece.prototype.Move = function(targetSpace, board) {
    var tempPos = this.currentPos;
    enPassantSpace = null;
    this.currentPos = targetSpace;
    this.hasMoved = true;
    board[targetSpace] = this;
    board[tempPos] = 0;
  };
}

function Pawn(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "Pawn";

  //Override show moves for pawn
  Pawn.prototype.ShowMoves = function(board) {
    var movableSpaces = [];
    var moveDir = ((this.colour == "white") ? -1 : 1);

    //Check space directly infront
    var searchSpace = parseInt(this.currentPos) + (moveDir * 10);
    if (SpaceIsEmpty(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    }

    //Check space two in front if piece has not moved yet
    searchSpace = parseInt(this.currentPos) + (moveDir * 20);
    if (SpaceIsEmpty(board, this, searchSpace) && SpaceIsEmpty(board, this, searchSpace - (moveDir * 10)) && !this.hasMoved) {
      movableSpaces.push(searchSpace);
    }
    //Check diagonal space 1 one to take pieces, including en passant
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) + 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    //Check diagonal space 2 one to take pieces, including en passant
    searchSpace = parseInt(this.currentPos) + (moveDir * 10) - 1;
    if (SpaceContainsEnemy(board, this, searchSpace)) {
      movableSpaces.push(searchSpace);
    } else if (SpaceContainsEnemy(board, this, searchSpace - (moveDir * 10))) {
      movedPiece = board[searchSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        movableSpaces.push(searchSpace);
      }
    }
    return CheckByDiscovery(board, movableSpaces, this);
  };

  //Override pawn movement
  Pawn.prototype.Move = function(targetSpace, board) {
    var moveDir = ((this.colour == "white") ? -1 : 1);
    var movedPiece;

    //Take piece for en passant
    if (SpaceContainsEnemy(board, this, targetSpace - (moveDir * 10))) {
      movedPiece = board[targetSpace - (moveDir * 10)];
      if (movedPiece.currentPos == enPassantSpace) {
        board[enPassantSpace] = 0;
        enPassantSpace = null;
      }
    }

    //Move Piece
    var tempPos = this.currentPos;
    this.currentPos = targetSpace;

    //Set en passant space
    if (!this.hasMoved) {
      enPassantSpace = this.currentPos;
    }

    //Upgrade pawn to queen if reaching the final row
    if (targetSpace <= 29 || targetSpace >= 91) {
      board[targetSpace] = new Queen(targetSpace, this.colour);
    } else {
      board[targetSpace] = this;
    }
    this.hasMoved = true;
    board[tempPos] = 0;
  };
}

function Knight(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "Knight";

  Knight.prototype.ShowMoves = function(board) {
    var movableSpaces = [];
    var searchSpace = [-21, -19, 21, 19, 12, -8, -12, 8];

    //Check each possible knight movement space
    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = parseInt(this.currentPos) + searchSpace[i];
      if (SpaceIsEmpty(board, this, moveSpace) || SpaceContainsEnemy(board, this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }
    return CheckByDiscovery(board, movableSpaces, this);
  };
}

function Bishop(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "Bishop";

  //Use DiagonalMovement function
  Bishop.prototype.ShowMoves = function(board) {
    return DiagonalMovement(board, this);
  };
}

function Rook(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "Rook";

  //Use HorizontalMovement function
  Rook.prototype.ShowMoves = function(board) {
    return HorizontalVerticalMovement(board, this);
  };
}

function Queen(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "Queen";

  Queen.prototype.ShowMoves = function(board) {
    var movableSpaces = [];
    //Use horizontal & DiagonalMovement functions combined
    movableSpaces = DiagonalMovement(board, this).concat(HorizontalVerticalMovement(board, this));
    return movableSpaces;
  };
}

function King(currentPos, colour, hasMoved) {
  Piece.call(this, currentPos, colour, hasMoved);
  this.pieceVal = "King";
  this.check = false;
  this.checkmate = false;

  King.prototype.ShowMoves = function(board) {
    var movableSpaces = [];

    searchSpace = [1, -1, 10, -10, 9, -11, -9, 11];

    //Check each movement space the king can move to
    for (var i = 0; i < searchSpace.length; i++) {
      moveSpace = parseInt(this.currentPos) + searchSpace[i];
      if (SpaceIsEmpty(board, this, moveSpace) || SpaceContainsEnemy(board, this, moveSpace)) {
        movableSpaces.push(moveSpace);
      }
    }

    var leftRook = ((this.colour == "white") ? 91 : 21);
    var rightRook = ((this.colour == "white") ? 98 : 28);

    //Check if king has moved for castle
    if (!this.hasMoved) {
      //Confirm rook has not moved
      if (board[leftRook].pieceVal == "Rook" && !board[leftRook].hasMoved) {
        //Castle pieces if possible
        if (SpaceIsEmpty(board, this, this.currentPos - 1) && SpaceIsEmpty(board, this, this.currentPos - 2)) {
          movableSpaces.push(this.currentPos - 2);
        }
      }
      if (board[rightRook].pieceVal == "Rook" && !board[rightRook].hasMoved) {
        if (SpaceIsEmpty(board, this, this.currentPos + 1) && SpaceIsEmpty(board, this, this.currentPos + 2)) {
          movableSpaces.push(this.currentPos + 2);
        }
      }
    }

    var nonCheckSpaces = [];

    var enemyColour = ((this.colour == "white") ? "black" : "white");
    var tempBoard = board.slice();
    tempBoard[this.currentPos] = 0;

    //Only show spaces that don't place you in check
    for (var i = 0; i < movableSpaces.length; i++) {
      if (SpaceIsAttacked(tempBoard, enemyColour, movableSpaces[i]).length == 0) {
        nonCheckSpaces.push(movableSpaces[i]);
      }
    }
    return nonCheckSpaces;
  };

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

    //Handle movement
    var tempPos = this.currentPos;
    enPassantSpace = null;
    this.currentPos = targetSpace;
    this.hasMoved = true;
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

  //Loop in each diagonal direction
  for (var i = 0; i < directions.length; i++) {
    searching = true;
    var tempSpace = piece.currentPos;
    //Keep searching until a space containing a piece or end of board is found
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

  return CheckByDiscovery(board, movableSpaces, piece);
}

//Helper class for Rook and Queen movement
function HorizontalVerticalMovement(board, piece) {
  var movableSpaces = [];
  var searchSpace = [];
  var directions = [1, 10, -1, -10];

  //Loop in each vertical and horizontal direction
  for (var i = 0; i < directions.length; i++) {
    searching = true;
    var tempSpace = piece.currentPos;
    //Keep searching until a space containing a piece or end of board is found
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

  return CheckByDiscovery(board, movableSpaces, piece);
}

//Checks space does not contain another piece
function SpaceIsEmpty(board, movingPiece, targetSpace) {
  if (board[targetSpace] == 0) {
    return true;
  } else {
    return false;
  }
}

//Checks there is a piece of the opposing colour
function SpaceContainsEnemy(board, movingPiece, targetSpace) {
  enemySpace = false;
  if (board[targetSpace] instanceof Piece) {
    if (board[targetSpace].colour != movingPiece.colour) {
      enemySpace = true;
    }
  }

  return enemySpace;
}

//Performs similar actions to show moves to find if target square is attacked
function SpaceIsAttacked(board, colour, space) {

  var attackingPieces = [];
  var moveDir = ((this.colour == "white") ? -1 : 1);
  //Check Pawn
  var pawnSpaces = [1, -1];
  for (var i = 0; i < pawnSpaces.length; i++) {
    var targetPiece = board[space + (moveDir * 10) + pawnSpaces[i]];
    if (targetPiece instanceof Piece) {
      if (targetPiece.pieceVal == "Pawn" && targetPiece.colour == colour) {
        attackingPieces.push(targetPiece.currentPos);
      }
    }
  }
  //Check Knights
  var knightSpaces = [-21, -19, 21, 19, 12, -8, -12, 8];
  for (var i = 0; i < knightSpaces.length; i++) {
    targetPiece = board[space + (knightSpaces[i])];
    if (targetPiece instanceof Piece) {
      if (targetPiece.pieceVal == "Knight" && targetPiece.colour == colour) {
        attackingPieces.push(targetPiece.currentPos);
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
          attackingPieces.push(targetPiece.currentPos);
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
          attackingPieces.push(targetPiece.currentPos);
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
        attackingPieces.push(targetPiece.currentPos);
      }
    }
  }

  return attackingPieces;
}

//Check if king is in checkmate
function CheckForCheckmate(board, colour, king) {

  var kingMoves = king.ShowMoves(board);
  var tempBoard = board.slice();
  tempBoard[king.currentPos] = 0;
  //Check if any of the King's moves can get out of check
  for (var i = 0; i < kingMoves.length; i++) {
    if (SpaceIsAttacked(tempBoard, colour, kingMoves[i]).length == 0) {
      return false;
    }
  }

  var pieces = [];
  //Get enemy all pieces
  for (var i = 0; i < board.length; i++) {
    if (board[i] instanceof Piece && board[i].colour != colour) {
      pieces.push(board[i]);
    }
  }

  //Check if piece can be removed to solve check
  for (var i = 0; i < pieces.length; i++) {
    if (CheckByDiscovery(board, pieces[i].ShowMoves(board), pieces[i]).length != 0) {
      return false;
    }
  }

  return true;
}


//Ensure moving a piece will not create check
function CheckByDiscovery(board, moves, piece) {

  var validMoves = [];
  var king;
  var inCheck;
  var enemyColour;

  if (piece.colour == "white") {
    king = whiteKing;
    enemyColour = "black";
  } else {
    king = blackKing;
    enemyColour = "white";
  }

  //Push validMoves for moves that don't cause a check
  for (var i = 0; i < moves.length; i++) {
    var tempBoard = board.slice();
    tempBoard[moves[i]] = piece;
    tempBoard[piece.currentPos] = 0;

    if (SpaceIsAttacked(tempBoard, enemyColour, king.currentPos) == 0) {
      validMoves.push(moves[i]);
    }
  }
  return validMoves;
}



function CreateNewBoardData() {
  //Create a board with starting FEN configuration
  boardData = GenerateFenBoard("urunubuqukubunur./upupupupupupupup./.8./.8./.8./.8./uPuPuPuPuPuPuPuP./uRuNuBuQuKuBuNuR");
  return boardData;
}

//Get FEN from current board data
function GetBoardFen(board) {
  var fen = "";
  var concurrentBlanks = 0;

  //Loop through the whole board
  for (var i = 0; i < board.length; i++) {

    //If the end of the row has been reached
    if ((i > 19 && i < 99) && (i % 10 == 9)) {
      //Add number of previous blanks
      if (concurrentBlanks > 0) {
        fen += "." + concurrentBlanks;
        concurrentBlanks = 0;
      }
      //Indicate new line
      fen += "./"
    }
    //Check not null
    if (board[i] != 99) {
      //Check current space contains a piece
      if (board[i] instanceof Piece) {
        //If there have been blanks
        if (concurrentBlanks > 0) {
          fen += "." + concurrentBlanks;
          concurrentBlanks = 0;
        }
        var addition = "";
        //decide if each piece has been moveDir
        //and preceed it with a char to indicate so
        if (board[i].hasMoved) {
          addition = "m";
        } else {
          addition = "u";
        }
        //depending on piece add corresponding char
        switch (board[i].pieceVal) {
          case "Pawn":
            addition += "p";
            break;
          case "Knight":
            addition += "n";
            break;
          case "Bishop":
            addition += "b";
            break;
          case "Rook":
            addition += "r";
            break;
          case "Queen":
            addition += "q";
            break;
          case "King":
            addition += "k";
            break;
          default:

        }

        //Make addition capital if it is a white piece
        if (board[i].colour == "white") {
          addition = addition.toUpperCase();
        }
        fen += addition;
      } else {
        //Increase if space is blank
        concurrentBlanks++;
        //8 blanks is the maximum number of blanks per row
        if (concurrentBlanks == 8) {
          fen += "." + concurrentBlanks;
          concurrentBlanks = 0;
        }
      }
    }
  }

  return fen;
}

//Generate board data from FEN
function GenerateFenBoard(fen) {

  var boardSize = 120;
  var boardSpace = [];
  var currentSquare = 21;

  //Set all spaces on board to start null
  for (var i = 0; i < boardSize; i++) {
    boardSpace[i] = 99;
  }

  //For each char in fen, 2 at a time
  for (var i = 0; i < fen.length; i += 2) {
    var currentChar = fen.charAt(i + 1);
    var moved = ((fen.charAt(i) == "u" || fen.charAt(i) == "U") ? false : true);
    if (currentChar != "/") {
      if (!isNaN(currentChar)) {
        //if currentchar is a number skip that many spaces
        for (var j = 0; j < parseInt(currentChar, 10); j++) {
          boardSpace[currentSquare] = 0;
          currentSquare++;
        }
      } else {
        //create piece using factory that corresponds to the char
        switch (currentChar) {
          case "p":
            var temp = factory.create("Pawn", currentSquare, "black", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "P":
            var temp = factory.create("Pawn", currentSquare, "white", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "n":
            var temp = factory.create("Knight", currentSquare, "black", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "N":
            var temp = factory.create("Knight", currentSquare, "white", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "b":
            var temp = factory.create("Bishop", currentSquare, "black", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "B":
            var temp = factory.create("Bishop", currentSquare, "white", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "r":
            var temp = factory.create("Rook", currentSquare, "black", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "R":
            var temp = factory.create("Rook", currentSquare, "white", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "q":
            var temp = factory.create("Queen", currentSquare, "black", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "Q":
            var temp = factory.create("Queen", currentSquare, "white", moved);
            boardSpace[currentSquare] = temp;
            break;
          case "k":
            var tempKing = factory.create("King", currentSquare, "black", moved);
            boardSpace[currentSquare] = tempKing;
            blackKing = tempKing;
            break;
          case "K":
            var tempKing = factory.create("King", currentSquare, "white", moved);
            boardSpace[currentSquare] = tempKing;
            whiteKing = tempKing;
            break;
          default:

        }
        currentSquare++;
      }
    } else {
      //Increment currentSquare by two to skip null spaces
      currentSquare += 2;
    }
  }

  return boardSpace;
}
