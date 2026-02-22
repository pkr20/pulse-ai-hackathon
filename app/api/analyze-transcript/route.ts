import { NextResponse } from "next/server"
import OpenAI from "openai"
import type { SessionInsights } from "@/lib/store"

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
          content: `Analyze this transcript and return the JSON object:\n\n${transcript.slice(0, 15000)}`,
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
