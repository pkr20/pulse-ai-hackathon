"use client"

import { type CBTExercise } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Brain,
  Calendar,
  Heart,
  Wind,
  RefreshCw,
} from "lucide-react"
import type { CBTExerciseType } from "@/lib/store"

const exerciseIcons: Record<CBTExerciseType, React.ReactNode> = {
  "thought-record": <BookOpen className="h-5 w-5" />,
  "cognitive-distortion": <Brain className="h-5 w-5" />,
  "behavioral-activation": <Calendar className="h-5 w-5" />,
  gratitude: <Heart className="h-5 w-5" />,
  breathing: <Wind className="h-5 w-5" />,
  reframing: <RefreshCw className="h-5 w-5" />,
}

const treeLabels: Record<string, string> = {
  oak: "Oak",
  pine: "Pine",
  cherry: "Cherry Blossom",
  birch: "Birch",
  willow: "Willow",
  maple: "Maple",
}

interface ExerciseCardProps {
  exercise: CBTExercise
  completedCount: number
  onStart: (exercise: CBTExercise) => void
  /** Short reason when this exercise is AI-suggested (e.g. "For ruminating thoughts") */
  suggestedReason?: string
}

export default function ExerciseCard({
  exercise,
  completedCount,
  onStart,
  suggestedReason,
}: ExerciseCardProps) {
  return (
    <Card className="group cursor-pointer border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              {exerciseIcons[exercise.type]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  {exercise.title}
                </CardTitle>
                {suggestedReason && (
                  <span className="text-[10px] font-medium text-primary bg-primary/15 px-1.5 py-0.5 rounded">
                    Suggested
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {suggestedReason ? suggestedReason : `Plants a ${treeLabels[exercise.treeReward]} tree`}
              </p>
            </div>
          </div>
          {completedCount > 0 && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {completedCount}x
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed text-muted-foreground mb-4">
          {exercise.description}
        </CardDescription>
        <Button
          onClick={() => onStart(exercise)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          Begin Practice
        </Button>
      </CardContent>
    </Card>
  )
}
