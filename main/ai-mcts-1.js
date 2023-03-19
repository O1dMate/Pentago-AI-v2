const { PrettyResult, RotateGame, Evaluate } = require('./aux-functions');
const { randomInt } = require('crypto');

let SEARCH_DEPTH;
let PIECES;

let originalDepth = 1;
let bestIndex = -1;
let searchCalls = 0n;

function SearchAux(gameStr, searchDepth, currentTurn, pieces, eventCallback, completeCallback) {
	SEARCH_DEPTH = searchDepth;
	PIECES = pieces;

	let GamePieces = gameStr.split(',').map(x => parseInt(x));
	let numberFormatter = new Intl.NumberFormat('en-AU');

	// searchCalls = 0n;
	// let depth = 1;
	let depthTime = 0;

	
	depthTime = Date.now();
	let listOfMoves = GetEmptyIndices(GamePieces);
	let resultList = [];

	for (let moveIndex = 0; moveIndex < listOfMoves.length; ++moveIndex) {
		const RATES = {
			'WHITE': 0,
			'BLACK': 0,
			'DRAW': 0,
		};

		// Modify the Game Board with the move
		GamePieces[listOfMoves[moveIndex][0]] = currentTurn;
		RotateGame(GamePieces, listOfMoves[moveIndex][1], listOfMoves[moveIndex][2]);
		
		for (let i = 0; i < 5000; ++i) {
			let result = _SimulateRandomPlayout(GamePieces, currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);
			if (result === PIECES.BLACK) RATES['BLACK']++;
			else if (result === PIECES.WHITE) RATES['WHITE']++;
			else RATES['DRAW']++;
		}
		RATES.move = listOfMoves[moveIndex];
		resultList.push(JSON.parse(JSON.stringify(RATES)));
		// console.log(RATES);

		// Undo the move from Game Board
		RotateGame(GamePieces, listOfMoves[moveIndex][1], !listOfMoves[moveIndex][2]);
		GamePieces[listOfMoves[moveIndex][0]] = PIECES.EMPTY;

	}
	
	resultList.sort((a,b) => a.WHITE > b.WHITE ? -1 : 1);
	console.log(resultList.slice(0,15));

	depthTime = Date.now() - depthTime;
	depthTime = numberFormatter.format(depthTime.toString());
	console.log(`msTime (${depthTime})`);

	// while (depth <= SEARCH_DEPTH) {
	// 	searchCalls = 0n;
	// 	originalDepth = depth;

	// 	depthTime = Date.now();
	// 	result = Search(GamePieces, depth, currentTurn, currentTurn);
	// 	depthTime = Date.now() - depthTime;

	// 	let numberFormatter = new Intl.NumberFormat('en-AU');
	// 	let searchCallsStr = numberFormatter.format(searchCalls.toString());
	// 	depthTime = numberFormatter.format(depthTime.toString());

	// 	if (result === Number.MIN_SAFE_INTEGER) {
	// 		completeCallback({}, `Depth (${depth}), AI will LOSE:`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
	// 		break;
	// 	}

	// 	if (result === Number.MAX_SAFE_INTEGER) {
	// 		completeCallback({}, `Depth (${depth}), Winning Move:`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
	// 		break;
	// 	}

	// 	eventCallback(`Depth (${depth}), Score (${result})`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
	// 	depth++;

	// 	if (depth > GamePieces.filter(x => x === PIECES.EMPTY).length) break;
	// }

	return bestIndex;
}

