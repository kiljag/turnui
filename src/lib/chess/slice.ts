import { Chess, Piece } from 'chess.js';
import { PieceMap, getPieceMap } from './piece';
import { createSlice } from '@reduxjs/toolkit';

type BoardState = "init" | "waiting" | "creating" | "joining" | "playing" | "gameover" | "error";

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
    displayMessage: string,
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
    displayMessage: '',
}

const chessSlice = createSlice({
    name: 'chess',
    initialState: initialState,
    reducers: {

        reduceClear: (state) => {
            return initialState;
        },

        reduceCreatingRoom: (state) => {
            state.boardState = "creating";
        },

        reduceSetRoomId: (state, action) => {

            // const payload = action.payload;
            // const roomId = payload.roomId;
            // state.roomId = "" + roomId;
        },

        reduceJoiningRoom: (state) => {
            state.boardState = "joining";
        },

        reduceWaiting: (state) => {
            state.boardState = "waiting";
        },

        reduceError: (state, action) => {
            let payload = action.payload;
            state.boardState = 'error';
            state.displayMessage = payload['message'];
        },

        // websocket responses
        reduceNewRoom: (state, action) => {
            const payload = action.payload;
            state.roomId = payload['roomId'];
            state.boardState = 'creating';
        },

        reduceNewPlayer: (state, action) => {
            let payload = action.payload;
            state.playerId = payload['playerId'];
            state.playerIsWhite = (payload['color'] === 'w');
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
                state.displayMessage = payload['message'];
            }
        },
    }
});

export const {
    reduceClear, reduceJoiningRoom, reduceCreatingRoom, reduceWaiting, reduceError, reduceSetRoomId,
    reduceNewRoom, reduceNewPlayer, reduceStartGame, reduceChessMove, reduceEndGame,
} = chessSlice.actions;

export default chessSlice;