let PIECES = { 'EMPTY': -1, 'BLACK': 0, 'WHITE': 1 };
let TURN = {
	PLAYER: 0,
	AI: 1,
	PLAYER_COLOR: PIECES.WHITE,
	AI_COLOR: PIECES.BLACK
};
let CURRENT_TURN = TURN.PLAYER;
let OTHER_PLAYER_LOOKUP = { [PIECES.WHITE]: PIECES.BLACK, [PIECES.BLACK]: PIECES.WHITE };

let currentlyHighlightedPieceIndex = -1;
let SEARCH_DEPTH = 3;

let SCREEN_WIDTH = 0;
let SCREEN_HEIGHT = 0;

let fullBoardSize;
let gapBetweenBoards;
let singleBoardSize;
let boardRadiusCurve = 15;
let pieceSize;
let gapBetweenPieces;

let pairScore = 2; // Score for having two in a row
let tripletScore = 100; // Score for having three in a row
let quadScore = 20; // Score for having four in a row

let openEndPair = 8; // Score for two in a row, but with an open end.
let openEndTriplet = 20; // Score for three in a row, but with an open end.
let openEndQuad = 80; // Score for four in a row, but with an open end.

const ROW_INDICES = [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23], [24, 25, 26, 27, 28, 29], [30, 31, 32, 33, 34, 35]];
const COL_INDICES = [[0, 6, 12, 18, 24, 30], [1, 7, 13, 19, 25, 31], [2, 8, 14, 20, 26, 32], [3, 9, 15, 21, 27, 33], [4, 10, 16, 22, 28, 34], [5, 11, 17, 23, 29, 35]];
const DIAGONAL_INDICES = [[6, 13, 20, 27, 34], [0, 7, 14, 21, 28, 35], [1, 8, 15, 22, 29], [24, 19, 14, 9, 4], [30, 25, 20, 15, 10, 5], [31, 26, 21, 16, 11]];

// Track what piece is in location (empty=-1, black=0, white=1).
let GamePieces = [];

