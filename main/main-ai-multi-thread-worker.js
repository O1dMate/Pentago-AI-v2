const cluster = require('node:cluster');
// const numCPUs = require('node:os').cpus().length;
// const numCPUs = 1;

const { RotateGame } = require('./aux-functions');
// // const standardAi = require('./ai-1-normal');
// // const alphaBetaAi = require('./ai-2-alpha-beta');
const depthOneResultsAi = require('./ai-3-depth-one-results');
// // const moveOrderingBestRotationAi = require('./ai-4-move-ordering-best-rotation');
// // const fullScoreMovesAi = require('./ai-5-move-ordering-full-score-moves');
// // const iterativeDeepeningAi = require('./ai-6-iterative-deepening');
// // const top75PercentAi = require('./ai-7-top-75-percent');
// // const top75PercentNoIterDeepAi = require('./ai-8-top-75-percent-no-iter-deep');
// // const top75PercentBetterIterDeepAi = require('./ai-9-top-75-percent-better-iter-deep');
// // const transpositionLookupAi = require('./ai-10-transposition-lookup');
// // const moveOrderingRowScoreAi = require('./ai-11-move-ordering-row-score');
// // const moveFilteringAi = require('./ai-12-move-filtering');

let PIECES = null;
let CURRENT_TURN = null;
let SEARCH_DEPTH = null;

// Track what piece is in location
let GamePieces = null;

// ******************** UPDATABLE OPTIONS ********************
let AI_TO_USE = depthOneResultsAi;
// ******************** UPDATABLE OPTIONS ********************


// function StartConfiguration() {
// 	GamePieces = [];

// 	// Default Game Board is empty
// 	for (let i = 0; i < 36; ++i) {
// 		GamePieces.push(PIECES.EMPTY);
// 	}

// 	// Check Transposition Table Using these. Clashing results occur here
// 	// GamePieces = "1,1,3,2,1,1,1,1,1,1,2,2,3,3,3,1,1,1,3,2,3,1,1,1,2,2,3,1,1,1,3,2,1,1,1,1".split(',').map(x => parseInt(x));
// 	// GamePieces = "3,1,1,1,2,1,3,3,1,1,2,1,3,2,3,2,1,1,3,2,3,1,1,1,2,2,3,1,1,1,3,2,1,1,1,1".split(',').map(x => parseInt(x));

// 	GamePieces = "1,3,1,3,1,1,1,3,3,1,2,1,1,1,1,1,1,2,1,1,1,1,3,1,1,2,1,1,2,1,1,1,1,1,1,1".split(',').map(x => parseInt(x));
// }

// function main() {
// 	StartConfiguration();

// 	// const numberFormatter = new Intl.NumberFormat('en-AU');

// 	// Store the search results from the workers
// 	const SEARCH_RESULTS = new Map();
// 	const SEARCH_DEPTH_COMPLETE = new Map();
// 	const SEARCH_DEPTH_PRINTED_RESULTS = new Map();
// 	for (let i = 1; i < SEARCH_DEPTH; ++i) { 
// 		SEARCH_RESULTS.set(i+1, new Map());
// 		SEARCH_DEPTH_COMPLETE.set(i+1, new Map());
// 	}

// 	let totalListOfMovesToSearch;
// 	AI_TO_USE.SearchAux(GamePieces.toString(), 1, CURRENT_TURN, PIECES, () => { }, (resultObj) => { totalListOfMovesToSearch = resultObj.depthOneResults.length });

// 	// Fork workers.
// 	for (let i = 0; i < numCPUs; i++) {
// 		cluster.fork();
// 	}

// 	let depthTwoComplete = 0;

// 	for (const id in cluster.workers) {
// 		cluster.workers[id].on('message', ({ msgType, msg }) => {
// 			msg = JSON.parse(msg);

// 			// Adding +1 to the depth because the multi thread search makes a move then starts the search.
// 			let depth = msg.depth+1;
			
// 			SEARCH_DEPTH_COMPLETE.get(depth).set(msg.move.toString(), msg);
// 			// if (depth === 2) depthTwoComplete++;

