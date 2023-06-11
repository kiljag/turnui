'use client';

import ChessApp from "@/components/chess/ChessApp";
import NavBar from "@/components/util/NavBar";
import app from '@/lib/chess/app';
import { useEffect, useState } from "react";
import TestBoard from "@/components/chess/TestBoard";
import { useTime } from "framer-motion";

export default function ChessPage() {

  const [disabled, setDisabled] = useState(false);

  // useEffect(() => {
  //   app.closeLocalStream();
  // }, []);

  function handleClick() {
    console.log('button clicked');
    setDisabled(true);
  }

  return (
    <div className="">
      {/* <NavBar title="Play Chess" />
      <ChessApp /> */}
      <div className="pt-4">

      </div>
      <div className="m-auto">
        <button onClick={handleClick} disabled={disabled}>PLAY</button>
      </div>
    </div>
  );
}
