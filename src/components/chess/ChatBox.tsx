import { ChessState } from "@/lib/chess/slice";
import { connect } from "react-redux";

interface ChatBoxProps {
    chatMessages: string[],
}

const mapStateToProps = function (state: ChessState) {
    return {
        chatMessages: state.chatMessages
    }
}

function ChatBox(props: ChatBoxProps) {
    let children: any[];

    return (
        <div className="h-12 w-6">
            This is chat area
        </div>
    )
}

export default connect(mapStateToProps)(ChatBox);