'use client';

import { Chess } from "chess.js";

import BoardSquare from "./BoardSquare";
import { useState } from "react";
import TestPiece from "./TestPiece";
import { algebraic, tosquareid } from "../../lib/chess/board";

let chess = new Chess();
let playerIsWhite = true;

chess.board();
export default function TestBoard({ chessMove }: { chessMove: string }) {

    console.log(chessMove);
    const [squareId, setSquareId] = useState<number>(0);

    function handleClick(squareId: number) {
        console.log('square got clicked');
        setSquareId(squareId);
    }

    // position squares in a grid
    let squares: JSX.Element[] = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let squareId = (i << 4) | j;
            squares.push(
                <BoardSquare key={squareId}
                    squareId={squareId}
                    squareState={"empty"}
                    playerIsWhite={playerIsWhite}
                    handleClick={handleClick}
                />
            );
        }
    }

    // let pieces: JSX.Element[] = [];
    let styles: React.CSSProperties = {}

    let i = squareId >> 4;
    let j = squareId & 0xf;

    styles = {
        left: `calc(${j} * var(--square-len))`,
        top: `calc(${i} * var(--square-len))`,
    }

    let piece = (
        <div key={'black-knight'}
            style={styles}
            className="piece-container absolute">
            <TestPiece
                squareId={squareId}
                symbol={'n'}
                color={'b'}
                playerIsWhite={true}
                handleClick={handleClick}
            />
        </div>
    )

    return (
        <div className='board-container board-white relative m-auto 
                box-content border-solid border-2 border-gray-700'
        >
            {squares}
            {piece}
        </div>
    )
}