
import { ChessState } from "@/lib/chess/slice";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { chessInfo } from "@/lib/chess/wsocket";

interface VideoBarProps {
    activeLocalStream: boolean;
    activeRemoteStream: boolean;
}

const mapStateToProps = function (state: ChessState) {
    return {
        activeLocalStream: state.activeLocalStream,
        activeRemoteStream: state.activeRemoteStream,
    }
}

function VideoBar(props: VideoBarProps) {
    console.log('video props : ', props);

    const localRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localRef.current && props.activeLocalStream) {
            localRef.current.srcObject = chessInfo.localStream;
        }
        if (remoteRef.current && props.activeRemoteStream) {
            remoteRef.current.srcObject = chessInfo.remoteStream;
        }
    }, [props]);

    return (
        <div className="video-bar">

            {props.activeLocalStream ? (
                <div className="video-container">
                    <video className="h-full w-full" ref={localRef} autoPlay playsInline />
                </div>
            ) : null}

            {props.activeRemoteStream ? (
                <div className="video-container">
                    <video className="h-full w-full" ref={remoteRef} autoPlay playsInline />
                </div>
            ) : null}

        </div>
    )
}

export default connect(mapStateToProps)(VideoBar);
