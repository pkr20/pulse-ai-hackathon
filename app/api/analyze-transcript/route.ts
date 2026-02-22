import { NextResponse } from "next/server"
import OpenAI from "openai"
import type { CBTExerciseType, SessionInsights } from "@/lib/store"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to your .env.local file." },
      { status: 500 }
    )
  }

  try {
    const { transcript } = (await req.json()) as { transcript: string }
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript text is required" },
        { status: 400 }
      )
    }

    // Step 1: Detect therapist vs client and extract client content for personalization
    let contentForAnalysis = transcript
    const labelingCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are analyzing a therapy or coaching session transcript. Your job is to identify who is the therapist vs the client.

Return a JSON object with these fields:
- clientContent: A single string containing ONLY what the client said. Combine all client turns into one block. Use their exact words. This is what we use for personalization.
- therapistContent: (optional) What the therapist said, if any.
- hasMultipleSpeakers: true if you detected a back-and-forth between therapist and client, false if it's a single speaker (e.g. client journal, monologue).

Rules:
- Therapist typically: asks questions ("How does that make you feel?"), reflects, summarizes, gives suggestions.
- Client typically: shares feelings, describes situations, expresses thoughts, talks about their life.
- If unclear or single speaker, put everything in clientContent.
- Preserve the client's words exactly; do not paraphrase.`,
        },
        {
          role: "user",
          content: `Identify therapist vs client in this transcript and return the JSON:\n\n${transcript.slice(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const labelingText = labelingCompletion.choices[0]?.message?.content
    if (labelingText) {
      try {
        const labeled = JSON.parse(labelingText) as {
          clientContent?: string
          hasMultipleSpeakers?: boolean
        }
        if (labeled.clientContent?.trim()) {
          contentForAnalysis = labeled.clientContent.trim()
        }
      } catch {
        // Fall back to full transcript if parsing fails
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a supportive mental health assistant. Analyze therapy or coaching session transcripts to extract insights that personalize CBT exercises. Use ONLY what the client said or implied. Keep options short (2-6 words each). Use simple words.

Return a JSON object with these fields:
- summary: 1-2 sentence summary
- emotions: 2-5 emotions (e.g. ["anxious", "sad", "hopeful"])
- themes: 2-4 themes (e.g. ["work", "family", "self-doubt"])
- checkIn: "[emotion] about [topic]" - 3-5 words (e.g. "nervous about work")
- spotTheDistortionThought: A thought the client said, 5-12 words, use their words
- suggestedPractices: Array of 1-2 suggested daily practices. Each has exerciseType and reason (5-12 words).
  Map clinically: OCD/rumination/catastrophizing → cognitive-distortion (Spot the Distortion)
  Depression/low mood/negativity → gratitude (Gratitude Journal)
  Anxiety/panic/stress → breathing (Mindful Breathing)
  Avoidance/low motivation/withdrawal → behavioral-activation (Activity Planning)
  Anxiety/panic/dissociation → grounding (5-4-3-2-1 Grounding)
  Negative self-talk/self-criticism → thought-record or reframing (Kind Thoughts)
  Use exerciseType: "cognitive-distortion" | "gratitude" | "breathing" | "behavioral-activation" | "grounding" | "thought-record" | "reframing"
- personalizedOptions: Object with options FROM THE TRANSCRIPT for exercises:
  - situations: 3-5 situations/events the client described (e.g. "Meeting with boss", "Argument with partner")
  - thoughts: 3-5 negative thoughts they expressed (e.g. "I'm not good enough", "They don't like me")
  - supportingFacts: 2-4 things that support their negative thought (from what they said)
  - opposingFacts: 2-4 things that go against it (from session)
  - kinderThoughts: 3-5 kinder ways to think (based on session)
  - friendAdvice: 3-5 things you'd tell a friend in their situation
  - activities: 3-5 activities they put off or discussed (e.g. "Exercise", "Calling mom")
  - smallSteps: 2-4 small steps they could take (from session)
  - whenOptions: 2-4 when they might do it (e.g. "Tomorrow morning", "This weekend")
  - howFeelNow: 3-5 ways they might feel (e.g. "Calm", "A bit better", "Still worried")
  - addThoughts: 2-4 short follow-up options (e.g. "I want to work on this", "Feeling better")

If the transcript doesn't clearly provide something, use 2-3 sensible options based on themes. Always provide arrays, never leave empty.`,
        },
        {
          role: "user",
          content: `Analyze this transcript (client's words only) and return the JSON object:\n\n${contentForAnalysis.slice(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      throw new Error("No response from AI")
    }

    const parsed = JSON.parse(text) as {
      summary?: string
      emotions?: string[]
      themes?: string[]
      checkIn?: string
      spotTheDistortionThought?: string
      suggestedPractices?: { exerciseType: string; reason: string }[]
      personalizedOptions?: {
        situations?: string[]
        thoughts?: string[]
        supportingFacts?: string[]
        opposingFacts?: string[]
        kinderThoughts?: string[]
        friendAdvice?: string[]
        activities?: string[]
        smallSteps?: string[]
        whenOptions?: string[]
        howFeelNow?: string[]
        addThoughts?: string[]
      }
    }

    const validTypes: CBTExerciseType[] = [
      "thought-record",
      "cognitive-distortion",
      "behavioral-activation",
      "grounding",
      "gratitude",
      "breathing",
      "reframing",
    ]
    const suggestedPractices = Array.isArray(parsed.suggestedPractices)
      ? parsed.suggestedPractices
          .filter(
            (s): s is { exerciseType: string; reason: string } =>
              s && typeof s.exerciseType === "string" && typeof s.reason === "string" && validTypes.includes(s.exerciseType as CBTExerciseType)
          )
          .map((s) => ({
            exerciseType: s.exerciseType as CBTExerciseType,
            reason: String(s.reason).slice(0, 80),
          }))
          .slice(0, 2)
      : undefined

    const insights: SessionInsights = {
      summary: parsed.summary ?? "Session analyzed.",
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      checkIn:
        parsed.checkIn ??
        (parsed.emotions?.[0] && parsed.themes?.[0]
          ? `${parsed.emotions[0]} about ${parsed.themes[0]}`
          : "reflective about your week"),
      spotTheDistortionThought: parsed.spotTheDistortionThought?.trim() || undefined,
      personalizedOptions: parsed.personalizedOptions,
      suggestedPractices: suggestedPractices?.length ? suggestedPractices : undefined,
    }

    return NextResponse.json(insights)
  } catch (err) {
    console.error("Transcript analysis error:", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to analyze transcript",
      },
      { status: 500 }
    )
  }
}
