
interface VideoBarProps {
    opponentJoined: boolean,
}

export default function VideoBar(props: VideoBarProps) {
    return (
        <div className="video-bar">
            <div className="video-container">
                <video id="player1" playsInline />
            </div>
            {props.opponentJoined &&
                <div className="video-container">
                    <video id="player2" playsInline />
                </div>
            }
        </div>
    )
}