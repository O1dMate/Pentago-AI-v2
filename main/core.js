let GAME = {
	WHITE: 0n,
	BLACK: 0n,
	REMAINING: 36
};
const Q4_MASK = (7n << 12n) | (7n << 6n) | 7n;
const Q3_MASK = Q4_MASK << 3n;
const Q2_MASK = Q4_MASK << 18n;
const Q1_MASK = Q4_MASK << 21n;

const Q1_MASK_INV = BigInt('0b' + Q1_MASK.toString(2).padStart(36, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q2_MASK_INV = BigInt('0b' + Q2_MASK.toString(2).padStart(36, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q3_MASK_INV = BigInt('0b' + Q3_MASK.toString(2).padStart(36, '0').split('').map(x => x === '0' ? '1' : '0').join(''));
const Q4_MASK_INV = BigInt('0b' + Q4_MASK.toString(2).padStart(36, '0').split('').map(x => x === '0' ? '1' : '0').join(''));

const Q1_RIGHT_ROTATION_LOOKUP = new Map();
const Q2_RIGHT_ROTATION_LOOKUP = new Map();
const Q3_RIGHT_ROTATION_LOOKUP = new Map();
const Q4_RIGHT_ROTATION_LOOKUP = new Map();
const Q1_LEFT_ROTATION_LOOKUP = new Map();
const Q2_LEFT_ROTATION_LOOKUP = new Map();
const Q3_LEFT_ROTATION_LOOKUP = new Map();
const Q4_LEFT_ROTATION_LOOKUP = new Map();

const OLD_PIECES = { WHITE: 1, BLACK: 0, EMPTY: -1 };

// GAME = _GetGameObjFromGameArrayStr('1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1');
// GAME = _GetGameObjFromGameArrayStr('-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1,-1,-1,-1,0,1,0,-1,-1,-1,1,0,1');

console.clear();
console.log(`\nStarting Pentago AI v2: ${(new Date()).toLocaleString()}\n`);

function DrawGameFromInts(gameObj) {
	let gameArray = [];

	// Convert the Integer to Binary Strings and pad them with zeros until they are of length 36. E.g. 23 => 000000000000000000000000000000010111
	let whiteBinaryString = gameObj.WHITE.toString(2).padStart(36, '0');
	let blackBinaryString = gameObj.BLACK.toString(2).padStart(36, '0');

	for (let i = 0; i < 36; ++i) {
		if (whiteBinaryString[i] === '1') gameArray.push('W');
		else if (blackBinaryString[i] === '1') gameArray.push('B');
		else gameArray.push('-');
	}

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

	console.log('\n' + stringsToPrint.join(''));
}

function _GetGameObjFromGameArrayStr(gameStr) {
	let gameArr = gameStr.split(',').map(x => parseInt(x));

	let gameData = {
		BLACK: 0n, WHITE: 0n, REMAINING: 0
	};

	if (gameArr.length !== 36) throw new Exception('Game String is not of length 36. Length =' + gameArr.length);

	gameArr.forEach(piece => {
		gameData.WHITE = gameData.WHITE << 1n;
		gameData.BLACK = gameData.BLACK << 1n;

		if (piece === OLD_PIECES.WHITE) gameData.WHITE += 1n;
		else if (piece === OLD_PIECES.BLACK) gameData.BLACK += 1n;
		else gameData.REMAINING += 1;
	});

	return gameData;
}

function _GetGameArrayFromGameObj(gameObj) {
	let gameArr = [];
	let white = gameObj.WHITE;
	let black = gameObj.BLACK;

	for (let i = 0; i < 36; ++i) {
		if (white % 2n === 1n) gameArr.push(OLD_PIECES.WHITE);
		else if (black % 2n === 1n) gameArr.push(OLD_PIECES.BLACK);
		else gameArr.push(OLD_PIECES.EMPTY);

		white = white >> 1n;
		black = black >> 1n;
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

// gameObj = Game Object containing black and white Integers
// quadrant = 0,1,2,3 (TL, TR, BL, BR)
// direction = false,true (left, right)
function RotateGame(gameObj, quadrant, direction) {
	let maskToUse;
	let invMaskToUse;
	let lookupTableToUse;

	if (quadrant === 0) {
		maskToUse = Q1_MASK;
		invMaskToUse = Q1_MASK_INV;

		if (direction === true) lookupTableToUse = Q1_RIGHT_ROTATION_LOOKUP;
		else lookupTableToUse = Q1_LEFT_ROTATION_LOOKUP;
	} else if (quadrant === 1) {
		maskToUse = Q2_MASK;
		invMaskToUse = Q2_MASK_INV;

		if (direction === true) lookupTableToUse = Q2_RIGHT_ROTATION_LOOKUP;
		else lookupTableToUse = Q2_LEFT_ROTATION_LOOKUP;
	} else if (quadrant === 2) {
		maskToUse = Q3_MASK;
		invMaskToUse = Q3_MASK_INV;

		if (direction === true) lookupTableToUse = Q3_RIGHT_ROTATION_LOOKUP;
		else lookupTableToUse = Q3_LEFT_ROTATION_LOOKUP;
	} else if (quadrant === 3) {
		maskToUse = Q4_MASK;
		invMaskToUse = Q4_MASK_INV;

		if (direction === true) lookupTableToUse = Q4_RIGHT_ROTATION_LOOKUP;
		else lookupTableToUse = Q4_LEFT_ROTATION_LOOKUP;
	}

	// (1234567n & 8434456n) | (1234567n & 9878764n);
	(1234567 & 8434456) | (1234567 & 9878764);

	// (gameObj.WHITE & invMaskToUse) | (maskToUse & gameObj.WHITE);
	// (gameObj.BLACK & invMaskToUse) | (maskToUse & gameObj.BLACK);
	// gameObj.WHITE = (gameObj.WHITE & invMaskToUse) | lookupTableToUse.get(maskToUse & gameObj.WHITE);
	// gameObj.BLACK = (gameObj.BLACK & invMaskToUse) | lookupTableToUse.get(maskToUse & gameObj.BLACK);
}

function ResetGame() {
	GAME = {
		WHITE: 0n,
		BLACK: 0n,
		REMAINING: 36
	};
}

// Generate Rotation Lookup Tables
ResetGame();
for (let a = 0n; a <= 7n; a += 1n) {
	for (let b = 0n; b <= 7n; b += 1n) {
		for (let c = 0n; c <= 7n; c += 1n) {
			let valueQ4 = (a << 12n) | (b << 6n) | c;
			let valueQ3 = valueQ4 << 3n;
			let valueQ2 = valueQ4 << 18n;
			let valueQ1 = valueQ4 << 21n;

			GAME.WHITE = valueQ4;
			let gameArrRepresentation = _GetGameArrayFromGameObj(GAME);
			_RotateGameArrayBoard(gameArrRepresentation, 3, true);
			let rightRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 3, false);
			_RotateGameArrayBoard(gameArrRepresentation, 3, false);
			let leftRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 3, true);

			Q4_RIGHT_ROTATION_LOOKUP.set(valueQ4, rightRotationValue);
			Q4_LEFT_ROTATION_LOOKUP.set(valueQ4, leftRotationValue);



			GAME.WHITE = valueQ3;
			gameArrRepresentation = _GetGameArrayFromGameObj(GAME);
			_RotateGameArrayBoard(gameArrRepresentation, 2, true);
			rightRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 2, false);
			_RotateGameArrayBoard(gameArrRepresentation, 2, false);
			leftRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 2, true);

			Q3_RIGHT_ROTATION_LOOKUP.set(valueQ3, rightRotationValue);
			Q3_LEFT_ROTATION_LOOKUP.set(valueQ3, leftRotationValue);


			GAME.WHITE = valueQ2;
			gameArrRepresentation = _GetGameArrayFromGameObj(GAME);
			_RotateGameArrayBoard(gameArrRepresentation, 1, true);
			rightRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 1, false);
			_RotateGameArrayBoard(gameArrRepresentation, 1, false);
			leftRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 1, true);

			Q2_RIGHT_ROTATION_LOOKUP.set(valueQ2, rightRotationValue);
			Q2_LEFT_ROTATION_LOOKUP.set(valueQ2, leftRotationValue);


			GAME.WHITE = valueQ1;
			gameArrRepresentation = _GetGameArrayFromGameObj(GAME);
			_RotateGameArrayBoard(gameArrRepresentation, 0, true);
			rightRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 0, false);
			_RotateGameArrayBoard(gameArrRepresentation, 0, false);
			leftRotationValue = _GetGameObjFromGameArrayStr(gameArrRepresentation.toString()).WHITE;
			_RotateGameArrayBoard(gameArrRepresentation, 0, true);

			Q1_RIGHT_ROTATION_LOOKUP.set(valueQ1, rightRotationValue);
			Q1_LEFT_ROTATION_LOOKUP.set(valueQ1, leftRotationValue);
		}
	}
}
ResetGame();

