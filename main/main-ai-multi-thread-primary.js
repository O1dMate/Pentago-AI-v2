const cluster = require('node:cluster');
// const numCPUs = require('node:os').cpus().length;
const numCPUs = 12;

const { RotateGame, PrettyResult } = require('./aux-functions');
// const standardAi = require('./ai-1-normal');
// const alphaBetaAi = require('./ai-2-alpha-beta');
const depthOneResultsAi = require('./ai-3-depth-one-results');
const path = require('node:path');
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

const SEARCH_DEPTH = 5;
const AI_TO_USE = depthOneResultsAi;
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
	// // const numberFormatter = new Intl.NumberFormat('en-AU');

	// // Store the search results from the workers
	// const SEARCH_RESULTS = new Map();
	// const SEARCH_DEPTH_COMPLETE = new Map();
	// const SEARCH_DEPTH_PRINTED_RESULTS = new Map();
	// for (let i = 1; i < SEARCH_DEPTH; ++i) { 
	// 	SEARCH_RESULTS.set(i+1, new Map());
	// 	SEARCH_DEPTH_COMPLETE.set(i+1, new Map());
	// }

	let listOfMovesToSearch;
	let numberOfInitialMovesToSearch;

	AI_TO_USE.SearchAux(GamePieces.toString(), 1, CURRENT_TURN, PIECES, () => { }, (resultObj) => {
		listOfMovesToSearch = resultObj.depthOneResults.map(x => x.move);
		numberOfInitialMovesToSearch = resultObj.depthOneResults.length;
	});

	let totalCalls = 0;

	// Store the search results from the workers
	const SEARCH_RESULTS = new Map();
	const SEARCH_DEPTH_COMPLETE = [{ size: 0 }, { size: 0 }];

	for (let currentDepth = 2; currentDepth <= SEARCH_DEPTH; ++currentDepth) {
		SEARCH_RESULTS.set(currentDepth, new Map());
		SEARCH_DEPTH_COMPLETE.push(new Map());
	}

	// Fork Workers
	for (let workerId = 1; workerId <= numCPUs; workerId++) {
		cluster.fork();

		cluster.workers[workerId].on('message', ({ msgType, msg }) => {
			if (msgType === 'log') {
				// console.log(++totalCalls, msg);
				return;
			} else if (msgType === 'getMove') {
				let responseMessage = null;

				// If there are more moves to process, send the next one to the Worker
				if (listOfMovesToSearch.length > 0) {
					responseMessage = listOfMovesToSearch[0];
					listOfMovesToSearch = listOfMovesToSearch.slice(1);
				}

				cluster.workers[workerId].send(responseMessage);
			} else if (msgType === 'moveResult') {
				let move = msg.move;
				let moveResult = -JSON.parse(msg.results).result;
				let moveDepth = JSON.parse(msg.results).depth + 1; // Adding one here because we already made the first move before starting the search.

				SEARCH_RESULTS.get(moveDepth).set(move, moveResult);

				if (msg.complete) SEARCH_DEPTH_COMPLETE[moveDepth].set(move, true);

				// console.log(moveDepth, move, moveResult);
				let sumOfPreviousDepthsCompleted = SEARCH_DEPTH_COMPLETE.slice(0,moveDepth).map(x => x.size).reduce((accum, cur) => accum+cur, 0);
				
				if (SEARCH_RESULTS.get(moveDepth).size + sumOfPreviousDepthsCompleted === numberOfInitialMovesToSearch) {
					console.log(moveDepth);
					console.log(SEARCH_RESULTS.get(2).size, SEARCH_RESULTS.get(3).size, SEARCH_RESULTS.get(4).size);
					console.log(SEARCH_DEPTH_COMPLETE.map(x => x.size));
				}

				// for (let currentDepth = 2; currentDepth <= SEARCH_DEPTH-1; ++currentDepth) {
				// 	SEARCH_RESULTS.set(currentDepth, new Map());
				// 	SEARCH_DEPTH_COMPLETE.set(currentDepth, new Map());
				// }
			}
		});
	}

	setTimeout(() => {
		console.log();
		console.log(SEARCH_RESULTS.get(2).size, SEARCH_RESULTS.get(3).size, SEARCH_RESULTS.get(4).size);
		console.log(SEARCH_DEPTH_COMPLETE.map(x => x.size));
	}, 5000);

	// console.log(listOfMovesToSearch);
	// console.log(numberOfInitialMovesToSearch);

	// let depthTwoComplete = 0;

	// for (const id in cluster.workers) {
	// 	cluster.workers[id].on('message', ({ msgType, msg }) => {
	// 		msg = JSON.parse(msg);

	// 		// Adding +1 to the depth because the multi thread search makes a move then starts the search.
	// 		let depth = msg.depth+1;
			
	// 		SEARCH_DEPTH_COMPLETE.get(depth).set(msg.move.toString(), msg);
	// 		// if (depth === 2) depthTwoComplete++;

	// 		if (msgType === 'complete') {
	// 			for (let i = depth+1; i < SEARCH_DEPTH+1; ++i) {
	// 				SEARCH_DEPTH_COMPLETE.get(i).set(msg.move.toString(), msg);
	// 			}
	// 		}
			
	// 		SEARCH_RESULTS.get(depth).set(msg.move.toString(), msg);
			
			
	// 		let condition1 = (totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size) === 0;
	// 		// let condition2 = SEARCH_RESULTS.get(depth).size === totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size;

	// 		// console.log(msgType, { depthTwoComplete }, depth, msg.move, msg.result);
	// 		// console.log(SEARCH_RESULTS.get(depth).size, totalListOfMovesToSearch, SEARCH_DEPTH_COMPLETE.get(depth).size, SEARCH_RESULTS.get(depth).size === totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size);
	// 		// console.log(condition1, condition2, !SEARCH_DEPTH_PRINTED_RESULTS.has(depth));
			
	// 		console.log(condition1, depth, { depthTwoComplete }, SEARCH_DEPTH_COMPLETE.get(2).size);
	// 		console.log(condition1, depth, { depthTwoComplete }, SEARCH_DEPTH_COMPLETE.get(3).size);

	// 		// if ((condition1 || condition2) && !SEARCH_DEPTH_PRINTED_RESULTS.has(depth)) {
	// 		if (condition1 && !SEARCH_DEPTH_PRINTED_RESULTS.has(depth)) {
	// 			SEARCH_DEPTH_PRINTED_RESULTS.set(depth, true);

	// 			let bestResult = [{ result: Number.MIN_SAFE_INTEGER }];
	// 			// let totalSearchCalls = 0n;
	// 			// let depthTime = 0;

	// 			// console.log(SEARCH_RESULTS.get(2).get('29,0,false'));

	// 			SEARCH_RESULTS.get(depth).forEach((moveResult) => {
	// 				// console.log(moveResult.move, moveResult.result);
	// 				// totalSearchCalls += BigInt(moveResult.searchCalls);
	// 				// depthTime += moveResult.depth;

	// 				if (moveResult.result > bestResult[0].result) bestResult = [{ result: moveResult.result, move: moveResult.move }];
	// 				else if (moveResult.result === bestResult[0].result) bestResult.push({ result: moveResult.result, move: moveResult.move });
	// 			});

	// 			console.log(`Depth: ${depth}`, bestResult);
	// 			// console.log(SEARCH_RESULTS.get(2));

	// 			// TODO: Actually get the best score, result and such from the map.
	// 			// console.log(`Depth (${depth}), Score (${msg.result})`, PrettyResult(msg.bestIndex), `Calls (${msg.searchCallsStr})`, `msTime (${msg.depthTime})`)
	// 		}
	// 	});
	// }

	// cluster.on('exit', (worker, code, signal) => {
	// 	// console.log(`Worker ${worker.id} Exited`);
	// 	console.log(2, SEARCH_RESULTS.get(2).size, SEARCH_DEPTH_COMPLETE.size);
	// 	// console.log({ depthTwoComplete });
	// 	console.log(3, SEARCH_RESULTS.get(3).size, SEARCH_DEPTH_COMPLETE.size);
	// });

	// let freeSpaces = BigInt(GamePieces.filter(x => x === PIECES.EMPTY).length);
	// let gameTreeSize = 8n * freeSpaces;
	// console.log(`\nEmpty (${freeSpaces})`);
	// console.log(`Depth (1), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	// for (let i = 1n; i < BigInt(SEARCH_DEPTH); i += 1n) {
	// 	gameTreeSize *= (freeSpaces - i) * 8n;
	// 	console.log(`Depth (${(i + 1n).toString()}), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
	// }
}

// Setup the initial board configuration
StartConfiguration();

cluster.setupPrimary({
	exec: path.join(__dirname, 'main-ai-multi-thread-worker.js'),
	args: [JSON.stringify({ PIECES, CURRENT_TURN, SEARCH_DEPTH, GamePieces })],
	silent: true,
});

main();