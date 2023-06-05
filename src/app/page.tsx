
import ChessApp from "@/components/chess/ChessApp";
import NavBar from "@/components/util/NavBar";

export default function Home() {

  return (
    <div className="">
      <NavBar title="Chess" />
      <ChessApp />
    </div>

  );
}
