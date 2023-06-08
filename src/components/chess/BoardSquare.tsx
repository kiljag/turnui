import { Piece } from "chess.js";
import classNames from "classnames";

export type SquareState = "empty" | "selected" | "target" | "attackable" | "fromsquare" | "tosquare" | "ischeck";

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

    let children: any = (
        <div className={
            classNames('h-full w-full', {
                'square-target': props.squareState === 'target',
                'square-attackable': props.squareState === "attackable",
                'bg-yellow-400': props.squareState === 'fromsquare',
                'bg-green-400': props.squareState === 'tosquare',
                'bg-red-500': props.squareState === 'ischeck',
                'bg-green-600': props.squareState === 'selected',
            })
        } />
    );

    return (
        <div className={`square ${algebraic(props.squareId)}`}
            onClick={() => props.handleClick(props.squareId)}
        >
            {children}
        </div>
    )
}