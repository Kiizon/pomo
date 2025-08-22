"use client";

import { useState, useEffect } from "react";


type Phase  = "Pomodoro" | "Short Break" | "Long Break";

interface TimerCardProps {
    phase: Phase;
    seconds?: number;
    onDone?: () => void;
}


export default function TimerCard({ seconds, phase, onDone }: TimerCardProps) {

    const phaseTimerDefault = (p: Phase) =>
        p === "Pomodoro" ? 25* 60 : p === "Short Break" ? 5 * 60 : 15*60;
    
    const effectiveSeconds = seconds ?? phaseTimerDefault(phase);

    const [isRunning, setIsRunning] = useState(false);
    const [remaining, setRemaining] = useState(seconds ?? effectiveSeconds);

    // Reset timer when phase/seconds changes
    useEffect(() => {
        setRemaining(effectiveSeconds);
        setIsRunning(false);
    }, [phase,effectiveSeconds]);

    // Tick when is running and remaining is greater than 0
    useEffect(() => {
      if (!isRunning)
        return;
      if (remaining <= 0) { 
        setIsRunning(false);
        onDone?.(); 
        return; 
      }
        // Update remaining time every second
        const id = setInterval(() => setRemaining(time => time - 1), 1000);
        return () => clearInterval(id);
    }, [remaining, onDone, isRunning]);
  
    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
  
    return (
      <div className="rounded-2xl p-6 shadow w-64 text-center">
        <div className="flex justify-center gap-4 mb-2">
            <div className="text-sm opacity-70">Pomodoro</div>
            <div className="text-sm opacity-70">Short Break</div>
            <div className="text-sm opacity-70">Long Break</div>
        </div>
        <div className="text-5xl font-semibold my-3">{mm}:{ss}</div>
        <button className="mt-2 px-3 py-2 rounded bg-black text-white" onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>
    );
  }
