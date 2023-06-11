
import { Chess } from 'chess.js';
import * as types from './types';
import store from '../store';
import {
    reduceRoomInfo, reduceRoomCreated, reducePlayerInfo, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError, reduceClear, reduceLocalStream, reduceRemoteStream, reduceChatMessage, reduceJoining, reduceBoardInfo,
} from './slice';
import moveselfSound from '../..//assets/sounds/move-self.mp3'
import captureSound from '../../assets/sounds/capture.mp3';
import moveCheckSound from '../../assets/sounds/move-check.mp3';
import { Board } from './board';

const WS_HOST = process.env['NEXT_PUBLIC_WS_HOST'] as string
console.log('wsHost: ', WS_HOST);

// websocket connection
async function createConnection(wsHost: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        try {
            let ws = new WebSocket(wsHost);
            ws.onopen = (event: any) => {
                resolve(ws);
            }
            ws.onerror = (event: any) => {
                console.error(`error connecting to server ${wsHost} : `, event);
                reject();
            }

        } catch (err) {
            console.log('error creating connection', err);
            reject(err);
        }
    });
}

async function playSound(sound: string) {
    try {
        let audio = new Audio(sound);
        await audio.play();
    } catch (err) {
        console.error('error playing sound : ', err)
    }
}

async function playMoveSelf() {
    await playSound(moveselfSound);
}

async function playCaptureSound() {
    await playSound(captureSound);
}

async function playMovecheck() {
    await playSound(moveCheckSound);
}

let errorMessage = {
    payload: {
        message: "Error connecting to server",
    }
}

class App {

    chess: Chess;
    board: Board;
    wsocket: WebSocket | null;

    constructor() {
        this.chess = new Chess();
        this.board = new Board();
        this.wsocket = null;

        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);

