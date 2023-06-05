import { Piece } from "chess.js";

export type SquareState = "empty" | "selected" | "target" | "attackable"

interface BoardSquareProps {
    squareId: number,
    playerIsWhite: boolean,
    squareState: SquareState,

    handleClick: (sqaureId: number) => void,
}

// conver 0x88 squareId to algebraic notation
function algebraic(squareId: number): string {
    const f = squareId & 0xf;
    const r = squareId >> 4;
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}

export default function BoardSquare(props: BoardSquareProps) {

    let children: any = null;
    if (props.squareState === "selected") {
        children = (
            <div className="h-full w-full bg-green-500">
            </div>
        )
    } else if (props.squareState === "target") {
        children = (
            <div className="h-full w-full square-target">
            </div>
        )
    } else if (props.squareState === "attackable") {
        children = (
            <div className="h-full w-full square-attackable">
            </div>
        )
    }

    return (
        <div className={`square ${algebraic(props.squareId)}`}
            onClick={() => props.handleClick(props.squareId)}
        >
            {children}
        </div>
    )
}