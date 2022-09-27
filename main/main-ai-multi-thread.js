const cluster = require('node:cluster');
const numCPUs = require('node:os').cpus().length;
// const numCPUs = 2;

const { RotateGame } = require('./aux-functions');
// const standardAi = require('./ai-1-normal');
const alphaBetaAi = require('./ai-2-alpha-beta');
// const depthOneResultsAi = require('./ai-3-depth-one-results');
// const moveOrderingBestRotationAi = require('./ai-4-move-ordering-best-rotation');
// const fullScoreMovesAi = require('./ai-5-move-ordering-full-score-moves');
// const iterativeDeepeningAi = require('./ai-6-iterative-deepening');
// const top75PercentAi = require('./ai-7-top-75-percent');
// const top75PercentNoIterDeepAi = require('./ai-8-top-75-percent-no-iter-deep');
// const top75PercentBetterIterDeepAi = require('./ai-9-top-75-percent-better-iter-deep');
// const transpositionLookupAi = require('./ai-10-transposition-lookup');
// const moveOrderingRowScoreAi = require('./ai-11-move-ordering-row-score');
// const moveFilteringAi = require('./ai-12-move-filtering');

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
	StartConfiguration();

	// Fork workers.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	for (const id in cluster.workers) {
		cluster.workers[id].on('message', (...msg) => {
			console.log(...msg);
		});
	}

	cluster.on('exit', (worker, code, signal) => {
		// console.log(`Worker ${worker.process.pid} Exited`);
	});

	// console.log('\nalphaBetaAi');
	// alphaBetaAi(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES, PrintEvtCallback, CompleteEvtCallback)

	// console.log('');
}

function workerThreadMain() {
	StartConfiguration();

	if (cluster.worker.id === 1) {
		let freeSpaces = BigInt(GamePieces.filter(x => x === PIECES.EMPTY).length);
		let gameTreeSize = 8n * freeSpaces;
		console.log(`\nEmpty (${freeSpaces})`);
		console.log(`Depth (1), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
		for (let i = 1n; i < BigInt(SEARCH_DEPTH); i += 1n) {
			gameTreeSize *= (freeSpaces - i) * 8n;
			console.log(`Depth (${(i + 1n).toString()}), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
		}
	}

	alphaBetaAi.SearchAux(GamePieces.toString(), 0, 0, PIECES, null, null)
	let totalListOfMovesToSearch = alphaBetaAi.GetEmptyIndices(GamePieces);

	let movesForWorkerToSearch = [];
	let i = cluster.worker.id - 1;

	while(i < totalListOfMovesToSearch.length) {
		movesForWorkerToSearch.push(totalListOfMovesToSearch[i]);
		i += numCPUs;
	}

	if (cluster.worker.id === 1) {
		console.log('Total Moves:', totalListOfMovesToSearch.length);
	}
	// console.log(movesForWorkerToSearch);
	// console.log(cluster.worker.id, movesForWorkerToSearch.length);

	let moveResults = new Map();

	movesForWorkerToSearch.forEach(move => {
		// console.log(move);

		// Modify the Game Board with the move
		GamePieces[move[0]] = CURRENT_TURN;
		RotateGame(GamePieces, move[1], move[2]);

		alphaBetaAi.SearchAux(GamePieces.toString(), SEARCH_DEPTH - 1, CURRENT_TURN === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK, PIECES, (...msg) => {
			let msgString = [...msg].map(x => x.toString()).join('|');
			// console.log(msgString);
			let score = msgString.match(/Score \(-?\d+\)/)[0].match(/-?\d+/)[0];

			moveResults.set(move.toString(), -parseInt(score));
		}, (_, ...msg) => {
			let msgString = [...msg].map(x => x.toString()).join('|');

			if (msgString.includes('Winning Move')) {
				moveResults.set(move.toString(), Number.MIN_SAFE_INTEGER);
			} else  {
				moveResults.set(move.toString(), Number.MAX_SAFE_INTEGER);
			}
		});

		// Undo the move from Game Board
		RotateGame(GamePieces, move[1], !move[2]);
		GamePieces[move[0]] = PIECES.EMPTY;
	});

	let bestMove = [];
	let bestScore = Number.MIN_SAFE_INTEGER;

	moveResults.forEach((moveScore, move) => {
		if (moveScore > bestScore) {
			bestScore = moveScore;
			bestMove = [move];
		} else if (moveScore === bestScore) {
			bestMove.push(move);
		}
	});

	// console.log(moveResults);
	console.log(bestMove, bestScore);
}

// function PrintEvtCallback(...msg) {
// 	console.log(...msg);
// }

// function CompleteEvtCallback(_obj, ...msg) {
// 	console.log(...msg);
// }


/* ****************************** */
if (cluster.isPrimary) {
	main();
} else {
	if (cluster.worker.id === 1) {
		workerThreadMain();
		process.exit(1);	
	}
	else {
		setTimeout(() => {
			workerThreadMain();
			process.exit(1);
		}, 100);
	}

}
/* ****************************** */
