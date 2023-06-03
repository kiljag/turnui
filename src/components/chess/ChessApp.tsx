'use client';

import Board from './Board';
import { Provider } from 'react-redux';
import store from '@/lib/store';
import VideoBar from './VideoBar';
import { makeChessMove } from '@/lib/chess/wsocket';

export default function ChessApp() {

    function handleMove(from: string, to: string) {
        let move: string = from + to;
        console.log(move);
        makeChessMove(move);
    }

    return (
        <Provider store={store}>
            <div className='chess-app'>
                <VideoBar opponentJoined={false} />
                <Board
                    handleMove={handleMove}
                />
            </div>
        </Provider>
    );
}