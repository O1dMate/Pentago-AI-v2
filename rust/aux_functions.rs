#![allow(non_snake_case)]

const INDEX_MAP: [u8; 36] = [0,1,2,8,14,13,12,6,7, 3,4,5,11,17,16,15,9,10, 18,19,20,26,32,31,30,24,25, 21,22,23,29,35,34,33,27,28];

const PIECES_EMPTY: i8 = -1;
const PIECES_BLACK: i8 = 0;
const PIECES_WHITE: i8 = 1;

const PIECES_BLACK_INT_VALUE: u128 = 1;
const PIECES_WHITE_INT_VALUE: u128 = 2;

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

const WHITE_WINNING_INTS: [u128; 32] = [
    167772832,
    176160928,
    537397258,
    539492362,
    10737590272,
    45097320448,
    2338618605568,
    2748779200552,
    8933532008578,
    149534151933952,
    175921860454912,
    565288563638272,
    738871813875712,
    2260733345693698,
    9009948033941512,
    720575974749503488,
    2341871814856671232,
    2449958199437033608,
    9225624395016306688,
    9259400833873871362,
    11529261225556836352,
    12105686793488171008,
    36929658369121189888,
    37073632819708690432,
    46116860187092451328,
    193690812776634646528,
    592637682173528768512,
    627189300705148045312,
    737881584897403912192,
    2361903817409563721728,
    2370442642268696477698,
    3099064263382273097728
];

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

pub fn RotateGame(game: u128, quadrant: usize, direction: bool) -> u128 {
    // Extract the bits for the target quadrant only
    let mut quadrant_int: u128 = (QUADRANT_MASKS[quadrant] & game) >> QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
    // Save the center value since the rotation won't affect it (but the shift operations will)
    let center_value: u128 = quadrant_int & 3;
    // Remove the center value
    quadrant_int = quadrant_int >> 2;

    // Perform the rotation and add the center value back in
    if direction {
        quadrant_int = ((((quadrant_int >> 4) | (quadrant_int << 12)) & 65535) << 2) | center_value;
    } else {
        quadrant_int = ((((quadrant_int << 4) | (quadrant_int >> 12)) & 65535) << 2) | center_value;
    }

    // Move the bits back to line up with were they were taken from
    quadrant_int = quadrant_int << QUADRANT_ROTATION_BIT_SHIFT_AMOUNT[quadrant];
    // Put the new quadrant bits into the game board
	quadrant_int = (game & QUADRANT_MASKS_INV[quadrant]) | quadrant_int;

    return quadrant_int;
}

