const assert = require('node:assert/strict');

const GAME = {
	BOARD: 0n,
	REMAINING: 36n
};

const Q4_MASK = (63n << 24n) | (63n << 12n) | 63n;
const Q3_MASK = Q4_MASK << 6n;
const Q2_MASK = Q4_MASK << 36n;
const Q1_MASK = Q4_MASK << 42n;

const Q1_MASK_INV = BigInt('0b' + Q1_MASK.toString(2).padStart(72, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q2_MASK_INV = BigInt('0b' + Q2_MASK.toString(2).padStart(72, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q3_MASK_INV = BigInt('0b' + Q3_MASK.toString(2).padStart(72, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q4_MASK_INV = BigInt('0b' + Q4_MASK.toString(2).padStart(72, '0').split('').map(x => x === '0' ? '1' : '0').join(''));

const ROTATION_LOOKUP_LEFT = new Map();
const ROTATION_LOOKUP_RIGHT = new Map();

const ARRAY_REPRESENTATION_PIECES = { EMPTY: -1, BLACK: 0, WHITE: 1 };

const PIECE_REPRESENTATIONS = {
	EMPTY: 0n, BLACK: 1n, WHITE: 2n
};

// _GetGameObjFromGameArrayStr(GAME, '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,0,0,-1,-1,-1,0,1,0,-1,-1,-1,1,0,1');
// _GetGameObjFromGameArrayStr(GAME, '0,0,0,-1,-1,-1,0,0,0,-1,-1,-1,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1');

console.clear();
console.log(`\nStarting Pentago AI v2: ${(new Date()).toLocaleString()}\n`);

function DrawGameFromInts(gameObj) {
	const gameArray = [];

	// Convert the Integer to a Binary String and pad them with zeros until they are of length 72 (2 * 36, because there are 36 cells & 2-bits per cell).
	const gameBinaryString = gameObj.BOARD.toString(2).padStart(36*2, '0');
	
	// Convert the Binary String (of length 72) to an Array of length 36. Each element is the 2-bits representing the cell.
	const gameIntArray = gameBinaryString.match(/[01]{2}/g).map(bitPair => BigInt(`0b${bitPair}`));
	
	gameIntArray.forEach(cellInt => {
		if (cellInt === PIECE_REPRESENTATIONS.WHITE) gameArray.push('W');
		else if (cellInt === PIECE_REPRESENTATIONS.BLACK) gameArray.push('B');
		else gameArray.push('-');
	});

	let stringsToPrint = [];
	let currentLine = '';

	for (let i = 0; i < 36; ++i) {
		currentLine += gameArray[i] + ' ';

		if ((i+1) !== 0 && (i+1)%6 === 0) {
			currentLine += '\n';
			stringsToPrint.push(currentLine);
			currentLine = '';
		}
		else if ((i+1) !== 0 && (i+1)%3 === 0) {
			currentLine += ' ';
		}
		if (i === 17) stringsToPrint.push('\n');
	}

	console.log(`\nBinary Game: ${gameBinaryString.match(/[01]{2}/g).join(' ')}`);
	console.log('\n' + stringsToPrint.join(''));
}

function _GetGameObjFromGameArrayStr(gameObj, gameStr) {
	let gameArr = gameStr.trim().split(',').map(x => parseInt(x));

	gameObj.BOARD = 0n;
	gameObj.REMAINING = 0n;

	if (gameArr.length !== 36) throw new Error('Game String is not of length 36. Length =' + gameArr.length);

	gameArr.forEach(piece => {
		gameObj.BOARD = gameObj.BOARD << 2n;

		if (piece === ARRAY_REPRESENTATION_PIECES.WHITE) gameObj.BOARD += PIECE_REPRESENTATIONS.WHITE;
		else if (piece === ARRAY_REPRESENTATION_PIECES.BLACK) gameObj.BOARD += PIECE_REPRESENTATIONS.BLACK;
		else gameObj.REMAINING += 1n;
	});
}

function _GetGameArrayFromGameObj(gameObj) {
	let gameArr = [];

	let gameInt = gameObj.BOARD;

	for (let i = 0; i < 36; ++i) {
		if ((gameInt & 3n) === PIECE_REPRESENTATIONS.WHITE) gameArr.push(ARRAY_REPRESENTATION_PIECES.WHITE);
		else if ((gameInt & 3n) === PIECE_REPRESENTATIONS.BLACK) gameArr.push(ARRAY_REPRESENTATION_PIECES.BLACK);
		else gameArr.push(ARRAY_REPRESENTATION_PIECES.EMPTY);

		gameInt = gameInt >> 2n;
	}

	gameArr.reverse();

	return gameArr;
}

const QUADRANT_INDICES = [0, 1, 2, 8, 14, 13, 12, 6];
const LEFT_TURN_ADD_AMOUNT = [2, 7, 12, 5, -2, -7, -12, -5]; // Based on the QUADRANT_INDICES Array
const RIGHT_TURN_ADD_AMOUNT = [12, 5, -2, -7, -12, -5, 2, 7]; // Based on the QUADRANT_INDICES Array
const QUADRANT_PLUS_AMOUNTS = [0, 3, 18, 21];

// game = game board
// quadrant = 0,1,2,3 (TL, TR, BL, BR)
// direction = false,true (left, right)
function _RotateGameArrayBoard(game, quadrant, direction) {
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

function RotateGame(gamObj, quadrant, direction) {
	let mapToUse;

	if (direction) mapToUse = RIGHT_ROTATION_LOOKUP;
	else mapToUse = LEFT_ROTATION_LOOKUP;

	if (quadrant === 0) {
		gamObj.BOARD = (gamObj.BOARD & Q1_MASK_INV) | mapToUse.get(gamObj.BOARD & Q1_MASK);
	} else if (quadrant === 1) {
		gamObj.BOARD = (gamObj.BOARD & Q2_MASK_INV) | mapToUse.get(gamObj.BOARD & Q2_MASK);
	} else if (quadrant === 2) {
		gamObj.BOARD = (gamObj.BOARD & Q3_MASK_INV) | mapToUse.get(gamObj.BOARD & Q3_MASK);
	} else  {
		gamObj.BOARD = (gamObj.BOARD & Q4_MASK_INV) | mapToUse.get(gamObj.BOARD & Q4_MASK);
	}
}

function ResetGame(gameObj) {
	gameObj.BOARD = 0n;
	gameObj.REMAINING = 36n;
}

const _rotationLookup = new Map();
const RIGHT_ROTATION_LOOKUP = new Map();
const LEFT_ROTATION_LOOKUP = new Map();

// Generate Rotation Lookup Tables
function _RecursiveRotationLookupTableGeneration(depth, quadrant, arrayRepresentationAsString) {
	if (depth === 0) {
		_rotationLookup.set(arrayRepresentationAsString, true);

		// Convert the Array String to an Array
		const arrayBoard = arrayRepresentationAsString.split(',').map(cell => parseInt(cell));

		// Rotate the board both ways and store the resulting Array String
		_RotateGameArrayBoard(arrayBoard, quadrant, true);
		const gameStrBeforeRotation = arrayRepresentationAsString;
		const gameStrAfterRightRotation = arrayBoard.toString();
		_RotateGameArrayBoard(arrayBoard, quadrant, false);
		_RotateGameArrayBoard(arrayBoard, quadrant, false);
		const gameStrAfterLeftRotation = arrayBoard.toString();

		const gameObj = {};

		// Convert the original and rotated boards to Integers
		_GetGameObjFromGameArrayStr(gameObj, gameStrBeforeRotation);
		let gameIntBefore = gameObj.BOARD;
		_GetGameObjFromGameArrayStr(gameObj, gameStrAfterRightRotation);
		let gameIntAfterRightRot = gameObj.BOARD;
		_GetGameObjFromGameArrayStr(gameObj, gameStrAfterLeftRotation);
		let gameIntAfterLeftRot = gameObj.BOARD;

		// Store the Before & After game board Integers
		RIGHT_ROTATION_LOOKUP.set(gameIntBefore, gameIntAfterRightRot);
		LEFT_ROTATION_LOOKUP.set(gameIntBefore, gameIntAfterLeftRot);

		return;
	}
	
	// Loop through all the possible positions the cell could be (Empty, Black, White)
	Object.values(ARRAY_REPRESENTATION_PIECES).forEach(piece => {
		_RecursiveRotationLookupTableGeneration(depth - 1, quadrant, arrayRepresentationAsString.replace(`|${depth}|`, piece.toString()));
	});
}

// Q1
_RecursiveRotationLookupTableGeneration(9, 0, '|9|,|8|,|7|,-1,-1,-1,|6|,|5|,|4|,-1,-1,-1,|3|,|2|,|1|,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1');
// Q2
_RecursiveRotationLookupTableGeneration(9, 1, '-1,-1,-1,|9|,|8|,|7|,-1,-1,-1,|6|,|5|,|4|,-1,-1,-1,|3|,|2|,|1|,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1');
// Q3
_RecursiveRotationLookupTableGeneration(9, 2, '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,|9|,|8|,|7|,-1,-1,-1,|6|,|5|,|4|,-1,-1,-1,|3|,|2|,|1|,-1,-1,-1');
// Q4
_RecursiveRotationLookupTableGeneration(9, 3, '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,|9|,|8|,|7|,-1,-1,-1,|6|,|5|,|4|,-1,-1,-1,|3|,|2|,|1|');
assert.strictEqual(_rotationLookup.size, 4* Math.pow(3,9) - 3, `Generated Rotation Lookup Table is not of the correct size (4 * (3^9) - 3 = 78729). Actual size: (${_rotationLookup.size})\n`);
assert.strictEqual(RIGHT_ROTATION_LOOKUP.size, 4* Math.pow(3,9) - 3, `Generated RIGHT Rotation Lookup Table is not of the correct size (4 * (3^9) - 3 = 78729). Actual size: (${_rotationLookup.size})\n`);
assert.strictEqual(LEFT_ROTATION_LOOKUP.size, 4* Math.pow(3,9) - 3, `Generated LEFT Rotation Lookup Table is not of the correct size (4 * (3^9) - 3 = 78729). Actual size: (${_rotationLookup.size})\n`);

// ***** TESTS ***** function _GetGameObjFromGameArrayStr
// _GetGameObjFromGameArrayStr(GAME, '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1');
// _GetGameObjFromGameArrayStr(GAME, '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1');
_GetGameObjFromGameArrayStr(GAME, '1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1');
// _GetGameObjFromGameArrayStr(GAME, '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1,-1,-1,-1,0,1,0,-1,-1,-1,1,0,1');
// ResetGame(GAME);
// ***** TESTS ***** function _GetGameObjFromGameArrayStr


console.log(GAME);
DrawGameFromInts(GAME);

let iters = 1000000;
let i = 0;

let timer = Date.now();

while (i < iters) {
	RotateGame(GAME, 0, true);
	RotateGame(GAME, 1, true);
	RotateGame(GAME, 2, true);
	RotateGame(GAME, 3, true);
	i++;
}

timer = Date.now() - timer;

console.log(`Time Taken (ms): ${timer}`);

// GAME.BOARD = GAME.BOARD & Q4_MASK_INV;


// console.log(_GetGameArrayFromGameObj(GAME));

// let time = Date.now();

// for (let i = 0; i < 10000000; ++i) {
// 	RotateGame(GAME, i%4, false);
// }

// time = Date.now() - time;

// console.log('Time (ms):', time);

// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// DrawGameFromInts(GAME);
