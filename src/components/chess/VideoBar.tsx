
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
        <div className="w-full h-40 border-b border-solid border-grey-50 align-middle items-center">
            <div className="flex align-center justify-center max-w-md gap-2 m-auto">
                {props.activeLocalStream ? (
                    <div className="w-48 h-36 m-2">
                        <video className="h-full w-full" ref={localRef} autoPlay playsInline muted />
                    </div>
                ) : null}

                {props.activeRemoteStream ? (
                    <div className="w-48 h-36 m-2">
                        <video className="h-full w-full" ref={remoteRef} autoPlay playsInline muted />
                    </div>
                ) : null}

            </div>

        </div>

    )
}

export default connect(mapStateToProps)(VideoBar);
