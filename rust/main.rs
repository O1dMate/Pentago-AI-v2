#![allow(non_snake_case)]

use std::collections::HashMap;
use std::io::BufReader; 
use std::io::BufRead; 
use std::io; 
use std::fs; 

use std::time::{SystemTime, UNIX_EPOCH};

// const INDEX_MAP: [u8; 36] = [0,1,2,8,14,13,12,6,7, 3,4,5,11,17,16,15,9,10, 18,19,20,26,32,31,30,24,25, 21,22,23,29,35,34,33,27,28];

const PIECES_EMPTY: i8 = -1;
const PIECES_BLACK: i8 = 0;
const PIECES_WHITE: i8 = 1;

const Q4_MASK: u64 = (7 << 12) | (7 << 6) | 7;
const Q3_MASK: u64 = Q4_MASK << 3;
const Q2_MASK: u64 = Q4_MASK << 18;
const Q1_MASK: u64 = Q4_MASK << 21;

const Q1_MASK_INV: u64 = !Q1_MASK;
const Q2_MASK_INV: u64 = !Q2_MASK;
const Q3_MASK_INV: u64 = !Q3_MASK;
const Q4_MASK_INV: u64 = !Q4_MASK;

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
    println!("\nGame Board: {{ WHITE: {}, BLACK: {}, REMAINING: {} }}", gameObj.white, gameObj.black, gameObj.remaining);
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

fn GameObjFromGameStr(gameObj: &mut GameBoard, gameStr: &String) {
    gameObj.white = 0;
    gameObj.black = 0;

    for currentChar in gameStr.split(',') {
        let charConvertedToInt = currentChar.parse::<i8>().unwrap();

        gameObj.white = gameObj.white << 1;
        gameObj.black = gameObj.black << 1;

        if charConvertedToInt == PIECES_WHITE {
            gameObj.white += 1;
        } else if charConvertedToInt == PIECES_BLACK {
            gameObj.black += 1;
        } else {
            gameObj.remaining += 1;
        }
    }
}

fn GetGameStrFromGameObj(gameObj: &GameBoard, gameStr: &mut String) {
    gameStr.clear();
    // gameStr.push('a');
    let mut game_board: [i8; 36] = [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1];

    let mut white: u64 = gameObj.white;
    let mut black: u64 = gameObj.black;

    // Read the board bit by bit.
    // Since we start with LSB, we are reading it from the Bottom Left to Top Right. Resulting string will need to be reversed.
    for index in 0..36 {
        if white & 1 == 1 {
            game_board[index as usize] = PIECES_WHITE;
        } else if black & 1 == 1 {
            game_board[index as usize] = PIECES_BLACK;
        } else {
            game_board[index as usize] = PIECES_EMPTY;
        }

        white = white >> 1;
        black = black >> 1;
    }

    gameStr.push_str(&game_board[35].to_string());
    for index in 1..36 {
        gameStr.push(',');
        gameStr.push_str(&game_board[(35-index) as usize].to_string());
    }
}

// File to Vector
// Source: https://www.quora.com/How-do-I-use-RUST-to-read-a-file-line-by-line-into-an-array?share=1
fn file_to_vec(filename: String) -> io::Result<Vec<String>> { 
    let file_in = fs::File::open(filename)?; 
    let file_reader = BufReader::new(file_in); 
    Ok(file_reader.lines().filter_map(io::Result::ok).collect()) 
} 

fn LoadLookupTables(ROTATION_LOOKUP_RIGHT: &mut HashMap<u64, u64>, ROTATION_LOOKUP_LEFT: &mut HashMap<u64, u64>) {
    let rightRotationLookupTableLines = file_to_vec(String::from("RotationLookupRight.txt")).unwrap();
    let leftRotationLookupTableLines = file_to_vec(String::from("RotationLookupLeft.txt")).unwrap();

    for line in rightRotationLookupTableLines {
        let keyValueStr: Vec<&str> = line.split(',').collect();
        let key: u64 = keyValueStr[0].parse::<u64>().unwrap();
        let value: u64 = keyValueStr[1].parse::<u64>().unwrap();

        ROTATION_LOOKUP_RIGHT.insert(key, value);
    }

    for line in leftRotationLookupTableLines {
        let keyValueStr: Vec<&str> = line.split(',').collect();
        let key: u64 = keyValueStr[0].parse::<u64>().unwrap();
        let value: u64 = keyValueStr[1].parse::<u64>().unwrap();

        ROTATION_LOOKUP_LEFT.insert(key, value);
    }
}

