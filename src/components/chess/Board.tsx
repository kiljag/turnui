'use client';

import { PieceMap, getPieceMap } from '@/lib/chess/piece';
import { Chess, Square } from 'chess.js';
import BoardPiece from './BoardPiece';
import BoardSquare, { SquareState } from './BoardSquare';
import { ChessState } from '@/lib/chess/slice';
import { useState } from 'react';
import { connect } from 'react-redux';
import ChessModal from './ChessModal';
import app from '@/lib/chess/app';
import { init } from 'next/dist/compiled/@vercel/og/satori';

// conver 0x88 squareId to algebraic notation
function algebraic(squareId: number): string {
    const f = squareId & 0xf;
    const r = squareId >> 4;
    return ('abcdefgh'.substring(f, f + 1) +
        '87654321'.substring(r, r + 1));
}

function tosquareid(id: string): number {
    const r = '87654321'.indexOf(id[1]);
    const f = 'abcdefgh'.indexOf(id[0]);
    return (r << 4 | f);
}

interface BoardProps {
    chessMoves: string[],
    playerIsWhite: boolean,
    boardState: string,
    roomId: string,
    playerHasWon: boolean,
    handleMove: (from: string, to: string) => void,
}

const mapStateToProps = function (state: ChessState) {
    return {
        // chess: state.chess,
        chessMoves: state.chessMoves,
        playerIsWhite: state.playerIsWhite,
        boardState: state.boardState,
        roomId: state.roomId,
        playerHasWon: state.playerHasWon,
    }
}

function Board(props: BoardProps) {

    const [selected, setSelected] = useState<number>(-1);
    const [targetSquares, setTargetSquares] = useState<{ [squareId: number]: boolean }>({});
    let pieceMap = getPieceMap(app.chess);
    if (props.boardState !== "playing") {
        pieceMap = {};
    }

    function handleClick(squareId: number) {
        if (props.boardState !== "playing") {
            console.error('board is not in playing state');
            return;
        }

        // player check
        if (props.playerIsWhite !== (app.chess.turn() === 'w')) {
            return;
        }

        // check if the selected square is legal
        if (selected < 0) {
            let isLegal = false;
            let moves = app.chess._moves();
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].from === squareId) {
                    isLegal = true;
                    break;
                }
            }
            if (!isLegal) return;

            // select the target squares for the selected piece
            let square = algebraic(squareId);
            let pieceMoves = app.chess._moves({ square: square as Square });
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

            let moves = app.chess.history({ verbose: true });
            if (moves.length > 0) {
                let move = moves[moves.length - 1];
                if ((move.from as string) === (algebraic(squareId))) {
                    squareState = "fromsquare";
                } else if ((move.to as string) === (algebraic(squareId))) {
                    squareState = "tosquare";
                }
            }

            // see if there is a check
            if (app.chess.isCheck() && pieceMap[squareId] && pieceMap[squareId].symbol === 'k') {
                if (app.chess.turn() === pieceMap[squareId].color) {
                    squareState = "ischeck";
                }
            }

            if (selected == squareId) {
                squareState = "selected";
            } else if (targetSquares[squareId]) {
                if (pieceMap[squareId] &&
                    (pieceMap[squareId].color === (props.playerIsWhite ? 'b' : 'w'))) {
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
    let history = app.chess.history({ verbose: true });

    for (let squareId in pieceMap) {
        let piece = pieceMap[squareId];
        let i = piece.squareId >> 4;
        let j = piece.squareId & 0xf;
        let target: any = {
            x: ((props.playerIsWhite ? j : 7 - j) * 80) + 'px',
            y: ((props.playerIsWhite ? i : 7 - i) * 80) + 'px',
        };
        let initial = target;

        if (history.length == 0) {
            initial = {
                x: '280px',
                y: '280px',
            }
        }

        if (history.length > 0) { // animate
            let move = history[history.length - 1];
            if ((move.to as string) === algebraic(piece.squareId)) {
                let from = tosquareid(move.from as string);
                i = from >> 4;
                j = from & 0xf;
                initial = {
                    x: ((props.playerIsWhite ? j : 7 - j) * 80) + 'px',
                    y: ((props.playerIsWhite ? i : 7 - i) * 80) + 'px',
                }
            }
        }
        let animate = target;
        pieces.push(
            <BoardPiece key={squareId}
                squareId={piece.squareId}
                symbol={piece.symbol}
                color={piece.color}
                playerIsWhite={true}
                handleClick={handleClick}
                initial={initial}
                animate={animate}
            />
        );
    }

    return (
        <div className='board-root bg-gray-900'>
            <div className='board-container bg-gray-800 m-auto'>
                <div className={`board ${props.playerIsWhite ? 'board-white' : 'board-black'}`}>
                    {props.boardState === 'playing' || <ChessModal />}
                    {squares}
                    {pieces}
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(Board);
