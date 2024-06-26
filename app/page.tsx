import ChessLogo from "./components/ChessLogo";
import Image from "next/image";
import Link from "next/link";
import NavBar from "./components/NavBar";

export default function Home() {
    return (
        <div className="w-full">
            <NavBar title="Turn Games" />
            <div className="m-auto mt-10">
                <Link href="/chess">
                    <ChessLogo />
                </Link>
            </div>
        </div>
    );
}
