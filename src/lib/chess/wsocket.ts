
import * as types from './types';
import store from '../store';
import {
    reduceNewRoom, reduceNewPlayer, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError,
    reduceSetRoomId,
} from './slice';


function onclose(event: any) {
    console.log('connection closed');
    store.dispatch(reduceError({
        payload: {
            message: "Connection Closed",
        }
    }));
}

function onmessage(event: any) {
    console.log('received : ', event.data);
    try {
        const message = JSON.parse(event.data);
        const type = message['type'];
        const payload = message['payload'];

        switch (type) {

            case types.TYPE_NEW_ROOM: {
                let roomId = payload['roomId'];
                store.dispatch(reduceNewRoom(payload));
                joinChessRoom(roomId);
                break;
            }

            case types.TYPE_NEW_PLAYER: {
                store.dispatch(reduceNewPlayer(payload));
                break;
            }

            case types.TYPE_START_GAME: {
                store.dispatch(reduceStartGame(payload));
                break;
            }

            case types.TYPE_CHESS_MOVE: {
                let move = payload['move'];
                let state = store.getState();
                try {
                    let chessMove = state.chess.move(move);
                    store.dispatch(reduceChessMove(payload));

                } catch (error) {
                    console.log('error in making move : ', move);
                    store.dispatch(reduceError({
                        payload: {
                            message: 'Unknown error occured',
                        }
                    }));
                }
                break;
            }

            case types.TYPE_END_GAME: {
                store.dispatch(reduceEndGame(payload));
                break;
            }
        }

    } catch (err) {
        console.log('error reading message', err);
        store.dispatch(reduceError({
            payload: {
                message: "Unknown Error occured"
            }
        }))
    }
}

let errorMessage = {
    payload: {
        message: "Error connecting to server",
    }
}

let wsocket: WebSocket;

async function createConnection(): Promise<WebSocket> {
    let wsHost = process.env['WS_HOST'] as string;

    return new Promise((resolve, reject) => {
        try {
            wsocket = new WebSocket(wsHost);
            wsocket.onclose = onclose;
            wsocket.onmessage = onmessage;
            wsocket.onopen = (event: any) => {
                resolve(wsocket);
            }
            wsocket.onerror = (event: any) => {
                reject();
            }
        } catch (error) {
            console.log(error);
            reject();
        }
    });
}


export async function createChessRoom() {
    try {
        await createConnection();
        wsocket.send(JSON.stringify({
            type: types.TYPE_CREATE_ROOM,
        }));

    } catch (error) {
        console.log('error in creating room :');
        store.dispatch(reduceError(errorMessage));
    }
}

export async function joinChessRoom(roomId: string) {
    try {
        if (!wsocket || wsocket.readyState === wsocket.CLOSED) {
            await createConnection();
        }
        wsocket.send(JSON.stringify({
            type: types.TYPE_JOIN_ROOM,
            payload: {
                roomId: roomId,
                color: 'w',
            },
        }));

    } catch (error) {
        console.log('error in joining room : ', error);
        store.dispatch(reduceError(errorMessage));
    }
}

export function makeChessMove(move: string) {
    try {
        let state = store.getState();
        wsocket.send(JSON.stringify({
            type: types.TYPE_MAKE_MOVE,
            payload: {
                move: move,
                playerId: state.playerId,
            },
        }));

    } catch (error) {
        console.log('error in making move: ', move)
        store.dispatch(reduceError(errorMessage));
    }
}
