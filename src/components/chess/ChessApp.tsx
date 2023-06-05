'use client';

import Board from './Board';
import { Provider } from 'react-redux';
import store from '@/lib/store';
import VideoBar from './VideoBar';
import { makeChessMove } from '@/lib/chess/wsocket';
import { useEffect } from 'react';
import { setupLocalStream } from '@/lib/chess/wsocket';
import MovesArea from './MovesArea';
import ChatBox from './ChatBox';

export default function ChessApp() {

    function handleMove(from: string, to: string) {
        let move: string = from + to;
        console.log(move);
        makeChessMove(move);
    }

    useEffect(() => {
        setupLocalStream();
    })

    return (
        <Provider store={store}>
            <div className='w-full h-full items-center'>
                <VideoBar />
                <div className='w-full flex items-center'>
                    <div className='m-auto p-4'>
                        <Board handleMove={handleMove} />
                    </div>

                    {/* <div className='m-auto p-4 items-center'> */}
                    {/* <MovesArea /> */}
                    {/* <ChatBox /> */}
                    {/* </div> */}
                </div>
            </div>
        </Provider>
    );
}