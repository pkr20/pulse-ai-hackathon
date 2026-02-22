"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getState,
  completeExercise,
  exercises,
  getTodayExerciseCount,
  getExerciseTypeStats,
  getMonthActivityMap,
  getSessionInsights,
  getPersonalizedExercise,
  type UserState,
  type CBTExercise,
} from "@/lib/store"
import ForestScene from "@/components/forest-scene"
import ExerciseCard from "@/components/exercise-card"
import ExerciseDialog from "@/components/exercise-dialog"
import StatsPanel from "@/components/stats-panel"
import ActivityGrid from "@/components/activity-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { TreePine, Sprout, ChevronLeft, ChevronRight, Maximize2, Stethoscope } from "lucide-react"
import TranscriptUpload from "@/components/transcript-upload"

const levelNames = [
  "",
  "Bare Soil",
  "First Sprouts",
  "Young Clearing",
  "Growing Grove",
  "Shady Thicket",
  "Verdant Woodland",
  "Thriving Forest",
  "Ancient Grove",
  "Enchanted Forest",
  "Eden",
]

export default function Home() {
  const [state, setState] = useState<UserState | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [exerciseStats, setExerciseStats] = useState<Record<string, number>>({})
  const [activityMap, setActivityMap] = useState<Record<string, number>>({})
  const [activeExercise, setActiveExercise] = useState<CBTExercise | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [topPanel, setTopPanel] = useState<"forest" | "activity">("forest")

  const [sessionInsights, setSessionInsights] = useState<ReturnType<typeof getSessionInsights>>(null)

  const loadState = useCallback(() => {
    const s = getState()
    setState(s)
    setTodayCount(getTodayExerciseCount())
    setExerciseStats(getExerciseTypeStats())
    setActivityMap(getMonthActivityMap())
    setSessionInsights(getSessionInsights())
  }, [])

  useEffect(() => {
    loadState()
  }, [loadState])

  function handleStartExercise(exercise: CBTExercise) {
    const insights = getSessionInsights()
    const personalized = getPersonalizedExercise(exercise, insights)
    setActiveExercise(personalized)
    setDialogOpen(true)
  }

  function handleCompleteExercise(exercise: CBTExercise, responses: string[]) {
    completeExercise(exercise.type, responses, exercise.treeReward)
    loadState()
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setActiveExercise(null)
  }

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Sprout className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Preparing your grove...</span>
        </div>
      </main>
    )
  }

  const levelName = levelNames[Math.min(state.level, 10)] || "Eden"

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <TreePine className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-xl font-semibold text-foreground tracking-tight">
              MindGrove
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/therapist"
              className="flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              Therapist
            </Link>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Level {state.level}
              </p>
              <p className="text-sm font-medium text-foreground">{levelName}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Forest / Activity Swipeable Panel */}
        <section>
          <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
            {/* Arrow buttons */}
            <button
              onClick={() => setTopPanel(topPanel === "forest" ? "activity" : "forest")}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-card/70 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-card-foreground shadow-sm border border-border/30"
              aria-label="Previous view"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTopPanel(topPanel === "forest" ? "activity" : "forest")}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-card/70 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-card-foreground shadow-sm border border-border/30"
              aria-label="Next view"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Sliding container */}
            <div className="aspect-[16/9] sm:aspect-[2/1] relative">
              <div
                className="absolute inset-0 flex transition-transform duration-400 ease-in-out"
                style={{
                  width: "200%",
                  transform: topPanel === "forest" ? "translateX(0%)" : "translateX(-50%)",
                }}
              >
                {/* Forest panel */}
                <div className="relative w-1/2 h-full">
                  <ForestScene trees={state.trees} level={state.level} />
                  {/* Enter 3D forest button */}
                  {state.trees.length > 0 && (
                    <Link
                      href="/forest"
                      className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-card/70 px-3 py-1.5 text-xs font-medium text-card-foreground backdrop-blur-sm border border-border/30 shadow-sm transition-colors hover:bg-card"
                    >
                      <Maximize2 className="h-3 w-3" />
                      Enter 3D
                    </Link>
                  )}
                  {state.trees.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/40 backdrop-blur-[2px]">
                      <div className="text-center space-y-2 px-6">
                        <Sprout className="h-8 w-8 text-primary mx-auto" />
                        <p className="font-serif text-lg text-foreground font-medium">
                          Your forest awaits
                        </p>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                          Complete CBT exercises below to plant your first tree.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity grid panel */}
                <div className="w-1/2 h-full bg-card">
                  <ActivityGrid activityMap={activityMap} streak={state.streak} />
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              <button
                onClick={() => setTopPanel("forest")}
                className={`h-1.5 rounded-full transition-all ${topPanel === "forest" ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                aria-label="Show forest"
              />
              <button
                onClick={() => setTopPanel("activity")}
                className={`h-1.5 rounded-full transition-all ${topPanel === "activity" ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
                aria-label="Show activity"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <StatsPanel state={state} todayCount={todayCount} />
        </section>

        {/* Suggested for you - when transcript has been analyzed */}
        {sessionInsights?.suggestedPractices && sessionInsights.suggestedPractices.length > 0 && (
          <section className="pb-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
              Suggested for you
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your session, these practices may help most right now.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessionInsights.suggestedPractices.map((sp) => {
                const ex = exercises.find((e) => e.type === sp.exerciseType)
                if (!ex) return null
                return (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    completedCount={exerciseStats[ex.type] || 0}
                    onStart={handleStartExercise}
                    suggestedReason={sp.reason}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* Exercises */}
        <section className="pb-8">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Daily Practices
              </h2>
              <TabsList className="bg-muted/50 h-8">
                <TabsTrigger value="all" className="text-xs h-7 px-3">
                  All
                </TabsTrigger>
                <TabsTrigger value="thinking" className="text-xs h-7 px-3">
                  Thinking
                </TabsTrigger>
                <TabsTrigger value="wellness" className="text-xs h-7 px-3">
                  Wellness
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exercises.map((ex) => {
                  const suggested = sessionInsights?.suggestedPractices?.find((sp) => sp.exerciseType === ex.type)
                  return (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      completedCount={exerciseStats[ex.type] || 0}
                      onStart={handleStartExercise}
                      suggestedReason={suggested?.reason}
                    />
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="thinking" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exercises
                  .filter((ex) =>
                    ["thought-record", "cognitive-distortion", "reframing"].includes(
                      ex.type
                    )
                  )
                  .map((ex) => {
                    const suggested = sessionInsights?.suggestedPractices?.find((sp) => sp.exerciseType === ex.type)
                    return (
                      <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        completedCount={exerciseStats[ex.type] || 0}
                        onStart={handleStartExercise}
                        suggestedReason={suggested?.reason}
                      />
                    )
                  })}
              </div>
            </TabsContent>

            <TabsContent value="wellness" className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exercises
                  .filter((ex) =>
                    ["behavioral-activation", "grounding", "gratitude", "breathing"].includes(
                      ex.type
                    )
                  )
                  .map((ex) => {
                    const suggested = sessionInsights?.suggestedPractices?.find((sp) => sp.exerciseType === ex.type)
                    return (
                      <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        completedCount={exerciseStats[ex.type] || 0}
                        onStart={handleStartExercise}
                        suggestedReason={suggested?.reason}
                      />
                    )
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>

      {/* Exercise Dialog */}
      <ExerciseDialog
        exercise={activeExercise}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onComplete={handleCompleteExercise}
      />
    </main>
  )
}