pub fn ConvertGameArrayToGameInt(game_board: &[i8; 36]) -> u128 {
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

pub fn PrintGame(game: u128) {
    let mut gameStr = String::from("");
    let mut game_board: [i8; 36] = [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1];

    let mut gameInt = game;

    // Read the board bit by bit and convert back to a Game Array (also undoing the special indexing)
    for index in 0..36 {
        let actualPos = INDEX_MAP[(35 - index) as usize] as usize;
        
        if gameInt & 3 == PIECES_WHITE_INT_VALUE {
            game_board[actualPos] = PIECES_WHITE;
        } else if gameInt & 3 == PIECES_BLACK_INT_VALUE {
            game_board[actualPos] = PIECES_BLACK;
        } else {
            game_board[actualPos] = PIECES_EMPTY;
        }

        gameInt = gameInt >> 2;
    }

    // Convert from Game Array to String
    for index in 0..36 {
        if game_board[index] == PIECES_WHITE {
            gameStr.push('W');
        } else if game_board[index] == PIECES_BLACK {
            gameStr.push('B');
        } else {
            gameStr.push('-');
        }

        gameInt = gameInt >> 2;
    }

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

pub fn CheckWhiteWin(game: u128) -> bool {
    let mut i = 0;

    while i < WHITE_WINNING_INTS.len() {
        if game & WHITE_WINNING_INTS[i as usize] == WHITE_WINNING_INTS[i as usize] {
            return true;
        }

        i += 1;
    }
    
    return false;
}

pub fn CheckBlackWin(game: u128) -> bool {
    let mut i = 0;

    while i < BLACK_WINNINGS_INTS.len() {
        if game & BLACK_WINNINGS_INTS[i as usize] == BLACK_WINNINGS_INTS[i as usize] {
            return true;
        }

        i += 1;
    }
    
    return false;
}

// // This function was only used to Generate the Arrays. It isn't called the initial once of construction.
// pub fn BuildWinningPositionArrays() {
//     // All of the ways WHITE can win for each row (5 consecutively). The case of 6 consecutively doesn't need to be checked as it is covered by the 5 consecutively check.
//     let rowWins = [
//         [
//             [1,1,1,1,1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,1,1,1,1,1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,-1, 1,1,1,1,1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,1,1,1,1,1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, 1,1,1,1,1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,1,1,1,1,1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, 1,1,1,1,1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,1,1,1,1,1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, 1,1,1,1,1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,1,1,1,1,1, -1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, 1,1,1,1,1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1, -1,1,1,1,1,1]
//         ]
//     ];

//     // All of the ways WHITE can win for each col (5 consecutively). The case of 6 consecutively doesn't need to be checked as it is covered by the 5 consecutively check.
//     let colWins = [
//         [
//             [1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,1,-1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,1,-1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,1,-1]
//         ],
//         [
//             [-1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,-1],
//             [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,1]
//         ]
//     ];

//     let mut WHITE_ROW_WINS = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
//     let mut BLACK_ROW_WINS = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];

//     let mut WHITE_COL_WINS = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
//     let mut BLACK_COL_WINS = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];

//     // Indices the diagonals: [(0-28), (7-35)]
//     let mut WHITE_DIAG_TL_BR = [0,0];
//     let mut BLACK_DIAG_TL_BR = [0,0];

//     // Indices the diagonals: [(5-25), (10-30)]
//     let mut WHITE_DIAG_TR_BL = [0,0];
//     let mut BLACK_DIAG_TR_BL = [0,0];

//     // Indices the diagonals: [(1-29), (6-34), (4-24), (11-31)]
//     let mut WHITE_REMAINING_DIAGS = [0,0,0,0];
//     let mut BLACK_REMAINING_DIAGS = [0,0,0,0];

//     for rowIndex in 0..6 {
//         for winIndex in 0..2 {
            
//             let mut whiteGameInt = ConvertGameArrayToGameInt(&rowWins[rowIndex][winIndex]);
//             let mut blackGameInt = whiteGameInt >> 1;

//             WHITE_ROW_WINS[rowIndex][winIndex] = whiteGameInt;
//             BLACK_ROW_WINS[rowIndex][winIndex] = blackGameInt;

//             whiteGameInt = ConvertGameArrayToGameInt(&colWins[rowIndex][winIndex]);
//             blackGameInt = whiteGameInt >> 1;

//             WHITE_COL_WINS[rowIndex][winIndex] = whiteGameInt;
//             BLACK_COL_WINS[rowIndex][winIndex] = blackGameInt;
//         }
//     }

//     let DIAG_TL_BR = [
//         [1,-1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,-1,-1],
//         [-1,-1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,-1,1]
//     ];

//     let mut whiteInt1 = ConvertGameArrayToGameInt(&DIAG_TL_BR[0]);
//     let mut whiteInt2 = ConvertGameArrayToGameInt(&DIAG_TL_BR[1]);
//     let mut blackInt1 = whiteInt1 >> 1;
//     let mut blackInt2 = whiteInt2 >> 1;

//     WHITE_DIAG_TL_BR[0] = whiteInt1;
//     WHITE_DIAG_TL_BR[1] = whiteInt2;
//     BLACK_DIAG_TL_BR[0] = blackInt1;
//     BLACK_DIAG_TL_BR[1] = blackInt2;

//     let DIAG_TR_BL = [
//         [-1,-1,-1,-1,-1,1, -1,-1,-1,-1,1,-1, -1,-1,-1,1,-1,-1, -1,-1,1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//         [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,1,-1,-1, -1,-1,1,-1,-1,-1, -1,1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1]
//     ];

//     whiteInt1 = ConvertGameArrayToGameInt(&DIAG_TR_BL[0]);
//     whiteInt2 = ConvertGameArrayToGameInt(&DIAG_TR_BL[1]);
//     blackInt1 = whiteInt1 >> 1;
//     blackInt2 = whiteInt2 >> 1;

//     WHITE_DIAG_TR_BL[0] = whiteInt1;
//     WHITE_DIAG_TR_BL[1] = whiteInt2;
//     BLACK_DIAG_TR_BL[0] = blackInt1;
//     BLACK_DIAG_TR_BL[1] = blackInt2;

//     // Indices the diagonals: [(1-29), (6-34), (4-24), (11-31)]
//     let REMAINING_DIAGS = [
//         [-1,1,-1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,-1,1,-1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,-1,-1],
//         [-1,-1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, -1,1,-1,-1,-1,-1, -1,-1,1,-1,-1,-1, -1,-1,-1,1,-1,-1, -1,-1,-1,-1,1,-1],
//         [-1,-1,-1,-1,1,-1, -1,-1,-1,1,-1,-1, -1,-1,1,-1,-1,-1, -1,1,-1,-1,-1,-1, 1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,-1],
//         [-1,-1,-1,-1,-1,-1, -1,-1,-1,-1,-1,1, -1,-1,-1,-1,1,-1, -1,-1,-1,1,-1,-1, -1,-1,1,-1,-1,-1, -1,1,-1,-1,-1,-1]
//     ];

//     whiteInt1 = ConvertGameArrayToGameInt(&REMAINING_DIAGS[0]);
//     whiteInt2 = ConvertGameArrayToGameInt(&REMAINING_DIAGS[1]);
//     blackInt1 = whiteInt1 >> 1;
//     blackInt2 = whiteInt2 >> 1;

//     WHITE_REMAINING_DIAGS[0] = whiteInt1;
//     WHITE_REMAINING_DIAGS[1] = whiteInt2;
//     BLACK_REMAINING_DIAGS[0] = blackInt1;
//     BLACK_REMAINING_DIAGS[1] = blackInt2;

//     whiteInt1 = ConvertGameArrayToGameInt(&REMAINING_DIAGS[2]);
//     whiteInt2 = ConvertGameArrayToGameInt(&REMAINING_DIAGS[3]);
//     blackInt1 = whiteInt1 >> 1;
//     blackInt2 = whiteInt2 >> 1;

//     WHITE_REMAINING_DIAGS[2] = whiteInt1;
//     WHITE_REMAINING_DIAGS[3] = whiteInt2;
//     BLACK_REMAINING_DIAGS[2] = blackInt1;
//     BLACK_REMAINING_DIAGS[3] = blackInt2;

//     println!("{:?}", WHITE_ROW_WINS);
//     println!("{:?}", BLACK_ROW_WINS);

//     println!("{:?}", WHITE_COL_WINS);
//     println!("{:?}", BLACK_COL_WINS);

//     println!("{:?}", WHITE_DIAG_TL_BR);
//     println!("{:?}", BLACK_DIAG_TL_BR);

//     println!("{:?}", WHITE_DIAG_TR_BL);
//     println!("{:?}", BLACK_DIAG_TR_BL);

//     println!("{:?}", WHITE_REMAINING_DIAGS);
//     println!("{:?}", BLACK_REMAINING_DIAGS);
// }