'use client';

import ChessApp from "@/app/chess/ChessApp";
import app from '@/app/lib/chess/app';
import NavBar from "@/app/components/NavBar";
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
