'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from '@/lib/store';
import app from '@/lib/chess/app';
import ChessBoard from './ChessBoard';

export default function ChessApp() {

    useEffect(() => {
        app.testInit();
    }, []);

    return (
        <Provider store={store}>
            <ChessBoard />
        </Provider>
    );
}