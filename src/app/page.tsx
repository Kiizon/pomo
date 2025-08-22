"use client";
import { PomodoroTimer } from "./components/PomodoroTimer";

export default function HomePage() {

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pomodoro</h1>
      <PomodoroTimer />
    </main>
  );
}
