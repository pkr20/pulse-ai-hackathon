"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  getState,
  getExerciseTypeStats,
  getMonthActivityMap,
  getSessionInsights,
  type UserState,
  type CBTExerciseType,
} from "@/lib/store"
import { ArrowLeft, BarChart3, Flame, TrendingUp, Calendar, Stethoscope } from "lucide-react"
import ActivityGrid from "@/components/activity-grid"
import TranscriptUpload from "@/components/transcript-upload"

const exerciseTitles: Record<CBTExerciseType, string> = {
  "thought-record": "Thought Record",
  "cognitive-distortion": "Spot the Distortion",
  "behavioral-activation": "Activity Planning",
  grounding: "5-4-3-2-1 Grounding",
  gratitude: "Gratitude Journal",
  breathing: "Mindful Breathing",
  reframing: "Kind Thoughts",
}

export default function TherapistPage() {
  const [state, setState] = useState<UserState | null>(null)
  const [exerciseStats, setExerciseStats] = useState<Record<string, number>>({})
  const [activityMap, setActivityMap] = useState<Record<string, number>>({})
  const [insights, setInsights] = useState<ReturnType<typeof getSessionInsights>>(null)

  const loadState = useCallback(() => {
    setState(getState())
    setExerciseStats(getExerciseTypeStats())
    setActivityMap(getMonthActivityMap())
    setInsights(getSessionInsights())
  }, [])

  useEffect(() => {
    loadState()
  }, [loadState])

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Stethoscope className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Loading therapist view...</span>
        </div>
      </main>
    )
  }

  const totalExercises = state.totalExercises
  const topExercises = (Object.entries(exerciseStats) as [CBTExerciseType, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const hasActivity = totalExercises > 0
  const weekDays = 7
  const today = new Date().toISOString().split("T")[0]
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - weekDays)
  const weekAgoStr = weekAgo.toISOString().split("T")[0]
  const weekActivity = Object.entries(activityMap).filter(
    ([date]) => date >= weekAgoStr && date <= today
  )
  const weekTotal = weekActivity.reduce((acc, [, count]) => acc + count, 0)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to app</span>
          </Link>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-lg font-semibold text-foreground">
              Therapist View
            </h1>
          </div>
          <TranscriptUpload onInsightsChange={() => setInsights(getSessionInsights())} />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <p className="text-2xl font-bold text-foreground">{totalExercises}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total practices</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <p className="text-2xl font-bold text-foreground">{state.streak}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <p className="text-2xl font-bold text-foreground">{state.level}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Level</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <p className="text-2xl font-bold text-foreground">{weekTotal}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
            </div>
          </div>
        </section>

        {/* What's working */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            What&apos;s working
          </h2>
          {hasActivity ? (
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Most-used practices (indicates engagement and preference)
              </p>
              <div className="space-y-3">
                {topExercises.length > 0 ? (
                  topExercises.map(([type, count]) => {
                    const max = topExercises[0]?.[1] ?? 1
                    const pct = Math.round((count / max) * 100)
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {exerciseTitles[type] ?? type}
                          </span>
                          <span className="text-muted-foreground">{count}×</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No practices completed yet.
                  </p>
                )}
              </div>
              {state.streak > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Flame className="h-4 w-4 text-accent" />
                  <p className="text-sm text-muted-foreground">
                    {state.streak}-day streak suggests consistent engagement.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-card/80 p-6 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No practice data yet. Client completes exercises to see what&apos;s working.
              </p>
            </div>
          )}
        </section>

        {/* Activity calendar */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activity
          </h2>
          <div className="rounded-xl border border-border/40 bg-card/80 overflow-hidden">
            <ActivityGrid activityMap={activityMap} streak={state.streak} useFakeData={false} />
          </div>
        </section>

        {/* Session insights (if transcript was analyzed) */}
        {insights && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Session context
            </h2>
            <div className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{insights.summary}</p>
              {insights.emotions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Emotions:</span> {insights.emotions.join(", ")}
                </p>
              )}
              {insights.themes.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Themes:</span> {insights.themes.join(", ")}
                </p>
              )}
              {insights.suggestedPractices && insights.suggestedPractices.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Suggested practices:</span>{" "}
                  {insights.suggestedPractices.map((sp) => sp.reason).join("; ")}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Note */}
        <p className="text-xs text-muted-foreground/80 text-center max-w-md mx-auto">
          This view shows data from the current device. For shared sessions, client and therapist
          would view this on the same device or export data.
        </p>
      </div>
    </main>
  )
}
