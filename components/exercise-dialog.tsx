"use client"

import { useState } from "react"
import type { CBTExercise } from "@/lib/store"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import BreathingExercise from "@/components/breathing-exercise"
import GratitudeExercise, { GratitudeWordCloud } from "@/components/gratitude-exercise"
import { getAllGratitudeWords } from "@/lib/store"
import TreeGrowAnimation from "@/components/tree-grow-animation"

interface ExerciseDialogProps {
  exercise: CBTExercise | null
  open: boolean
  onClose: () => void
  onComplete: (exerciseType: CBTExercise, responses: string[]) => void
}

export default function ExerciseDialog({
  exercise,
  open,
  onClose,
  onComplete,
}: ExerciseDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)

  if (!exercise) return null

  const totalSteps = exercise.prompts.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  function handleOpen(isOpen: boolean) {
    if (!isOpen) {
      handleClose()
    }
  }

  function handleClose() {
    setCurrentStep(0)
    setResponses([])
    setCompleted(false)
    onClose()
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      // Complete
      setCompleted(true)
      onComplete(exercise, responses)
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  function handleResponseChange(value: string) {
    const newResponses = [...responses]
    newResponses[currentStep] = value
    setResponses(newResponses)
  }

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <VisuallyHidden asChild>
            <DialogTitle>A New Tree Grows</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <TreeGrowAnimation
              treeType={exercise.treeReward}
              label="A New Tree Grows"
              sublabel={`Your ${exercise.title.toLowerCase()} practice planted a new tree. Keep going to watch it grow.`}
            />
            <Button
              onClick={handleClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return to Forest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-card-foreground">
            {exercise.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Progress value={progress} className="h-1.5" />

          <div className="min-h-[180px] space-y-4">
            <p className="text-sm font-medium text-card-foreground leading-relaxed">
              {exercise.prompts[currentStep]}
            </p>

            {exercise.type === "breathing" && currentStep === 0 ? (
              <BreathingExercise
                targetRounds={3}
                onComplete={() => {
                  handleResponseChange("Completed 3 breathing rounds")
                }}
              />
            ) : exercise.type === "gratitude" && currentStep === 0 ? (
              <GratitudeExercise
                onComplete={(selected) => {
                  handleResponseChange(selected.join(", "))
                  setCurrentStep(1)
                }}
              />
            ) : exercise.type === "gratitude" && currentStep === 1 ? (
              <GratitudeWordCloud
                words={[
                  ...getAllGratitudeWords(),
                  ...(responses[0] || "")
                    .split(",")
                    .map((w) => w.trim().toLowerCase())
                    .filter(Boolean),
                ]}
              />
            ) : (
              <Textarea
                value={responses[currentStep] || ""}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Take your time to reflect and write your response..."
                className="min-h-[120px] resize-none border-border bg-muted/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            )}
          </div>

          {/* Hide nav on gratitude step 0 (it has its own Continue button) */}
          {!(exercise.type === "gratitude" && currentStep === 0) && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                size="sm"
                className="text-muted-foreground hover:text-card-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  exercise.type === "gratitude" && currentStep === 1
                    ? !responses[0]?.trim()
                    : !responses[currentStep]?.trim()
                }
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentStep < totalSteps - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Complete
                    <Check className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
