"use client";
import TimerCard from "./components/TimerCard";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pomodoro</h1>
      <TimerCard phase="Short Break" onDone={() => console.log("done")} />
    </main>
  );
}
