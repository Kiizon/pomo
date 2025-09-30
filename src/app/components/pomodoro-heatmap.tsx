"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiClient } from "@/lib/api-client"
import { sessionUpdated } from "@/lib/events"

type PomodoroDay = {
  date: string
  count: number
}

export function PomodoroHeatmap() {
  const [pomodoroData, setPomodoroData] = useState<PomodoroDay[]>([])
  const [maxCount, setMaxCount] = useState(0)
  const [totalPomodoros, setTotalPomodoros] = useState(0)

  const toLocalYYYYMMDD = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00") // noon to avoid TZ edge cases
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"
    const intensity = Math.ceil((count / Math.max(maxCount, 1)) * 4)
    switch (intensity) {
      case 1:
        return "bg-green-100 dark:bg-green-900"
      case 2:
        return "bg-green-300 dark:bg-green-700"
      case 3:
        return "bg-green-500 dark:bg-green-500"
      case 4:
        return "bg-green-700 dark:bg-green-300"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  const parseLocalYMD = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // month is 0-indexed in JS Date
  };


  const groupPomodorosByDay = useCallback((timestamps: string[]): PomodoroDay[] => {
    const days: Record<string, number> = {}
    const today = new Date()

    // last 365 local days with 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days[toLocalYYYYMMDD(d)] = 0
    }

    // count by local day
    for (const ts of timestamps) {
        let d: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(ts)) {
          // date-only string -> parse as local
          d = parseLocalYMD(ts);
        } else {
          d = new Date(ts);
        }
        const key = toLocalYYYYMMDD(d);
        if (key in days) days[key]++;
      }

    return Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])


  const buildColumns = (data: PomodoroDay[]) => {
    if (data.length === 0) return [] as (PomodoroDay | null)[][]
    const first = new Date(data[0].date + "T12:00:00")
    const jsDay = first.getDay() // Sun=0..Sat=6
    const mondayOffset = jsDay === 0 ? 6 : jsDay - 1 // 0 if Monday

    const padded: (PomodoroDay | null)[] = Array(mondayOffset).fill(null).concat(data)

    const numWeeks = Math.ceil(padded.length / 7)
    const cols: (PomodoroDay | null)[][] = []
    for (let w = 0; w < numWeeks; w++) {
      cols.push(padded.slice(w * 7, w * 7 + 7))
    }
    return cols
  }

  const computeMonthLabels = (columns: (PomodoroDay | null)[][]) => {
    return columns.map((col) => {
      const top = col.find(Boolean) as PomodoroDay | undefined
      if (!top) return ""
      const d = new Date(top.date + "T12:00:00")

      return d.getDate() <= 7 ? d.toLocaleString("en-US", { month: "short" }) : ""
    })
  }

  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        const heatmapData = await apiClient.getHeatmapData(365) as Array<{date: string; count: number; total_minutes: number}>
        
        // heatmapData is array of {date, count, total_minutes}
        // Create map for quick lookup
        const dataMap: Record<string, number> = {}
        heatmapData.forEach((item) => {
          dataMap[item.date] = item.count
        })
        
        // Build full 365 days with counts
        const days: Record<string, number> = {}
        const today = new Date()
        
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const key = toLocalYYYYMMDD(d)
          days[key] = dataMap[key] || 0
        }
        
        const grouped = Object.entries(days)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
        
        setPomodoroData(grouped)
        setMaxCount(Math.max(...grouped.map((d) => d.count), 1))
        setTotalPomodoros(heatmapData.reduce((sum, item) => sum + item.count, 0))
      } catch (error) {
        console.error('Failed to load heatmap data:', error)
        // Fallback to empty data
        const grouped = groupPomodorosByDay([])
        setPomodoroData(grouped)
        setMaxCount(1)
        setTotalPomodoros(0)
      }
    }

    loadHeatmapData()
    
    // Listen for new sessions
    const unsubscribe = sessionUpdated.subscribe(() => {
      loadHeatmapData()
    })

    return () => {
      unsubscribe()
    }
  }, [groupPomodorosByDay])

  const columns = useMemo(() => buildColumns(pomodoroData), [pomodoroData])
  const monthLabels = useMemo(() => computeMonthLabels(columns), [columns])

  return (
    <Card className="shadow-lg w-fit">
      <CardContent className="pt-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {totalPomodoros} pomodoros in the last year
          </h2>
        </div>

        <div>
          <div className="inline-flex flex-col gap-0.5">
            <div className="flex text-[10px] text-gray-500 mb-0.5">
              <div className="w-6" />
              <div className="flex gap-0.5">
                {monthLabels.map((label, i) => (
                  <div key={i} className="flex flex-col items-center" style={{ width: 10 }}>
                    <span className="min-w-0 text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-0.5">
              <div className="flex flex-col gap-0.5 justify-around text-[9px] text-gray-500 pr-1 w-5">
                <span>M</span>
                <span>W</span>
                <span>F</span>
              </div>

              <div className="flex gap-0.5">
                <TooltipProvider delayDuration={150}>
                  {columns.map((col, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-0.5">
                      {col.map((day, rIdx) =>
                        day ? (
                          <Tooltip key={rIdx}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-2.5 h-2.5 rounded-[2px] ${getColorClass(day.count)}`}
                                aria-label={`${day.count} pomodoros on ${formatDate(day.date)}`}
                                role="img"
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>
                                {day.count} pomodoros on {formatDate(day.date)}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div key={rIdx} className="w-2.5 h-2.5 rounded-[2px] bg-transparent" />
                        ),
                      )}
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

