const standardAi = require('./ai-1-normal');
const alphaBetaAi = require('./ai-2-alpha-beta');
const depthOneResultsAi = require('./ai-3-depth-one-results');
const moveOrderingBestRotationAi = require('./ai-4-move-ordering-best-rotation');
const fullScoreMovesAi = require('./ai-5-move-ordering-full-score-moves');
const iterativeDeepeningAi = require('./ai-6-iterative-deepening');
const top75PercentAi = require('./ai-7-top-75-percent');
const top75PercentNoIterDeepAi = require('./ai-8-top-75-percent-no-iter-deep');
const top75PercentBetterIterDeepAi = require('./ai-9-top-75-percent-better-iter-deep');
const transpositionLookupAi = require('./ai-10-transposition-lookup');
const moveOrderingRowScoreAi = require('./ai-11-move-ordering-row-score');
const moveFilteringAi = require('./ai-12-move-filtering');

const PIECES = { EMPTY: 1, BLACK: 2, WHITE: 3 };

// ******************** UPDATABLE OPTIONS ********************
const CURRENT_TURN = PIECES.BLACK;

const SEARCH_DEPTH = 4;
// ******************** UPDATABLE OPTIONS ********************

// Track what piece is in location
let GamePieces = [];

function StartConfiguration() {
	GamePieces = [];

	// Default Game Board is empty
	for (let i = 0; i < 36; ++i) {
		GamePieces.push(PIECES.EMPTY);
	}

	// Check Transposition Table Using these. Clashing results occur here
	// GamePieces = "1,1,3,2,1,1,1,1,1,1,2,2,3,3,3,1,1,1,3,2,3,1,1,1,2,2,3,1,1,1,3,2,1,1,1,1".split(',').map(x => parseInt(x));
	// GamePieces = "3,1,1,1,2,1,3,3,1,1,2,1,3,2,3,2,1,1,3,2,3,1,1,1,2,2,3,1,1,1,3,2,1,1,1,1".split(',').map(x => parseInt(x));

	GamePieces = "1,3,1,3,1,1,1,3,3,1,2,1,1,1,1,1,1,2,1,1,1,1,3,1,1,2,1,1,2,1,1,1,1,1,1,1".split(',').map(x => parseInt(x));
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
	
	// console.log('\nmoveFilteringAi');
	// moveFilteringAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\nmoveOrderingRowScoreAi');
	// moveOrderingRowScoreAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\ntranspositionLookupAi');
	// transpositionLookupAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\ntop75PercentBetterIterDeepAi');
	// top75PercentBetterIterDeepAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\ntop75PercentNoIterDeepAi');
	// top75PercentNoIterDeepAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\ntop75PercentAi');
	// top75PercentAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\niterativeDeepeningAi');
	// iterativeDeepeningAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\nfullScoreMovesAi');
	// fullScoreMovesAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\nmoveOrderingBestRotationAi');
	// moveOrderingBestRotationAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\ndepthOneResultsAi');
	// depthOneResultsAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	console.log('\nalphaBetaAi');
	alphaBetaAi.SearchAux(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)
	// console.log('\nstandardAi');
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

console.clear();
StartConfiguration();
main();
