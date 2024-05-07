'use client';

import { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { ChessState, reduceClear, selectBoardState, selectDisplayMessage, selectPlayerHasWon, selectRoomId } from "../redux/chessSlice";
import app from '../lib/chess/app';
import { useAppSelector } from "../redux/hooks";


export default function ChessModal() {

    const boardState = useAppSelector(selectBoardState);
    const displayMessage = useAppSelector(selectDisplayMessage);
    const chessRoomId = useAppSelector(selectRoomId);
    const playerHasWon = useAppSelector(selectPlayerHasWon);
    const [roomId, setRoomId] = useState("");

    let children: any = null;

    // user action handlers
    function handleRoomIdChange(e: any) {
        let t = e.target.value as string;
        if (t) {
            t = t.replace(/[\r\n]+/gm, "");
            setRoomId(t);
        }
    }

    function handleJoinClick() {
        app.dispatchJoining({});
    }

    // async calls
    function handleCreate() {
        app.createChessRoom();
    }

    function handleJoin() {
        app.joinChessRoom(roomId);
    }

    function handlePlayAgain() {
        app.playChessAgain();
    }

    function handleExit() {
        app.leaveChessRoom();
    }


    if (boardState === "init") {
        children = (
            <div className="p-4" >
                <span className="mr-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={handleCreate}
                    >
                        CREATE ROOM
                    </button>
                </span>
                <span className="ml-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={handleJoinClick}
                    >
                        JOIN ROOM
                    </button>
                </span>
            </div>
        );

    } else if (boardState === "creating") {
        console.log("board state : ", boardState);
        children = (
            <div className="p-4">
                <div className="text-sm">
                    share the roomId with your friend
                </div>
                <div className="h-20 m-auto mt-2 border-2 border-white text-xl text-center pt-6">
                    {chessRoomId}
                </div>
                <button className="h-10 w-20 border-white border-2 mt-4"
                    onClick={handleExit}
                > EXIT
                </button>
            </div>
        );

    } else if (boardState === "joining") {
        children = (
            <div className="p-4">
                <textarea className="h-20 w-full 
                    bg-transparent border-white border-2 text-white
                    text-xl text-center pt-6
                    "
                    placeholder="Enter room id here"
                    onChange={handleRoomIdChange}
                />
                <button className="h-10 w-20 border-white border-2 mt-4"
                    onClick={handleJoin}
                > JOIN
                </button>
            </div>
        );

    } else if (boardState === "waiting") {
        children = (
            <div className="p-4">
                <div className="text-sm">
                    Waiting for other player..
                </div>
                <button className="h-10 w-20 border-white border-2 mt-4"
                    onClick={handleExit}
                > EXIT
                </button>
            </div>
        );

    } else if (boardState === "gameover") {
        children = (
            <div className="p-4">
                <div className="text-xl">
                    Game Over
                </div>
                <div className="p-4 text-sm">
                    {displayMessage}
                </div>
                <span className="mr-4">
                    <button className="h-10 w-40 border-white border-2"
                        onClick={handlePlayAgain}
                    >
                        PLAY AGAIN
                    </button>
                </span>
                <span className="ml-4">
                    <button className="h-10 w-40 border-white border-2"
                        onClick={handleExit}
                    >
                        EXIT
                    </button>
                </span>
            </div>
        );

    } else if (boardState === "error") {
        children = (
            <div className="p-4">
                <div className="text-white">
                    {displayMessage || "Error connecting to server"}
                </div>
                <div className="pt-4">
                    <button className="h-10 w-20 text-sm border-white border-2 text-white"
                        onClick={handleExit}
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="instruction-modal">
            {children}
        </div>
    );
}

