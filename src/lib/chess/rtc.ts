



// // initialize local stream
// async function initializeLocalStream(): Promise<MediaStream> {
//     return new Promise((resolve, reject) => {
//         const constraints = {
//             video: true,
//             audio: true,
//         }
//         navigator.mediaDevices.getUserMedia(constraints)
//             .then((stream) => {
//                 resolve(stream);
//             })
//             .catch((err) => {
//                 console.error('error opening media devices :', err);
//                 reject(err);
//             });
//     });
// }

//  // webrtc related functions

//  async startLocalStream() {
//     try {
//         this.localStream = await initializeLocalStream();
//         this.dispatchLocalStream({
//             isActive: true,
//         });
//     } catch (err) {
//         console.error('error in starting local stream', err);
//     }
// }

// async closeLocalStream() {
//     try {
//         if (this.localStream !== null) {
//             console.log('stopping all tracks');
//             const tracks = this.localStream.getTracks();
//             console.log('num tracks ', tracks.length);
//             tracks.forEach(track => track.stop());

//             this.localStream.getTracks().forEach((track) => {
//                 this.localStream?.removeTrack(track);
//             });
//         }
//     } catch (err) {
//         console.error('error in clearing local stream', err);
//     }
//     this.dispatchLocalStream({
//         isActive: false,
//     });
// }

// // initialize remote stream and peer connection

// async createPeerConnection() {
//     try {
//         const configuration = {
//             'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]
//         }
//         let peerConnection = new RTCPeerConnection(configuration);

//         // add local tracks to peer connection
//         if (this.localStream !== null) {
//             let localStream = this.localStream;
//             this.localStream.getTracks().forEach((track) => {
//                 peerConnection.addTrack(track, localStream);
//             });
//         }

//         // set remote stream
//         let remoteStream = new MediaStream();
//         peerConnection.ontrack = async (event) => {
//             event.streams[0].getTracks().forEach((track) => {
//                 remoteStream.addTrack(track);
//             })
//         }

//         this.peerConnection = peerConnection;
//         this.remoteStream = remoteStream;
//         this.dispatchRemoteStream({
//             isActive: true,
//         });

//     } catch (err) {
//         console.error('error in creating peer connection', err);
//     }
// }

// // disconnect from peer
// async closePeerConnection() {
//     if (this.peerConnection !== null) {
//         this.peerConnection.close();
//     }

//     this.dispatchRemoteStream({
//         isActive: false,
//     });
// }

// // listen for ice candidates and send them signalling server 
// async setIceCandidateHandler() {
//     try {
//         if (this.peerConnection !== null) {
//             this.peerConnection.onicecandidate = async (event) => {
//                 if (event.candidate) {
//                     this.wsocket?.send(JSON.stringify({
//                         type: 'rtc_message',
//                         payload: {
//                             'sessionId': store.getState().sessionId,
//                             'roomId': store.getState().roomId,
//                             'ice': JSON.stringify(event.candidate),
//                         }
//                     }));
//                 }
//             }
//         }

//     } catch (err) {
//         console.error('error in setting ice candidate handler', err);
//     }
// }

// // create offer and send it to signalling server
// async createSDPOffer() {
//     try {
//         await this.createPeerConnection();
//         const offer = await this.peerConnection?.createOffer();
//         this.peerConnection?.setLocalDescription(offer);
//         this.wsocket?.send(JSON.stringify({
//             type: 'rtc_message',
//             payload: {
//                 'sessionId': store.getState().sessionId,
//                 'roomId': store.getState().roomId,
//                 'offer': JSON.stringify(offer),
//             }
//         }));
//         this.setIceCandidateHandler();

//     } catch (err) {
//         console.error('error in creating sdp offer', err);
//     }
// }

// // process offer, create answer and send it to signalling server
// async createSDPAnswer(offer: string) {
//     try {
//         await this.createPeerConnection();
//         this.peerConnection?.setRemoteDescription(JSON.parse(offer));
//         const answer = await this.peerConnection?.createAnswer();
//         this.peerConnection?.setLocalDescription(answer);
//         this.wsocket?.send(JSON.stringify({
//             type: 'rtc_message',
//             payload: {
//                 'sessionId': store.getState().sessionId,
//                 'roomId': store.getState().roomId,
//                 'answer': JSON.stringify(answer),
//             }
//         }));
//         this.setIceCandidateHandler();

//     } catch (err) {
//         console.error('error in creating sdp answer', err);
//     }
// }

// async handleSDPAnswer(answer: string) {
//     try {
//         this.peerConnection?.setRemoteDescription(JSON.parse(answer));
//     } catch (err) {
//         console.error('error in handling sdp answer', err);
//     }
// }

// async handleIceCandidate(ice: string) {
//     try {
//         let candidate = JSON.parse(ice);
//         this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (err) {
//         console.error('error handling ice candidate', err);
//     }
// }

// case types.TYPE_RTC_MESSAGE: {
//     let offer = payload['offer'];
//     let answer = payload['answer'];
//     let ice = payload['ice'];

//     if (offer !== undefined) {
//         this.createSDPAnswer(offer);
//     } else if (answer !== undefined) {
//         this.handleSDPAnswer(answer);
//     } else if (ice !== undefined) {
//         this.handleIceCandidate(ice);
//     }
//     break;
// }

 // start rtc peer connection
//  if (store.getState().isHost) {
//     this.createSDPOffer();
// }

// async leaveChessRoom() {
//     try {
//         this.closePeerConnection();
//         if (this.wsocket !== null) {
//             this.wsocket.close();
//             this.isActive = false;
//         }
//         this.dispatchClear({});
//     } catch (err) {
//         console.error('error in leaving room', err);
//     }
// }

// // websocket close handler
// onclose(event: any) {
//     console.log('websocket connection closed');
//     // if (this.isActive) {
//     //     console.log('room is active');
//     //     this.dispatchError({
//     //         message: 'error connecting to server',
//     //     })
//     //     this.isActive = false;
//     // }
// }