function StartConfiguration() {
	GamePieces = [];

	// Default Game Board is empty
	for (let i = 0; i < 36; ++i) {
		GamePieces.push(PIECES.EMPTY);
	}

	GamePieces[2] = PIECES.BLACK;
	GamePieces[3] = PIECES.BLACK;
	GamePieces[9] = PIECES.BLACK;
	GamePieces[10] = PIECES.BLACK;
	GamePieces[14] = PIECES.BLACK;
	GamePieces[15] = PIECES.BLACK;
	GamePieces[19] = PIECES.BLACK;
	GamePieces[28] = PIECES.BLACK;

	GamePieces[5] = PIECES.WHITE;
	GamePieces[6] = PIECES.WHITE;
	GamePieces[7] = PIECES.WHITE;
	GamePieces[11] = PIECES.WHITE;
	GamePieces[12] = PIECES.WHITE;
	GamePieces[25] = PIECES.WHITE;
	GamePieces[27] = PIECES.WHITE;
	GamePieces[34] = PIECES.WHITE;

	// GamePieces[23] = PIECES.WHITE;
	// GamePieces[29] = PIECES.WHITE;
	// GamePieces[20] = PIECES.BLACK;
	// GamePieces[25] = PIECES.BLACK;
	// GamePieces[30] = PIECES.BLACK;

	// GamePieces[0] = PIECES.BLACK;
	// GamePieces[10] = PIECES.BLACK;
	// GamePieces[15] = PIECES.BLACK;
	// GamePieces[25] = PIECES.BLACK;
	// GamePieces[34] = PIECES.BLACK;
	// GamePieces[1] = PIECES.WHITE;
	// GamePieces[6] = PIECES.WHITE;
	// GamePieces[29] = PIECES.WHITE;
	// GamePieces[35] = PIECES.WHITE;

	// GamePieces[4] = PIECES.BLACK;
	// GamePieces[9] = PIECES.BLACK;
	// GamePieces[14] = PIECES.BLACK;
	// GamePieces[19] = PIECES.BLACK;
	// GamePieces[24] = PIECES.BLACK;

	// GamePieces[3] = PIECES.BLACK;
	// GamePieces[5] = PIECES.BLACK;
	// GamePieces[14] = PIECES.BLACK;
	// GamePieces[15] = PIECES.BLACK;
	// GamePieces[17] = PIECES.BLACK;
	// GamePieces[10] = PIECES.WHITE;
	// GamePieces[18] = PIECES.WHITE;
	// GamePieces[25] = PIECES.WHITE;
	// GamePieces[30] = PIECES.WHITE;
	// GamePieces[32] = PIECES.WHITE;

	GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,-1,0,0,0,-1,0,1,1,0,1,-1,1,-1,0,1,0,-1,-1,0,-1,1,-1,-1'.split(',').map(x => parseInt(x));


	// Great Test Position for Black 
	// GamePieces = '-1,0,0,1,-1,1,-1,1,0,0,1,1,-1,1,0,-1,0,1,-1,-1,-1,-1,-1,-1,-1,1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// Great Test Position for Black
	// GamePieces = '-1,0,0,1,1,1,-1,1,0,1,1,0,-1,1,0,1,0,-1,-1,0,1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// Great Test Position for White
	// GamePieces = '-1,0,0,1,-1,1,-1,1,0,0,1,1,-1,1,0,-1,0,1,-1,-1,-1,-1,1,-1,0,0,0,-1,-1,-1,1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// GamePieces = '1,-1,-1,1,0,0,1,-1,-1,-1,1,1,1,-1,-1,0,-1,1,-1,-1,0,0,1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,0'.split(',').map(x => parseInt(x));

	// 2 in a row for each player on separate rows. 
	// GamePieces = '-1,1,1,-1,-1,-1,-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// 3 in a row for each player on separate rows. 
	// GamePieces = '-1,1,1,-1,-1,-1,-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	let iters = 10_000_000;
	let i = 0;

	let timer = Date.now();

	while (i < iters) {
		RotateBoard(GamePieces, 0, true);
		RotateBoard(GamePieces, 1, true);
		RotateBoard(GamePieces, 2, true);
		RotateBoard(GamePieces, 3, true);
		Evaluate(GamePieces, PIECES.WHITE);
		i++;
	}

	timer = Date.now() - timer;

	console.log(`Time Taken (ms): ${timer}`);
}

let QUADRANT_INDICES = [0, 1, 2, 8, 14, 13, 12, 6];
let LEFT_TURN_ADD_AMOUNT = [2, 7, 12, 5, -2, -7, -12, -5]; // Based on the QUADRANT_INDICES Array
let RIGHT_TURN_ADD_AMOUNT = [12, 5, -2, -7, -12, -5, 2, 7]; // Based on the QUADRANT_INDICES Array
let QUADRANT_PLUS_AMOUNTS = [0, 3, 18, 21];

// game = game board
// quadrant = 0,1,2,3 (TL, TR, BL, BR)
// direction = false,true (left, right)
function RotateBoard(game, quadrant, direction) {
	let plusAmount = QUADRANT_PLUS_AMOUNTS[quadrant];

	let oldLeftValues = [game[QUADRANT_INDICES[0] + plusAmount], game[QUADRANT_INDICES[1] + plusAmount]];
	let oldRightValues = [game[QUADRANT_INDICES[6] + plusAmount], game[QUADRANT_INDICES[7] + plusAmount]];

	if (!direction) {
		for (let i = 0; i < QUADRANT_INDICES.length; ++i) {
			if (i > 5) game[QUADRANT_INDICES[i] + plusAmount] = oldLeftValues[i - 6];
			else game[QUADRANT_INDICES[i] + plusAmount] = game[QUADRANT_INDICES[i] + plusAmount + LEFT_TURN_ADD_AMOUNT[i]];
		}
	} else {
		for (let i = QUADRANT_INDICES.length - 1; i > -1; --i) {
			if (i < 2) game[QUADRANT_INDICES[i] + plusAmount] = oldRightValues[i];
			else game[QUADRANT_INDICES[i] + plusAmount] = game[QUADRANT_INDICES[i] + plusAmount + RIGHT_TURN_ADD_AMOUNT[i]];
		}
	}
}

