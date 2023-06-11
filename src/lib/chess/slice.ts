import { Chess } from 'chess.js';
import { createSlice } from '@reduxjs/toolkit';
import { BoardInfo, ChessPiece, ChessSquare } from './board';

type BoardState = "init" |
    "creating" |
    "joining" | "playing" | "gameover" | "waiting" | "error";

export interface ChatMessage {
    chatId: number,
    userId: string,
    message: string,
}

export interface ChessState {

    // room info
    sessionId: string,
    roomId: string,
    isHost: boolean,
    roomCreated: boolean,

    // board info
    chessMoves: string[],

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
    chatMessages: ChatMessage[],

    // boardInfo
    squares: ChessSquare[],
    pieces: ChessPiece[],
}

const initialState: ChessState = {
    // room info
    sessionId: "",
    roomId: "",
    isHost: false,
    roomCreated: false,
    chessMoves: [],

    boardState: "init",
    playerId: "",
    playerIsWhite: true,
    isPlayerTurn: false,
    playerHasWon: false,
    displayMessage: '',

    activeLocalStream: false,
    activeRemoteStream: false,
    chatMessages: [],

    // boardInfo
    squares: [],
    pieces: [],
}

const chessSlice = createSlice({
    name: 'chess',
    initialState: initialState,
    reducers: {

        reduceBoardInfo(state, action) {
            return {
                ...state,
                squares: action.payload.squares,
                pieces: action.payload.pieces,
            }
        },

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

        reduceRoomCreated: (state) => {
            state.roomCreated = true;
            state.chatMessages = [];
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
            return {
                ...state,
                chessMoves: [],
                isPlayerTurn: state.isPlayerTurn,
                boardState: 'playing',
            }
        },

        reduceChessMove: (state, action) => {
            let payload = action.payload;
            return {
                ...state,
                isPlayerTurn: state.playerIsWhite === (payload['turn'] === 'w'),
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

        reduceJoining: (state, action) => {
            return {
                ...state,
                boardState: 'joining',
            }
        },

        reduceError: (state, action) => {
            const payload = action.payload;
            return {
                ...state,
                boardState: 'error',
                displayMessage: payload['message'],
                chessMoves: [],
                chatMessages: [],
                roomCreated: false,
            }
        },

        reduceClear: (state) => {
            return {
                ...state,
                chess: new Chess(),
                chessMoves: [],
                chatMessages: [],
                boardState: "init",
                pieceMap: {},
                roomCreated: false,
                roomId: "",
                sessionId: "",
                isHost: false,
            };
        },

        // chat
        reduceChatMessage: (state, action) => {
            const payload = action.payload;
            const item: ChatMessage = {
                chatId: payload['chatId'],
                userId: payload['userId'],
                message: payload['message'],
            };
            let chatMessages = state.chatMessages.concat(item);
            return {
                ...state,
                chatMessages: chatMessages,
            }
        },

        // streams
        reduceLocalStream: (state, action) => {
            const isActive = action.payload['isActive'];
            return {
                ...state,
                activeLocalStream: isActive,
            }
        },

        reduceRemoteStream: (state, action) => {
            const isActive = action.payload['isActive'];
            return {
                ...state,
                activeRemoteStream: isActive,
            }
        }
    }
});

export const {
    reduceRoomInfo, reduceRoomCreated, reducePlayerInfo, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError, reduceClear, reduceLocalStream, reduceRemoteStream, reduceChatMessage, reduceJoining, reduceBoardInfo,
} = chessSlice.actions;

export default chessSlice;