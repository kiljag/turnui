'use client';

import Board from './Board';
import { Provider } from 'react-redux';
import {store} from '../redux/store';
import app from '../lib/chess/app';
import VideoBar from './VideoBar';
import { useEffect } from 'react';
import MovesArea from './MovesArea';
import ChatBox from './ChatBox';

export default function ChessApp() {

    function handleMove(from: string, to: string) {
        let move: string = from + to;
        // console.log(move);
        app.makeChessMove(move);
    }

    function closeLocalStream() {
        console.log('closing local stream');
        app.closeLocalStream();
    }

    useEffect(() => {
        setTimeout(() => {
            app.startLocalStream();
        }, 500);

        return () => {
            closeLocalStream();
        }
    }, []);

    return (
        <Provider store={store}>
            <div className='w-full h-full items-center'>

                <div className='flex flex-row justify-around bg-gray-900'>
                    <div className='mt-2'>
                        <VideoBar />
                    </div>
                </div>

                <div className='m-atuo'>
                    <div className='flex flex-row justify-center m-auto'>
                        <MovesArea />
                        <Board handleMove={handleMove} />
                        <ChatBox />
                    </div>
                </div>

            </div>
        </Provider>
    );
}