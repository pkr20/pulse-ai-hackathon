"use client"

import { useState, useMemo, useCallback } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PRESET_TAGS = [
  "Family",
  "Friends",
  "Health",
  "Nature",
  "Music",
  "Food",
  "Sleep",
  "Home",
  "Work",
  "Laughter",
  "Sunshine",
  "Pets",
  "Books",
  "Exercise",
  "Coffee",
  "Kindness",
  "Memories",
  "Learning",
  "Peace",
  "Love",
]

interface GratitudeExerciseProps {
  onComplete: (selected: string[]) => void
}

export default function GratitudeExercise({ onComplete }: GratitudeExerciseProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [customInput, setCustomInput] = useState("")

  function toggleTag(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed])
      setCustomInput("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addCustom()
    }
  }

  function removeTag(tag: string) {
    setSelected((prev) => prev.filter((t) => t !== tag))
  }

  const canComplete = selected.length >= 1

  return (
    <div className="space-y-4">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-primary-foreground/20 transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset tags */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.filter((t) => !selected.includes(t)).map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-card-foreground transition-colors hover:bg-primary/10 hover:border-primary/30"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your own..."
          className="h-8 text-sm bg-muted/30 border-border"
        />
        <Button
          onClick={addCustom}
          disabled={!customInput.trim()}
          size="sm"
          variant="outline"
          className="h-8 shrink-0 border-border"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Done button */}
      <Button
        onClick={() => onComplete(selected)}
        disabled={!canComplete}
        size="sm"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {canComplete
          ? `Continue with ${selected.length} item${selected.length !== 1 ? "s" : ""}`
          : "Select at least 1 thing"}
      </Button>
    </div>
  )
}

// Word cloud component for step 2
interface WordCloudProps {
  words: string[]
}

export function GratitudeWordCloud({ words }: WordCloudProps) {
  const wordCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const w of words) {
      const key = w.toLowerCase()
      map[key] = (map[key] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
  }, [words])

  const maxCount = wordCounts.length > 0 ? wordCounts[0][1] : 1

  // Deterministic but varied positioning
  const getStyle = useCallback(
    (word: string, count: number, index: number) => {
      const ratio = count / maxCount
      const fontSize = 11 + ratio * 18
      const opacity = 0.45 + ratio * 0.55
      // Rotate some words slightly
      const seed = word.charCodeAt(0) + index
      const rotate = seed % 5 === 0 ? (seed % 2 === 0 ? -6 : 6) : 0

      return {
        fontSize: `${fontSize}px`,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }
    },
    [maxCount]
  )

  if (wordCounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Complete gratitude exercises to build your word cloud.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 px-2">
      {wordCounts.map(([word, count], i) => (
        <span
          key={word}
          className="font-semibold text-primary transition-transform hover:scale-110 cursor-default"
          style={getStyle(word, count, i)}
          title={`${word}: ${count} time${count !== 1 ? "s" : ""}`}
        >
          {word}
        </span>
      ))}
    </div>
  )
}
