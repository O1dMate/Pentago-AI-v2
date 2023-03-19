const { PrettyResult, RotateGame, Evaluate } = require('./aux-functions');

function GetDescription() {
	return {
		name: '01 - Normal Minimax w/o Optimizations',
		des: '',
	};
}

let SEARCH_DEPTH;
let PIECES;

let originalDepth = 1;
let bestIndex = -1;
let searchCalls = 0n;

function SearchAux(gameStr, searchDepth, currentTurn, pieces, eventCallback, completeCallback) {
	SEARCH_DEPTH = searchDepth;
	PIECES = pieces;

	let GamePieces = gameStr.split(',').map(x => parseInt(x));

	searchCalls = 0n;
	let depth = 1;
	let depthTime = 0;

	while (depth <= SEARCH_DEPTH) {
		searchCalls = 0n;
		originalDepth = depth;

		// Perform the actual Search
		depthTime = Date.now();
		result = Search(GamePieces, depth, currentTurn, currentTurn);
		depthTime = Date.now() - depthTime;

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

		// Check if the game is over (Win or Loss)
		if (result === Number.MIN_SAFE_INTEGER || result === Number.MAX_SAFE_INTEGER) {
			completeCallback(currentDepthResults);
			break;
		}

		eventCallback(currentDepthResults);
		depth++;

		if (depth > GamePieces.filter(x => x === PIECES.EMPTY).length) break;
	}

	return bestIndex;
}

function Search(game, depth, player, currentTurn) {
	searchCalls += 1n;

	let currentGameScore = Evaluate(game, player);

	if (depth <= 0) return currentGameScore;
	if (currentGameScore === Number.MAX_SAFE_INTEGER || currentGameScore === Number.MIN_SAFE_INTEGER) return currentGameScore;

	let listOfMoves = GetEmptyIndices(game, currentTurn);

	if (listOfMoves.length === 0) return currentGameScore;

	let nextTurn = currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK;

	if (player === currentTurn) {
		let bestScore = Number.MIN_SAFE_INTEGER;

		for (let i = 0; i < listOfMoves.length; ++i) {
			// Modify the Game Board with the move
			game[listOfMoves[i][0]] = currentTurn;
			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);
			let evaluationOfMove = Search(game, depth - 1, player, nextTurn);

			// Undo the move from Game Board
			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
			game[listOfMoves[i][0]] = PIECES.EMPTY;

			if (depth === originalDepth && evaluationOfMove > bestScore) bestIndex = listOfMoves[i];
			bestScore = Math.max(bestScore, evaluationOfMove);
		}

		return bestScore;
	} else {
		let bestScore = Number.MAX_SAFE_INTEGER;

		for (let i = 0; i < listOfMoves.length; ++i) {
			// Modify the Game Board with the move
			game[listOfMoves[i][0]] = currentTurn;
			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);

			let evaluationOfMove = Search(game, depth - 1, player, nextTurn);

			// Undo the move from Game Board
			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
			game[listOfMoves[i][0]] = PIECES.EMPTY;

			bestScore = Math.min(bestScore, evaluationOfMove); // Min here because we assume opponent chooses best possible move
		}

		return bestScore;
	}
}

function GetEmptyIndices(game) {
	let emptyIndexList = [];

	for (let i = 0; i < game.length; ++i) {
		if (game[i] === PIECES.EMPTY) {
			emptyIndexList.push([i, 0, false]);
			emptyIndexList.push([i, 0, true]);
			emptyIndexList.push([i, 1, false]);
			emptyIndexList.push([i, 1, true]);
			emptyIndexList.push([i, 2, false]);
			emptyIndexList.push([i, 2, true]);
			emptyIndexList.push([i, 3, false]);
			emptyIndexList.push([i, 3, true]);
		}
	}

	return emptyIndexList;
}

module.exports = { SearchAux, GetEmptyIndices, GetDescription };