        // for now
        this.board.init(true);
    }

    // redux dispatch methods
    dispatchRoomInfo(payload: any) {
        console.log('dispatching roominfo')
        store.dispatch(reduceRoomInfo(payload));
    }

    dispatchRoomCreated(payload: any) {
        store.dispatch(reduceRoomCreated(payload));
    }

    dispatchPlayerInfo(payload: any) {
        store.dispatch(reducePlayerInfo(payload));
    }

    dispatchStartGame(payload: any) {
        store.dispatch(reduceStartGame(payload));
    }

    dispatchChessMove(payload: any) {
        store.dispatch(reduceChessMove(payload));
    }

    disptachEndGame(payload: any) {
        store.dispatch(reduceEndGame(payload));
    }

    dispatchJoining(payload: any) {
        store.dispatch(reduceJoining(payload));
    }

    dispatchClear(payload: any) {
        store.dispatch(reduceClear(payload));
    }

    dispatchError(payload: any) {
        store.dispatch(reduceError(payload));
    }

    dispatchLocalStream(payload: any) {
        store.dispatch(reduceLocalStream(payload));
    }

    dispatchRemoteStream(payload: any) {
        store.dispatch(reduceRemoteStream(payload));
    }

    dispatchChatMessage(payload: any) {
        store.dispatch(reduceChatMessage(payload));
    }

    dispatchBoardInfo(payload: any) {
        store.dispatch(reduceBoardInfo(payload));
    }

    onclose(event: any) {
        console.log('connection closed');
    }

    // state machine
    onmessage(event: any) {
        console.log('received : ', event.data);
        try {
            const message = JSON.parse(event.data);
            const type = message['type'];
            const payload = message['payload'];

            switch (type) {

                case types.TYPE_ROOM_INFO: {
                    this.dispatchRoomInfo(payload);
                    break;
                }

                case types.TYPE_ROOM_CREATED: {
                    // add to chess room
                    setTimeout(() => {
                        this.addToChessRoom();
                    }, 500 + Math.floor(500 * Math.random()));
                    this.dispatchRoomCreated(payload);
                    break;
                }

                case types.TYPE_PLAYER_INFO: {
                    this.dispatchPlayerInfo(payload);
                    break;
                }

                case types.TYPE_START_GAME: {
                    this.chess = new Chess();
                    this.dispatchStartGame(payload);
                    break;
                }

                case types.TYPE_CHESS_MOVE: {
                    let move = payload['move'];
                    try {
                        let chessMove = this.chess.move(move);
                        payload['turn'] = this.chess.turn();
                        this.dispatchChessMove(payload);

                        // sound effects
                        if (this.chess.isCheck()) {
                            playMovecheck();
                        } else if (chessMove.captured) {
                            playCaptureSound();
                        } else {
                            playMoveSelf();
                        }

                    } catch (err) {
                        console.error(`error in making move (${move}): `, err);
                        this.dispatchError({
                            message: 'unknown error occured',
                        });
                    }
                    break;
                }

                case types.TYPE_END_GAME: {
                    this.disptachEndGame(payload);
                    break;
                }

                case types.TYPE_CHAT_MESSAGE: {
                    this.dispatchChatMessage(payload);
                    break;
                }

                case types.TYPE_OPPONENT_LEFT: {
                    this.dispatchError({
                        message: 'opponent left the room',
                    });
                    break;
                }

                case types.TYPE_ROOM_IS_FULL: {
                    this.dispatchError({
                        message: 'room is full',
                    })
                }

                default: {
                    break;
                }
            }

        } catch (err) {
            console.error('error in processing response', err);
        }
    }

    async initialize() {
    }

    async createWSConnection() {
        this.wsocket = await createConnection(WS_HOST);
        this.wsocket.onclose = this.onclose;
        this.wsocket.onmessage = this.onmessage;
    }

    async handleError(err: any) {
        try {
            console.error(err);
            this.dispatchError(errorMessage);
        } catch (err) {
            console.error('error : ', err);
        }
    }

    async createChessRoom() {
        try {
            await this.createWSConnection();
            if (this.wsocket) {
                this.wsocket?.send(JSON.stringify({
                    type: types.TYPE_CREATE_ROOM,
                }));
            }

        } catch (err) {
            console.log('error in creating chess room', err);
            this.handleError(err);
        }
    }

    async joinChessRoom(roomId: string) {
        try {
            await this.createWSConnection();
            if (this.wsocket) {
                this.wsocket.send(JSON.stringify({
                    type: types.TYPE_JOIN_ROOM,
                    payload: {
                        roomId: roomId,
                    }
                }))
            }

        } catch (err) {
            console.log('error in joining chess room', err);
            this.handleError(err);
        }
    }

    async addToChessRoom() {
        try {
            let state = store.getState();
            this.wsocket?.send(JSON.stringify({
                type: types.TYPE_ADD_TO_ROOM,
                payload: {
                    sessionId: state.sessionId,
                    roomId: state.roomId,
                }
            }));

        } catch (err) {
            this.handleError(err);
        }
    }

    async makeChessMove(move: string) {
        try {
            let state = store.getState();
            this.wsocket?.send(JSON.stringify({
                type: types.TYPE_MAKE_MOVE,
                payload: {
                    sessionId: state.sessionId,
                    roomId: state.roomId,
                    playerId: state.playerId,
                    move: move,
                },
            }));

        } catch (err) {
            this.handleError(err);
        }
    }

    async playChessAgain() {
        await this.addToChessRoom();
    }

    async sendChatMessage(message: string) {
        try {
            let state = store.getState();
            this.wsocket?.send(JSON.stringify({
                type: types.TYPE_CHAT_MESSAGE,
                payload: {
                    sessionId: state.sessionId,
                    roomId: state.roomId,
                    message: message,
                }
            }));

        } catch (err) {
            console.error('error in sending chat message :', err);
        }
    }

    async handleClick(squareId: number) {
        let boardInfo = this.board.handleClick(squareId);
        if (boardInfo !== undefined) {
            let squares = boardInfo.squares.map((s) => ({ ...s }));
            let pieces = boardInfo.pieces.map((p) => ({ ...p }));
            this.dispatchBoardInfo({
                squares: squares,
                pieces: pieces,
            });

            if (boardInfo.move !== undefined && boardInfo.move !== "") {


            }
        }
        else {
            console.log('received undefined');
        }
    }

    async testInit() {
        this.board = new Board();
        let boardInfo = this.board.init(true);
        let squares = boardInfo.squares.map((s) => ({ ...s }));
        let pieces = boardInfo.pieces.map((p) => ({ ...p }));
        this.dispatchBoardInfo({
            squares: squares,
            pieces: pieces,
        });
    }
}

const app = new App();
export default app;