// 			if (msgType === 'complete') {
// 				for (let i = depth+1; i < SEARCH_DEPTH+1; ++i) {
// 					SEARCH_DEPTH_COMPLETE.get(i).set(msg.move.toString(), msg);
// 				}
// 			}
			
// 			SEARCH_RESULTS.get(depth).set(msg.move.toString(), msg);
			
			
// 			let condition1 = (totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size) === 0;
// 			// let condition2 = SEARCH_RESULTS.get(depth).size === totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size;

// 			// console.log(msgType, { depthTwoComplete }, depth, msg.move, msg.result);
// 			// console.log(SEARCH_RESULTS.get(depth).size, totalListOfMovesToSearch, SEARCH_DEPTH_COMPLETE.get(depth).size, SEARCH_RESULTS.get(depth).size === totalListOfMovesToSearch - SEARCH_DEPTH_COMPLETE.get(depth).size);
// 			// console.log(condition1, condition2, !SEARCH_DEPTH_PRINTED_RESULTS.has(depth));
			
// 			console.log(condition1, depth, { depthTwoComplete }, SEARCH_DEPTH_COMPLETE.get(2).size);
// 			console.log(condition1, depth, { depthTwoComplete }, SEARCH_DEPTH_COMPLETE.get(3).size);

// 			// if ((condition1 || condition2) && !SEARCH_DEPTH_PRINTED_RESULTS.has(depth)) {
// 			if (condition1 && !SEARCH_DEPTH_PRINTED_RESULTS.has(depth)) {
// 				SEARCH_DEPTH_PRINTED_RESULTS.set(depth, true);

// 				let bestResult = [{ result: Number.MIN_SAFE_INTEGER }];
// 				// let totalSearchCalls = 0n;
// 				// let depthTime = 0;

// 				// console.log(SEARCH_RESULTS.get(2).get('29,0,false'));

// 				SEARCH_RESULTS.get(depth).forEach((moveResult) => {
// 					// console.log(moveResult.move, moveResult.result);
// 					// totalSearchCalls += BigInt(moveResult.searchCalls);
// 					// depthTime += moveResult.depth;

// 					if (moveResult.result > bestResult[0].result) bestResult = [{ result: moveResult.result, move: moveResult.move }];
// 					else if (moveResult.result === bestResult[0].result) bestResult.push({ result: moveResult.result, move: moveResult.move });
// 				});

// 				console.log(`Depth: ${depth}`, bestResult);
// 				// console.log(SEARCH_RESULTS.get(2));

// 				// TODO: Actually get the best score, result and such from the map.
// 				// console.log(`Depth (${depth}), Score (${msg.result})`, PrettyResult(msg.bestIndex), `Calls (${msg.searchCallsStr})`, `msTime (${msg.depthTime})`)
// 			}
// 		});
// 	}

// 	cluster.on('exit', (worker, code, signal) => {
// 		// console.log(`Worker ${worker.id} Exited`);
// 		console.log(2, SEARCH_RESULTS.get(2).size, SEARCH_DEPTH_COMPLETE.size);
// 		// console.log({ depthTwoComplete });
// 		console.log(3, SEARCH_RESULTS.get(3).size, SEARCH_DEPTH_COMPLETE.size);
// 	});

// 	let freeSpaces = BigInt(GamePieces.filter(x => x === PIECES.EMPTY).length);
// 	let gameTreeSize = 8n * freeSpaces;
// 	console.log(`\nEmpty (${freeSpaces})`);
// 	console.log(`Depth (1), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
// 	for (let i = 1n; i < BigInt(SEARCH_DEPTH); i += 1n) {
// 		gameTreeSize *= (freeSpaces - i) * 8n;
// 		console.log(`Depth (${(i + 1n).toString()}), Game Tree Size:`, new Intl.NumberFormat('en-AU').format(gameTreeSize.toString()));
// 	}
// }

// function workerThreadMain() {
// 	StartConfiguration();

// 	// let totalListOfMovesToSearch = AI_TO_USE.GetEmptyIndices(GamePieces);
// 	let totalListOfMovesToSearch;

