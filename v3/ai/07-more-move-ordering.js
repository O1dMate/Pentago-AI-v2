const { PrettyResult, RotateGame, DrawGame, Evaluate } = require('./aux-functions');

function GetDescription() {
	return {
		name: '07 - More Move Ordering',
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
let depthOneBestMoves = {};

let KILLER_MOVES = [];

function SearchAux(gameStr, searchDepth, currentTurn, pieces, eventCallback, completeCallback) {
	SEARCH_DEPTH = searchDepth;
	PIECES = pieces;

	let GamePieces = gameStr.split(',').map(x => parseInt(x));
	KILLER_MOVES = Array.from({ length: searchDepth + 1 }, () => new Map());

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
		if (depth === 5) {
			depthOneResults.slice(0, 5).forEach(move => {
				depthOneBestMoves[move.move] = true;
			});
		} else if (depth === 7) {
			depthOneResults.slice(0, 3).forEach(move => {
				depthOneBestMoves[move.move] = true;
			});
		} else if (depth === 9) {
			depthOneResults.slice(0, 1).forEach(move => {
				depthOneBestMoves[move.move] = true;
			});
		}

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

	if (!Array.isArray(listOfMoves)) {
		if (listOfMoves.winning) {
			// Make the winning move, get the score, undo the move, return results.
			game[listOfMoves.winning[0][0]] = currentTurn;
			RotateGame(game, listOfMoves.winning[0][1], listOfMoves.winning[0][2]);
			currentGameScore = Evaluate(game, player);
			RotateGame(game, listOfMoves.winning[0][1], !listOfMoves.winning[0][2]);
			game[listOfMoves.winning[0][0]] = PIECES.EMPTY;

			return currentGameScore
		} else {
			listOfMoves.other.sort((moveA, moveB) => {
				const isKillerA = KILLER_MOVES[depth].get(moveA[3]);
				const isKillerB = KILLER_MOVES[depth].get(moveB[3]);
				if (isKillerA === undefined && isKillerB === undefined) return 0;
				if (isKillerA === undefined) return 1;
				if (isKillerB === undefined) return -1;
		
				return isKillerB - isKillerA > 0 ? 1 : -1;
			});
			listOfMoves = [...listOfMoves.priority, ...listOfMoves.other];
		}
	}


	if (player === currentTurn) {
		let bestScore = Number.MIN_SAFE_INTEGER;

		// If we are at the first move, and we know that the move will lead to a loss, don't explore at the move at all.
		if (depth === originalDepth) {
			if (Object.keys(depthOneBestMoves).length > 0) {
				listOfMoves = listOfMoves.filter(move => depthOneBestMoves.hasOwnProperty(JSON.stringify(move)));
			}

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

let a = 0;

function GetEmptyIndices(game, currentTurn) {
	let winningMoves = [];
	let priorityMoves = [];
	let otherMoves = [];

	let tempScore = 0;

	// Check if opponent has 4 in a row
	tempScore = Evaluate(game, currentTurn);
	if (tempScore < -500000) {

		let bestNonWinMove = [];
		let bestNonWinScore = Number.MIN_SAFE_INTEGER;

		// Opponent will WIN next turn unless we can win right now!
		// Check all positions and see if we can WIN first. If not, the move we make is irrelevant.
		for (let i = 0; i < game.length; ++i) {
			if (game[i] === PIECES.EMPTY) {
				// Place the marble
				game[i] = currentTurn;

				for (let quadrant = 0; quadrant <= 3; ++quadrant) {
					RotateGame(game, quadrant, false); // Perform the Left Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, true); // Undo the Left Rotation

					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0]);
					else {
						if (tempScore > bestNonWinScore) bestNonWinMove = [i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0]
					}

					RotateGame(game, quadrant, true); // Perform the Right Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, false); // Undo the Right Rotation

					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1]);
					else {
						if (tempScore > bestNonWinScore) bestNonWinMove = [i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1]
					}
				}

				// Remove the marble
				game[i] = PIECES.EMPTY;
			}
		}

		// If we can WIN first, do it!
		if (winningMoves.length > 0) return { winning: [...winningMoves] };
		
		// Otherwise, the move we make is irrelevant, but may as well choose highest scoring move
		return [bestNonWinMove];
	}
	else if (tempScore < -500) {
		const requiredIndices = new Set();

		for (let i = 0; i < game.length; ++i) {
			if (game[i] === PIECES.EMPTY) {
				// Place the marble
				game[i] = currentTurn;

				// Determine if the marble has blocked the 4 in a row
				if (Evaluate(game, currentTurn) > -500) {
					// The 4 in a row was blocked
					requiredIndices.add(i);
				}

				// Remove the marble
				game[i] = PIECES.EMPTY;
			}
		}

		for (let i = 0; i < game.length; ++i) {
			if (game[i] === PIECES.EMPTY) {
				// Place the marble
				game[i] = currentTurn;

				for (let quadrant = 0; quadrant <= 3; ++quadrant) {
					RotateGame(game, quadrant, false); // Perform the Left Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, true); // Undo the Left Rotation

					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0]);
					else if (tempScore > -500 && requiredIndices.has(i)) priorityMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0, tempScore]);
					else otherMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0, tempScore]);

					RotateGame(game, quadrant, true); // Perform the Right Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, false); // Undo the Right Rotation

					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1]);
					else if (tempScore > -500 && requiredIndices.has(i)) priorityMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1, tempScore]);
					else otherMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1, tempScore]);
				}

				// Remove the marble
				game[i] = PIECES.EMPTY;
			}
		}

		// If there are moves that can block, only these should be explored, as any other move will lead to a loss.
		if (priorityMoves.length > 0) otherMoves = [];
	} else if (tempScore > 500) {
		console.log(tempScore);
	} else {
		for (let i = 0; i < game.length; ++i) {
			if (game[i] === PIECES.EMPTY) {
				// Place the marble
				game[i] = currentTurn;
	
				for (let quadrant = 0; quadrant <= 3; ++quadrant) {
					RotateGame(game, quadrant, false); // Perform the Left Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, true); // Undo the Left Rotation
	
					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0]);
					else if (tempScore > 500) priorityMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0, tempScore]);
					else if (tempScore < -500) continue; // This would mean the move gives out opponent 4 in a row on the start of their turn.
					else otherMoves.push([i, quadrant, false, (((i << 2) | (quadrant)) << 1) | 0, tempScore]);
					
					RotateGame(game, quadrant, true); // Perform the Right Rotation 
					tempScore = Evaluate(game, currentTurn);
					RotateGame(game, quadrant, false); // Undo the Right Rotation
	
					if (tempScore === Number.MAX_SAFE_INTEGER) winningMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1]);
					else if (tempScore > 500) priorityMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1, tempScore]);
					else if (tempScore < -500) continue; // This would mean the move gives out opponent 4 in a row on the start of their turn.
					else otherMoves.push([i, quadrant, true, (((i << 2) | (quadrant)) << 1) | 1, tempScore]);
				}
	
				// Remove the marble
				game[i] = PIECES.EMPTY;
			}
		}
	}

	if (priorityMoves.length > 0) {
		priorityMoves.sort((a, b) => {
			// Sort according to the 4th element (the score)
			return a[4] > b[4] ? -1 : 1;
		});
	} else if (otherMoves.length > 0) {
		otherMoves.sort((a, b) => {
			// Sort according to the 4th element (the score)
			return a[4] > b[4] ? -1 : 1;
		});
	}

	if (a < 0) ++a;
	else {
		DrawGame(game);
		console.log('Score:', Evaluate(game, currentTurn));
		console.log({ winningMoves });
		console.log({ priorityMoves });
		console.log({ otherMoves });
		process.exit(0);
	}

	// If there are winning moves possible, only return those.
	if (winningMoves.length > 0) return { winning: [...winningMoves] };

	// Otherwise, return the remaining moves
	return { priority: [...priorityMoves], other: [...otherMoves] };
}

module.exports = { SearchAux, GetEmptyIndices, GetDescription };