"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Trophy, Zap } from "lucide-react"

type ActivityItem = {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
  }
  type: "completed" | "milestone" | "streak"
  count?: number
  timestamp: Date
  message: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  // mock data for friend feed
  const generateMockActivities = (): ActivityItem[] => {
    const users = [
      { name: "six seven", avatar: "", initials: "67" },
      { name: "Joseph Huang", avatar: "", initials: "JH" },
      { name: "Kish Dizon", avatar: "", initials: "KD" },
      { name: "Skibidi Toilet", avatar: "", initials: "ST" },
      { name: "Hamed Joseph", avatar: "", initials: "HJ" },
    ]

    const activities: ActivityItem[] = []
    const now = new Date()

    // gen random feed acitivity
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const hoursAgo = Math.floor(Math.random() * 24)
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

      const activityType = Math.random()

      if (activityType < 0.6) {
        activities.push({
          id: `activity-${i}`,
          user,
          type: "completed",
          timestamp,
          message: `${user.name} completed a pomodoro!`,
        })
      } else if (activityType < 0.8) {
        const count = Math.floor(Math.random() * 10) + 2
        activities.push({
          id: `activity-${i}`,
          user,
          type: "milestone",
          count,
          timestamp,
          message: `${user.name} completed their ${count}${getOrdinalSuffix(count)} pomodoro today!`,
        })
      } else {
        const streakDays = Math.floor(Math.random() * 7) + 3
        activities.push({
          id: `activity-${i}`,
          user,
          type: "streak",
          count: streakDays,
          timestamp,
          message: `${user.name} is on a ${streakDays}-day streak!`,
        })
      }
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return "st"
    if (j === 2 && k !== 12) return "nd"
    if (j === 3 && k !== 13) return "rd"
    return "th"
  }

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "completed":
        return <Clock className="h-4 w-4 text-green-500" />
      case "milestone":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "streak":
        return <Zap className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Completed
          </Badge>
        )
      case "milestone":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Milestone
          </Badge>
        )
      case "streak":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Streak
          </Badge>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    const mockActivities = generateMockActivities()
    setActivities(mockActivities)
  }, [])

  return (
    <Card className="shadow-lg h-[400px]">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.message}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(activity.timestamp)}</span>
                  {getActivityBadge(activity.type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}