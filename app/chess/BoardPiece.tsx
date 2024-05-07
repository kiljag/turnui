'use client';

import { Color, PieceSymbol } from "chess.js";
import { motion } from 'framer-motion';

interface BoardPieceProps {
    squareId: number,
    symbol: PieceSymbol,
    color: Color,
    playerIsWhite: boolean,
    initial: any,
    animate: any,
    handleClick: (squareId: number) => void,
}

export default function BoardPiece(props: BoardPieceProps) {

    return (
        <motion.div
            className={`piece piece-${props.color}${props.symbol}`}
            onClick={() => props.handleClick(props.squareId)}
            initial={props.initial}
            animate={props.animate}
            transition={{ duration: 0.5 }}
        >
        </motion.div>
    );
}