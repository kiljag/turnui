
import * as types from './types';
import store from '../store';
import {
    reduceRoomInfo, reducePlayerInfo, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError, reduceClear, reduceLocalStream, reduceRemoteStream
} from './slice';
import {
    playMoveSelf, playCaptureSound,
} from './sounds';
import { Chess } from 'chess.js';

let WS_HOST = process.env['NEXT_PUBLIC_WS_HOST'] as string
console.log('wsHost: ', WS_HOST);

interface ChessInfo {
    wsocket: WebSocket | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;
}

export const chessInfo: ChessInfo = {
    wsocket: null,
    localStream: null,
    remoteStream: null,
    peerConnection: null,
}

let errorMessage = {
    payload: {
        message: "Error connecting to server",
    }
}

let unknownError = {
    payload: {
        message: "Unknown error occured",
    }
}

async function createConnection(): Promise<WebSocket> {

    return new Promise((resolve, reject) => {
        try {
            let ws = new WebSocket(WS_HOST);
            ws.onopen = (event: any) => {
                resolve(ws);
            }
            ws.onerror = (event: any) => {
                console.error(`error connecting to server ${WS_HOST} : `, event);
                reject();
            }

        } catch (error) {
            console.log(error);
            reject();
        }
    });
}

// initialize local stream
async function initializeLocalStream(): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
        const constraints = {
            video: true,
            audio: true,
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                resolve(stream);
            })
            .catch((err) => {
                console.error('error opening media devices :', err);
                reject(err);
            });
    });
}

// initialize peer connection
async function createPeerConnection() {
    try {
        const configuration = {
            'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]
        }
        let peerConnection = new RTCPeerConnection(configuration);

        // add local tracks to peer connection
        if (chessInfo.localStream !== null) {
            let localStream = chessInfo.localStream;
            chessInfo.localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
            });
        }

        // set remote stream
        let remoteStream = new MediaStream();
        peerConnection.ontrack = async (event) => {
            console.log('track event : ', event);
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            })
        }

        chessInfo.peerConnection = peerConnection;
        chessInfo.remoteStream = remoteStream;
        store.dispatch(reduceRemoteStream());

    } catch (err) {
        console.error('error in creating peer connection');
    }
}

async function setIceCandidateHandler() {

    // ice candidates
    if (chessInfo.peerConnection) {
        chessInfo.peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                console.log('sending ice candidate');
                chessInfo.wsocket?.send(JSON.stringify({
                    type: 'rtc_message',
                    payload: {
                        'sessionId': store.getState().sessionId,
                        'roomId': store.getState().roomId,
                        'ice': JSON.stringify(event.candidate),
                    }
                }));
            }
        }
    } else {
        console.error('peerConnection is null');
    }
}

async function createOffer() {
    try {
        await createPeerConnection();

        const offer = await chessInfo.peerConnection?.createOffer();
        chessInfo.peerConnection?.setLocalDescription(offer);
        chessInfo.wsocket?.send(JSON.stringify({
            type: 'rtc_message',
            payload: {
                'sessionId': store.getState().sessionId,
                'roomId': store.getState().roomId,
                'offer': JSON.stringify(offer),
            }
        }));
        setIceCandidateHandler();

    } catch (err) {
        console.error('error creating offer : ', err);
    }
}

async function processOffer(offer: string) {
    try {
        await createPeerConnection();
        chessInfo.peerConnection?.setRemoteDescription(JSON.parse(offer));
        const answer = await chessInfo.peerConnection?.createAnswer();
        chessInfo.peerConnection?.setLocalDescription(answer);
        chessInfo.wsocket?.send(JSON.stringify({
            type: 'rtc_message',
            payload: {
                'sessionId': store.getState().sessionId,
                'roomId': store.getState().roomId,
                'answer': JSON.stringify(answer),
            }
        }));
        setIceCandidateHandler();

    } catch (err) {
        console.error('error processing offer ', err);
    }
}

async function processAnswer(answer: string) {
    try {
        chessInfo.peerConnection?.setRemoteDescription(JSON.parse(answer));
    } catch (err) {
        console.error('error processing answer ', err);
    }
}

async function processIceCandidate(ice: string) {
    try {
        let candidate = JSON.parse(ice);
        console.log('candidate : ', candidate);
        chessInfo.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
        console.error('error processing ice candidate ', err);
    }
}

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

            case types.TYPE_ROOM_INFO: {
                store.dispatch(reduceRoomInfo(payload));
                break;
            }

            case types.TYPE_ROOM_CREATED: {
                // add to chess room
                setTimeout(() => {
                    addToChessRoom();
                }, 500 + Math.floor(500 * Math.random()));

                if (store.getState().isHost) {
                    createOffer();
                }

                break;
            }

            case types.TYPE_PLAYER_INFO: {
                store.dispatch(reducePlayerInfo(payload));
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

                    if (chessMove.captured) {
                        playCaptureSound();
                    } else {
                        playMoveSelf();
                    }
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

            case types.TYPE_RTC_MESSAGE: {
                let offer = payload['offer'];
                let answer = payload['answer'];
                let ice = payload['ice'];

                if (offer !== undefined) {
                    processOffer(offer);
                }
                else if (answer !== undefined) {
                    processAnswer(answer);
                }
                else if (ice !== undefined) {
                    processIceCandidate(ice);
                }
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

// create local stream
export async function setupLocalStream() {
    try {
        chessInfo.localStream = await initializeLocalStream();
        console.log('initialized localstream');
        store.dispatch(reduceLocalStream());
    } catch (error) {
        console.log('failed to initialize localstream', error);
    }

}

// chess actions
export async function createChessRoom() {
    try {
        chessInfo.wsocket = await createConnection();
        chessInfo.wsocket.onclose = onclose;
        chessInfo.wsocket.onmessage = onmessage;
        chessInfo.wsocket.send(JSON.stringify({
            type: types.TYPE_CREATE_ROOM,
        }));

    } catch (error) {
        console.log('error in creating room :');
        store.dispatch(reduceError(errorMessage));
    }
}

export async function joinChessRoom(roomId: string) {
    try {
        chessInfo.wsocket = await createConnection();
        chessInfo.wsocket.onclose = onclose;
        chessInfo.wsocket.onmessage = onmessage;
        chessInfo.wsocket.send(JSON.stringify({
            type: types.TYPE_JOIN_ROOM,
            payload: {
                roomId: roomId,
            },
        }));

    } catch (error) {
        console.log('error in joining room : ', error);
        store.dispatch(reduceError(errorMessage));
    }
}

export async function addToChessRoom() {
    try {
        let state = store.getState();
        chessInfo.wsocket?.send(JSON.stringify({
            type: types.TYPE_ADD_TO_ROOM,
            payload: {
                sessionId: state.sessionId,
                roomId: state.roomId,
            }
        }));

    } catch (error) {
        console.log('error in adding to room : ', error);
        store.dispatch(reduceError(errorMessage));
    }
}

export function makeChessMove(move: string) {
    try {
        let state = store.getState();
        chessInfo.wsocket?.send(JSON.stringify({
            type: types.TYPE_MAKE_MOVE,
            payload: {
                sessionId: state.sessionId,
                roomId: state.roomId,
                playerId: state.playerId,
                move: move,
            },
        }));

    } catch (error) {
        console.log('error in making move: ', error);
        store.dispatch(reduceError(errorMessage));
    }
}

export async function playChessAgain() {
    await addToChessRoom();
}

export async function leaveChessRoom() {
    // if (wsocket !== null) {
    //     wsocket.close();
    // }
}