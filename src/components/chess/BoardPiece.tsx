'useclient';

import { Color, PieceSymbol } from "chess.js";
import { motion } from 'framer-motion';

interface BoardPieceProps {
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
    handleClick: (squareId: number) => void,
}

export default function BoardPiece(props: BoardPieceProps) {

    return (
        <div
            className={`h-full w-full piece-${props.color}${props.symbol}`}
            onClick={() => props.handleClick(props.squareId)}
        />
    );
}