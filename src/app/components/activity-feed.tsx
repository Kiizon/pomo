"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { fetchRecentSessions, fetchTodayTotalMinutes, type SessionRow } from "@/lib/sessions"
import { useAuth } from "@/components/auth-provider"
import { sessionUpdated } from "@/lib/events"

export function ActivityFeed() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadSessions = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const [recentSessions, totalMins] = await Promise.all([
        fetchRecentSessions(20),
        fetchTodayTotalMinutes()
      ])
      setSessions(recentSessions)
      setTodayTotal(totalMins)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSessionTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatSessionDate = (isoString: string) => {
    const date = new Date(isoString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  useEffect(() => {
    loadSessions()
    
    // Subscribe to session updates
    const unsubscribe = sessionUpdated.subscribe(() => {
      loadSessions()
    })
    
    return unsubscribe
  }, [user])

  return (
    <Card className="shadow-lg h-[400px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Sessions</CardTitle>
          {todayTotal > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {todayTotal} min today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No sessions yet. Complete a Pomodoro to get started!
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session.kind === 'work' ? 'Pomodoro' : 'Break'} Session
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSessionDate(session.started_at)} at {formatSessionTime(session.started_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {session.duration_min} min
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}