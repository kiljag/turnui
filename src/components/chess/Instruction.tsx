import { ChessState } from "@/lib/chess/slice";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { reduceSetRoomId, reduceClear, reduceWaiting, reduceJoiningRoom } from '@/lib/chess/slice';
import { createChessRoom, joinChessRoom } from '@/lib/chess/wsocket';
import { useState } from "react";

interface InstructionProps {
    boardState: string,
    displayMessage: string,
    roomId: string,
    playerHasWon: boolean,
}

const mapStateToProps = function (state: ChessState) {
    return {
        boardState: state.boardState,
        displayMessage: state.displayMessage,
        roomId: state.roomId,
        playerHasWon: state.playerHasWon,
    }
}

let currentRoomId = "";

function Instruction(props: InstructionProps) {
    console.log('props : ', props);

    const [roomId, setRoomId] = useState("");
    const dispatch = useDispatch();

    let children: any = null;

    function handleCreatingRoom() {
        console.log('creating room');
        createChessRoom();
    }

    function handleJoiningRoom() {
        console.log('joining room ', roomId);
        dispatch(reduceJoiningRoom());
    }

    function handleJoinRoom() {
        console.log('about to join');
        currentRoomId = roomId;
        joinChessRoom(roomId);
    }

    function handlePlayAgain() {
        console.log('play again..', props.roomId);
        let r = props.roomId || currentRoomId;
        joinChessRoom(r);
        dispatch(reduceWaiting());
    }

    function handleExit() {
        console.log('exit/clear');
        dispatch(reduceClear());
    }

    function handleRoomIdChange(e: any) {
        let t = e.target.value as string;
        if (t) {
            t = t.replace(/[\r\n]+/gm, "");
            setRoomId(t);
        }
    }

    if (props.boardState === "init") {
        children = (
            <div className="p-4" >
                <span className="mr-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={handleCreatingRoom}
                    >
                        CREATE ROOM
                    </button>
                </span>
                <span className="ml-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={handleJoiningRoom}
                    >
                        JOIN ROOM
                    </button>
                </span>
            </div>
        );

    } else if (props.boardState === "creating") {
        children = (
            <div className="p-4">
                <div className="text-sm">
                    share the roomId with your friend
                </div>
                <div className="h-20 m-auto mt-2 border-2 border-white text-xl text-center pt-6">
                    {props.roomId}
                </div>
                <button className="h-10 w-20 border-white border-2 mt-4"
                    onClick={handleExit}
                > EXIT
                </button>
            </div>
        );

    } else if (props.boardState === "joining") {
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
                    onClick={handleJoinRoom}
                > JOIN
                </button>
            </div>
        );

    } else if (props.boardState === "waiting") {
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

    } else if (props.boardState === "gameover") {
        children = (
            <div className="p-4">
                <div className="text-xl">
                    Game Over
                </div>
                <div className="p-4 text-sm">
                    {props.displayMessage}
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

    } else if (props.boardState === "error") {
        children = (
            <div className="p-4">
                <div className="text-sm">
                    {props.displayMessage}
                </div>
                <button className="h-10 w-20 text-sm bg-red text-white"
                    onClick={handleExit}
                >
                    CLOSE
                </button>
            </div>
        );
    }

    return (
        <div className="instruction-modal">
            {children}
        </div>
    );
}

export default connect(mapStateToProps)(Instruction);
