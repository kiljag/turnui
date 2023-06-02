import { Piece } from "chess.js";

interface BoardSquareProps {
    squareId: number,
    playerIsWhite: boolean,

    handleClick: (sqaureId: number) => void,

}

export default function BoardSquare(props: BoardSquareProps) {

    return (
        <div className="square"
            onClick={() => props.handleClick(props.squareId)}
        >
        </div>
    )
}