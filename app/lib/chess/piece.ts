import { Chess, PieceSymbol, Color } from 'chess.js';

export interface Piece {
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
}

export interface PieceMap {
    [squareId: number]: Piece,
}

// conver 0x88 sqaureId to algebraic notation
export function algebraic(squareId: number): string {
    const f = squareId & 0xf;
    const r = squareId >> 4;
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}

export function getPieceMap(chess: Chess): PieceMap {
    let board = chess.board()
    let pieceMap: PieceMap = {}

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {

            let cell = board[i][j];
            if (cell && cell.type && cell.color) {
                let squareId = (i << 4) | j;
                pieceMap[squareId] = {
                    squareId: squareId,
                    symbol: cell.type,
                    color: cell.color,
                }
            }
        }
    }

    return pieceMap;
}