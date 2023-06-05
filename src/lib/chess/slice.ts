import { Chess, Piece } from 'chess.js';
import { PieceMap, getPieceMap } from './piece';
import { createSlice } from '@reduxjs/toolkit';

type BoardState = "init" | "creating" | "playing" | "gameover" | "waiting" | "error";

export interface ChessState {
    // room info
    sessionId: string,
    roomId: string,
    isHost: boolean,

    // board info
    chess: Chess,
    chessMoves: string[],
    pieceMap: PieceMap,

    boardState: BoardState,
    playerId: string,
    playerIsWhite: boolean,
    isPlayerTurn: boolean,
    playerHasWon: boolean,
    displayMessage: string,

    // video stream
    activeLocalStream: boolean,
    activeRemoteStream: boolean,

    // chats
    chatMessages: string[],
}

let chess = new Chess();
let pieceMap = getPieceMap(chess);

const initialState: ChessState = {
    // room info
    sessionId: "",
    roomId: "",
    isHost: false,

    chess: chess,
    chessMoves: [],
    pieceMap: pieceMap,

    boardState: "init",
    playerId: "",
    playerIsWhite: true,
    isPlayerTurn: false,
    playerHasWon: false,
    displayMessage: '',

    activeLocalStream: false,
    activeRemoteStream: false,

    chatMessages: [],
}

const chessSlice = createSlice({
    name: 'chess',
    initialState: initialState,
    reducers: {

        // websocket responses
        reduceRoomInfo: (state, action) => {
            const payload = action.payload;
            return {
                ...state,
                roomId: payload['roomId'],
                sessionId: payload['sessionId'],
                boardState: payload['isHost'] ? 'creating' : state.boardState,
                isHost: payload['isHost'],
            }
        },

        reducePlayerInfo: (state, action) => {
            let payload = action.payload;
            return {
                ...state,
                playerId: payload['playerId'],
                playerIsWhite: (payload['color'] === 'w'),
                boardState: 'waiting',
            }
        },

        reduceStartGame: (state, action) => {
            let chess = new Chess();
            state.chess = chess;
            state.pieceMap = getPieceMap(chess);
            state.isPlayerTurn = state.playerIsWhite;
            state.boardState = 'playing';
        },

        reduceChessMove: (state, action) => {
            let payload = action.payload;
            let isPlayerTurn = (state.playerIsWhite === (state.chess.turn() === 'w'));
            return {
                ...state,
                pieceMap: getPieceMap(state.chess as Chess),
                isPlayerTurn: isPlayerTurn,
                chessMoves: [...state.chessMoves, payload['move']],
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

        reduceError: (state, action) => {
            let payload = action.payload;
            state.boardState = 'error';
            state.displayMessage = payload['message'];
        },

        reduceClear: (state) => {
            return {
                ...state,
                chess: new Chess(),
                chessMoves: [],
                boardState: "init",
                pieceMap: {},
            };
        },

        // streams
        reduceLocalStream: (state) => {
            return {
                ...state,
                activeLocalStream: true,
            }
        },

        reduceRemoteStream: (state) => {
            return {
                ...state,
                activeRemoteStream: true,
            }
        }
    }
});

export const {
    reduceRoomInfo, reducePlayerInfo, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError, reduceClear, reduceLocalStream, reduceRemoteStream,
} = chessSlice.actions;

export default chessSlice;