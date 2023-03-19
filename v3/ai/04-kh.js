const { PrettyResult, RotateGame, Evaluate } = require('./aux-functions');

function GetDescription() {
	return {
		name: '04 - Killer Heuristics',
		des: '',
	};
}

let SEARCH_DEPTH;
let PIECES;

let originalDepth = 1;
let bestIndex = -1;
let searchCalls = 0n;

let depthOneResults = [];
let depthOneMovesToAvoid = {};

let KILLER_MOVES =[];

function SearchAux(gameStr, searchDepth, currentTurn, pieces, eventCallback, completeCallback) {
	SEARCH_DEPTH = searchDepth;
	PIECES = pieces;

	let GamePieces = gameStr.split(',').map(x => parseInt(x));
	KILLER_MOVES = Array.from({ length: searchDepth+1 }, () => new Map());

	searchCalls = 0n;
	let depth = 1;
	let depthTime = 0;

	while (depth <= SEARCH_DEPTH) {
		searchCalls = 0n;
		originalDepth = depth;

		// Perform the actual Search
		depthTime = Date.now();
		result = Search(GamePieces, depth, currentTurn, currentTurn, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
		depthTime = Date.now() - depthTime;

		// Store all the initial moves that will lead to a loss. These moves will not be played.
		depthOneResults.sort((a, b) => a.score < b.score ? 1 : -1);
		depthOneResults.forEach(move => {
			if (move.score === Number.MIN_SAFE_INTEGER) depthOneMovesToAvoid[move.move] = true;
		});

		let numberFormatter = new Intl.NumberFormat('en-AU');
		let searchCallsStr = numberFormatter.format(searchCalls.toString());
		depthTime = numberFormatter.format(depthTime.toString());

		const currentDepthResults = {
			depth,
			result,
			bestIndex: [...PrettyResult(bestIndex)],
			calls: searchCallsStr,
			msTime: depthTime,
		};

		// console.log(depth, KILLER_MOVES);

		// Check if the game is over (Win or Loss)
		if (result === Number.MIN_SAFE_INTEGER || result === Number.MAX_SAFE_INTEGER) {
			completeCallback(currentDepthResults);
			break;
		}

		eventCallback(currentDepthResults);

		depth++;
		depthOneResults = [];

		if (depth > GamePieces.filter(x => x === PIECES.EMPTY).length) break;
	}

	return bestIndex;
}

function Search(game, depth, player, currentTurn, alpha, beta) {
	searchCalls += 1n;

	let currentGameScore = Evaluate(game, player);

	if (depth <= 0) return currentGameScore;
	if (currentGameScore === Number.MAX_SAFE_INTEGER || currentGameScore === Number.MIN_SAFE_INTEGER) return currentGameScore;

	let listOfMoves = GetEmptyIndices(game, currentTurn);

	if (listOfMoves.length === 0) return currentGameScore;

	let nextTurn = currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK;
	
	// Move Ordering: Put the killer moves at the beginning of the move list
	// if (KILLER_MOVES[depth].size > 0) {
		// listOfMoves.sort((moveA, moveB) => {
		// 	const isKillerA = KILLER_MOVES[depth].get(moveA[3]);
		// 	const isKillerB = KILLER_MOVES[depth].get(moveB[3]);
		// 	return isKillerB - isKillerA > 0 ? 1 : -1;
		// 	// const isKillerA = KILLER_MOVES[depth].has(moveA[3]);
		// 	// const isKillerB = KILLER_MOVES[depth].has(moveB[3]);
		// 	// return isKillerB - isKillerA;
		// });
	// }
	listOfMoves.sort((moveA, moveB) => {
		const isKillerA = KILLER_MOVES[depth].get(moveA[3]);
		const isKillerB = KILLER_MOVES[depth].get(moveB[3]);
		if (isKillerA === undefined && isKillerB === undefined) return 0;
		if (isKillerA === undefined) return 1;
		if (isKillerB === undefined) return -1;
		
		return isKillerB - isKillerA > 0 ? 1 : -1;
	});

	if (player === currentTurn) {
		let bestScore = Number.MIN_SAFE_INTEGER;

		// If we are at the first move, and we know that the move will lead to a loss, don't explore at the move at all.
		if (depth === originalDepth) {
			// Remove all the moves that we know will lead to a loss.
			listOfMoves = listOfMoves.filter(move => !depthOneMovesToAvoid.hasOwnProperty(JSON.stringify(move)));
		}

		// listOfMoves.sort((moveA, moveB) => {
		// 	const isKillerA = KILLER_MOVES[depth].get(moveA[3]);
		// 	const isKillerB = KILLER_MOVES[depth].get(moveB[3]);
		// 	if (isKillerA === undefined && isKillerB === undefined) return 0;
		// 	if (isKillerA === undefined) return 1;
		// 	if (isKillerB === undefined) return -1;
			
		// 	return isKillerB - isKillerA > 0 ? 1 : -1;
		// });

		for (let i = 0; i < listOfMoves.length; ++i) {
			// Modify the Game Board with the move
			game[listOfMoves[i][0]] = currentTurn;
			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);
			let evaluationOfMove = Search(game, depth - 1, player, nextTurn, alpha, beta);

			// Undo the move from Game Board
			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
			game[listOfMoves[i][0]] = PIECES.EMPTY;

			if (depth === originalDepth) {
				depthOneResults.push({
					move: JSON.stringify(listOfMoves[i]),
					score: evaluationOfMove
				});
			}

			if (depth === originalDepth && evaluationOfMove > bestScore) bestIndex = listOfMoves[i];
			bestScore = Math.max(bestScore, evaluationOfMove);

			if (bestScore >= beta) {
				// Save the killer move
				if (!KILLER_MOVES[depth].has(listOfMoves[i][3])) {
					KILLER_MOVES[depth].set(listOfMoves[i][3], bestScore);
				} else {
					if (bestScore > KILLER_MOVES[depth].get(listOfMoves[i][3])) {
						KILLER_MOVES[depth].set(listOfMoves[i][3], bestScore);
					}
				}
				break;
			}
			alpha = Math.max(alpha, bestScore);
		}

		return bestScore;
	} else {
		let bestScore = Number.MAX_SAFE_INTEGER;

		// listOfMoves.sort((moveA, moveB) => {
		// 	const isKillerA = KILLER_MOVES[depth].get(moveA[3]);
		// 	const isKillerB = KILLER_MOVES[depth].get(moveB[3]);
		// 	if (isKillerA === undefined && isKillerB === undefined) return 0;
		// 	if (isKillerA === undefined) return 1;
		// 	if (isKillerB === undefined) return -1;

		// 	return isKillerB - isKillerA > 0 ? 1 : -1;
		// });

		for (let i = 0; i < listOfMoves.length; ++i) {
			// Modify the Game Board with the move
			game[listOfMoves[i][0]] = currentTurn;
			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);

			let evaluationOfMove = Search(game, depth - 1, player, nextTurn, alpha, beta);

			// Undo the move from Game Board
			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
			game[listOfMoves[i][0]] = PIECES.EMPTY;

			bestScore = Math.min(bestScore, evaluationOfMove); // Min here because we assume opponent chooses best possible move

			if (bestScore <= alpha) {
				// Save the killer move
				if (!KILLER_MOVES[depth].has(listOfMoves[i][3])) {
					KILLER_MOVES[depth].set(listOfMoves[i][3], bestScore);
				} else {
					if (bestScore > KILLER_MOVES[depth].get(listOfMoves[i][3])) {
						KILLER_MOVES[depth].set(listOfMoves[i][3], bestScore);
					}
				}
				break;
			}
			beta = Math.min(beta, bestScore);
		}

		return bestScore;
	}
}

function GetEmptyIndices(game) {
	let emptyIndexList = [];

	for (let i = 0; i < game.length; ++i) {
		if (game[i] === PIECES.EMPTY) {
			emptyIndexList.push([i, 0, false, (((i << 2) | (0)) << 1) | 0]);
			emptyIndexList.push([i, 0, true, (((i << 2) | (0)) << 1) | 1]);
			emptyIndexList.push([i, 1, false, (((i << 2) | (1)) << 1) | 0]);
			emptyIndexList.push([i, 1, true, (((i << 2) | (1)) << 1) | 1]);
			emptyIndexList.push([i, 2, false, (((i << 2) | (2)) << 1) | 0]);
			emptyIndexList.push([i, 2, true, (((i << 2) | (2)) << 1) | 1]);
			emptyIndexList.push([i, 3, false, (((i << 2) | (3)) << 1) | 0]);
			emptyIndexList.push([i, 3, true, (((i << 2) | (3)) << 1) | 1]);
		}
	}

	return emptyIndexList;
}

module.exports = { SearchAux, GetEmptyIndices, GetDescription };