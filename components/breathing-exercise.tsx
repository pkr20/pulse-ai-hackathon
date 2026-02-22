"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"
import TreeGrowAnimation from "@/components/tree-grow-animation"

const PHASE_DURATION = 4000 // 4 seconds per side
const PHASES = ["Breathe In", "Hold", "Breathe Out", "Hold"] as const
type BoxPhase = (typeof PHASES)[number]

interface BreathingExerciseProps {
  targetRounds: number
  onComplete: () => void
}

export default function BreathingExercise({
  targetRounds,
  onComplete,
}: BreathingExerciseProps) {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [roundCount, setRoundCount] = useState(0)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const finished = roundCount >= targetRounds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseStartRef = useRef(0)
  const hasCompletedRef = useRef(false)

  const phase: BoxPhase = PHASES[phaseIndex]

  // Animation tick
  useEffect(() => {
    if (!running || finished) return

    phaseStartRef.current = Date.now()
    setPhaseProgress(0)

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - phaseStartRef.current
      const progress = Math.min(elapsed / PHASE_DURATION, 1)
      setPhaseProgress(progress)

      if (progress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current)

        setPhaseIndex((prev) => {
          const next = (prev + 1) % 4
          // A full round completes when we cycle back to index 0
          if (next === 0) {
            setRoundCount((r) => {
              const newR = r + 1
              if (newR >= targetRounds && !hasCompletedRef.current) {
                hasCompletedRef.current = true
                setRunning(false)
                setTimeout(() => onComplete(), 3000)
              }
              return newR
            })
          }
          return next
        })
      }
    }, 30)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, phaseIndex, finished, targetRounds, onComplete])

  const handleToggle = useCallback(() => {
    setRunning((r) => !r)
  }, [])

  const progressPercent = Math.round((roundCount / targetRounds) * 100)

  // Dot position around the box (0-1 maps to the perimeter)
  const totalProgress = (phaseIndex + phaseProgress) / 4
  const getDotPosition = (t: number) => {
    // t goes 0->1 around the box: top-left -> top-right -> bottom-right -> bottom-left -> top-left
    const segment = t * 4
    if (segment <= 1) {
      // Top edge: left to right
      return { x: segment * 100, y: 0 }
    } else if (segment <= 2) {
      // Right edge: top to bottom
      return { x: 100, y: (segment - 1) * 100 }
    } else if (segment <= 3) {
      // Bottom edge: right to left
      return { x: (1 - (segment - 2)) * 100, y: 100 }
    } else {
      // Left edge: bottom to top
      return { x: 0, y: (1 - (segment - 3)) * 100 }
    }
  }

  const dot = getDotPosition(running ? totalProgress : 0)

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      {finished ? (
        <TreeGrowAnimation
          treeType="willow"
          label="Done"
          sublabel={`${targetRounds} rounds done`}
        />
      ) : (
        <>
          {/* Box animation */}
          <div className="relative h-40 w-40">
            <svg viewBox="-4 -4 108 108" className="h-full w-full" aria-hidden="true">
              <rect
                x="0" y="0" width="100" height="100"
                rx="8" ry="8"
                fill="none"
                className="stroke-muted"
                strokeWidth="2"
              />
              <rect
                x="0" y="0" width="100" height="100"
                rx="8" ry="8"
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeDasharray={400}
                strokeDashoffset={400 - totalProgress * 400}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="5"
                className="fill-primary"
                style={{ transition: "cx 0.05s linear, cy 0.05s linear" }}
              />
              <circle
                cx={dot.x}
                cy={dot.y}
                r="10"
                className="fill-primary/20"
                style={{ transition: "cx 0.05s linear, cy 0.05s linear" }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-card-foreground">
                {running ? phase : "Ready"}
              </span>
              {running && (
                <span className="text-xs text-muted-foreground mt-1">
                  {Math.ceil(PHASE_DURATION / 1000 - (phaseProgress * PHASE_DURATION) / 1000)}s
                </span>
              )}
            </div>

            <span className="absolute -top-5 left-0 text-[10px] text-muted-foreground/60">In</span>
            <span className="absolute -top-5 right-0 text-[10px] text-muted-foreground/60">Hold</span>
            <span className="absolute -bottom-5 right-0 text-[10px] text-muted-foreground/60">Out</span>
            <span className="absolute -bottom-5 left-0 text-[10px] text-muted-foreground/60">Hold</span>
          </div>

          {/* Round counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Round {roundCount} of {targetRounds}
            </span>
            <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Start / Pause */}
          <Button
            onClick={handleToggle}
            variant="outline"
            size="lg"
            className="min-w-[160px] border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            {running ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> {roundCount > 0 ? "Resume" : "Start"}
              </>
            )}
          </Button>
        </>
      )}


    </div>
  )
}
