import { ChatMessage, ChessState } from "@/lib/chess/slice";
import { useState } from "react";
import { connect } from "react-redux";
import app from "@/lib/chess/app";
import Image from "next/image";

import whitePawn from '@/assets/sprites/wp.png';
import blackPawn from '@/assets/sprites/bp.png';

interface ChatBoxProps {
    roomCreated: boolean,
    chatMessages: ChatMessage[],
}

const mapStateToProps = function (state: ChessState) {
    return {
        roomCreated: state.roomCreated,
        chatMessages: state.chatMessages,
    }
}

function ChatBox(props: ChatBoxProps) {

    const [message, setMessage] = useState<string>("");

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
    for (let i = props.chatMessages.length - 1; i >= 0; i--) {
        children.push(
            <div key={props.chatMessages[i].chatId}
                className="flex flex-row items-center mb-2 p-2 bg-gray-800 rounded-xl">
                <div className="h-10 w-10 shrink-0">
                    <Image src={app.userId == props.chatMessages[i].userId ? whitePawn : blackPawn} alt="uer-avatar" />
                </div>
                <div className="text-base text-white">
                    {props.chatMessages[i].message}
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
                {props.roomCreated ? (
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

export default connect(mapStateToProps)(ChatBox);