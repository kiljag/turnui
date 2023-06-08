
import { Chess } from 'chess.js';
import * as types from './types';
import store from '../store';
import {
    reduceRoomInfo, reduceRoomCreated, reducePlayerInfo, reduceStartGame, reduceChessMove, reduceEndGame,
    reduceError, reduceClear, reduceLocalStream, reduceRemoteStream, reduceChatMessage, reduceJoining,
} from './slice';
import moveselfSound from '../..//assets/sounds/move-self.mp3'
import captureSound from '../../assets/sounds/capture.mp3';
import moveCheckSound from '../../assets/sounds/move-check.mp3';

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
    wsocket: WebSocket | null;
    isActive: boolean; // check if the connection is active or not
    userId: string;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    peerConnection: RTCPeerConnection | null;

    constructor() {
        this.chess = new Chess();
        this.wsocket = null;
        this.isActive = false;
        this.userId = "";
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;

        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
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

    // webrtc related functions

    async startLocalStream() {
        try {
            this.localStream = await initializeLocalStream();
            this.dispatchLocalStream({
                isActive: true,
            });
        } catch (err) {
            console.error('error in starting local stream', err);
        }
    }

    async closeLocalStream() {
        try {
            if (this.localStream !== null) {
                console.log('stopping all tracks');
                const tracks = this.localStream.getTracks();
                console.log('num tracks ', tracks.length);
                tracks.forEach(track => track.stop());

                this.localStream.getTracks().forEach((track) => {
                    this.localStream?.removeTrack(track);
                });
            }
        } catch (err) {
            console.error('error in clearing local stream', err);
        }
        this.dispatchLocalStream({
            isActive: false,
        });
    }

    // initialize remote stream and peer connection

    async createPeerConnection() {
        try {
            const configuration = {
                'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]
            }
            let peerConnection = new RTCPeerConnection(configuration);

            // add local tracks to peer connection
            if (this.localStream !== null) {
                let localStream = this.localStream;
                this.localStream.getTracks().forEach((track) => {
                    peerConnection.addTrack(track, localStream);
                });
            }

            // set remote stream
            let remoteStream = new MediaStream();
            peerConnection.ontrack = async (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                })
            }

            this.peerConnection = peerConnection;
            this.remoteStream = remoteStream;
            this.dispatchRemoteStream({
                isActive: true,
            });

        } catch (err) {
            console.error('error in creating peer connection', err);
        }
    }

    // disconnect from peer
    async closePeerConnection() {
        if (this.peerConnection !== null) {
            this.peerConnection.close();
        }

        this.dispatchRemoteStream({
            isActive: false,
        });
    }

    // listen for ice candidates and send them signalling server 
    async setIceCandidateHandler() {
        try {
            if (this.peerConnection !== null) {
                this.peerConnection.onicecandidate = async (event) => {
                    if (event.candidate) {
                        this.wsocket?.send(JSON.stringify({
                            type: 'rtc_message',
                            payload: {
                                'sessionId': store.getState().sessionId,
                                'roomId': store.getState().roomId,
                                'ice': JSON.stringify(event.candidate),
                            }
                        }));
                    }
                }
            }

        } catch (err) {
            console.error('error in setting ice candidate handler', err);
        }
    }

    // create offer and send it to signalling server
    async createSDPOffer() {
        try {
            await this.createPeerConnection();
            const offer = await this.peerConnection?.createOffer();
            this.peerConnection?.setLocalDescription(offer);
            this.wsocket?.send(JSON.stringify({
                type: 'rtc_message',
                payload: {
                    'sessionId': store.getState().sessionId,
                    'roomId': store.getState().roomId,
                    'offer': JSON.stringify(offer),
                }
            }));
            this.setIceCandidateHandler();

        } catch (err) {
            console.error('error in creating sdp offer', err);
        }
    }

    // process offer, create answer and send it to signalling server
    async createSDPAnswer(offer: string) {
        try {
            await this.createPeerConnection();
            this.peerConnection?.setRemoteDescription(JSON.parse(offer));
            const answer = await this.peerConnection?.createAnswer();
            this.peerConnection?.setLocalDescription(answer);
            this.wsocket?.send(JSON.stringify({
                type: 'rtc_message',
                payload: {
                    'sessionId': store.getState().sessionId,
                    'roomId': store.getState().roomId,
                    'answer': JSON.stringify(answer),
                }
            }));
            this.setIceCandidateHandler();

        } catch (err) {
            console.error('error in creating sdp answer', err);
        }
    }

    async handleSDPAnswer(answer: string) {
        try {
            this.peerConnection?.setRemoteDescription(JSON.parse(answer));
        } catch (err) {
            console.error('error in handling sdp answer', err);
        }
    }

    async handleIceCandidate(ice: string) {
        try {
            let candidate = JSON.parse(ice);
            this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('error handling ice candidate', err);
        }
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
            this.closePeerConnection();
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
                    userId: this.userId,
                }
            }));

        } catch (err) {
            console.error('error in sending chat message :', err);
        }
    }

    async leaveChessRoom() {
        try {
            this.closePeerConnection();
            if (this.wsocket !== null) {
                this.wsocket.close();
                this.isActive = false;
            }
            this.dispatchClear({});

        } catch (err) {
            console.error('error in leaving room', err);
        }
    }

    // websocket close handler
    onclose(event: any) {
        console.log('websocket connection closed');
        if (this.isActive) {
            console.log('room is active');
            this.dispatchError({
                message: 'error connecting to server',
            })
            this.isActive = false;
        }

    }

    // state machine
    onmessage(event: any) {
        // console.log('received : ', event.data);
        try {
            const message = JSON.parse(event.data);
            const type = message['type'];
            const payload = message['payload'];

            switch (type) {

                case types.TYPE_ROOM_INFO: {
                    this.isActive = true;
                    this.dispatchRoomInfo(payload);
                    break;
                }

                case types.TYPE_ROOM_CREATED: {
                    // add to chess room
                    setTimeout(() => {
                        this.addToChessRoom();
                    }, 500 + Math.floor(500 * Math.random()));
                    this.userId = Math.floor(100000 * Math.random()).toString();
                    this.dispatchRoomCreated(payload);

                    // start rtc peer connection
                    if (store.getState().isHost) {
                        this.createSDPOffer();
                    }
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

                case types.TYPE_RTC_MESSAGE: {
                    let offer = payload['offer'];
                    let answer = payload['answer'];
                    let ice = payload['ice'];

                    if (offer !== undefined) {
                        this.createSDPAnswer(offer);
                    } else if (answer !== undefined) {
                        this.handleSDPAnswer(answer);
                    } else if (ice !== undefined) {
                        this.handleIceCandidate(ice);
                    }
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

                default: {
                    break;
                }
            }

        } catch (err) {
            console.error('error in processing response', err);
        }
    }
}

const app = new App();
export default app;

