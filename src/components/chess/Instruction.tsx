
import { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { ChessState, reduceClear } from "@/lib/chess/slice";
import { createChessRoom, joinChessRoom, playChessAgain } from '@/lib/chess/wsocket';

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

function Instruction(props: InstructionProps) {

    const [joining, setJoining] = useState(false);
    const [roomId, setRoomId] = useState("");
    const dispatch = useDispatch();

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
        console.log('joining room ', roomId);
        setJoining(true);
    }

    // async calls
    function handleCreate() {
        console.log('creating room');
        createChessRoom();
    }

    function handleJoin() {
        console.log('about to join');
        joinChessRoom(roomId);
    }

    function handlePlayAgain() {
        console.log('play again..');
        playChessAgain();
    }

    function handleExit() {
        console.log('exit/clear');
        dispatch(reduceClear());
    }

    if (joining) { // propmt the player to enter roomid
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

    } else if (props.boardState === "init") {
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
