const fs = require('fs');
const path = require('path');

console.clear();

// ENSURE this matches what is in the actual game AI file!
const PIECES = { EMPTY: 1, BLACK: 2, WHITE: 3 };
const OTHER_PLAYER_LOOKUP = { [PIECES.WHITE]: PIECES.BLACK, [PIECES.BLACK]: PIECES.WHITE };

// Indices of each Row, Col, & Diagonal
const ROW_INDICES = [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], [12, 13, 14, 15, 16, 17], [18, 19, 20, 21, 22, 23], [24, 25, 26, 27, 28, 29], [30, 31, 32, 33, 34, 35]];
const COL_INDICES = [[0, 6, 12, 18, 24, 30], [1, 7, 13, 19, 25, 31], [2, 8, 14, 20, 26, 32], [3, 9, 15, 21, 27, 33], [4, 10, 16, 22, 28, 34], [5, 11, 17, 23, 29, 35]];
const DIAGONAL_INDICES = [[6, 13, 20, 27, 34], [0, 7, 14, 21, 28, 35], [1, 8, 15, 22, 29], [24, 19, 14, 9, 4], [30, 25, 20, 15, 10, 5], [31, 26, 21, 16, 11]];

// Read the lines from the specified files.Create an Object with each line as a key.
const QUADS_5 = fs.readFileSync(path.join(__dirname, '../quads-5.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
const QUADS_5_OPPONENT = fs.readFileSync(path.join(__dirname, '../quads-5.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).map(line => line.replaceAll('C', '1').replaceAll('O', '2').replaceAll('1', 'O').replaceAll('2', 'C')).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});

const QUADS_6 = fs.readFileSync(path.join(__dirname, '../quads-6.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
const QUADS_6_OPPONENT = fs.readFileSync(path.join(__dirname, '../quads-6.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).map(line => line.replaceAll('C', '1').replaceAll('O', '2').replaceAll('1', 'O').replaceAll('2', 'C')).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});

const TRIPLES_5 = fs.readFileSync(path.join(__dirname, '../triples-5.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
const TRIPLES_5_OPPONENT = fs.readFileSync(path.join(__dirname, '../triples-5.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).map(line => line.replaceAll('C', '1').replaceAll('O', '2').replaceAll('1', 'O').replaceAll('2', 'C')).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});

const TRIPLES_6_OKAY = fs.readFileSync(path.join(__dirname, '../triples-6-okay.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
const TRIPLES_6_OKAY_OPPONENT = fs.readFileSync(path.join(__dirname, '../triples-6-okay.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).map(line => line.replaceAll('C', '1').replaceAll('O', '2').replaceAll('1', 'O').replaceAll('2', 'C')).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});

const TRIPLES_6_BEST = fs.readFileSync(path.join(__dirname, '../triples-6-best.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
const TRIPLES_6_BEST_OPPONENT = fs.readFileSync(path.join(__dirname, '../triples-6-best.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).map(line => line.replaceAll('C', '1').replaceAll('O', '2').replaceAll('1', 'O').replaceAll('2', 'C')).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});

const SINGLE_NOT_ON_EDGE_SCORE = 2;
const PAIR_SCORE = 10;
const TRIPLE_SCORE = 100;
const QUAD_SCORE = 1_000;
const QUAD_OPEN_END_SCORE = 1_000_000;

const BLOCKED_TRIPLE_SCORE = 25;

const SCORE_LOOKUP_TABLE_5 = {
	[PIECES.BLACK]: new Map(),
	[PIECES.WHITE]: new Map()
};
const SCORE_LOOKUP_TABLE_6 = {
	[PIECES.BLACK]: new Map(),
	[PIECES.WHITE]: new Map()
};

function _PreCalculateScoreOfRow(row, targetColor) {
	// E = Empty. O = Opponent. C = Colour (target colour)

	let fullRowStr = row.join('').replaceAll(PIECES.EMPTY, 'E').replaceAll(targetColor, 'C').replaceAll(OTHER_PLAYER_LOOKUP[targetColor], 'O');

	// Check for WIN (5 in a row). (6 in a row is also covered by this check)
	if (fullRowStr.includes('CCCCC')) return Number.MAX_SAFE_INTEGER;
	else if (fullRowStr.includes('OOOOO')) return Number.MIN_SAFE_INTEGER;

	if (row.length === 6) {
		// Check for 4 in a row with open ends. (This is only possible with length 6)
		if (fullRowStr === ('ECCCCE')) return QUAD_OPEN_END_SCORE;
		if (fullRowStr === ('EOOOOE')) return -QUAD_OPEN_END_SCORE;

		// Check for QUADS
		if (QUADS_6.hasOwnProperty(fullRowStr)) return QUAD_SCORE;
		if (QUADS_6_OPPONENT.hasOwnProperty(fullRowStr)) return -QUAD_SCORE;

		// Check for TRIPLES
		if (TRIPLES_6_BEST.hasOwnProperty(fullRowStr)) return 2 * TRIPLE_SCORE;
		if (TRIPLES_6_BEST_OPPONENT.hasOwnProperty(fullRowStr)) return -2 * TRIPLE_SCORE;

		// Check for TRIPLES
		if (TRIPLES_6_OKAY.hasOwnProperty(fullRowStr)) return TRIPLE_SCORE;
		if (TRIPLES_6_OKAY_OPPONENT.hasOwnProperty(fullRowStr)) return -TRIPLE_SCORE;
	} else {

		// Check for QUADS
		if (QUADS_5.hasOwnProperty(fullRowStr)) return QUAD_SCORE;
		if (QUADS_5_OPPONENT.hasOwnProperty(fullRowStr)) return -QUAD_SCORE;

		// Check for TRIPLES
		if (TRIPLES_5.hasOwnProperty(fullRowStr)) return TRIPLE_SCORE;
		if (TRIPLES_5_OPPONENT.hasOwnProperty(fullRowStr)) return -TRIPLE_SCORE;
	}

	// Check for Blocked TRIPLES
	if (fullRowStr.includes('CCC') && fullRowStr.includes('OOO')) return 0;
	if (fullRowStr.includes('CCC')) return BLOCKED_TRIPLE_SCORE;
	if (fullRowStr.includes('OOO')) return -BLOCKED_TRIPLE_SCORE;

	// Check for PAIRS
	if (fullRowStr.includes('CC') && fullRowStr.includes('OO')) return 0;
	if (fullRowStr.includes('CC')) return PAIR_SCORE;
	if (fullRowStr.includes('OO')) return -PAIR_SCORE;

	// Check for SINGLE_NOT_ON_EDGE_SCORE
	if (fullRowStr.includes('ECE') && fullRowStr.includes('EOE')) return 0;
	if (fullRowStr.includes('ECE')) return SINGLE_NOT_ON_EDGE_SCORE;
	if (fullRowStr.includes('EOE')) return -SINGLE_NOT_ON_EDGE_SCORE;

	return 0;
}

function _RowToInt(rowArray) {
	if (rowArray.length === 5) return rowArray[4] + 10 * rowArray[3] + 100 * rowArray[2] + 1000 * rowArray[1] + 10000 * rowArray[0];
	return rowArray[5] + 10 * rowArray[4] + 100 * rowArray[3] + 1000 * rowArray[2] + 10000 * rowArray[1] + 100000 * rowArray[0];
}

function _GenerateRowScoreLookupTable() {
	let charsWhite = ['E', 'O', 'C'];
	let charsBlack = ['E', 'C', 'O'];
	let charInts = [PIECES.EMPTY, PIECES.BLACK, PIECES.WHITE];

	for (let aa = 0; aa <= 2; ++aa) {
		for (let bb = 0; bb <= 2; ++bb) {
			for (let cc = 0; cc <= 2; ++cc) {
				for (let dd = 0; dd <= 2; ++dd) {
					for (let ee = 0; ee <= 2; ++ee) {
						let rowInt = _RowToInt([charInts[aa], charInts[bb], charInts[cc], charInts[dd], charInts[ee]]);

						SCORE_LOOKUP_TABLE_5[PIECES.WHITE].set(rowInt, _PreCalculateScoreOfRow([charsWhite[aa], charsWhite[bb], charsWhite[cc], charsWhite[dd], charsWhite[ee]], PIECES.WHITE));
						SCORE_LOOKUP_TABLE_5[PIECES.BLACK].set(rowInt, _PreCalculateScoreOfRow([charsBlack[aa], charsBlack[bb], charsBlack[cc], charsBlack[dd], charsBlack[ee]], PIECES.BLACK));

						for (let ff = 0; ff <= 2; ++ff) {
							rowInt = _RowToInt([charInts[aa], charInts[bb], charInts[cc], charInts[dd], charInts[ee], charInts[ff]]);
							SCORE_LOOKUP_TABLE_6[PIECES.WHITE].set(rowInt, _PreCalculateScoreOfRow([charsWhite[aa], charsWhite[bb], charsWhite[cc], charsWhite[dd], charsWhite[ee], charsWhite[ff]], PIECES.WHITE));
							SCORE_LOOKUP_TABLE_6[PIECES.BLACK].set(rowInt, _PreCalculateScoreOfRow([charsBlack[aa], charsBlack[bb], charsBlack[cc], charsBlack[dd], charsBlack[ee], charsBlack[ff]], PIECES.BLACK));
						}
					}
				}
			}
		}
	}
}

function Evaluate(game, targetColor) {
	let score = EvaluateStrength(game, targetColor);

	if (score === Number.MAX_SAFE_INTEGER) {
		let opponentScore = EvaluateStrength(game, OTHER_PLAYER_LOOKUP[targetColor]);

		// Check if there is a DRAW
		if (opponentScore === Number.MAX_SAFE_INTEGER) return 0;

		// No DRAW, target color won
		return Number.MAX_SAFE_INTEGER;
	}
	else if (score < -1_000_000_000) return Number.MIN_SAFE_INTEGER;

	return score;
}

function EvaluateStrength(game, targetColor) {
	let score = 0;
	let tempScore = 0;
	let rowInt = 0;

	for (let i = 0; i < ROW_INDICES.length; ++i) {
		rowInt = _RowToInt([game[ROW_INDICES[i][0]], game[ROW_INDICES[i][1]], game[ROW_INDICES[i][2]], game[ROW_INDICES[i][3]], game[ROW_INDICES[i][4]], game[ROW_INDICES[i][5]]]);
		tempScore = SCORE_LOOKUP_TABLE_6[targetColor].get(rowInt);

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	for (let i = 0; i < COL_INDICES.length; ++i) {
		rowInt = _RowToInt([game[COL_INDICES[i][0]], game[COL_INDICES[i][1]], game[COL_INDICES[i][2]], game[COL_INDICES[i][3]], game[COL_INDICES[i][4]], game[COL_INDICES[i][5]]]);
		tempScore = SCORE_LOOKUP_TABLE_6[targetColor].get(rowInt);

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	for (let i = 0; i < DIAGONAL_INDICES.length; ++i) {
		if (DIAGONAL_INDICES[i].length === 6) {
			rowInt = _RowToInt([game[DIAGONAL_INDICES[i][0]], game[DIAGONAL_INDICES[i][1]], game[DIAGONAL_INDICES[i][2]], game[DIAGONAL_INDICES[i][3]], game[DIAGONAL_INDICES[i][4]], game[DIAGONAL_INDICES[i][5]]]);
			tempScore = SCORE_LOOKUP_TABLE_6[targetColor].get(rowInt);
		} else {
			rowInt = _RowToInt([game[DIAGONAL_INDICES[i][0]], game[DIAGONAL_INDICES[i][1]], game[DIAGONAL_INDICES[i][2]], game[DIAGONAL_INDICES[i][3]], game[DIAGONAL_INDICES[i][4]]]);
			tempScore = SCORE_LOOKUP_TABLE_5[targetColor].get(rowInt);
		}

		if (tempScore === Number.MAX_SAFE_INTEGER) return tempScore;
		score += tempScore;
	}

	return score;
}

const QUADRANT_INDICES = [0, 1, 2, 8, 14, 13, 12, 6];
const LEFT_TURN_ADD_AMOUNT = [2, 7, 12, 5, -2, -7, -12, -5]; // Based on the QUADRANT_INDICES Array
const RIGHT_TURN_ADD_AMOUNT = [12, 5, -2, -7, -12, -5, 2, 7]; // Based on the QUADRANT_INDICES Array
const QUADRANT_PLUS_AMOUNTS = [0, 3, 18, 21];

// game = game board
// quadrant = 0,1,2,3 (TL, TR, BL, BR)
// direction = false,true (left, right)
function RotateGame(game, quadrant, direction) {
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

function PrettyResult(result) {
	let niceResults = result.map(x => x);
	niceResults[1] = niceResults[1] === 0 ? 'Q1' :
		niceResults[1] === 1 ? 'Q2' :
			niceResults[1] === 2 ? 'Q3' :
				'Q4';
	niceResults[2] = niceResults[2] === false ? 'Left' : 'Right';
	return niceResults;
}

_GenerateRowScoreLookupTable();

// let GAME_ARR = [1,1,3,3,3,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
// let GAME_ARR = [1,3,3,3,3,1,1,1,2,2,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
// let GAME_ARR = [3,3,3,3,3,1,1,1,2,2,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
// let GAME_ARR = [3,3,3,3,3,1,1,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
// let GAME_ARR = [3, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// console.log({
// 	white: Evaluate(GAME_ARR, PIECES.WHITE),
// 	black: Evaluate(GAME_ARR, PIECES.BLACK),
// });

// let iters = 1_000_000;
// let i = 0;

// let timer = Date.now();

// while (i < iters) {
// 	RotateGame(GAME_ARR, 0, true);
// 	RotateGame(GAME_ARR, 1, true);
// 	RotateGame(GAME_ARR, 2, true);
// 	RotateGame(GAME_ARR, 3, true);
// 	Evaluate(GAME_ARR, PIECES.WHITE);
// 	i++;
// }

// timer = Date.now() - timer;

// console.log(`Time Taken (ms): ${timer}`);

module.exports = {
	PrettyResult,
	RotateGame,
	Evaluate,
};