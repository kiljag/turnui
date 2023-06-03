'use client';

import { PieceMap, getPieceMap } from '@/lib/chess/piece';
import { Chess, Square } from 'chess.js';
import BoardPiece from './BoardPiece';
import BoardSquare, { SquareState } from './BoardSquare';
import { ChessState } from '@/lib/chess/slice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { connect } from 'react-redux';
import Instruction from './Instruction';
import * as chessSlice from '@/lib/chess/slice';

// conver 0x88 squareId to algebraic notation
function algebraic(squareId: number): string {
    const f = squareId & 0xf;
    const r = squareId >> 4;
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}

interface BoardProps {
    chess: Chess,
    pieceMap: PieceMap,
    playerIsWhite: boolean,
    boardState: string,
    roomId: string,
    playerHasWon: boolean,
    error: string,
    handleMove: (from: string, to: string) => void,
}

const mapStateToProps = function (state: ChessState) {
    return {
        chess: state.chess,
        pieceMap: state.pieceMap,
        playerIsWhite: state.playerIsWhite,
        boardState: state.boardState,
        roomId: state.roomId,
        playerHasWon: state.playerHasWon,
        error: state.error,
    }
}

function Board(props: BoardProps) {

    const [selected, setSelected] = useState<number>(-1);
    const [targetSquares, setTargetSquares] = useState<{ [squareId: number]: boolean }>({});
    const dispatch = useDispatch();

    function handleJoinRoom() {

    }

    function handlePlayAgain() {

    }

    function handleCloseError() {
        console.log('closing error popup');
    }

    function handleClick(squareId: number) {
        // player check
        if (props.playerIsWhite !== (props.chess.turn() === 'w')) {
            return;
        }

        // check if the selected square is legal
        if (selected < 0) {
            let isLegal = false;
            let moves = props.chess._moves();
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].from === squareId) {
                    isLegal = true;
                    break;
                }
            }
            if (!isLegal) return;

            // select the target squares for the selected piece
            let square = algebraic(squareId);
            let pieceMoves = props.chess._moves({ square: square as Square });
            let targetSquares: { [squareId: number]: boolean } = {}
            for (let i = 0; i < pieceMoves.length; i++) {
                targetSquares[pieceMoves[i].to] = true;
            }
            setSelected(squareId);
            setTargetSquares(targetSquares);

        } else { // about to move
            if (!targetSquares[squareId]) {
                setSelected(-1);
                setTargetSquares({});
                return;
            }

            // make a move
            setSelected(-1);
            setTargetSquares({});
            props.handleMove(algebraic(selected), algebraic(squareId));
        }
    }

    let squares: JSX.Element[] = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let squareId = (i << 4) | j;
            if (!props.playerIsWhite) {
                squareId = ((7 - i) << 4) | (7 - j);
            }
            let squareState: SquareState = "empty";
            if (selected == squareId) {
                squareState = "selected";
            } else if (targetSquares[squareId]) {
                if (props.pieceMap[squareId] && (props.pieceMap[squareId].color === (props.playerIsWhite ? 'b' : 'w'))) {
                    squareState = "attackable";
                } else {
                    squareState = "target";
                }
            }
            squares.push(
                <BoardSquare key={squareId}
                    squareId={squareId}
                    squareState={squareState}
                    playerIsWhite={true}
                    handleClick={handleClick}
                />
            );
        }
    }

    let pieces: JSX.Element[] = [];
    for (let squareId in props.pieceMap) {
        let piece = props.pieceMap[squareId];
        let i = piece.squareId >> 4;
        let j = piece.squareId & 0xf;
        let styles: React.CSSProperties = {
            left: ((props.playerIsWhite ? j : 7 - j) * 80) + 'px',
            top: ((props.playerIsWhite ? i : 7 - i) * 80) + 'px',
        };
        pieces.push(
            <BoardPiece key={squareId}
                squareId={piece.squareId}
                symbol={piece.symbol}
                color={piece.color}
                playerIsWhite={true}
                styles={styles}
                handleClick={handleClick}
            />
        );
    }

    return (
        <div className='board-container'>
            <div className='board'>
                {props.boardState === 'playing' ||
                    <Instruction />
                }
                {squares}
                {pieces}
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(Board);
