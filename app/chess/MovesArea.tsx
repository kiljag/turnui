'use client';

import { selectChessMoves } from "@/app/redux/chessSlice";
import { useAppSelector } from "../redux/hooks";

function MovesArea() {

    const moves = useAppSelector(selectChessMoves);

    let children: any[] = [];
    for (let i = 0; i < moves.length; i++) {
        children.push(
            <span key={i}
                className="text-xl m-1 rounded-xl bg-gray-800 text-white text-center" >
                {moves[i]}
            </span>
        );
    }

    return (
        <div className="moves-area m-auto mt-2 p-4 bg-gray-900 rounded-xl">
            <div className="moves-box">
                {children}
            </div>
        </div>
    )
}

export default MovesArea;