import { Chess, Piece } from 'chess.js';
import { PieceMap, getPieceMap } from './piece';
import { createSlice } from '@reduxjs/toolkit';

type BoardState = "init" | "waiting" | "joining" | "playing" | "gameover" | "error";

export interface ChessState {
    chess: Chess,
    pieceMap: PieceMap,
    boardState: BoardState,
    roomId: string,
    playerId: string,
    playerIsWhite: boolean,
    playerHasWon: boolean,
    error: string,
}

let chess = new Chess();
let pieceMap = getPieceMap(chess);

const initialState: ChessState = {
    chess: chess,
    pieceMap: pieceMap,
    boardState: "init",
    roomId: "",
    playerId: "",
    playerIsWhite: true,
    playerHasWon: false,
    error: '',
}

const chessSlice = createSlice({
    name: 'chess',
    initialState: initialState,
    reducers: {
        createRoom: (state) => {
            state.chess = state.chess;
            state.boardState = "waiting";
            state.roomId = "room_123";
        },

        joinRoom: (state, action) => {
            state.boardState = "joining";
            state.roomId = ""
        },

        setNewPlayer: (state, action) => {
            let payload = action.payload;
            state.chess = new Chess();
            state.roomId = payload.roomId;
            state.playerId = payload.playerId;
            state.playerIsWhite = payload.playerIsWhite;
            state.pieceMap = {};
        },

        startGame: (state, action) => {
            state.chess = new Chess();
        },

        makeMove: (state, action) => {

        },

        testMove: (state, action) => {
            state.pieceMap = action.payload.pieceMap;
        },
    }
});

export const { createRoom, joinRoom, setNewPlayer, testMove } = chessSlice.actions;

export default chessSlice;