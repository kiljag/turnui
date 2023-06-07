import Image from "next/image";
import chesslogo from '@/assets/logos/chess-logo.jpg';

export default function ChessLogo() {
    return (
        <div className="flex flex-row items-center h-32 w-96 box-content rounded-xl
                bg-violet-950 border-solid border-2 border-gray-50 m-auto">
            <div className="h-28 w-28 ml-2 shrink-0">
                <Image
                    className="rounded-xl max-h-full max-w-full"
                    src={chesslogo}
                    alt="chess logo"

                />
            </div>
            <div className="">
                <div className="text-gray-50 text-xl pl-2">Play Chess</div>
                <div className="text-gray-50  pl-2 pr-1 text-sm">
                    Invite your friend and play and enjoy your game
                </div>
            </div>
        </div>
    );
}