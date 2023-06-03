import { Piece } from "chess.js";

export type SquareState = "empty" | "selected" | "target" | "attackable"

interface BoardSquareProps {
    squareId: number,
    playerIsWhite: boolean,
    squareState: SquareState,

    handleClick: (sqaureId: number) => void,
}

export default function BoardSquare(props: BoardSquareProps) {

    let children: any = null;
    if (props.squareState === "selected") {
        children = (
            <div className="h-full w-full bg-green-700">
            </div>
        )
    } else if (props.squareState === "target") {
        children = (
            <div className="h-full w-full bg-gray-500 bg-gradient-radial">
            </div>
        )
    } else if (props.squareState === "attackable") {
        children = (
            <div className="h-full w-full bg-red-500">
            </div>
        )
    }

    return (
        <div className="square"
            onClick={() => props.handleClick(props.squareId)}
        >
            {children}
        </div>
    )
}