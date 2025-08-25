"use client";
import { PomodoroTimer } from "./components/pomodoro-timer";
import { ActivityFeed } from "./components/activity-feed"
import { PomodoroHeatmap } from "./components/pomodoro-heatmap"
export default function HomePage() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pomodoro Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your productivity with the Pomodoro technique</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>
          <div className="md:col-span-2">
            <ActivityFeed />
          </div>
        </div>

        <div className="mt-8">
          <PomodoroHeatmap />
        </div>
      </div>
    </div>
  );
}
