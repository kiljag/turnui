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
    let children: any;
    for (let i = 0; i < props.moves.length; i++) {
        children.push(
            <div key={i}>
                {props.moves[i]}
            </div>
        );
    }

    return (
        <div className="moves-area h-12 w-4">
            This is moves area
            {children}
        </div>
    )
}

export default connect(mapStateToProps)(MovesArea);