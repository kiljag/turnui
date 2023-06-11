'use client';

import { useState } from "react";
import TestBoard from "./TestBoard"
let chessMoves = ["init", "f2f3", "e7e6", "g2g4", "d8h4"];

export default function TestApp() {

    const [idx, setIdx] = useState<number>(0);

    function handleClick() {
        if (idx < chessMoves.length - 1) {
            setIdx(idx + 1);
        }
    }

    return (
        <div className="pt-4">
            <div className="">
                <TestBoard chessMove={chessMoves[idx]} />
            </div>
            <div className="ml-[50%] mt-[5px]">
                <button className="bg-black text-white absolute m-auto"
                    onClick={handleClick}
                >
                    NEXT
                </button>
            </div>
        </div>
    )
}