import { Piece } from "chess.js";
import classNames from "classnames";



interface BoardSquareProps {
    squareId: number,
    playerIsWhite: boolean,
    squareState: string,
    handleClick: (sqaureId: number) => void,
}


export default function BoardSquare(props: BoardSquareProps) {

    return (
        <div className={classNames('h-full w-full', {
            'square-target': props.squareState === 'target',
            'square-attackable': props.squareState === "attackable",
            'square-is-from': props.squareState === 'fromsquare',
            'square-is-to': props.squareState === 'tosquare',
            'square-is-check': props.squareState === 'ischeck',
            'square-selected': props.squareState === 'selected',
        })}
            onClick={() => props.handleClick(props.squareId)}
        />
    )
}