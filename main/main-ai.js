// const standardAi = require('./AI_Standard');
// const alphaBetaOnlyAi = require('./AI_Standard_Alpha_Beta');
// const abMoveOrderingAi = require('./AI_Standard_AB_Move_Ordering');
// const abMoveOrderingAckDefAi = require('./AI_Standard_AB_Move_OrderingAckDef');
// const abMoveOrderingAckDefFullAi = require('./AI_Standard_AB_Move_OrderingAckDefFull');
// const abMoIterativeDeepeningAi = require('./AI_Standard_AB_MO_Iterative_Deepening');
// const abMoIdTranspositionLookupAi = require('./AI_Standard_AB_MO_ID_Transposition_Lookup');

const PIECES = { EMPTY: 1, BLACK: 2, WHITE: 3 };
const OTHER_PLAYER_LOOKUP = { [PIECES.WHITE]: PIECES.BLACK, [PIECES.BLACK]: PIECES.WHITE };

// ******************** UPDATABLE OPTIONS ********************
const CURRENT_TURN = PIECES.WHITE;

const SEARCH_DEPTH = 3;
// ******************** UPDATABLE OPTIONS ********************

// Track what piece is in location
const GamePieces = [];

function StartConfiguration() {
	GamePieces = [];

	// Default Game Board is empty
	for (let i = 0; i < 36; ++i) {
		GamePieces.push(PIECES.EMPTY);
	}

	// let blackPieces = 3;
	// let whitePieces = 3;

	// while (blackPieces > 0) {
	// 	let i = Math.floor(Math.random() * GamePieces.length);

	// 	while (GamePieces[i] !== PIECES.EMPTY) {
	// 		i = Math.floor(Math.random() * GamePieces.length);
	// 	}

	// 	GamePieces[i] = PIECES.BLACK;
	// 	blackPieces--;
	// }

	// while (whitePieces > 0) {
	// 	let i = Math.floor(Math.random() * GamePieces.length);

	// 	while (GamePieces[i] !== PIECES.EMPTY) {
	// 		i = Math.floor(Math.random() * GamePieces.length);
	// 	}

	// 	GamePieces[i] = PIECES.WHITE;
	// 	whitePieces--;
	// }

	// GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,1,0,0,0,-1,0,1,1,1,1,0,1,-1,0,-1,0,1,-1,0,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// 2 in a row for each player on separate rows. 
	// GamePieces = '-1,1,1,-1,-1,-1,-1,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));
	
	// 3 in a row for each player on separate rows.
	// GamePieces = '-1,1,1,1,-1,-1,-1,0,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// BLACK is about to get 4 in a row with open ends through middle diagonal. WHITE must defend or lose.
	// GamePieces = '0,1,-1,-1,-1,-1,1,-1,-1,-1,0,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,1,-1,-1,-1,-1,0,1'.split(',').map(x => parseInt(x));

	// Good Example Game (Pretty sure this will end in a draw). Play as WHITE.
	GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,-1,0,0,0,-1,0,1,1,0,1,-1,1,-1,0,1,0,-1,-1,0,-1,1,-1,-1'.split(',').map(x => parseInt(x));
	// GamePieces = '1,0,1,0,0,-1,0,1,1,0,1,1,-1,1,0,0,1,0,-1,1,0,0,1,-1,0,0,1,1,0,-1,-1,0,1,1,-1,-1'.split(',').map(x => parseInt(x)); // Same game as above, with only 8 moves left. Should be a draw
	// GamePieces = '0,1,-1,0,0,-1,1,1,0,0,1,1,1,0,1,0,1,0,1,1,0,0,1,-1,0,0,1,1,0,-1,1,0,1,1,-1,-1'.split(',').map(x => parseInt(x)); // Same game as above, with only 6 moves left. Should be a draw

	// Example Game. If WHITE turn, win in 3. If BLACK turn, win in 1.
	// GamePieces = '-1,-1,-1,0,0,-1,0,1,1,0,1,1,0,1,0,-1,1,0,-1,1,0,0,1,-1,0,-1,1,1,0,-1,-1,0,1,1,-1,-1'.split(',').map(x => parseInt(x));

	// GamePieces = '1,0,1,0,0,0,0,1,1,0,1,1,1,0,0,1,1,0,0,1,1,-1,-1,0,1,-1,0,1,0,-1,-1,0,-1,0,1,1'.split(',').map(x => parseInt(x));
	// GamePieces = '1,0,-1,-1,-1,-1,0,-1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,0,-1,-1,-1,-1,0,1'.split(',').map(x => parseInt(x));

	// Random Game. Play as WHITE. WHITE will lose (>= depth 4).
	// GamePieces = '-1,0,0,1,1,1,-1,1,0,-1,1,0,-1,1,0,1,0,-1,-1,-1,1,-1,-1,-1,-1,0,0,-1,-1,-1,-1,0,-1,1,-1,-1'.split(',').map(x => parseInt(x));

	// Random Game. Play as WHITE
	// GamePieces = '-1,0,0,1,-1,1,-1,1,0,0,1,1,-1,1,0,-1,0,1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));

	// GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,1,0,0,0,-1,0,1,1,1,1,0,1,-1,0,-1,0,1,-1,0,-1,-1,-1,-1'.split(',').map(x => parseInt(x));
	/* AI as White
		Depth (1), Score (282) [ 17, 'Q2', 'Right' ] Calls (105) msTime (3)
		Depth (2), Score (-86) [ 12, 'Q1', 'Left' ] Calls (1521) msTime (19)
		AI Winning Move: [ 1, 'Q1', 'Left' ]
	*/
	/* AI as Black
		Depth (1), Score (9007199254740962) [ 12, 'Q1', 'Left' ] Calls (105) msTime (4)
		Depth (2), Score (-134) [ 3, 'Q3', 'Right' ] Calls (1103) msTime (17)
		Depth (3), Score (242) [ 34, 'Q4', 'Right' ] Calls (33204) msTime (74)
		Depth (4), Score (-192) [ 1, 'Q3', 'Right' ] Calls (114709) msTime (322)
	*/

	// GamePieces = '-1,1,1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,-1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));
	/* AI as White
	Depth (1), Score (100040) [ 4, 'Q3', 'Left' ] Calls (217) msTime (7)
	Depth (2), Score (24) [ 15, 'Q3', 'Left' ] Calls (1838) msTime (39)
	Depth (3), Winning Move: [ 4, 'Q3', 'Left' ] Calls (2546) msTime (28)
	*/
	/* AI as Black
	Depth (1), Score (9007199254740962) [ 12, 'Q1', 'Left' ] Calls (105) msTime (4)
	Depth (2), Score (-134) [ 3, 'Q3', 'Right' ] Calls (1103) msTime (17)
	Depth (3), Score (242) [ 34, 'Q4', 'Right' ] Calls (33204) msTime (74)
	Depth (4), Score (-192) [ 1, 'Q3', 'Right' ] Calls (114709) msTime (322)
	*/
	// GamePieces = '-1,1,1,1,-1,-1,-1,-1,-1,-1,1,-1,-1,-1,-1,0,-1,1,-1,-1,0,-1,-1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x));
	// GamePieces = '-1,-1,-1,1,-1,0,-1,-1,-1,-1,1,-1,1,1,1,0,-1,1,-1,-1,0,-1,-1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x)); // As Black should lose in 8 (maybe)
	// GamePieces = '1,-1,-1,1,0,0,1,-1,-1,-1,1,-1,1,-1,-1,0,-1,1,-1,-1,0,-1,-1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x)); // As White should win in 7 (maybe)
	// GamePieces = '-1,-1,-1,1,0,0,-1,-1,-1,-1,1,1,1,1,1,0,-1,1,-1,-1,0,-1,-1,1,-1,0,-1,-1,-1,1,0,-1,-1,-1,-1,-1'.split(',').map(x => parseInt(x)); // As Black, Loss is certain in 6 moves

	// Game from Dil & I. White to Move (WHITE will win at depth 5).
	// GamePieces = '-1,-1,0,0,-1,1,1,1,-1,0,0,1,1,-1,0,0,-1,-1,-1,0,-1,-1,-1,-1,-1,1,-1,1,0,-1,-1,-1,-1,-1,1,-1'.split(',').map(x => parseInt(x));
	// GamePieces = '0,-1,0,0,-1,1,-1,1,-1,0,0,1,-1,1,1,0,-1,1,-1,0,-1,-1,-1,-1,-1,1,-1,1,0,-1,-1,-1,-1,-1,1,-1'.split(',').map(x => parseInt(x));
	// GamePieces = '-1,-1,0,0,-1,1,1,1,-1,0,0,1,1,-1,0,0,-1,1,-1,0,-1,-1,-1,-1,-1,1,-1,1,0,-1,-1,-1,-1,-1,1,0'.split(',').map(x => parseInt(x));
	// GamePieces = '0,-1,0,0,-1,1,-1,1,-1,0,0,1,-1,1,1,0,-1,1,-1,0,1,-1,-1,-1,-1,1,-1,1,0,-1,-1,-1,-1,-1,1,0'.split(',').map(x => parseInt(x));


	// GamePieces = '-1,-1,-1,-1,1,0,0,1,1,0,1,1,-1,-1,0,0,0,-1,0,1,1,0,1,-1,1,-1,0,1,0,-1,-1,0,-1,1,-1,-1'.split(',').map(x => parseInt(x));
}

function main() {
	let freeSpaces = BigInt(GamePieces.filter(x => x === PIECES.EMPTY).length);
	let gameTreeSize = 8n * freeSpaces;
	console.log(`\nDepth (1), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	for (let i = 1n; i < BigInt(SEARCH_DEPTH); i+=1n) {
		gameTreeSize *= (freeSpaces-i)*8n;
		console.log(`Depth (${(i+1n).toString()}), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	}

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
}

StartConfiguration();
main();