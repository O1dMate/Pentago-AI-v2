#![allow(non_snake_case)]

macro_rules! rotate_game_board_macro {
	($game: ident, $quadrant: expr, $direction: expr, $quadrant_int: ident, $center_value: ident) => {
		$quadrant_int = (QUADRANT_MASKS[$quadrant] & $game) >> QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[$quadrant];

		// Save the center value since the rotation won't affect it (but the shift operations will)
		$center_value = $quadrant_int & 3;

		// Remove the center value
		$quadrant_int = $quadrant_int >> 2;

		// Perform the rotation and add the center value back in
		if $direction {
			$quadrant_int = (((($quadrant_int >> 4) | ($quadrant_int << 12)) & 65535) << 2) | $center_value;
		} else {
			$quadrant_int = (((($quadrant_int << 4) | ($quadrant_int >> 12)) & 65535) << 2) | $center_value;
		}
		
		// Move the bits back to line up with were they were taken from.
		// Put the new quadrant bits into the game board.
		$game = ($game & QUADRANT_MASKS_INV[$quadrant]) | ($quadrant_int << QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[$quadrant]);
	}
}

macro_rules! check_for_black_win_macro {
	($game: ident, $returnVar: ident, $tempCounter: ident) => {
		$tempCounter = 0;
		$returnVar = false;

		while $tempCounter < 32 {
			if ($game & BLACK_WINNINGS_INTS[$tempCounter as usize]) == BLACK_WINNINGS_INTS[$tempCounter as usize] {
				$returnVar = true;
				break;
			}

			$tempCounter += 1;
		}
	}
}

// Import modules
mod aux_functions;
mod aux_functions_testing;

use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
	println!("");

	// let game_board: [i8; 36] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	let game_board: [i8; 36] = [1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1];
	// let game_board: [i8; 36] = [1,-1,1,-1,-1,-1,0,1,0,0,1,-1,1,0,1,1,0,-1,1,0,0,1,-1,-1,0,0,1,-1,1,-1,1,0,-1,-1,0,-1];

    let currentGame: u128 = aux_functions::ConvertGameArrayToGameInt(&game_board);
	let mut newGameAsInt = currentGame;

	// println!("{:?}", currentGame);
	// aux_functions::PrintGame(newGameAsInt);
	
	println!("White won: {}", aux_functions::CheckWhiteWin(newGameAsInt));
	println!("Black won: {}", aux_functions::CheckBlackWin(newGameAsInt));

	let mut i: u32 = 0;
	let mut complete = false;
	let total: u32 = 1000000;
	
	// Start Timing
	let mut timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
	
	let mut _tempCenter: u128 = 0;
	let mut _tempInt: u128 = 0;
	let mut _tempCounter: u32 = 0;
	let mut winResult = false;

	let mut counter: u128 = 1;

	while i < total {
		rotate_game_board_macro!(newGameAsInt, 0 as usize, true, _tempInt, _tempCenter);
		rotate_game_board_macro!(newGameAsInt, 1 as usize, true, _tempInt, _tempCenter);
		rotate_game_board_macro!(newGameAsInt, 2 as usize, true, _tempInt, _tempCenter);
		rotate_game_board_macro!(newGameAsInt, 3 as usize, true, _tempInt, _tempCenter);

		// aux_functions::CheckWhiteWin(newGameAsInt);
		// aux_functions::CheckBlackWin(newGameAsInt);
		check_for_black_win_macro!(newGameAsInt, winResult, _tempCounter);

		i += 1;
	}

	// Stop Timing
	timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() - timer;

	println!("\nTime Taken: {timer}");

	// aux_functions::PrintGame(newGameAsInt);

	if currentGame == newGameAsInt {
		println!("\nGames MATCH!\n");
	} else {
		println!("\nGames DO NOT MATCH!\n");
	}

	println!("");
}

// Used to extract only the quadrant being rotated
const QUADRANT_MASKS: [u128; 4] = [
    4722348468471135731712, // Q1: 0b111111111111111111000000000000000000000000000000000000000000000000000000
    18014329790005248,      // Q2: 0b000000000000000000111111111111111111000000000000000000000000000000000000
    68719214592,            // Q3: 0b000000000000000000000000000000000000111111111111111111000000000000000000
    262143                  // Q4: 0b000000000000000000000000000000000000000000000000000000111111111111111111
];

// Used to extract everything except the quadrant being rotated
const QUADRANT_MASKS_INV: [u128; 4] = [
    18014398509481983,      // Q1: 0b000000000000000000111111111111111111111111111111111111111111111111111111
    4722348468539855208447, // Q2: 0b111111111111111111000000000000000000111111111111111111111111111111111111
    4722366482800925999103, // Q3: 0b111111111111111111111111111111111111000000000000000000111111111111111111
    4722366482869644951552  // Q4: 0b111111111111111111111111111111111111111111111111111111000000000000000000
];

const QUADRANT_ROTATION_BIT_SHIFT_AMOUNT: [u128; 4] = [54, 36, 18, 0];

const BLACK_WINNINGS_INTS: [u128; 32] = [
    83886416,
    88080464,
    268698629,
    269746181,
    5368795136,
    22548660224,
    1169309302784,
    1374389600276,
    4466766004289,
    74767075966976,
    87960930227456,
    282644281819136,
    369435906937856,
    1130366672846849,
    4504974016970756,
    360287987374751744,
    1170935907428335616,
    1224979099718516804,
    4612812197508153344,
    4629700416936935681,
    5764630612778418176,
    6052843396744085504,
    18464829184560594944,
    18536816409854345216,
    23058430093546225664,
    96845406388317323264,
    296318841086764384256,
    313594650352574022656,
    368940792448701956096,
    1180951908704781860864,
    1185221321134348238849,
    1549532131691136548864
];