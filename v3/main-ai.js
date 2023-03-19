
// const AI_TO_TEST_1 = require('./ai/01-normal-minimax');
// const AI_TO_TEST_2 = require('./ai/02-alpha-beta');
// const AI_TO_TEST_3 = require('./ai/03-depth-one-pruning');
// const AI_TO_TEST_4 = require('./ai/04-kh');
const AI_TO_TEST_5 = require('./ai/05-move-ordering');
const AI_TO_TEST_6 = require('./ai/06-iterative-deepening');
const AI_TO_TEST_7 = require('./ai/07-more-move-ordering');

const PIECES = { EMPTY: 0, BLACK: 1, WHITE: 2 };

// ******************** UPDATABLE OPTIONS ********************
const CURRENT_TURN = PIECES.WHITE;

const SEARCH_DEPTH = 5;
// ******************** UPDATABLE OPTIONS ********************

// Track what piece is in location
let GamePieces = [];

function StartConfiguration() {
	GamePieces = [];

	// Default Game Board is empty
	for (let i = 0; i < 36; ++i) {
		GamePieces.push(PIECES.EMPTY);
	}

	// Win in 3
	// GamePieces = "2,1,0,0,0,0,1,0,0,0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,2,1".split(',').map(x => parseInt(x));
	// GamePieces = "0,1,0,1,1,0,0,1,1,0,2,0,0,0,0,0,0,2,0,0,0,0,1,0,0,2,0,0,2,2,0,0,0,0,0,0".split(',').map(x => parseInt(x));
	// GamePieces = "0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,1,2,0,0,0,1,2,1,0,0,0,0,2,1,0,0,0,0,0,2".split(',').map(x => parseInt(x));

	// Win in 5
	// GamePieces = "0,0,1,1,0,2,2,2,0,1,1,2,2,0,1,1,0,0,0,1,0,0,0,0,0,2,0,2,1,0,0,0,0,0,2,0".split(',').map(x => parseInt(x));
	// GamePieces = "2,2,1,0,0,0,2,0,0,2,0,0,1,0,1,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1".split(',').map(x => parseInt(x));
	// GamePieces = "0,0,1,2,0,0,0,1,2,0,2,2,1,1,1,0,0,0,1,2,1,0,0,0,2,2,1,0,0,0,1,2,0,0,0,0".split(',').map(x => parseInt(x));


	// Lose in 4 (black)
	// GamePieces = "1,2,2,0,0,0,0,0,2,2,0,0,1,0,1,2,0,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1".split(',').map(x => parseInt(x));
	// GamePieces = "0,0,1,2,0,0,0,1,2,0,2,2,1,1,1,0,0,0,1,1,0,0,0,0,2,2,2,0,2,0,1,2,1,0,0,0".split(',').map(x => parseInt(x));

	// Win 3
	// GamePieces = "2,2,1,0,0,0,2,0,0,2,0,0,1,0,1,2,0,0,0,0,1,0,2,0,0,0,0,0,0,1,0,0,0,0,0,1".split(',').map(x => parseInt(x));


	// Win in 1
	// GamePieces = "2,2,1,0,0,0,2,0,0,2,0,0,1,0,1,2,0,0,0,0,1,2,1,1,0,0,0,2,0,0,0,0,0,0,0,0".split(',').map(x => parseInt(x));
	// GamePieces = "2,2,1,1,0,0,2,0,1,2,0,0,1,0,0,2,0,0,0,0,1,2,1,1,0,0,0,2,0,0,0,0,0,0,0,0".split(',').map(x => parseInt(x));

	// Win in 7
	// GamePieces = "0,0,0,2,0,1,1,1,0,2,2,1,0,0,0,2,0,0,0,2,0,0,0,0,0,1,0,0,2,0,0,0,0,0,1,0".split(',').map(x => parseInt(x));

	// GamePieces = "0,0,0,1,0,2,2,2,0,1,1,2,0,0,0,1,0,0,0,1,0,0,1,0,0,2,0,0,1,2,0,0,0,0,0,0".split(',').map(x => parseInt(x));


	// GamePieces = "0,1,0,1,0,0,0,1,1,0,2,0,0,0,0,0,0,2,0,0,0,0,1,0,0,2,0,0,2,0,0,0,0,0,0,0".split(',').map(x => parseInt(x));


	// GamePieces = "0,0,0,1,0,2,2,2,0,1,1,2,0,0,0,1,0,0,0,1,0,0,1,0,0,2,0,0,1,2,0,0,0,0,0,0".split(',').map(x => parseInt(x));
	// GamePieces = "0,0,1,2,0,0,0,0,0,0,2,2,1,1,1,0,0,0,1,2,1,0,0,0,2,2,1,0,0,0,1,2,0,0,0,0".split(',').map(x => parseInt(x));


	// More Ordering Tests - White must block
	// GamePieces = "1,2,0,0,0,0,2,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,1,2".split(',').map(x => parseInt(x));
	
	// More Ordering Tests - White must make 4 in a row
	GamePieces = "0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0,0,0,2,1,0,0,0,0,2,1,0,0,0,0,0,0,0,0".split(',').map(x => parseInt(x));
	
}

function main() {
	let freeSpaces = BigInt(GamePieces.filter(x => x === PIECES.EMPTY).length);
	let gameTreeSize = 8n * freeSpaces;
	console.log(`\nEmpty (${freeSpaces})`);
	console.log(`Depth (1), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	for (let i = 1n; i < BigInt(SEARCH_DEPTH); i+=1n) {
		gameTreeSize *= (freeSpaces-i)*8n;
		console.log(`Depth (${(i+1n).toString()}), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	}

	const listToTest = [
		AI_TO_TEST_7,
		AI_TO_TEST_6,
		AI_TO_TEST_5,
		// AI_TO_TEST_4,
		// AI_TO_TEST_3,
		// AI_TO_TEST_2,
		// AI_TO_TEST_1,
	];

	listToTest.forEach(ai => {
		console.log('\n', ai.GetDescription(), '\n');
		ai.SearchAux(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, EventCallback, CompleteCallback);
		console.log('');
	});

}

function EventCallback({ depth, result, bestIndex, calls, msTime }) {
	console.log(`Depth (${depth}), Score (${result})`, bestIndex, `Calls (${calls})`, `msTime (${msTime})`);
}

function CompleteCallback({ depth, result, bestIndex, calls, msTime }) {
	if (result === Number.MAX_SAFE_INTEGER) {
		console.log(`Depth (${depth}) WIN!`, bestIndex, `Calls (${calls})`, `msTime (${msTime})`);
	} else if (result === Number.MIN_SAFE_INTEGER) {
		console.log(`Depth (${depth}) LOSS!`, bestIndex, `Calls (${calls})`, `msTime (${msTime})`);
	} else {
		console.log('Unsure');
	}
}

console.clear();
StartConfiguration();
main();
