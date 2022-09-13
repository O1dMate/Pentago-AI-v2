const fs = require('fs');
const path = require('path');

console.clear();

// ENSURE this matches what is in the actual game AI file!
const PIECES = { EMPTY: 1, BLACK: 2, WHITE: 3 };
const OTHER_PLAYER_LOOKUP = { [PIECES.WHITE]: PIECES.BLACK, [PIECES.BLACK]: PIECES.WHITE };

// Read the lines from the specified files.Create an Object with each line as a key.
// const QUADS_5 = fs.readFileSync(path.join(__dirname, '../quads-5.txt'), 'utf-8').split('\n').map(line => line.trim()).filter(line => line).reduce((accum, cur) => { return { ...accum, [cur]: true } }, {});
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

const PAIR_SCORE = 10;
const TRIPLE_SCORE = 100;
const QUAD_SCORE = 1_000;
const QUAD_OPEN_END_SCORE = 1_000_000;

const BLOCKED_TRIPLE_SCORE = 25;
const SCORE_FOR_CURRENT_TURN = 2;

function _PreCalculateScoreOfRow(row, targetColor) {
	// E = Empty. O = Opponent. C = Colour (target colour)

	let fullRowStr = row.join('').replaceAll(PIECES.EMPTY, 'E').replaceAll(targetColor, 'C').replaceAll(OTHER_PLAYER_LOOKUP[targetColor], 'O');
	console.log({ fullRowStr });

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
		if (TRIPLES_6_BEST.hasOwnProperty(fullRowStr)) return 2*TRIPLE_SCORE;
		if (TRIPLES_6_BEST_OPPONENT.hasOwnProperty(fullRowStr)) return -2*TRIPLE_SCORE;

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
	if (fullRowStr.includes('CCC')) return BLOCKED_TRIPLE_SCORE;
	if (fullRowStr.includes('OOO')) return -BLOCKED_TRIPLE_SCORE;

	// Check for PAIRS
	if (fullRowStr.includes('CC')) return PAIR_SCORE;
	if (fullRowStr.includes('OO')) return -PAIR_SCORE;

	// for (let i = 0; i < stringsToCheck.length; ++i) {
	// 	if (stringsToCheck[i] === playerFiveInARow) return Number.MAX_SAFE_INTEGER;
	// 	if (stringsToCheck[i] === opponentFiveInARow) return Number.MIN_SAFE_INTEGER;
	// }

	// for (let i = 0; i < stringsToCheck.length; ++i) {
	// 	for (let a = 0; a < playerFourInARow.length; ++a) {
	// 		if (stringsToCheck[i] === playerFourInARow[a]) return 1000;
	// 		if (stringsToCheck[i] === opponentFourInARow[a]) return -1000;
	// 	}
	// }

	// for (let i = 0; i < stringsToCheck.length; ++i) {
	// 	for (let a = 0; a < playerThreeInARow.length; ++a) {
	// 		if (stringsToCheck[i] === playerThreeInARow[a]) return 100;
	// 		if (stringsToCheck[i] === opponentThreeInARow[a]) return -100;
	// 	}
	// }

	// for (let i = 0; i < stringsToCheck.length; ++i) {
	// 	if (stringsToCheck[i].includes(C + C + C) && stringsToCheck[i].includes(O + O + O)) return 0;
	// 	if (stringsToCheck[i].includes(C + C + C)) return 50;
	// 	if (stringsToCheck[i].includes(O + O + O)) return -50;
	// }

	return 0;
}


let player = PIECES.WHITE;
let testGame = [PIECES.WHITE, PIECES.WHITE, PIECES.EMPTY, PIECES.WHITE, PIECES.EMPTY, PIECES.EMPTY];
let result = _PreCalculateScoreOfRow(testGame, player);

console.log({testGame, result, player});
