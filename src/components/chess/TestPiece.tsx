'useclient';

import { Color, PieceSymbol } from "chess.js";
import { motion } from 'framer-motion';

interface TestPieceProps {
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
    playerIsWhite: boolean,
    handleClick: (squareId: number) => void,
}

export default function TestPiece(props: TestPieceProps) {

    return (
        <div
            className={`h-full w-full piece-${props.color}${props.symbol}`}
            onClick={() => props.handleClick(props.squareId)}
        />
    );
}