fn RotateGame(ROTATION_LOOKUP_RIGHT: &HashMap<u64, u64>, ROTATION_LOOKUP_LEFT: &HashMap<u64, u64>, gameObj: &mut GameBoard, quadrant: u32, direction: bool) {
    let mut maskToUse: u64 = 0;
    let mut invMaskToUse: u64 = 0;

    if quadrant == 0 {
        maskToUse = Q1_MASK;
        invMaskToUse = Q1_MASK_INV;
    } else if quadrant == 1 {
        maskToUse = Q2_MASK;
        invMaskToUse = Q2_MASK_INV;
    } else if quadrant == 2 {
        maskToUse = Q3_MASK;
        invMaskToUse = Q3_MASK_INV;
    } else if quadrant == 3 {
        maskToUse = Q4_MASK;
        invMaskToUse = Q4_MASK_INV;
    }

    if direction == true {
        gameObj.white = (gameObj.white & invMaskToUse) | (maskToUse & gameObj.white);
        gameObj.black = (gameObj.black & invMaskToUse) | (maskToUse & gameObj.black);
        // gameObj.white = (gameObj.white & invMaskToUse) | ROTATION_LOOKUP_RIGHT.get(&(maskToUse & gameObj.white)).unwrap();
        // gameObj.black = (gameObj.black & invMaskToUse) | ROTATION_LOOKUP_RIGHT.get(&(maskToUse & gameObj.black)).unwrap();
    } else {
        gameObj.white = (gameObj.white & invMaskToUse) | ROTATION_LOOKUP_LEFT.get(&(maskToUse & gameObj.white)).unwrap();
        gameObj.black = (gameObj.black & invMaskToUse) | ROTATION_LOOKUP_LEFT.get(&(maskToUse & gameObj.black)).unwrap();
    }
}

fn main() {
    println!("");

    let mut ROTATION_LOOKUP_RIGHT: HashMap<u64, u64> = HashMap::with_capacity(2045);
    let mut ROTATION_LOOKUP_LEFT: HashMap<u64, u64> = HashMap::with_capacity(2045);

    LoadLookupTables(&mut ROTATION_LOOKUP_RIGHT, &mut ROTATION_LOOKUP_LEFT);

    // let mut game1 = GameBoard { white: 5, black: 2, remaining: 33 };
    // let game = GameBoard { white: 42983228421, black: 5637144744, remaining: 24 };
    // let game = GameBoard { white: 62338457349, black: 6381019386, remaining: 0 };

    // PrintGameObj(&game1);
    // PrintGameBoard(&game1);

    let mut game2 = GameBoard { white: 0, black: 0, remaining: 0 };

    let mut game2str = String::from("-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,0,1");
    // let mut game2str = String::from("1,-1,1,0,-1,0,-1,0,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,-1,0,-1,0,-1,0,1,-1,1");
    // let mut game2str = String::from("1,1,1,0,1,0,0,0,0,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,1,1,1,1,0,0,0,0,0,1,0,1");
    // let mut game2str = String::from("-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1");

    GameObjFromGameStr(&mut game2, &game2str);
    GetGameStrFromGameObj(&game2, &mut game2str);

    // PrintGameBoard(&game2);

    // RotateGame(&ROTATION_LOOKUP_RIGHT, &ROTATION_LOOKUP_LEFT, &mut game2, 0, false);
    // RotateGame(&ROTATION_LOOKUP_RIGHT, &ROTATION_LOOKUP_LEFT, &mut game2, 1, false);
    // RotateGame(&ROTATION_LOOKUP_RIGHT, &ROTATION_LOOKUP_LEFT, &mut game2, 2, false);
    // RotateGame(&ROTATION_LOOKUP_RIGHT, &ROTATION_LOOKUP_LEFT, &mut game2, 3, false);

    // game2.white = game2.white & (Q4_MASK_INV);
    // game2.black = game2.black & (Q4_MASK_INV);

    PrintGameObj(&game2);
    PrintGameBoard(&game2);

    println!("{:?}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis());

    let mut timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();

    let mut i: u32 = 0;
    let mut complete = false;
    let total: u32 = 100000000;

    while !complete {
        RotateGame(&ROTATION_LOOKUP_RIGHT, &ROTATION_LOOKUP_LEFT, &mut game2, i%4, true);

        i += 1;
        if i >= total {
            complete = true;
        }
    }

    timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() - timer;

    println!("Time Taken: {timer}");

    println!("");
}