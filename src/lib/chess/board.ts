
import { Chess, PieceSymbol, Color, Square } from "chess.js";

// conver 0x88 sqaureId to algebraic notation
export function algebraic(squareId: number): string {
    const f = squareId & 0xf;
    const r = squareId >> 4;
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}

// convert a squareId from algebraic notation to 0x88
export function tosquareid(id: string): number {
    const r = '87654321'.indexOf(id[1]);
    const f = 'abcdefgh'.indexOf(id[0]);
    return (r << 4 | f);
}

export type SquareState =
    "empty" |
    "selected" |
    "target" |
    "attackable" |
    "fromsquare" |
    "tosquare" |
    "ischeck";

export interface ChessSquare {
    key: string,
    squareId: number,
    squareState: SquareState,
}

export interface ChessPiece {
    key: string,
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
    isAlive: boolean,
}

export interface BoardInfo {
    squares: ChessSquare[],
    pieces: ChessPiece[],
    canPromote?: boolean,
    move?: string,
}

export class Board {
    chess: Chess;
    playerIsWhite: boolean;
    squareMap: { [cellId: string]: ChessSquare }
    pieceMap: { [cellId: string]: ChessPiece }
    /**
     * hold a reference from current position of the piece to it's original position
     * it helps to maintain the same key for piece, so we can animate the piece easily
     * since 'key' is required for proper react animations.
     */
    currPieceMap: { [cellId: string]: string }

    /**
     * to handle selection of pieces
     */
    selectedSquare: number
    targetSquares: { [cellId: string]: boolean }
    fromCellId: string
    toCellId: string

    constructor() {
        this.chess = new Chess();
        this.playerIsWhite = true;
        this.squareMap = {};
        this.pieceMap = {};
        this.currPieceMap = {};

        this.selectedSquare = -1;
        this.targetSquares = {};
        this.fromCellId = "";
        this.toCellId = "";
    }

    init(playerIsWhite: boolean): BoardInfo {

        this.playerIsWhite = playerIsWhite;

        // initialize squares
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let squareId = (i << 4) | j;
                let cellId = algebraic(squareId);
                this.squareMap[cellId] = {
                    key: cellId,
                    squareId: squareId,
                    squareState: 'empty',
                }
            }
        }

        // initialize pieces
        let b = this.chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cell = b[i][j];
                if (cell && cell.type && cell.color) {
                    let squareId = (i << 4) | j;
                    let cellId = algebraic(squareId);
                    this.pieceMap[cellId] = {
                        key: cellId,
                        squareId: squareId,
                        symbol: cell.type,
                        color: cell.color,
                        isAlive: true,
                    }
                    this.currPieceMap[cellId] = cellId;
                }
            }
        }

        let boardInfo: BoardInfo = {
            squares: Object.values(this.squareMap),
            pieces: Object.values(this.pieceMap),
        }
        return boardInfo;
    }


    /**
     * handle when a square is clicked on the board.
     * used for client side actions and animations
     */
    handleClick(squareId: number): BoardInfo | undefined {
        if (this.playerIsWhite !== (this.chess.turn() === 'w')) {
            return;
        }

        if (this.selectedSquare < 0) {
            return this.handleFirstSelect(squareId);

        } else {
            return this.handleSecondSelect(squareId);
        }
    }

    /** selecte a piece to move */
    handleFirstSelect(squareId: number): BoardInfo | undefined {

        // check if it is correct player's turn
        if (!(this.playerIsWhite === (this.chess.turn() === 'w'))) {
            return;
        }

        // check if clicked on a piece
        let cellId = algebraic(squareId);
        if (this.currPieceMap[cellId] === undefined) {
            return;
        }

        // check if clicked on proper colored piece
        let pieceId = this.currPieceMap[cellId];
        let piece = this.pieceMap[pieceId];
        if (piece !== undefined && (piece.color !== (this.playerIsWhite ? 'w' : 'b'))) {
            return;
        }

        // check if clicked on a legal piece
        let isLegal = false;
        let moves = this.chess._moves();
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].from === squareId) {
                isLegal = true;
                break;
            }
        }
        if (!isLegal) {
            return;
        }

        // and update the affected squares
        let availableMoves = this.chess._moves({ square: cellId as Square });
        this.selectedSquare = squareId;
        console.log(cellId);
        this.squareMap[cellId].squareState = 'selected';

        this.targetSquares = {};
        for (let i = 0; i < availableMoves.length; i++) {
            let targetId = availableMoves[i].to;
            let targetCellId = algebraic(targetId);
            this.targetSquares[targetCellId] = true;
            this.squareMap[targetCellId].squareState = 'target';

            let pieceId = this.currPieceMap[targetCellId];
            if (pieceId !== undefined && this.pieceMap[pieceId] !== undefined &&
                (this.pieceMap[pieceId].color === (this.playerIsWhite ? 'b' : 'w'))) {
                this.squareMap[pieceId].squareState = 'attackable';
            }
        }

        let boardInfo: BoardInfo = {
            squares: Object.values(this.squareMap),
            pieces: Object.values(this.pieceMap),
            canPromote: false,
            move: undefined,
        };
        return boardInfo;
    }

    handleSecondSelect(squareId: number): BoardInfo | undefined {

        let fromSquareId = this.selectedSquare;
        let fromCellId = algebraic(fromSquareId);
        let toSquareId = squareId;
        let toCellId = algebraic(toSquareId);

        // unpaint squares
        this.squareMap[fromCellId].squareState = 'empty';
        for (let targetCellId of Object.keys(this.targetSquares)) {
            this.squareMap[targetCellId].squareState = 'empty';
        }

        // handle the promote case
        if ((this.playerIsWhite && toCellId[1] === '8') ||
            (!this.playerIsWhite && toCellId[1] === '1')) {

        }

        let chessMove = "";

        // clicked on one of the target square, normal move
        if (this.targetSquares[toCellId] !== undefined) {

            let toPieceId = this.currPieceMap[toCellId];
            let fromPieceId = this.currPieceMap[fromCellId];
            if (toPieceId !== undefined) { // if piece is present on target square
                this.pieceMap[toPieceId].isAlive = false;
                delete this.currPieceMap[toCellId];
            }
            this.pieceMap[fromPieceId].squareId = toSquareId;
            this.currPieceMap[toCellId] = fromPieceId;
            this.squareMap[fromCellId].squareState = 'fromsquare';
            this.squareMap[toCellId].squareState = 'tosquare';

            chessMove = fromCellId + toCellId;
            this.chess.move(chessMove);
        }

        // if the king is in check
        if (this.chess.isCheck()) {
            if (this.playerIsWhite) {
                this.squareMap['e8'].squareState = 'ischeck';
            } else {
                this.squareMap['e1'].squareState = 'ischeck';
            }
        }

        this.selectedSquare = -1;
        this.targetSquares = {};
        this.fromCellId = fromCellId;
        this.toCellId = toCellId;

        let boardInfo: BoardInfo = {
            squares: Object.values(this.squareMap),
            pieces: Object.values(this.pieceMap),
            canPromote: false,
            move: chessMove,
        }
        return boardInfo;
    }

    /** promote a piece */
    handlePromote(): BoardInfo | undefined {
        if (this.selectedSquare = 0) {
            return;
        }
    }

    // moves in the form of algebraic notation
    handleMove(from: string, to: string): BoardInfo | undefined {
        this.squareMap[this.fromCellId].squareState = 'empty';
        this.squareMap[this.toCellId].squareState = 'empty';
        return;
    }
}

