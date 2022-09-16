const { PrettyResult, RotateGame, Evaluate } = require('./aux-functions');

let SEARCH_DEPTH;
let PIECES;

let originalDepth = 1;
let bestIndex = -1;
let searchCalls = 0n;
let iterativeDeepeningResults = {};

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

		depthTime = Date.now();
		result = Search(GamePieces, depth, currentTurn, currentTurn, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
		depthTime = Date.now() - depthTime;

		depthOneResults.sort((a, b) => a.score < b.score ? 1 : -1);

		let numberFormatter = new Intl.NumberFormat('en-AU');
		let searchCallsStr = numberFormatter.format(searchCalls.toString());
		depthTime = numberFormatter.format(depthTime.toString());

		if (result === Number.MIN_SAFE_INTEGER) {
			completeCallback({}, `Depth (${depth}), AI will LOSE:`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
			break;
		}

		if (result === Number.MAX_SAFE_INTEGER) {
			completeCallback({}, `Depth (${depth}), Winning Move:`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
			break;
		}

		eventCallback(`Depth (${depth}), Score (${result})`, PrettyResult(bestIndex), `Calls (${searchCallsStr})`, `msTime (${depthTime})`);
		// eventCallback(`Moves that don't end in a loss: ${depthOneResults.filter(move => move.score !== Number.MIN_SAFE_INTEGER).length}`)
		// depthOneResults.forEach(move => eventCallback(move));
		
		// Iterative Deepening
		let maxScoreForSearch = depthOneResults[0].score;
		let movesThatYieldMaxScore = depthOneResults.filter(move => move.score === maxScoreForSearch);
		iterativeDeepeningResults = {};
		movesThatYieldMaxScore.forEach(move => {
			let arrayMove = JSON.parse(move.move);
			
			// Calculate the MoveID and store the move result to be used later in the move list function.
			iterativeDeepeningResults[(1000*arrayMove[0]) + (arrayMove[1]) + (arrayMove[2] ? 4 : 0)] = true;
		});
		// movesThatYieldMaxScore.forEach(move => eventCallback(move));
		
		// Store all the initial moves that will lead to a loss. These moves will not be played.
		depthOneResults.forEach(move => {
			if (move.score === Number.MIN_SAFE_INTEGER) depthOneMovesToAvoid[move.move] = true;
		});
		
		depth++;
		depthOneResults = [];

		if (depth > GamePieces.filter(x => x === PIECES.EMPTY).length) break;
	}

	return bestIndex;
}

let depthOneResults = [];
let depthOneMovesToAvoid = {};

function Search(game, depth, player, currentTurn, alpha, beta) {
	searchCalls += 1n;

	let currentGameScore = Evaluate(game, player);

	if (depth <= 0) return currentGameScore;
	if (currentGameScore === Number.MAX_SAFE_INTEGER || currentGameScore === Number.MIN_SAFE_INTEGER) return currentGameScore;

	let listOfMoves = GetEmptyIndices(game, currentTurn);

	if (listOfMoves.length === 0) return currentGameScore;

	let nextTurn = currentTurn === PIECES.BLACK ? PIECES.WHITE : PIECES.BLACK;

	if (player === currentTurn) {
		let bestScore = Number.MIN_SAFE_INTEGER;

		// If we are at the first move, and we know that the move will lead to a loss, don't explore at the move at all.
		if (depth === originalDepth) {
			// Remove all the moves that we know will lead to a loss.
			listOfMoves = listOfMoves.filter(move => !depthOneMovesToAvoid.hasOwnProperty(JSON.stringify(move)));
		}

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

			// Only do Alpha-Beta after depth 2
			if (originalDepth > 2) {
				if (bestScore >= beta) break;
				alpha = Math.max(alpha, bestScore);
			}
		}

		return bestScore;
	} else {
		let bestScore = Number.MAX_SAFE_INTEGER;

		for (let i = 0; i < listOfMoves.length; ++i) {
			// Modify the Game Board with the move
			game[listOfMoves[i][0]] = currentTurn;
			RotateGame(game, listOfMoves[i][1], listOfMoves[i][2]);

			let evaluationOfMove = Search(game, depth - 1, player, nextTurn, alpha, beta);

			// Undo the move from Game Board
			RotateGame(game, listOfMoves[i][1], !listOfMoves[i][2]);
			game[listOfMoves[i][0]] = PIECES.EMPTY;

			bestScore = Math.min(bestScore, evaluationOfMove); // Min here because we assume opponent chooses best possible move

			// Only do Alpha-Beta after depth 2
			if (originalDepth > 2) {
				if (bestScore <= alpha) break;
				beta = Math.min(beta, bestScore);
			}
		}

		return bestScore;
	}
}

function GetEmptyIndices(game, targetColor) {
	let validMoves = [];
	let iterativeDeepening = [];

	let evalScore = 0;

	let scoreLookup = new Map();
	let moveId = 0;

	for (let i = 0; i < game.length; ++i) {
		if (game[i] !== PIECES.EMPTY) continue;

		game[i] = targetColor;

		for (let r = 0; r < 8; ++r) {
			moveId = (1000 * i) +  r;
			
			if (iterativeDeepeningResults.hasOwnProperty(moveId)) {
				iterativeDeepening.push([i, r % 4, (r > 3)]);
				delete iterativeDeepeningResults[moveId];
			}
			else {
				RotateGame(game, r % 4, (r > 3));
				evalScore = Evaluate(game, targetColor);
				RotateGame(game, r % 4, !(r > 3));
				
				// Only search moves that result in a better position after the move.
				if (evalScore > (Number.MIN_SAFE_INTEGER + 2_000_000)) {
					scoreLookup.set(moveId, evalScore);
					validMoves.push([i, r%4, (r > 3)]);
				}
			}

		}

		game[i] = PIECES.EMPTY;
	}

	validMoves.sort((a,b) => {
		let scoreA = scoreLookup.get((1000 * a[0]) + a[1] + (a[2] ? 4 : 0));
		let scoreB = scoreLookup.get((1000 * b[0]) + b[1] + (b[2] ? 4 : 0));

		return scoreA > scoreB ? -1 : 1;
	});

	validMoves = [...iterativeDeepening, ...validMoves];

	// Only return the top 75%. 
	return validMoves.slice(0, Math.ceil(validMoves.length*0.75));
}

module.exports = SearchAux;