function Evaluate(game, targetColor) {
	let whiteStrength = EvaluateStrength(game, PIECES.WHITE);
	let blackStrength = EvaluateStrength(game, PIECES.BLACK);

	if (whiteStrength === blackStrength) return 0;
	else if (targetColor === PIECES.WHITE && whiteStrength === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
	else if (targetColor === PIECES.WHITE && blackStrength === Number.MAX_SAFE_INTEGER) return Number.MIN_SAFE_INTEGER;
	else if (targetColor === PIECES.BLACK && blackStrength === Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
	else if (targetColor === PIECES.BLACK && whiteStrength === Number.MAX_SAFE_INTEGER) return Number.MIN_SAFE_INTEGER;
	else if (targetColor === PIECES.WHITE) return whiteStrength - blackStrength;
	return blackStrength - whiteStrength;
}

function EvaluateStrength(game, targetColor) {
	let score = 0;
	let tempScore;

	for (let i = 0; i < ROW_INDICES.length; ++i) {
		tempScore = CountRowColDiagScore(game, ROW_INDICES[i], targetColor);

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	for (let i = 0; i < COL_INDICES.length; ++i) {
		tempScore = CountRowColDiagScore(game, COL_INDICES[i], targetColor);

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	for (let i = 0; i < DIAGONAL_INDICES.length; ++i) {
		tempScore = CountRowColDiagScore(game, DIAGONAL_INDICES[i], targetColor);

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	return score;
}

function CountColorsOnRowColDiag(game, index, targetColor, print = false) {
	let rowIndices = ROW_INDICES[Math.floor(index / 6)];
	let colIndices = COL_INDICES[index % 6];
	let diagIndices = DIAGONAL_INDICES_FROM_INDEX[index];
	let nearbyIndices = SURROUNDING_INDICES[index];
	let count = 0;

	for (let i = 0; i < rowIndices.length; ++i) {
		if (game[rowIndices[i]] === targetColor) ++count;
	}

	for (let i = 0; i < colIndices.length; ++i) {
		if (game[colIndices[i]] === targetColor) ++count;
	}

	for (let i = 0; i < diagIndices.length; ++i) {
		for (let j = 0; j < DIAGONAL_INDICES[diagIndices[i]].length; ++j) {
			if (game[DIAGONAL_INDICES[diagIndices[i]][j]] === targetColor) ++count;
		}
	}

	for (let i = 0; i < nearbyIndices.length; ++i) {
		if (game[nearbyIndices[i]] === targetColor) ++count;
	}

	return count;
}

function CountRowColDiagScore(game, rowColDiagIndexList, targetColor) {
	let score = 0;
	let openStart = false;
	let openEnd = false;
	let consecutive = 0;

	for (let i = 0; i < rowColDiagIndexList.length; ++i) {
		if (game[rowColDiagIndexList[i]] === targetColor) {
			consecutive++;
		} else {
			if (game[rowColDiagIndexList[i]] === PIECES.EMPTY) openEnd = true;
			else openEnd = false;

			if (consecutive >= 2) {
				score = ScoreConsecutive(score, consecutive, openStart, openEnd);
			}

			consecutive = 0;
			openEnd = false;

			if (game[rowColDiagIndexList[i]] === PIECES.EMPTY) openStart = true;
			else openStart = false;
		}
	}

	if (consecutive >= 2) {
		score = ScoreConsecutive(score, consecutive, openStart, openEnd);
	}

	return score;
}

function ScoreConsecutive(currentScore, consecutive, openStart, openEnd) {
	if (consecutive === 2) return currentScore + ((openStart || openEnd) ? ((openStart && openEnd) ? 2 * openEndPair : openEndPair) : pairScore);
	else if (consecutive === 3) return currentScore + ((openStart || openEnd) ? ((openStart && openEnd) ? 2 * openEndTriplet : openEndTriplet) : tripletScore);
	else if (consecutive === 4) return currentScore + ((openStart || openEnd) ? ((openStart && openEnd) ? 100_000 : openEndQuad) : quadScore);
	return Number.MAX_SAFE_INTEGER;
}

StartConfiguration();