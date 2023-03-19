let PIECES = { EMPTY: 0, BLACK: 1, WHITE: 2 };
let CURRENT_TURN = PIECES.WHITE;

let currentlyHighlightedPieceIndex = -1;

let SCREEN_WIDTH = 0;
let SCREEN_HEIGHT = 0;

let fullBoardSize;
let gapBetweenBoards;
let singleBoardSize;
let boardRadiusCurve = 15;
let pieceSize;
let gapBetweenPieces;

// Screen Locations of the 4 Game Boards
let boardLocations = {
	'TL': { x: 0, y: 0, pieceLocations: [] },
	'TR': { x: 0, y: 0, pieceLocations: [] },
	'BL': { x: 0, y: 0, pieceLocations: [] },
	'BR': { x: 0, y: 0, pieceLocations: [] },
};

// Track what piece is in location (empty=-1, black=0, white=1).
let GamePieces = [];
let GamePieceIndexToPieceLocationMap = {
	0: {board: 'TL', index: 0},
	1: {board: 'TL', index: 1},
	2: {board: 'TL', index: 2},

	3: {board: 'TR', index: 0},
	4: {board: 'TR', index: 1},
	5: {board: 'TR', index: 2},

	6: {board: 'TL', index: 3},
	7: {board: 'TL', index: 4},
	8: {board: 'TL', index: 5},

	9: {board: 'TR', index: 3},
	10: {board: 'TR', index: 4},
	11: {board: 'TR', index: 5},

	12: {board: 'TL', index: 6},
	13: {board: 'TL', index: 7},
	14: {board: 'TL', index: 8},

	15: {board: 'TR', index: 6},
	16: {board: 'TR', index: 7},
	17: {board: 'TR', index: 8},

	18: {board: 'BL', index: 0},
	19: {board: 'BL', index: 1},
	20: {board: 'BL', index: 2},

	21: {board: 'BR', index: 0},
	22: {board: 'BR', index: 1},
	23: {board: 'BR', index: 2},

	24: {board: 'BL', index: 3},
	25: {board: 'BL', index: 4},
	26: {board: 'BL', index: 5},

	27: {board: 'BR', index: 3},
	28: {board: 'BR', index: 4},
	29: {board: 'BR', index: 5},

	30: {board: 'BL', index: 6},
	31: {board: 'BL', index: 7},
	32: {board: 'BL', index: 8},

	33: {board: 'BR', index: 6},
	34: {board: 'BR', index: 7},
	35: {board: 'BR', index: 8},
};

// Drawing functions to handled inverted Y-Axis of the browser
const drawRect = (x, y, w, h, curve) => rect(x, SCREEN_HEIGHT-y, w, h, curve);
const drawLine = (x1, y1, x2, y2) => line(x1, SCREEN_HEIGHT-y1, x2, SCREEN_HEIGHT-y2);
const drawCircle = (x, y, d) => circle(x, SCREEN_HEIGHT-y, d);
const drawArc = (x, y, w, h, startAngle, stopAngle) => arc(x, SCREEN_HEIGHT-y, w, h, 2*Math.PI-stopAngle, 2*Math.PI-startAngle);
const drawTri = (x1, y1, x2, y2, x3, y3) => triangle(x1, SCREEN_HEIGHT-y1, x2, SCREEN_HEIGHT-y2, x3, SCREEN_HEIGHT-y3);

function StartConfiguration() {
	GamePieces = [];

	// Default Game Board is empty
	for (let i = 0; i < 36; ++i) {
		GamePieces.push(PIECES.EMPTY);
	}

	// GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,-1,0,0,0,-1,0,1,1,0,1,-1,1,-1,0,1,0,-1,-1,0,-1,1,-1,-1'.split(',').map(x => parseInt(x));
}

// Initial Setup
function setup() {
	SCREEN_WIDTH = window.innerWidth - 20;
	SCREEN_HEIGHT = window.innerHeight - 20

	createCanvas(window.innerWidth-20, window.innerHeight-20);

	fullBoardSize = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
	gapBetweenBoards = fullBoardSize/20;
	singleBoardSize = (fullBoardSize - gapBetweenBoards) / 2;
	pieceSize = singleBoardSize / 6;
	gapBetweenPieces = singleBoardSize/3;

	// Calculate the screen locations of the 4 game boards
	boardLocations.TL.x = SCREEN_WIDTH/2 - singleBoardSize/2 - gapBetweenBoards/4;
	boardLocations.TL.y = SCREEN_HEIGHT/2 + singleBoardSize/2 + gapBetweenBoards/4;

	boardLocations.TR.x = SCREEN_WIDTH/2 + singleBoardSize/2 + gapBetweenBoards/4;
	boardLocations.TR.y = SCREEN_HEIGHT/2 + singleBoardSize/2 + gapBetweenBoards/4;

	boardLocations.BL.x = SCREEN_WIDTH/2 - singleBoardSize/2 - gapBetweenBoards/4;
	boardLocations.BL.y = SCREEN_HEIGHT/2 - singleBoardSize/2 - gapBetweenBoards/4;

	boardLocations.BR.x = SCREEN_WIDTH/2 + singleBoardSize/2 + gapBetweenBoards/4;
	boardLocations.BR.y = SCREEN_HEIGHT/2 - singleBoardSize/2 - gapBetweenBoards/4;

	// Calculate the screen locations where the pieces should be drawn on the game boards.

	Object.values(boardLocations).forEach(board => {
		board.pieceLocations.push({ x: board.x - gapBetweenPieces, y: board.y + gapBetweenPieces});
		board.pieceLocations.push({ x: board.x, y: board.y + gapBetweenPieces});
		board.pieceLocations.push({ x: board.x + gapBetweenPieces, y: board.y + gapBetweenPieces});

		board.pieceLocations.push({ x: board.x - gapBetweenPieces, y: board.y});
		board.pieceLocations.push({ x: board.x, y: board.y});
		board.pieceLocations.push({ x: board.x + gapBetweenPieces, y: board.y});

		board.pieceLocations.push({ x: board.x - gapBetweenPieces, y: board.y - gapBetweenPieces});
		board.pieceLocations.push({ x: board.x, y: board.y - gapBetweenPieces});
		board.pieceLocations.push({ x: board.x + gapBetweenPieces, y: board.y - gapBetweenPieces});
	});

	StartConfiguration();
	frameRate(60);
}

