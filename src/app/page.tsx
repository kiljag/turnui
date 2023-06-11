
import ChessLogo from "@/components/home/ChessLogo";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/util/NavBar";
import TestBoard from "@/components/chess/TestBoard";
import TestApp from "@/components/chess/TestApp";
import ChessApp from "@/components/chess/ChessApp";



export default function Home() {

    return (
        <div>
            <ChessApp />
        </div>
    );
}