function _SimulateRandomPlayout(game, currentTurn) {
	const gameBoard = game.map(x => x);
	let movesLeft = gameBoard.reduce((accum, val) => val === PIECES.EMPTY ? accum + 1 : accum, 0);
	let currentGameScore = 0;
	let moveList;
	let selectedMove;

	// console.log({ game });
	// console.log({ gameBoard });
	// console.log({ currentTurn });
	// console.log({ movesLeft });

	while (movesLeft > 0) {
		// Get move list
		// moveList = GetEmptyIndices(gameBoard);
		
		// Select a random move to play
		// selectedMove = randomInt(0, moveList.length);
		// gameBoard[moveList[selectedMove][0]] = currentTurn;
		// RotateGame(gameBoard, moveList[selectedMove][1], moveList[selectedMove][2]);
		
		selectedMove = GetRandomMove(gameBoard, movesLeft);
		gameBoard[selectedMove[0]] = currentTurn;
		RotateGame(gameBoard, selectedMove[1], selectedMove[2]);

		movesLeft--;

		// Check the current game score
		currentGameScore = Evaluate(gameBoard, currentTurn);

		// If the game is over, return the winning player
		if (currentGameScore === Number.MAX_SAFE_INTEGER) {
			// If score is max score, the current player won.
			return currentTurn;
		} else if (currentGameScore === Number.MIN_SAFE_INTEGER) {
			// If score is min score, the other player won.
			return (currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);
		}

		// Update whose turn it is
		currentTurn = (currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);
	}

	// If the game is over, return the winning player
	if (currentGameScore === Number.MAX_SAFE_INTEGER) {
		// If score is max score, the current player won.
		return currentTurn;
	} else if (currentGameScore === Number.MIN_SAFE_INTEGER) {
		// If score is min score, the other player won.
		return (currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK);
	}

	return 0;
}

// function Search(game, depth, player, currentTurn) {
// 	searchCalls += 1n;

// 	let currentGameScore = Evaluate(game, player);

// 	if (depth <= 0) return currentGameScore;
// 	if (currentGameScore === Number.MAX_SAFE_INTEGER || currentGameScore === Number.MIN_SAFE_INTEGER) return currentGameScore;

// 	let listOfMoves = GetEmptyIndices(game, currentTurn);

// 	if (listOfMoves.length === 0) return currentGameScore;

// 	let nextTurn = currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK;

// 	if (player === currentTurn) {
// 		let bestScore = Number.MIN_SAFE_INTEGER;

// 		for (let i = 0; i < listOfMoves.length; ++i) {
// 			// Modify the Game Board with the move
// 			game[listOfMoves[i][0]] = currentTurn;
// 			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);
// 			let evaluationOfMove = Search(game, depth - 1, player, nextTurn);

// 			// Undo the move from Game Board
// 			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
// 			game[listOfMoves[i][0]] = PIECES.EMPTY;

// 			if (depth === originalDepth && evaluationOfMove > bestScore) bestIndex = listOfMoves[i];
// 			bestScore = Math.max(bestScore, evaluationOfMove);
// 		}

// 		return bestScore;
// 	} else {
// 		let bestScore = Number.MAX_SAFE_INTEGER;

// 		for (let i = 0; i < listOfMoves.length; ++i) {
// 			// Modify the Game Board with the move
// 			game[listOfMoves[i][0]] = currentTurn;
// 			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);

// 			let evaluationOfMove = Search(game, depth - 1, player, nextTurn);

// 			// Undo the move from Game Board
// 			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
// 			game[listOfMoves[i][0]] = PIECES.EMPTY;

// 			bestScore = Math.min(bestScore, evaluationOfMove); // Min here because we assume opponent chooses best possible move
// 		}

// 		return bestScore;
// 	}
// }

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

function GetRandomMove(game, movesLeft) {
	let randomIndex = randomInt(0, movesLeft);
	let emptyIndex = 0;

	for (let i = 0; i < game.length; ++i) {
		if (game[i] === PIECES.EMPTY) {
			if (emptyIndex === randomIndex) {
				// Select Rotation
				let randomRotation = randomInt(0,8);

				return [i, randomRotation%4, !(randomRotation%2)];
			}

			emptyIndex++;
		}
	}
}

module.exports = { SearchAux, GetEmptyIndices };