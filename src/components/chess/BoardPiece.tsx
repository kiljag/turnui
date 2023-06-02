'useclient';

import { Color, PieceSymbol } from "chess.js"

interface BoardPieceProps {
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
    playerIsWhite: boolean,
    styles: React.CSSProperties,
    handleClick: (squareId: number) => void,
}

export default function BoardPiece(props: BoardPieceProps) {

    return (
        <div className={`piece piece-${props.color}${props.symbol}`} style={props.styles}
            onClick={() => props.handleClick(props.squareId)}
        >
        </div>
    );
}