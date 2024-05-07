'use client';

import { ChatMessage, ChessState, selectChatMessages, selectRoomCreated } from "@/app/redux/chessSlice";
import { useState } from "react";
import { connect } from "react-redux";
import app from "@/app/lib/chess/app";
import Image from "next/image";
import { useSelector } from "react-redux";

import whitePawn from '@/app/assets/sprites/wp.png';
import blackPawn from '@/app/assets/sprites/bp.png';
import { useAppSelector } from "../redux/hooks";

export default function ChatBox() {

    const [message, setMessage] = useState<string>("");
    const roomCreated = useAppSelector(selectRoomCreated);
    const chatMessages = useAppSelector(selectChatMessages);

    function sendMessage() {
        if (message !== undefined && message !== "") {
            app.sendChatMessage(message);
            setMessage("");
        }
    }

    function hanldeTextChange(e: any) {
        let message = e.target.value as string;
        if (message !== undefined && message !== "" && message[message.length - 1] == "\n") {
            sendMessage();
        } else {
            setMessage(e.target.value);
        }
    }

    function handleClick() {
        sendMessage();
    }

    let children: any[] = [];
    for (let i = chatMessages.length - 1; i >= 0; i--) {
        children.push(
            <div key={chatMessages[i].chatId}
                className="flex flex-row items-center mb-2 p-2 bg-gray-800 rounded-xl">
                <div className="h-10 w-10 shrink-0">
                    <Image src={app.userId == chatMessages[i].userId ? whitePawn : blackPawn} alt="uer-avatar" />
                </div>
                <div className="text-base text-white">
                    {chatMessages[i].message}
                </div>
            </div>
        );
    }

    return (
        <div className="chat-box m-auto mt-2 p-4 bg-gray-900 rounded-xl">
            <div className="flex flex-col justify-between h-full">
                <div className="chat-messages flex flex-col-reverse overflow-auto scrollbar-hide">
                    {children}
                </div>
                {roomCreated ? (
                    <div className="">
                        <div className="flex">
                            <div className="h-12 w-10/12 border border-gray-50">
                                <textarea className="h-11 m-auto w-full p-2 text-xl resize-none bg-gray-900 text-white"
                                    value={message}
                                    onChange={hanldeTextChange}
                                />

                            </div>
                            <div className="h-12 w-2/12">
                                <button className="h-12 w-full text-center text-xl text-white"
                                    onClick={handleClick}
                                >
                                    send
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null
                }
            </div>
        </div >
    )
}
