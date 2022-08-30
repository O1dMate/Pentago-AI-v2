use std::time::{SystemTime, UNIX_EPOCH};

const INDEX_MAP: [u8; 36] = [0,1,2,8,14,13,12,6,7, 3,4,5,11,17,16,15,9,10, 18,19,20,26,32,31,30,24,25, 21,22,23,29,35,34,33,27,28];

const PIECES_BLACK: i8 = 0;
const PIECES_WHITE: i8 = 1;

const PIECES_BLACK_INT_VALUE: u128 = 1;
const PIECES_WHITE_INT_VALUE: u128 = 2;

// Used to extract only the quadrant being rotated
const QUADRANT_INTS: [u128; 4] = [
    4722348468471135731712, // 0b111111111111111111000000000000000000000000000000000000000000000000000000
    18014329790005248,      // 0b111111111111111111000000000000000000000000000000000000
    68719214592,            // 0b111111111111111111000000000000000000
    262143                  // 0b111111111111111111
];

// Used to extract everything except the quadrant being rotated
const QUADRANT_REVERSE_INTS: [u128; 4] = [
    18014398509481983,      // 0b000000000000000000111111111111111111111111111111111111111111111111111111
    4722348468539855208447, // 0b111111111111111111000000000000000000111111111111111111111111111111111111
    4722366482800925999103, // 0b111111111111111111111111111111111111000000000000000000111111111111111111
    4722366482869644951552  // 0b111111111111111111111111111111111111111111111111111111000000000000000000
];

const QUADRANT_ROTATION_BIT_SHIFT_AMOUNT: [u128; 4] = [54, 36, 18, 0];

const WHITE_WINS: [u128; 32] = [
    3099064263382273097728,
    737881584897403912192,
    37073632819708690432,
    36929658369121189888,
    12105686793488171008,
    11529261225556836352,
    45097320448,
    10737590272,
    539492362,
    537397258,
    176160928,
    167772832,
    2361903817409563721728,
    720575974749503488,
    592637682173528768512,
    2341871814856671232,
    193690812776634646528,
    46116860187092451328,
    9009948033941512,
    2748779200552,
    2260733345693698,
    8933532008578,
    738871813875712,
    175921860454912,
    2449958199437033608,
    2370442642268696477698,
    9259400833873871362,
    627189300705148045312,
    9225624395016306688,
    2338618605568,
    565288563638272,
    149534151933952
];

fn convert_game_array_to_int(game_board: &[i8; 36]) -> u128 {
    let mut game_as_int: u128 = 0;

    // If PIECE is Black
    if game_board[0] == PIECES_BLACK {
        game_as_int = PIECES_BLACK_INT_VALUE;
    }
    // If PIECE is White
    else if game_board[0] == PIECES_WHITE {
        game_as_int = PIECES_WHITE_INT_VALUE;
    }

    for i in 1..36 {
        game_as_int = game_as_int << 2;
        if game_board[INDEX_MAP[i] as usize] == PIECES_BLACK {
            game_as_int = game_as_int | PIECES_BLACK_INT_VALUE;
        } else if game_board[INDEX_MAP[i] as usize] == PIECES_WHITE {
            game_as_int = game_as_int | PIECES_WHITE_INT_VALUE;
        }
    }

    return game_as_int;
}

fn rotate_game(game: u128, quadrant: usize, direction: bool) -> u128 {
    let mut quadrant_int: u128 = (QUADRANT_INTS[quadrant] & game) >> QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
    let center_value: u128 = quadrant_int & 3;
    quadrant_int = quadrant_int >> 2;

    if direction {
        quadrant_int = ((((quadrant_int >> 4) | (quadrant_int << 12)) & 65535) << 2) | center_value;
    } else {
        quadrant_int = ((((quadrant_int << 4) | (quadrant_int >> 12)) & 65535) << 2) | center_value;
    }

    quadrant_int = quadrant_int << QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
	quadrant_int = (game & QUADRANT_REVERSE_INTS[quadrant]) | quadrant_int;

    return quadrant_int;
}

fn check_for_white_win(game: u128) -> bool {
    for win in WHITE_WINS {
        if game & win == win {
            return true;
        }
    }
    return false;
}

fn main() {
    let mut game_board: [i8; 36] = [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1];
    game_board[0] = PIECES_WHITE;
    game_board[4] = PIECES_WHITE;
    game_board[6] = PIECES_WHITE;
    game_board[7] = PIECES_WHITE;

    let game_as_int: u128 = convert_game_array_to_int(&game_board);

    println!("");
    println!("{game_as_int}");
    println!("{game_as_int:b}");

    let mut new_game_as_int = rotate_game(game_as_int, 0, false);

    println!("");
    println!("{}", check_for_white_win(game_as_int));

    println!("");
    println!("{new_game_as_int}");
    println!("{new_game_as_int:b}");
    println!("{:?}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis());

    let mut timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis();

    let mut i: u32 = 0;
    let mut complete = false;
    let total: u32 = 10000000;

    while !complete {
        new_game_as_int = rotate_game(game_as_int, (i%4) as usize, false);
        // check_for_white_win(game_as_int);
        
        i += 1;
        if i >= total {
            complete = true;
        }
    }

    timer = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() - timer;

    println!("Time Taken: {timer}");
}