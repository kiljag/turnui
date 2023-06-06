import { ChessState } from "@/lib/chess/slice";
import { connect } from "react-redux";


interface MovesAreaProps {
    moves: string[],
}

const mapStateToProps = function (state: ChessState) {
    return {
        moves: state.chessMoves,
    }
}

function MovesArea(props: MovesAreaProps) {
    let children: any[] = [];
    for (let i = 0; i < props.moves.length; i++) {
        children.push(
            <span key={i}
                className="text-xl m-1 rounded-xl bg-gray-800 text-white text-center" >
                {props.moves[i]}
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

export default connect(mapStateToProps)(MovesArea);