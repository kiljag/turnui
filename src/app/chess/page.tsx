'use client';

import ChessApp from "@/components/chess/ChessApp";
import NavBar from "@/components/util/NavBar";
import app from '@/lib/chess/app';
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    app.closeLocalStream();
  }, []);

  return (
    <div className="">
      <NavBar title="Play Chess" />
      <ChessApp />
    </div>
  );
}
