#![allow(non_snake_case)]

// use std::time::{SystemTime, UNIX_EPOCH};

// const INDEX_MAP: [u8; 36] = [0,1,2,8,14,13,12,6,7, 3,4,5,11,17,16,15,9,10, 18,19,20,26,32,31,30,24,25, 21,22,23,29,35,34,33,27,28];

// const PIECES_BLACK: i8 = 0;
// const PIECES_WHITE: i8 += 1;

// const PIECES_BLACK_INT_VALUE: u128 = 1;
// const PIECES_WHITE_INT_VALUE: u128 = 2;

// fn convert_game_array_to_int(game_board: &[i8; 36]) -> u128 {
//     let mut game_as_int: u128 = 0;

//     // If PIECE is Black
//     if game_board[0] == PIECES_BLACK {
//         game_as_int = PIECES_BLACK_INT_VALUE;
//     }
//     // If PIECE is White
//     else if game_board[0] == PIECES_WHITE {
//         game_as_int = PIECES_WHITE_INT_VALUE;
//     }

//     for i in 1..36 {
//         game_as_int = game_as_int << 2;
//         if game_board[INDEX_MAP[i] as usize] == PIECES_BLACK {
//             game_as_int = game_as_int | PIECES_BLACK_INT_VALUE;
//         } else if game_board[INDEX_MAP[i] as usize] == PIECES_WHITE {
//             game_as_int = game_as_int | PIECES_WHITE_INT_VALUE;
//         }
//     }

//     return game_as_int;
// }

// fn rotate_game(game: u128, quadrant: usize, direction: bool) -> u128 {
//     let mut quadrant_int: u128 = (QUADRANT_INTS[quadrant] & game) >> QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
//     let center_value: u128 = quadrant_int & 3;
//     quadrant_int = quadrant_int >> 2;

//     if direction {
//         quadrant_int = ((((quadrant_int >> 4) | (quadrant_int << 12)) & 65535) << 2) | center_value;
//     } else {
//         quadrant_int = ((((quadrant_int << 4) | (quadrant_int >> 12)) & 65535) << 2) | center_value;
//     }

//     quadrant_int = quadrant_int << QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
// 	quadrant_int = (game & QUADRANT_REVERSE_INTS[quadrant]) | quadrant_int;

//     return quadrant_int;
// }

// fn check_for_white_win(game: u128) -> bool {
//     for win in WHITE_WINS {
//         if game & win == win {
//             return true;
//         }
//     }
//     return false;
// }

// fn main() {
//     let mut game_board: [i8; 36] = [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1];
//     game_board[0] = PIECES_WHITE;
//     game_board[4] = PIECES_WHITE;
//     game_board[6] = PIECES_WHITE;
//     game_board[7] = PIECES_WHITE;

//     let game_as_int: u128 = convert_game_array_to_int(&game_board);

//     println!("");
//     println!("{game_as_int}");
//     println!("{game_as_int:b}");

//     let mut new_game_as_int = rotate_game(game_as_int, 0, false);

//     println!("");
//     println!("{}", check_for_white_win(game_as_int));

//     println!("");
//     println!("{new_game_as_int}");
//     println!("{new_game_as_int:b}");
//     println!("{:?}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis());

//     let mut timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();

//     let mut i: u32 = 0;
//     let mut complete = false;
//     let total: u32 = 10000000;

//     while !complete {
//         new_game_as_int = rotate_game(game_as_int, (i%4) as usize, false);
//         // check_for_white_win(game_as_int);
        
//         i += 1;
//         if i >= total {
//             complete = true;
//         }
//     }

//     timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() - timer;

//     println!("Time Taken: {timer}");
// }

struct GameBoard {
    white: u64,
    black: u64,
    remaining: u8
}

fn PrintGameObj(gameObj: &GameBoard) {
    println!("Game Board: {{ WHITE: {}, BLACK: {}, REMAINING: {} }}", gameObj.white, gameObj.black, gameObj.remaining);
}

fn PrintGameBoard(gameObj: &GameBoard) {
    let mut gameStr = String::from("");

    let mut white: u64 = gameObj.white;
    let mut black: u64 = gameObj.black;

    // Read the board bit by bit.
    // Since we start with LSB, we are reading it from the Bottom Left to Top Right. Resulting string will need to be reversed.
    for _ in 0..36 {
        if white & 1 == 1 {
            gameStr.push('W');
        } else if black & 1 == 1 {
            gameStr.push('B');
        } else {
            gameStr.push('-');
        }

        white = white >> 1;
        black = black >> 1;
    }

    // Reverse the String
    gameStr = gameStr.chars().rev().collect::<String>();

    // Output game board string that will be printed
    let mut outputStringToPrint = String::from("\n");

    for index in 0..36 {
        outputStringToPrint.push_str(&gameStr[(index)..(index+1)]);
        outputStringToPrint.push(' ');

        if (index+1) != 0 && (index+1) % 6 == 0 {
            // Add a new line at the end of each row (every 6 elements)
            outputStringToPrint.push('\n');
        } else if (index+1) != 0 && (index+1) % 3 == 0 {
            // Add a space every between the quadrants (every 3 elements)
            outputStringToPrint.push(' ');
        }

        // Put a extra line between the 3rd and 4th row
        if index == 17 {
            outputStringToPrint.push('\n');
        }
    }

    // Print the formatted Game Board
    println!("{}", outputStringToPrint);
}

fn main() {
    println!("");

    let game = GameBoard { white: 5, black: 2, remaining: 33 };
    // let game = GameBoard { white: 42983228421, black: 5637144744, remaining: 24 };
    // let game = GameBoard { white: 62338457349, black: 6381019386, remaining: 0 };

    PrintGameObj(&game);
    PrintGameBoard(&game);

    println!("");
}