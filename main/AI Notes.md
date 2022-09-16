# AI Notes

All AIs use the optimizations of the previous AI (with the exception of AI 5).


## AI 1 (Normal)
 - Simplest and likely worst performing.
 - Traverses the game tree to the desired depth searching all moves.
 - No optimizations.


## AI 2 (Alpha Beta)
 - Alpha-Beta pruning now used to prune branches.
 - Should be much faster than AI 1 in almost every case.


## AI 3 (Depth One Results)
 - Looks at the results of the search to determine which moves will for sure lead to a loss. 
 - These moves are then excluded from lower depth searches.
 - Alpha-Beta pruning is not used for the first two searches (depth 1 & 2). This is because the Alpha-Beta can prune losing branches, resulting in moves falsely being reported as "not immediately losing" . This is not desirable for very low depth (< 3) as we want to find such moves that will lose and completely ignore them in lower depth searches.
 - Not applicable to all games. Most beneficial when the game is close and an incorrect move (or two) will immediately lead to a loss.


## AI 4 (Move Ordering - Best Rotation)
 - When generating a list of moves each board rotation (there are 8) is checked.
 - The resulting game score is calculated and stored after the rotation.
 - All moves are then sorted according to the rotation scores. E.g. if Q2R yields the best score, then all moves with that rotation are done first. Then all moves using the second best rotation.
 - Often drastically decreases the amount of total moves checked. However, this is required due to the extra time added by the 8 additional Evaluations per move.


## AI 5 (Move Ordering - Full Score Moves)
 - When generating a list of moves each move is made on the board and scored. 
 - The moves are then sorted according to the resulting score.
 - Same as above, often drastically decreases the amount of total moves checked. However, this even more so required due to the extra time added by the 0-288 additional Evaluations per move.
 - TODO: Currently it only checks moves that yield a higher score than the current position. This requires more testing as to whether this is a good idea.


## AI 6 (Iterative Deepening)
 - Stores the results of the previous depth search and checks the moves that yielded the highest score first.
 - E.g. if 204 was the highest score of the previous search, then all moves that lead to a score of 204 will be checked first in the following lower depth search.
 - This can be slower and faster depending on how good the previous depth search was. This is designed to be a good move approximation, but there is no guarantee.


## AI 7 (Top 75 Percent)
 - When generating moves only the best scoring 75% are used. The lowest scoring 25% of moves are discarded.
 - This can sometimes lead to incorrect results, as a "bad" move will end up leading to a good move later on. 
 - TODO: More testing on what sort of positions this is bad at.
 - TODO: More testing on what % value can be used for better speed & accuracy.
 - This is gives a significant speed improvement in certain cases. However, accuracy is still in question and requires further testing.


## AI 8 (Top 75 Percent & No Iterative Deepening)
 - Same as the AI 7, but with no Iterative Deepening in use.


