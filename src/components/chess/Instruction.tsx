import { ChessState } from "@/lib/chess/slice";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "react-redux";
import { reduceError, reduceClear, reduceJoiningRoom } from '@/lib/chess/slice';
import { createChessRoom, joinChessRoom } from '@/lib/chess/wsocket';
import { useState } from "react";

interface InstructionProps {
    boardState: string,
    error: string,
    roomId: string,
    playerHasWon: boolean,
}

const mapStateToProps = function (state: ChessState) {
    return {
        boardState: state.boardState,
        error: state.error,
        roomId: state.roomId,
        playerHasWon: state.playerHasWon,
    }
}

function Instruction(props: InstructionProps) {

    const [roomId, setRoomId] = useState("");
    const dispatch = useDispatch();

    let children: any = null;

    function handleCreateRoom() {
        console.log('creating room');
        createChessRoom();
    }

    function handleJoinRoom() {
        console.log('joining room ', roomId);
        joinChessRoom(roomId);
    }

    function handlePlayAgain() {
        console.log('play again..');
    }

    function handleCloseError() {
        console.log('');
    }

    if (props.boardState === "init") {
        children = (
            <div className="p-4" >
                <span className="mr-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={handleCreateRoom}
                    >
                        CREATE ROOM
                    </button>
                </span>
                <span className="ml-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={() => dispatch(reduceJoiningRoom())}
                    >
                        JOIN ROOM
                    </button>
                </span>
            </div>
        );

    } else if (props.boardState === "waiting") {
        children = (
            <div className="p-4">
                <div className="text-sm">
                    share the roomId with your friend
                </div>
                <div className="h-20 m-auto mt-2 border-2 border-white text-xl text-center pt-6">
                    {props.roomId}
                </div>
            </div>
        )

    } else if (props.boardState === "joining") {
        children = (
            <div className="p-4">
                <textarea className="h-20 w-full 
                    bg-transparent border-white border-2 text-white
                    text-xl text-center pt-6
                    "
                    placeholder="Enter room id here"
                    onChange={(e) => setRoomId(e.target.value)}
                />
                <button className="h-10 w-20 border-white border-2 mt-4"
                    onClick={handleJoinRoom}
                > JOIN
                </button>
            </div>
        )

    } else if (props.boardState === "gameover") {
        <div className="p-4">
            <div className="text-sm">
                {props.playerHasWon ? 'You have won' : 'Play again'}
            </div>
            <span className="mr-4">
                <button className="h-20 w-40 border-white border-2"
                    onClick={handlePlayAgain}
                >
                    PLAY AGAIN
                </button>
            </span>
            <span className="ml-4">
                <button className="h-20 w-40 border-white border-2"
                    onClick={handleCloseError}
                >
                    EXIT
                </button>
            </span>
        </div>

    } else if (props.boardState === "error") {
        children = (
            <div className="p-4">
                <div className="bg-red-500 text-center text-sm">
                    {props.error}
                </div>
                <button className="h-10 w-20 text-sm bg-red text-white"
                    onClick={() => dispatch(reduceClear())}
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
