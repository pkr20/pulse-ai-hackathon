"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getState, getSessionInsights, exercises } from "@/lib/store"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface AITherapistChatProps {
  /** Optional: render as a custom trigger instead of default button */
  trigger?: React.ReactNode
}

export default function AITherapistChat({ trigger }: AITherapistChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi, I'm here to listen. I have context from your last session and recent practices. How are you feeling today?",
        },
      ])
    }
  }, [open, messages.length])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setError(null)
    const userMessage: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const state = getState()
      const insights = getSessionInsights()

      const lastExercises = state.completedExercises
        .slice(-5)
        .reverse()
        .map((ex) => {
          const exercise = exercises.find((e) => e.type === ex.exerciseType)
          return {
            exerciseTitle: exercise?.title ?? ex.exerciseType,
            completedAt: ex.completedAt,
            responses: ex.responses.filter((r) => typeof r === "string" && r.trim()),
          }
        })
        .filter((e) => e.responses.length > 0)

      const res = await fetch("/api/chat-therapist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            sessionInsights: insights
              ? {
                  summary: insights.summary,
                  emotions: insights.emotions,
                  themes: insights.themes,
                  checkIn: insights.checkIn,
                  spotTheDistortionThought: insights.spotTheDistortionThought,
                  suggestedPractices: insights.suggestedPractices,
                }
              : undefined,
            lastExercises: lastExercises.length > 0 ? lastExercises : undefined,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to get response")

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageCircle className="h-4 w-4" />
            Talk to AI
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AI Therapist
          </SheetTitle>
          <SheetDescription>
            Chat with context from your last session and recent practice answers.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-4 pb-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/40 space-y-2">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
