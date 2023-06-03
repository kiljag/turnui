import { Chess, Piece } from 'chess.js';
import { PieceMap, getPieceMap } from './piece';
import { createSlice } from '@reduxjs/toolkit';

type BoardState = "init" | "waiting" | "joining" | "playing" | "gameover" | "error";

export interface ChessState {
    chess: Chess,
    chessMoves: string[],
    pieceMap: PieceMap,
    boardState: BoardState,
    roomId: string,
    playerId: string,
    playerIsWhite: boolean,
    isPlayerTurn: boolean,
    playerHasWon: boolean,
    error: string,
}

let chess = new Chess();
let pieceMap = getPieceMap(chess);

const initialState: ChessState = {
    chess: chess,
    chessMoves: [],
    pieceMap: pieceMap,
    boardState: "init",
    roomId: "",
    playerId: "",
    playerIsWhite: true,
    isPlayerTurn: false,
    playerHasWon: false,
    error: '',
}

const chessSlice = createSlice({
    name: 'chess',
    initialState: initialState,
    reducers: {

        reduceClear: (state) => {
            return initialState;
        },

        reduceJoiningRoom: (state) => {
            state.boardState = "joining";
            state.roomId = "";
        },

        // websocket responses
        reduceNewRoom: (state, action) => {
            const payload = action.payload;
            state.roomId = payload['roomId'];
        },

        reduceNewPlayer: (state, action) => {
            let payload = action.payload;
            state.playerId = payload['playerId'];
            state.playerIsWhite = (payload['color'] === 'w');
            state.boardState = 'waiting';
        },

        reduceStartGame: (state, action) => {
            let chess = new Chess();
            state.chess = chess;
            state.pieceMap = getPieceMap(chess);
            state.boardState = 'playing';
            state.isPlayerTurn = state.playerIsWhite;
        },

        reduceChessMove: (state, action) => {
            let payload = action.payload;
            try {
                state.pieceMap = getPieceMap(state.chess as Chess);
                state.boardState = 'playing';
                state.isPlayerTurn = (state.playerIsWhite === (state.chess.turn() === 'w'));
            } catch (err) {
                console.log('error in reduceMakeMove : ', err)
            }
        },

        reduceEndGame: (state, action) => {
            let payload = action.payload;
            if (payload['isgameover']) {
                state.boardState = 'gameover';

            } else if (payload['error']) {
                state.boardState = 'error';
                state.error = payload['message'];
            }
        },

        reduceError: (state, action) => {
            let payload = action.payload;
            state.boardState = 'error';
            state.error = payload['message'];
        }
    }
});

export const {
    reduceClear, reduceJoiningRoom, reduceError,
    reduceNewRoom, reduceNewPlayer, reduceStartGame, reduceChessMove, reduceEndGame,
} = chessSlice.actions;

export default chessSlice;