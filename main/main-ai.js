const standardAi = require('./ai-1-normal');
const alphaBetaAi = require('./ai-2-alpha-beta');
const depthOneResultsAi = require('./ai-3-depth-one-results');
const moveOrderingBestRotationAi = require('./ai-4-move-ordering-best-rotation');
const fullScoreMovesAi = require('./ai-5-move-ordering-full-score-moves');

// const standardAi = require('./AI_Standard');
// const alphaBetaOnlyAi = require('./AI_Standard_Alpha_Beta');
// const abMoveOrderingAi = require('./AI_Standard_AB_Move_Ordering');
// const abMoveOrderingAckDefAi = require('./AI_Standard_AB_Move_OrderingAckDef');
// const abMoveOrderingAckDefFullAi = require('./AI_Standard_AB_Move_OrderingAckDefFull');
// const abMoIterativeDeepeningAi = require('./AI_Standard_AB_MO_Iterative_Deepening');
// const abMoIdTranspositionLookupAi = require('./AI_Standard_AB_MO_ID_Transposition_Lookup');

const PIECES = { EMPTY: 1, BLACK: 2, WHITE: 3 };

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

	// WHITE Win (depth 1) as White
	// GamePieces = '1,1,1,1,1,3,1,1,1,1,1,3,1,1,1,1,2,3,1,1,1,1,2,3,1,1,1,2,2,1,1,1,1,1,1,1'.split(',').map(x => parseInt(x));
	// GamePieces = '1,1,1,1,1,1,1,3,2,1,1,3,2,3,3,3,2,3,1,3,2,2,2,3,1,1,1,1,2,1,1,1,1,1,1,1'.split(',').map(x => parseInt(x));

	// WHITE Win (depth 3) as White
	// GamePieces = '1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,2,2,3,1,1,1,2,3,2,1,1,1,1,3,2,1,1,1,1,1,3'.split(',').map(x => parseInt(x));
	
	// Unsure () as Black
	// GamePieces = '1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,2,2,3,1,1,1,2,3,2,1,1,1,1,3,2,1,1,1,1,1,3'.split(',').map(x => parseInt(x));
	
	// GamePieces = '1,1,1,1,3,2,2,3,3,2,3,3,1,1,2,2,2,1,2,3,3,2,3,1,3,1,2,3,2,1,1,2,1,3,1,1'.split(',').map(x => parseInt(x));
	// GamePieces = '1,1,3,1,1,1,1,1,1,1,1,1,2,1,1,1,3,1,2,1,1,3,3,2,2,1,1,1,1,1,2,3,1,1,1,1'.split(',').map(x => parseInt(x));
	
	// Simple Test Positions as White
	// GamePieces = '1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1'.split(',').map(x => parseInt(x));
	// GamePieces = "1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,3,2,2,1,1,1,1,2,1,1,1,1,1,1,1,1,1".split(',').map(x => parseInt(x));
	// GamePieces = "1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,3,1,1,3,2,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1".split(',').map(x => parseInt(x));
	
	// WHITE Win (depth 5) as White
	// GamePieces = "3,3,2,1,1,1,3,1,1,3,1,1,2,1,2,3,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2".split(',').map(x => parseInt(x));

	GamePieces = "2,3,3,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1".split(',').map(x => parseInt(x));
	// GamePieces = "3,1,1,1,1,1,3,1,1,3,1,1,2,1,2,3,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2".split(',').map(x => parseInt(x));
	// GamePieces = "3,3,2,1,1,1,3,1,1,3,1,1,2,1,2,3,1,1,1,1,2,1,3,1,1,1,1,1,1,2,1,1,1,1,1,2".split(',').map(x => parseInt(x));
	// GamePieces = "3,3,2,1,1,1,3,1,1,3,1,1,2,2,2,3,1,1,1,1,2,2,1,1,1,1,1,2,1,1,1,1,1,3,3,1".split(',').map(x => parseInt(x));
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
	console.log('');
	
	
	fullScoreMovesAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	console.log('');
	moveOrderingBestRotationAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	console.log('');
	// depthOneResultsAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('');
	// alphaBetaAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('');
	// standardAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)

	// Transposition Table only seems useful in the early stages of the game. In the Endgame, the board isn't almost certain not symmetric so the Transposition table doesn't help much.
	// console.log('\nMinimax AI (α+β pruning + MO + ID + Transposition Lookup 10M)');
	// abMoIdTranspositionLookupAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);
	
	// console.log('\nMinimax AI (α+β pruning + Move Ordering (Ack,Def Full)');
	// abMoveOrderingAckDefFullAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);

	// console.log('\nMinimax AI (α+β pruning + Move Ordering (Ack,Def))');
	// abMoveOrderingAckDefAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);

	// console.log('\nMinimax AI (α+β pruning + Move Ordering)');
	// abMoveOrderingAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);

	// console.log('\nMinimax AI (α+β pruning + MO + Iterative Deepening)');
	// abMoIterativeDeepeningAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);
	
	// console.log('\nMinimax AI (α+β pruning)');
	// alphaBetaOnlyAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);

	// console.log(`\nStandard Minimax AI (no optimizations)`);
	// standardAi(GamePieces.toString(), SEARCH_DEPTH, TURN.AI_COLOR, PIECES);

	console.log('');
}

function PrintEvtCallback(...msg) {
	console.log(...msg);
}

function CompleteEvtCallback(_obj, ...msg) {
	console.log(...msg);
}

StartConfiguration();
main();