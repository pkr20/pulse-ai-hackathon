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
          content: `You are a supportive mental health assistant. Analyze therapy or coaching session transcripts to extract insights that can personalize CBT (cognitive behavioral therapy) exercises.

Return a JSON object with exactly these fields:
- summary: A 1-2 sentence summary of the session
- emotions: Array of 2-5 emotions or feelings mentioned (e.g. ["anxious", "overwhelmed", "hopeful"])
- themes: Array of 2-4 themes or topics (e.g. ["work stress", "relationship", "self-criticism"])
- personalizedContext: A 1-2 sentence context that will be prepended to CBT exercise prompts. Write in second person, past tense. Example: "Based on your last session, you've been feeling anxious lately about work deadlines." This should feel warm and specific to the transcript.`,
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
      personalizedContext?: string
    }

    const insights: SessionInsights = {
      summary: parsed.summary ?? "Session analyzed.",
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
      themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      personalizedContext:
        parsed.personalizedContext ??
        "Based on your last session, here's a reflection question for you.",
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
