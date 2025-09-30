"use client";
import { PomodoroTimer } from "./components/pomodoro-timer";
import { ActivityFeed } from "./components/activity-feed"
import { PomodoroHeatmap } from "./components/pomodoro-heatmap"
import { AuthHeader } from "@/components/auth-header";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center px-4 py-8">
        <div className="w-fit mb-8">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pomodoro Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your productivity with the Pomodoro technique</p>
              </div>
              <AuthHeader />
            </div>
          </header>

          {!user ? (
            <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <LogIn className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Sign in to get started</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in with Google to track your Pomodoro sessions and view your productivity stats.
              </p>
            </CardContent>
          </Card>
          ) : (
            <>
              <div className="flex gap-6 mb-6">
                <div className="w-80">
                  <PomodoroTimer />
                </div>
                <div className="flex-1">
                  <ActivityFeed />
                </div>
              </div>

              <PomodoroHeatmap />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
