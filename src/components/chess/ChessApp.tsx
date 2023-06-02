'use client';

import Board from './Board';
import { Provider } from 'react-redux';
import store from '@/lib/store';
import VideoBar from './VideoBar';

export default function ChessApp() {

    function handleMove(move: string) {
        console.log(move);
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