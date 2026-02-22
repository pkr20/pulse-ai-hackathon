"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { FileText, Upload, Loader2, Trash2, Sparkles, Mic, Square } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  getSessionInsights,
  setSessionInsights,
  clearSessionInsights,
  type SessionInsights,
} from "@/lib/store"

interface TranscriptUploadProps {
  onInsightsChange?: (insights: SessionInsights | null) => void
}

export default function TranscriptUpload({ onInsightsChange }: TranscriptUploadProps) {
  const [open, setOpen] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsightsState] = useState<SessionInsights | null>(() =>
    getSessionInsights()
  )
  const [isRecording, setIsRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [recordingMode, setRecordingMode] = useState<"live" | "audio" | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      ? (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
      : null

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      mediaRecorderRef.current?.stop()
    }
  }, [])

  const refreshInsights = useCallback(() => {
    const next = getSessionInsights()
    setInsightsState(next)
    onInsightsChange?.(next)
  }, [onInsightsChange])

  async function handleAnalyze() {
    const text = transcript.trim()
    if (!text) {
      setError("Please paste or upload a transcript first.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/analyze-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed")
      }

      setSessionInsights(data as SessionInsights)
      refreshInsights()
      setTranscript("")
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze transcript")
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    clearSessionInsights()
    refreshInsights()
    setTranscript("")
    setError(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      setTranscript((prev) => (prev ? `${prev}\n\n${text}` : text))
    }
    reader.readAsText(file)
  }

  function handleStartRecording() {
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }
    setError(null)
    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = ""
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          final += text
        } else {
          interim += text
        }
      }
      if (final) {
        setTranscript((prev) => (prev ? `${prev} ${final}` : final))
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("Microphone access was denied.")
      } else if (event.error !== "aborted") {
        setError(`Recognition error: ${event.error}`)
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setRecordingMode(null)
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setRecordingMode("live")
  }

  function handleStopRecording() {
    if (recordingMode === "live") {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    } else if (recordingMode === "audio") {
      mediaRecorderRef.current?.stop()
      mediaRecorderRef.current = null
    }
    setRecordingMode(null)
    setIsRecording(false)
  }

  async function handleRecordAudio() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not available.")
      return
    }
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          resolve(new Blob(chunks, { type: "audio/webm" }))
        }
      })

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingMode("audio")

      const blob = await recordingPromise
      mediaRecorderRef.current = null
      setRecordingMode(null)
      setIsRecording(false)
      setTranscribing(true)

      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")

      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Transcription failed")
      setTranscript((prev) => (prev ? `${prev}\n\n${data.transcript}` : data.transcript))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recording failed")
    } finally {
      setTranscribing(false)
      setIsRecording(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            Personalize from transcript
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Session Transcript
            </SheetTitle>
            <SheetDescription>
              Paste, upload, or record a therapy/coaching transcript. We&apos;ll analyze it and
              personalize your CBT exercises (e.g. &quot;Based on your last session,
              you&apos;ve been feeling anxious lately...&quot;).
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Transcript
              </label>
              <Textarea
                placeholder="Paste your session transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[180px] max-h-[300px] resize-none overflow-y-auto"
                disabled={loading}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="file"
                  id="transcript-file"
                  accept=".txt,.md"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={loading}
                >
                  <label
                    htmlFor="transcript-file"
                    className="flex cursor-pointer items-center gap-1.5"
                  >
                    <Upload className="h-4 w-4" />
                    Upload .txt
                  </label>
                </Button>
                {isRecording ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopRecording}
                    className="gap-1.5 text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Stop
                  </Button>
                ) : SpeechRecognitionAPI && !transcribing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartRecording}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <Mic className="h-4 w-4" />
                    Record (live)
                  </Button>
                ) : null}
                {transcribing ? (
                  <span className="text-xs text-muted-foreground self-center flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Transcribing...
                  </span>
                ) : !isRecording ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecordAudio}
                    disabled={loading}
                    className="gap-1.5"
                  >
                    <Mic className="h-4 w-4" />
                    Record audio
                  </Button>
                ) : null}
              </div>
              {(isRecording || transcribing) && (
                <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  {transcribing ? "Transcribing your recording..." : "Listening... speak and your words will appear above."}
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={loading || !transcript.trim()}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze & personalize
                  </>
                )}
              </Button>
            </div>

            {insights && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Current personalization
                </p>
                <p className="text-sm text-muted-foreground italic">
                  &quot;Last time you felt {insights.checkIn}. How much now?&quot;
                </p>
                {insights.suggestedPractices && insights.suggestedPractices.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Suggested: {insights.suggestedPractices.map((sp) => sp.reason).join("; ")}
                  </p>
                )}
                {insights.spotTheDistortionThought && (
                  <p className="text-xs text-muted-foreground">
                    Spot the Distortion: &quot;{insights.spotTheDistortionThought}&quot;
                  </p>
                )}
                {insights.personalizedOptions && (
                  <p className="text-xs text-muted-foreground">
                    All exercises will use options from your session.
                  </p>
                )}
                {insights.emotions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Emotions: {insights.emotions.join(", ")}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="mt-2 gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear personalization
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
