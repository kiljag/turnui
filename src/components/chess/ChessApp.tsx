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
        setTimeout(() => {
            setupLocalStream();
        }, 1000);
    })

    return (
        <Provider store={store}>
            <div className='w-full h-full items-center'>

                <div className='flex-container bg-gray-900'>
                    <div></div>
                    <div className='mt-2'>
                        <VideoBar />
                    </div>
                    <div></div>
                </div>

                <div className='flex-container'>
                    <div>
                        <div className='flex flex-row-reverse'>
                            <div className='mr-10'>
                                <MovesArea />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='board-root bg-gray-900'>
                            <Board handleMove={handleMove} />
                        </div>
                    </div>
                    <div>
                        <div className='flex flex-row'>
                            <div className='ml-10'>
                                <ChatBox />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Provider>
    );
}