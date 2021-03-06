QUnit.test("Test Board Generation", function(assert) {

  var testBoard = CreateNewBoardData();

  assert.equal(testBoard[21].pieceVal, "Rook", "Upper left square is Rook");
  assert.equal(testBoard[94].pieceVal, "Queen", "White side queen is in correct position");
  assert.equal(testBoard[94].colour, "white", "White side queen is correct colour");
  assert.equal(testBoard[24].pieceVal, "Queen", "Black side queen is in correct position");
  assert.equal(testBoard[24].colour, "black", "Black side queen is correct colour");
});

QUnit.test("Test Show Moves", function(assert) {
  var testFen = "urunubuqukubunuru/u1upupu1upu1upupu/u3upu2uPu1u/u8u/u2uPuQu4u/upu4uPu2u/u1uPu1uPuNu1uPuPu/uRuNuBu1uKuBu1uR"
  var testBoard = GenerateFenBoard(testFen);

  var moves = testBoard[64].ShowMoves(testBoard);

  assert.ok(moves.includes(44), "Can move to space occupied by enemy piece");
  assert.ok(moves.includes(74), "Can move vertically");
  assert.ok(moves.includes(68), "Can move horizontally");
  assert.ok(moves.includes(97), "Can move diagonally");
  assert.notOk(moves.includes(61), "Can't move through pieces");

  moves = testBoard[85].ShowMoves(testBoard);
  assert.ok(moves.includes(97), "Knight can jump pieces");
  assert.notOk(moves.includes(64), "Knight Can't take friendly pieces");

  moves = testBoard[82].ShowMoves(testBoard);
  assert.ok(moves.includes(72), "Pawn can move one space forward");
  assert.ok(moves.includes(62), "Starting Pawn can move two spaces forward");
  assert.ok(moves.includes(71), "Pawn can take diagonally");
  assert.notOk(moves.includes(73), "Pawn can not move diagonally when there is no enemy");

  moves = testBoard[25].ShowMoves(testBoard);
  assert.notOk(moves.includes(36), "King can not move into check");
});

QUnit.test("Test Moving Piece", function(assert) {
  var testFen = "urunubuqukubunuru/upupupupupupupupu/u8u/u8u/u8u/u5uBu2u/uPuPuPuPuPuPuPuPu/uRuNuBuQuKu1uNuR";
  var testBoard = GenerateFenBoard(testFen);

  var currentPiece = testBoard[76];

  assert.equal(testBoard[76], currentPiece, "Piece starts in correct space");
  assert.equal(testBoard[43], 0, "Destination space is empty");
  testBoard[76].Move(43, testBoard);
  assert.equal(testBoard[43], currentPiece, "Piece ends in correct space");
  assert.equal(testBoard[76], 0, "Starting space is empty");
});

QUnit.test("Test Taking Piece", function(assert) {
  var testFen = "uru1ubuqukubunuru/upupupupupupupupu/u2unu5u/u8u/u8u/u5uBu2u/uPuPuPuPuPuPuPuPu/uRuNuBuQuKu1uNuR";
  var testBoard = GenerateFenBoard(testFen);

  var currentPiece = testBoard[76];

  assert.equal(testBoard[76], currentPiece, "Piece starts in correct space");
  assert.notEqual(testBoard[43].colour, currentPiece.colour, "Destination space contains enemy piece");
  testBoard[76].Move(43, testBoard);
  assert.equal(testBoard[43], currentPiece, "Piece ends in correct space");
  assert.equal(testBoard[76], 0, "Starting space is empty");
});

QUnit.test("Test Upgrading Pawn", function(assert) {
  var testFen = "u8u/u3uPu4u/u8u/u8u/u8u/u8u/u8u/u8";
  var testBoard = GenerateFenBoard(testFen);

  assert.equal(testBoard[34].pieceVal, "Pawn", "Piece starts as a pawn");
  testBoard[34].Move(24, testBoard);
  assert.equal(testBoard[24].pieceVal, "Queen", "Piece has been upgraded");

});

QUnit.test("Test en passant", function(assert) {
  var testFen = "u8u/u8u/u8u/u8u/u5upu2u/u8u/u4uPu3u/u8";
  var testBoard = GenerateFenBoard(testFen);

  testBoard[85].Move(65, testBoard);
  assert.ok(testBoard[66].ShowMoves(testBoard).includes(75), "Performing en passant is a valid move");
});

QUnit.test("Test castling", function(assert) {
  var testFen = "u8u/u8u/u8u/u8u/u8u/u8u/u8u/u4uKu2uR";
  var testBoard = GenerateFenBoard(testFen);
  assert.ok(testBoard[95].ShowMoves(testBoard).includes(97), "Castling is a valid move");
  testBoard[95].Move(97, testBoard);

  assert.equal(testBoard[95], 0, "King start square is empty");
  assert.equal(testBoard[97].pieceVal, "King", "King castled successfully");
  assert.equal(testBoard[96].pieceVal, "Rook", "Rook castled successfully");

});

QUnit.test("Test Check", function(assert) {
  var testFen = "u3uKu4u/u8u/u8u/u8u/u8u/u8u/u8u/u7uq";
  var testBoard = GenerateFenBoard(testFen);

  assert.notOk(testBoard[24].isChecked, "King does not start in check");
  testBoard[98].Move(94, testBoard);
  assert.ok(SpaceIsAttacked(testBoard, "black", testBoard[24].currentPos) > 0, "King is in check after black moves")
  assert.notOk(CheckForCheckmate(testBoard, "black", testBoard[24]), "King is not in checkmate");

});

QUnit.test("Test cannot create Check by discovery", function(assert) {
  var testFen = "u3uku4u/u8u/u8u/u3uru4u/u8u/u8u/u8u/u3uRu4";
  var testBoard = GenerateFenBoard(testFen);

  assert.notOk(testBoard[24].isChecked, "King does not start in check");
  var moves = testBoard[54].ShowMoves(testBoard);
  assert.notOk(moves.includes(55), "Rook can not move to create check");

});

QUnit.test("Test Checkmate", function(assert) {
  var testFen = "u2uqu1uqu3u/u8u/uqu7u/u3uKu4u/uqu7u/u8u/u8u/u6uqu1";
  var testBoard = GenerateFenBoard(testFen);

  assert.notOk(SpaceIsAttacked(testBoard, "black", testBoard[54].currentPos) > 0, "King does not start in check");
  testBoard[97].Move(94, testBoard);
  assert.ok(CheckForCheckmate(testBoard, "black", testBoard[54]), "King is in checkmate");
});