function ExportGameBoard() {
	console.log(GamePieces.toString());
	console.log();
	
	return GamePieces.toString();
}

// To be called each frame
function draw() {
	// Draw background & set Rectangle draw mode
	background(30);
	rectMode(CENTER);

	// Draw Game Board
	DrawBoard();
}

function mousePressed() {
	if (currentlyHighlightedPieceIndex !== -1 && GamePieces.filter(piece => piece === PIECES.EMPTY).length > 0) {
		GamePieces[currentlyHighlightedPieceIndex] = CURRENT_TURN;

		CURRENT_TURN = (CURRENT_TURN === PIECES.WHITE ? PIECES.BLACK : PIECES.WHITE);
	}
}

function DrawBoard() {
	let fullBoardSize = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT);
	let gapBetweenBoards = fullBoardSize/20;
	let singleBoardSize = (fullBoardSize - gapBetweenBoards) / 2;

	noStroke();
	fill(255,30,30);

	fill(150,150,150);
	drawRect(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, fullBoardSize, fullBoardSize);

	fill(160,0,0);

	// Draw 4 Game Boards
	drawRect(boardLocations.TL.x, boardLocations.TL.y, singleBoardSize, singleBoardSize, boardRadiusCurve);
	drawRect(boardLocations.TR.x, boardLocations.TR.y, singleBoardSize, singleBoardSize, boardRadiusCurve);
	drawRect(boardLocations.BL.x, boardLocations.BL.y, singleBoardSize, singleBoardSize, boardRadiusCurve);
	drawRect(boardLocations.BR.x, boardLocations.BR.y, singleBoardSize, singleBoardSize, boardRadiusCurve);

	let pieceSelected = null;

	// Draw Pieces on the Game Boards
	GamePieces.forEach((piece, index) => {
		let targetBoard = boardLocations[GamePieceIndexToPieceLocationMap[index].board];
		let pieceLocation = targetBoard.pieceLocations[GamePieceIndexToPieceLocationMap[index].index];

		if (piece === PIECES.EMPTY) {
			if (Math.sqrt((mouseX-pieceLocation.x)**2 + ((SCREEN_HEIGHT-mouseY)-pieceLocation.y)**2) < pieceSize/2) {
				fill(0, 120, 0);
				pieceSelected = index;
			} else {
				fill(120, 0, 0);
			}
		}
		else if (piece === PIECES.BLACK) fill(0, 0, 0);
		else fill(220, 220, 220);

		drawCircle(pieceLocation.x, pieceLocation.y, pieceSize);

		if (piece === PIECES.EMPTY) {
			textAlign(CENTER, CENTER);
			fill(0,20,180);
			textSize(32);
			text(index.toString(), pieceLocation.x, SCREEN_HEIGHT-pieceLocation.y);
		}

	});

	if (pieceSelected !== null) currentlyHighlightedPieceIndex = pieceSelected;
	else currentlyHighlightedPieceIndex = -1;
}

let QUADRANT_INDICES = [0,1,2,8,14,13,12,6];
let LEFT_TURN_ADD_AMOUNT = [2,7,12,5,-2,-7,-12,-5]; // Based on the QUADRANT_INDICES Array
let RIGHT_TURN_ADD_AMOUNT = [12,5,-2,-7,-12,-5,2,7]; // Based on the QUADRANT_INDICES Array
let QUADRANT_PLUS_AMOUNTS = [0,3,18,21];

// game = game board
// quadrant = 0,1,2,3 (TL, TR, BL, BR)
// direction = false,true (left, right)
function RotateBoard(game, quadrant, direction) {
	let plusAmount = QUADRANT_PLUS_AMOUNTS[quadrant];

	let oldLeftValues = [game[QUADRANT_INDICES[0]+plusAmount], game[QUADRANT_INDICES[1]+plusAmount]];
	let oldRightValues = [game[QUADRANT_INDICES[6]+plusAmount], game[QUADRANT_INDICES[7]+plusAmount]];

	if (!direction) {
		for (let i = 0; i < QUADRANT_INDICES.length; ++i) {
			if (i > 5) game[QUADRANT_INDICES[i]+plusAmount] = oldLeftValues[i-6];
			else game[QUADRANT_INDICES[i]+plusAmount] = game[QUADRANT_INDICES[i]+plusAmount+LEFT_TURN_ADD_AMOUNT[i]];
		}
	} else {
		for (let i = QUADRANT_INDICES.length-1; i > -1; --i) {
			if (i < 2) game[QUADRANT_INDICES[i]+plusAmount] = oldRightValues[i];
			else game[QUADRANT_INDICES[i]+plusAmount] = game[QUADRANT_INDICES[i]+plusAmount+RIGHT_TURN_ADD_AMOUNT[i]];
		}
	}
}
