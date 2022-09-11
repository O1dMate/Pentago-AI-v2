#![allow(non_snake_case)]

// Import modules
mod aux_functions;
mod aux_functions_testing;

use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
	println!("");

	let game_board: [i8; 36] = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
	// let game_board: [i8; 36] = [1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1];
	// let game_board: [i8; 36] = [1,-1,1,-1,-1,-1,0,1,0,0,1,-1,1,0,1,1,0,-1,1,0,0,1,-1,-1,0,0,1,-1,1,-1,1,0,-1,-1,0,-1];

    let currentGame: u128 = aux_functions::ConvertGameArrayToGameInt(&game_board);
	let mut newGameAsInt = currentGame;

	println!("{:?}", currentGame);
	aux_functions::PrintGame(newGameAsInt);
	
	println!("White won: {}", aux_functions::CheckWhiteWin(newGameAsInt));
	println!("Black won: {}", aux_functions::CheckBlackWin(newGameAsInt));

	let mut i: u32 = 0;
	let mut complete = false;
	let total: u32 = 1000000;
	
	// Start Timing
	let mut timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();
	
	while !complete {
		newGameAsInt = aux_functions::RotateGame(newGameAsInt, 0 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 0 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 0 as usize, false);
		newGameAsInt = aux_functions::RotateGame(newGameAsInt, 1 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 1 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 1 as usize, false);
		newGameAsInt = aux_functions::RotateGame(newGameAsInt, 2 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 2 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 2 as usize, false);
		newGameAsInt = aux_functions::RotateGame(newGameAsInt, 3 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 3 as usize, true);
		// newGameAsInt = aux_functions::RotateGame(newGameAsInt, 3 as usize, false);
		aux_functions::CheckWhiteWin(newGameAsInt);
		aux_functions::CheckBlackWin(newGameAsInt);
		
		i += 1;
		if i >= total {
			complete = true;
		}
	}

	// Stop Timing
	timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() - timer;
	
	println!("\nTime Taken: {timer}");

	if currentGame == newGameAsInt {
		println!("\nGames MATCH!\n");
	} else {
		println!("\nGames DO NOT MATCH!\n");
	}

	println!("");
}