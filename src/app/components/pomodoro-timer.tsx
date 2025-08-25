"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export function PomodoroTimer() {
  const [activeTab, setActiveTab] = useState("pomodoro")
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [progress, setProgress] = useState(100)

  const durations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = useCallback(() => {
    const totalDuration = durations[activeTab as keyof typeof durations]
    return (timeLeft / totalDuration) * 100
  }, [timeLeft, activeTab, durations])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(durations[activeTab as keyof typeof durations])
    setProgress(100)
  }, [activeTab, durations])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsActive(false)
    setTimeLeft(durations[value as keyof typeof durations])
    setProgress(100)
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const completePomodoro = () => {
    if (activeTab === "pomodoro") {
      toast("Pomodoro completed! Great job! Take a break now.")
    }

    // Auto switch to break after pomodoro
    if (activeTab === "pomodoro") {
      handleTabChange("shortBreak")
    } else {
      resetTimer()
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
        setProgress(calculateProgress())
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      completePomodoro()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, calculateProgress])

  return (
    <Card className="shadow-lg h-[400px]">
      <CardHeader>
        <CardTitle className="text-center">Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
          <TabsContent value="pomodoro" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-bold mb-6">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </TabsContent>
          <TabsContent value="shortBreak" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-bold mb-6">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </TabsContent>
          <TabsContent value="longBreak" className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-bold mb-6">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button variant="outline" size="icon" onClick={resetTimer}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="lg" onClick={toggleTimer} className={isActive ? "bg-red-500 hover:bg-red-600" : ""}>
          {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isActive ? "Pause" : "Start"}
        </Button>

      </CardFooter>
    </Card>
  )
}
