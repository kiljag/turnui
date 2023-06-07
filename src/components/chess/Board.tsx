'use client';

import { PieceMap, getPieceMap } from '@/lib/chess/piece';
import { Chess, Square, Move } from 'chess.js';
import BoardPiece from './BoardPiece';
import BoardSquare, { SquareState } from './BoardSquare';
import { ChessState } from '@/lib/chess/slice';
import { useState } from 'react';
import { connect } from 'react-redux';
import ChessModal from './ChessModal';

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
    chess: Chess,
    pieceMap: PieceMap,
    playerIsWhite: boolean,
    boardState: string,
    roomId: string,
    playerHasWon: boolean,
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
    }
}

function Board(props: BoardProps) {

    const [selected, setSelected] = useState<number>(-1);
    const [targetSquares, setTargetSquares] = useState<{ [squareId: number]: boolean }>({});

    function handleClick(squareId: number) {
        if (props.boardState !== "playing") {
            console.error('board is not in playing state');
            return;
        }

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
                if (props.pieceMap[squareId] &&
                    (props.pieceMap[squareId].color === (props.playerIsWhite ? 'b' : 'w'))) {
                    squareState = "attackable";
                } else {
                    squareState = "target";
                }
            }

            let moves = props.chess.history({ verbose: true });
            if (moves.length > 0) {
                let move = moves[moves.length - 1];
                if ((move.from as string) === (algebraic(squareId))) {
                    squareState = "fromsquare";
                } else if ((move.to as string) === (algebraic(squareId))) {
                    squareState = "tosquare";
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
    let moves = props.chess.history({ verbose: true });
    for (let squareId in props.pieceMap) {
        let piece = props.pieceMap[squareId];
        let i = piece.squareId >> 4;
        let j = piece.squareId & 0xf;
        let target: any = {
            x: ((props.playerIsWhite ? j : 7 - j) * 80) + 'px',
            y: ((props.playerIsWhite ? i : 7 - i) * 80) + 'px',
        };
        let initial = target;
        if (moves.length > 0) { // animate
            let move = moves[moves.length - 1];
            if ((move.to as string) === algebraic(piece.squareId)) {
                console.log(move.from);
                let from = tosquareid(move.from as string);
                i = from >> 4;
                j = from & 0xf;
                console.log(from, i, j);
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
        <div className='board-container bg-gray-800'>
            <div className={`board ${props.playerIsWhite ? 'board-white' : 'board-black'}`}>
                {props.boardState === 'playing' || <ChessModal />}
                {squares}
                {pieces}
            </div>
        </div>

    )
}

export default connect(mapStateToProps)(Board);
