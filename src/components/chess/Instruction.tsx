import { ChessState } from "@/lib/chess/slice";
import { useSelector } from "react-redux";

interface InstructionProps {
    error: string,
    handleCloseError: () => void,

    boardState: string,
    roomId: string,
    playerHasWon: boolean,
    handleCreate: () => void;
    handleJoin: () => void;
}

export default function Instruction(props: InstructionProps) {

    let children: any = null;

    if (props.boardState === "init") {
        children = (
            <div className="p-4" >
                <span className="mr-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={props.handleCreate}
                    >
                        CREATE ROOM
                    </button>
                </span>
                <span className="ml-4">
                    <button className="h-20 w-40 border-white border-2"
                        onClick={props.handleJoin}
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
                <div className="h-8 m-auto mt-2 border-2 border-white">
                    {props.roomId}
                </div>
            </div>
        )

    } else if (props.boardState === "gameover") {
        <div className="p-4">
            <div className="text-sm">
                {props.playerHasWon ? 'You have won' : 'Play again'}
            </div>
            <span className="mr-4">
                <button className="h-20 w-40 border-white border-2"
                    onClick={props.handleCreate}
                >
                    PLAY AGAIN
                </button>
            </span>
            <span className="ml-4">
                <button className="h-20 w-40 border-white border-2"
                    onClick={props.handleJoin}
                >
                    EXIT
                </button>
            </span>

        </div>

    } else if (props.boardState === "error") {
        children = (
            <div className="align-center">
                <div h-20 border-red border-2>{props.error}</div>
                <button className="h-10 w-20 text-sm bg-red text-white">CLOSE</button>
            </div>
        );
    }
    return (
        <div className="instruction-modal">
            {children}
        </div>
    );
}