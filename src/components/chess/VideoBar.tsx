
import { ChessState } from "@/lib/chess/slice";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import app from '@/lib/chess/app';

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

    let videoRef = useRef<HTMLVideoElement>();
    const localRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localRef.current) {
            if (props.activeLocalStream) {
                localRef.current.srcObject = app.localStream;
            } else {
                localRef.current.srcObject = null;
            }
            videoRef.current = localRef.current;
        }

        if (remoteRef.current && props.activeRemoteStream) {
            remoteRef.current.srcObject = app.remoteStream;
        }

        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    }, [props]);

    return (
        <div className="video-area align-middle items-center rounded-xl">
            <div className="flex align-center justify-center max-w-md gap-2 m-auto">

                <div className="rounded-xl bg-gray-950">
                    <div className="h-36 w-52 rounded-3xl m-auto mt-1 mb-1">
                        <video className="h-full w-full border-black rounded-2xl" ref={localRef} autoPlay playsInline muted />
                    </div>
                </div>

                {props.activeRemoteStream ? (
                    <div className="rounded-xl bg-gray-950">
                        <div className="h-36 w-52 rounded-3xl  m-auto mt-1 mb-1">
                            <video className="h-full w-full border-black rounded-2xl" ref={remoteRef} autoPlay playsInline />
                        </div>
                    </div>
                ) : null}

            </div>
        </div>
    )
}

export default connect(mapStateToProps)(VideoBar);
