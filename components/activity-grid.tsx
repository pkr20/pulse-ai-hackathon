"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"

interface ActivityGridProps {
  activityMap: Record<string, number>
  streak: number
  /** When false, only real data is shown (no placeholder/fake data) */
  useFakeData?: boolean
}

function getIntensity(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 3
  return 4
}

const intensityClasses = [
  "bg-muted/50",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/65",
  "bg-primary",
]

const intensityText = [
  "text-muted-foreground/50",
  "text-primary/80",
  "text-primary",
  "text-primary-foreground/90",
  "text-primary-foreground",
]

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0]
}

function generateFakeData(): Record<string, number> {
  const map: Record<string, number> = {}
  const now = new Date()
  for (let daysBack = 1; daysBack <= 120; daysBack++) {
    const d = new Date(now)
    d.setDate(d.getDate() - daysBack)
    const key = toDateStr(d)
    const seed = daysBack * 7 + d.getDay() * 13
    const rand = Math.abs(Math.sin(seed) * 10000) % 10
    if (rand < 2.5) continue
    if (rand < 4.5) map[key] = 1
    else if (rand < 6.5) map[key] = 2
    else if (rand < 8) map[key] = 3
    else map[key] = Math.floor(rand < 9.2 ? 4 : 6)
  }
  return map
}

const FAKE_DATA = generateFakeData()
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function ActivityGrid({ activityMap, streak, useFakeData = true }: ActivityGridProps) {
  const now = new Date()
  const todayStr = toDateStr(now)
  const mergedMap = useMemo(
    () => (useFakeData ? { ...FAKE_DATA, ...activityMap } : activityMap),
    [activityMap, useFakeData]
  )

  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [viewYear, setViewYear] = useState(now.getFullYear())

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear()

  const { cells, activeDays, totalExercises } = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    // Monday-start: 0=Mon ... 6=Sun
    const firstDow = (() => {
      const d = new Date(viewYear, viewMonth, 1).getDay()
      return d === 0 ? 6 : d - 1
    })()

    const totalSlots = Math.ceil((firstDow + daysInMonth) / 7) * 7
    const result: { date: string | null; day: number; count: number }[] = []
    let active = 0
    let total = 0

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - firstDow + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        result.push({ date: null, day: 0, count: 0 })
      } else {
        const m = String(viewMonth + 1).padStart(2, "0")
        const d = String(dayNum).padStart(2, "0")
        const dateStr = `${viewYear}-${m}-${d}`
        const count = mergedMap[dateStr] || 0
        if (count > 0) { active++; total += count }
        result.push({ date: dateStr, day: dayNum, count })
      }
    }

    return { cells: result, activeDays: active, totalExercises: total }
  }, [mergedMap, viewMonth, viewYear])

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  function goPrev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function goNext() {
    if (isCurrentMonth) return
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted/50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-semibold text-card-foreground min-w-[130px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-accent">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{streak}</span>
          </div>
        )}
      </div>

      {/* Centered fixed-size grid */}
      <div className="flex justify-center">
        <div className="inline-grid grid-cols-7 gap-1.5">
          {/* Day-of-week headers */}
          {DAY_LABELS.map((label) => (
            <div key={label} className="flex h-4 w-9 items-center justify-center text-[10px] font-medium text-muted-foreground/60">
              {label}
            </div>
          ))}

          {/* Date cells */}
          {cells.map((cell, i) => {
            if (!cell.date) {
              return <div key={i} className="h-9 w-9" />
            }

            const isFuture = cell.date > todayStr
            const isToday = cell.date === todayStr
            const intensity = isFuture ? -1 : getIntensity(cell.count)

            return (
              <div
                key={cell.date}
                className={`h-9 w-9 rounded-md flex items-center justify-center transition-colors ${
                  isFuture
                    ? "bg-muted/20"
                    : intensityClasses[intensity]
                } ${isToday ? "ring-1.5 ring-card-foreground/40 ring-offset-1 ring-offset-card" : ""}`}
                title={isFuture ? "" : `${cell.date}: ${cell.count} exercise${cell.count !== 1 ? "s" : ""}`}
              >
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isFuture
                      ? "text-muted-foreground/25"
                      : intensity >= 0
                        ? intensityText[intensity]
                        : "text-muted-foreground/40"
                  }`}
                >
                  {cell.day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20 shrink-0">
        <p className="text-[10px] text-muted-foreground">
          {activeDays} active day{activeDays !== 1 ? "s" : ""} &middot; {totalExercises} exercise{totalExercises !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground/60">Less</span>
          {intensityClasses.map((cls, i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
          ))}
          <span className="text-[9px] text-muted-foreground/60">More</span>
        </div>
      </div>
    </div>
  )
}
