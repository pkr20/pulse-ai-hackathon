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
import { getAllGratitudeWords, DISTORTION_TYPES } from "@/lib/store"
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

  const hasCheckIn = !!exercise.personalizedCheckIn
  const hasSpotTheDistortionFlow =
    exercise.type === "cognitive-distortion" && !!exercise.spotTheDistortionFlow

  const totalSteps = hasSpotTheDistortionFlow
    ? (hasCheckIn ? 1 : 0) + 3 + 1 // check-in + 3 custom steps + reflection
    : exercise.prompts.length + 2 + (hasCheckIn ? 1 : 0)
  const progress = ((currentStep + 1) / totalSteps) * 100

  const isCheckInStep = hasCheckIn && currentStep === 0
  const spotDistortionOffset = hasCheckIn ? 1 : 0
  const isSpotDistortionStep1 = hasSpotTheDistortionFlow && currentStep === spotDistortionOffset
  const isSpotDistortionStep2 = hasSpotTheDistortionFlow && currentStep === spotDistortionOffset + 1
  const isSpotDistortionStep3 = hasSpotTheDistortionFlow && currentStep === spotDistortionOffset + 2
  const isIntroStep = !hasSpotTheDistortionFlow && currentStep === spotDistortionOffset
  const isReflectionStep = currentStep === totalSteps - 1
  const promptIndex = currentStep - (hasCheckIn ? 2 : 1)

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
      if (exercise) {
        onComplete(exercise, responses)
      }
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
          <DialogDescription className="text-muted-foreground italic">
            {isCheckInStep
              ? "Check-in"
              : isSpotDistortionStep1
                ? "Which distortion?"
                : isSpotDistortionStep2
                  ? "How do you feel?"
                  : isSpotDistortionStep3
                    ? "Your thoughts"
                    : isIntroStep
                      ? "Introduction"
                      : isReflectionStep
                        ? "Everyday Application"
                        : `Step ${promptIndex + 1} of ${exercise.prompts.length}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Progress value={progress} className="h-1.5" />

          {isCheckInStep ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-card-foreground leading-relaxed text-center">
                {exercise.personalizedCheckIn!.text}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={responses[0] === String(n) ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleResponseChange(String(n))}
                    className="min-w-[48px]"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          ) : isSpotDistortionStep1 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-card-foreground leading-relaxed">
                Last time you said: &quot;{exercise.spotTheDistortionFlow!.thought}&quot;
              </p>
              <p className="text-sm text-muted-foreground">Which one fits?</p>
              <div className="grid gap-2">
                {DISTORTION_TYPES.map((d) => (
                  <Button
                    key={d}
                    variant={responses[spotDistortionOffset] === d ? "default" : "outline"}
                    onClick={() => handleResponseChange(d)}
                    className="justify-start text-left h-auto py-3 px-4 font-normal"
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          ) : isSpotDistortionStep2 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-card-foreground leading-relaxed text-center">
                How do you feel now?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant={responses[spotDistortionOffset + 1] === "I feel the same" ? "default" : "outline"}
                  onClick={() => handleResponseChange("I feel the same")}
                  className="flex-1 h-auto py-4"
                >
                  I feel the same
                </Button>
                <Button
                  variant={responses[spotDistortionOffset + 1] === "It is getting better" ? "default" : "outline"}
                  onClick={() => handleResponseChange("It is getting better")}
                  className="flex-1 h-auto py-4"
                >
                  It is getting better
                </Button>
              </div>
            </div>
          ) : isSpotDistortionStep3 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-card-foreground leading-relaxed">
                Add any thoughts.
              </p>
              <div className="grid gap-2">
                {(exercise.spotTheDistortionFlow?.addThoughtsOptions ?? [
                  "I want to work on this",
                  "I feel a bit better",
                  "No more thoughts",
                ]).map((opt) => (
                  <Button
                    key={opt}
                    variant={responses[currentStep] === opt ? "default" : "outline"}
                    onClick={() => handleResponseChange(opt)}
                    className="justify-start text-left h-auto py-3 px-4 font-normal"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          ) : isIntroStep ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                <h4 className="text-sm font-semibold text-primary mb-2 text-center">When can you use this?</h4>
                <ul className="space-y-2">
                  {exercise.dailyLifeExample.map((example, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Have you felt this before?
              </p>
            </div>
          ) : isReflectionStep ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-card-foreground leading-relaxed text-center">
                {exercise.reflectionPrompt}
              </p>
              <div className="grid gap-2">
                {exercise.reflectionOptions.map((option, i) => (
                  <Button
                    key={i}
                    variant={responses[currentStep] === option ? "default" : "outline"}
                    onClick={() => handleResponseChange(option)}
                    className="justify-start text-left h-auto py-3 px-4 font-normal whitespace-normal"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-card-foreground leading-relaxed">
                {exercise.promptPrefix ?? ""}{exercise.prompts[promptIndex]}
              </p>

              {exercise.type === "breathing" && promptIndex === 0 ? (
                <BreathingExercise
                  targetRounds={3}
                  onComplete={() => {
                    handleResponseChange("Completed 3 breathing rounds")
                  }}
                />
              ) : exercise.type === "gratitude" && promptIndex === 0 ? (
                <GratitudeExercise
                  onComplete={(selected) => {
                    handleResponseChange(selected.join(", "))
                    setCurrentStep((s) => s + 1)
                  }}
                />
              ) : exercise.type === "gratitude" && promptIndex === 1 ? (
                <GratitudeWordCloud
                  words={[
                    ...getAllGratitudeWords(),
                    ...(responses[(hasCheckIn ? 2 : 1)] || "")
                      .split(",")
                      .map((w) => w.trim().toLowerCase())
                      .filter(Boolean),
                  ]}
                />
              ) : exercise.promptOptions?.[promptIndex]?.length ? (
                <div className="grid gap-2">
                  {exercise.promptOptions[promptIndex].map((opt) => (
                    <Button
                      key={opt}
                      variant={responses[currentStep] === opt ? "default" : "outline"}
                      onClick={() => handleResponseChange(opt)}
                      className="justify-start text-left h-auto py-3 px-4 font-normal whitespace-normal"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : (
                <Textarea
                  value={responses[currentStep] || ""}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  placeholder="Write your thoughts..."
                  className="min-h-[120px] resize-none border-border bg-muted/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              )}
            </>
          )}

          {/* Hide nav on gratitude step 0 (it has its own Continue button) */}
          {!(exercise.type === "gratitude" && promptIndex === 0) && (
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
                  isCheckInStep
                    ? !responses[0]
                    : isSpotDistortionStep1
                      ? !responses[spotDistortionOffset]
                      : isSpotDistortionStep2
                        ? !responses[spotDistortionOffset + 1]
                        : isIntroStep
                          ? false
                          : exercise.type === "gratitude" && promptIndex === 1
                            ? !responses[(hasCheckIn ? 2 : 1)]?.trim()
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