// 	AI_TO_USE.SearchAux(GamePieces.toString(), 1, CURRENT_TURN, PIECES, () => { }, (resultObj) => { totalListOfMovesToSearch = resultObj.depthOneResults.map(x => JSON.parse(x.move))});

// 	let movesForWorkerToSearch = [];
// 	let i = cluster.worker.id - 1;

// 	while(i < totalListOfMovesToSearch.length) {
// 		movesForWorkerToSearch.push(totalListOfMovesToSearch[i]);
// 		i += numCPUs;
// 	}

// 	// console.log('movesForWorkerToSearch', movesForWorkerToSearch.length);
// 	// let calls = 0;

// 	movesForWorkerToSearch.forEach(move => {
// 		// Modify the Game Board with the move
// 		GamePieces[move[0]] = CURRENT_TURN;
// 		RotateGame(GamePieces, move[1], move[2]);

// 		AI_TO_USE.SearchAux(GamePieces.toString(), SEARCH_DEPTH - 1, CURRENT_TURN === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK, PIECES, (msg) => {
// 			cluster.worker.send({ msgType: 'update', msg: JSON.stringify({move, ...msg, result: -msg.result }) });
// 		}, (msg) => {
// 			cluster.worker.send({ msgType: 'complete', msg: JSON.stringify({move, ...msg, result: -msg.result }) });
// 			// console.log('calls', ++calls);
// 		});

// 		// Undo the move from Game Board
// 		RotateGame(GamePieces, move[1], !move[2]);
// 		GamePieces[move[0]] = PIECES.EMPTY;
// 	});

// }

// /* ****************************** */
// if (cluster.isPrimary) {
// 	main();
// } else {
// 	workerThreadMain();
// 	// process.exit(123);
// }
// /* ****************************** */

function GetNextMove() {
	return new Promise((res) => {
		// Wait from response from Primary, clean up the event listener, then resolve the Promise.
		cluster.worker.on('message', (moveToMake) => {
			cluster.worker._events = {};
			res(moveToMake);
		});

		// Ask the Primary node for the next move to make.
		process.send({ msgType: 'getMove' });
	});
}

async function main() {
	let gameValues = JSON.parse(process.argv[2]);
	PIECES = gameValues.PIECES;
	CURRENT_TURN = gameValues.CURRENT_TURN;
	SEARCH_DEPTH = gameValues.SEARCH_DEPTH - 1; // Subtract 1 because we make a move then perform the search.
	GamePieces = gameValues.GamePieces;

	let nextMove = await GetNextMove();
	
	// Continue processing moves until there are none left to process (Primary will return null)
	while (nextMove) {
		nextMove = JSON.parse(nextMove); // Move Format = [boardIndex, quadrant, rotationDir] = [25, 3, false] = [25, Q4, "Left"]

		// Modify the Game Board with the move, and update the current turn
		GamePieces[nextMove[0]] = CURRENT_TURN;
		RotateGame(GamePieces, nextMove[1], nextMove[2]);
		CURRENT_TURN = (CURRENT_TURN === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);

		AI_TO_USE.SearchAux(GamePieces.toString(), SEARCH_DEPTH, CURRENT_TURN, PIECES
		, (msg) => {
			process.send({ msgType: 'moveResult', msg: {
				complete: false,
				move: JSON.stringify(nextMove),
				results: JSON.stringify(msg),
			}});
		}, (msg) => {
			process.send({
				msgType: 'moveResult', msg: {
					complete: true,
					move: JSON.stringify(nextMove),
					results: JSON.stringify(msg),
				}
			});
		});

		// Undo the move from Game Board and update the current turn
		CURRENT_TURN = (CURRENT_TURN === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);
		RotateGame(GamePieces, nextMove[1], !nextMove[2]);
		GamePieces[nextMove[0]] = PIECES.EMPTY;

		process.send({ msgType: 'log', msg: `Worker ${cluster.worker.id}, [${nextMove}]` });
		nextMove = await GetNextMove();
	}

	// process.exit(1);
}

main();