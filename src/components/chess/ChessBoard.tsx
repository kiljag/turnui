'use client';

import BoardPiece from './BoardPiece';
import BoardSquare from './BoardSquare';
import { ChessState } from '@/lib/chess/slice';
import { connect } from 'react-redux';
import app from '@/lib/chess/app';
import { BoardInfo, ChessPiece, ChessSquare } from '@/lib/chess/board';
import classNames from 'classnames';


interface BoardProps {
    squares: ChessSquare[],
    pieces: ChessPiece[],
    playerIsWhite: boolean,
}

const mapStateToProps = function (state: ChessState) {
    return {
        squares: state.squares,
        pieces: state.pieces,
        playerIsWhite: state.playerIsWhite,
    }
}

function Board(props: BoardProps) {

    console.log(props.squares);
    console.log(props.pieces);

    function handleClick(squareId: number) {
        console.log('clicked', squareId);
        app.handleClick(squareId);
    }

    let squares: JSX.Element[] = [];
    let pieces: JSX.Element[] = [];

    if (props.squares !== undefined) {

        for (let square of props.squares) {
            let i = square.squareId >> 4;
            let j = square.squareId & 0xf;
            let styles: React.CSSProperties = {
                left: `calc(${props.playerIsWhite ? j : 7 - j} * var(--square-len))`,
                top: `calc(${props.playerIsWhite ? i : 7 - i} * var(--square-len))`,
            }
            squares.push(
                <div key={`square-${square.key}`}
                    className={`absolute square-container ${square.key}`}
                    style={styles}
                >
                    <BoardSquare
                        squareId={square.squareId}
                        playerIsWhite={props.playerIsWhite}
                        squareState={square.squareState}
                        handleClick={handleClick}
                    />
                </div>
            )
        }
    }

    if (props.pieces !== undefined) {

        for (let piece of props.pieces) {
            let i = piece.squareId >> 4;
            let j = piece.squareId & 0xf;
            let styles: React.CSSProperties = {
                left: `calc(${props.playerIsWhite ? j : 7 - j} * var(--square-len))`,
                top: `calc(${props.playerIsWhite ? i : 7 - i} * var(--square-len))`,
            }
            squares.push(
                <div key={`piece-${piece.key}`}
                    className={`absolute piece-container ${piece.color}-${piece.symbol}`}
                    style={styles}
                >
                    <BoardPiece
                        squareId={piece.squareId}
                        symbol={piece.symbol}
                        color={piece.color}
                        handleClick={handleClick}
                    />
                </div>
            )
        }
    }

    return (
        <div className={classNames('relative board-container', {
            'board-white': props.playerIsWhite,
            'board-black': !props.playerIsWhite,
        })}>
            {squares}
            {pieces}
        </div>
    )
}

export default connect(mapStateToProps)(Board);
