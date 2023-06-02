'use client';

import { PieceMap, getPieceMap } from '@/lib/chess/piece';
import { Chess } from 'chess.js';
import BoardPiece from './BoardPiece';
import BoardSquare from './BoardSquare';
import { ChessState } from '@/lib/chess/slice';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { connect } from 'react-redux';
import Instruction from './Instruction';
import { createRoom, joinRoom } from '@/lib/chess/slice';

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
    handleMove: (move: string) => void,
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

    const dispatch = useDispatch();

    console.log(props);

    function handleCreateRoom() {
        console.log('creating room');
        dispatch(createRoom());
    }

    function handleJoinRoom() {
        console.log('joining room');
    }

    function handleCloseError() {
        console.log('closing error popup');
    }

    function handleClick(squareId: number) {
        console.log('clicked : ', squareId);
    }

    let squares: JSX.Element[] = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let squareId = (i << 4) | j;
            if (!props.playerIsWhite) {
                squareId = ((7 - i) << 4) | (7 - j);
            }
            squares.push(
                <BoardSquare key={squareId}
                    squareId={squareId}
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
                    <Instruction
                        error={props.error}
                        boardState={props.boardState}
                        roomId={props.roomId}
                        playerHasWon={props.playerHasWon}
                        handleCreate={handleCreateRoom}
                        handleJoin={handleJoinRoom}
                        handleCloseError={handleCloseError}
                    />
                }
                {squares}
                {pieces}
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(Board);