// ***** TESTS ***** function _GetGameObjFromGameArrayStr
GAME = _GetGameObjFromGameArrayStr('-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1');
// GAME = _GetGameObjFromGameArrayStr('1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1');
// GAME = _GetGameObjFromGameArrayStr('1,1,1,0,1,0,0,0,0,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,1,1,1,0,0,0,0,0,1,0,1');
// GAME = _GetGameObjFromGameArrayStr('-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1');
// ***** END TESTS *****

// ***** TESTS ***** function _GetGameArrayFromGameObj 
// let testGame1 = '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1';
// let testGame2 = '1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1';
// let testGame3 = '1,1,1,0,1,0,0,0,0,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,1,1,1,0,0,0,0,0,1,0,1';
// let testGame4 = '-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1';
// console.log(_GetGameArrayFromGameObj(_GetGameObjFromGameArrayStr(testGame1)).toString() === testGame1);
// console.log(_GetGameArrayFromGameObj(_GetGameObjFromGameArrayStr(testGame2)).toString() === testGame2);
// console.log(_GetGameArrayFromGameObj(_GetGameObjFromGameArrayStr(testGame3)).toString() === testGame3);
// console.log(_GetGameArrayFromGameObj(_GetGameObjFromGameArrayStr(testGame4)).toString() === testGame4);
// ***** END TESTS *****

console.log(GAME);
DrawGameFromInts(GAME);
let time = Date.now();

for (let i = 0; i < 10000000; ++i) {
	RotateGame(GAME, i%4, false);
}

time = Date.now() - time;

console.log('Time (ms):', time);
// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// RotateGame(GAME, 0, false);
// DrawGameFromInts(GAME);
