import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface LastExercise {
  exerciseTitle: string
  completedAt: string
  responses: string[]
}

interface ChatContext {
  sessionInsights?: {
    summary: string
    emotions: string[]
    themes: string[]
    checkIn: string
    spotTheDistortionThought?: string
    suggestedPractices?: { exerciseType: string; reason: string }[]
  }
  lastExercises?: LastExercise[]
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    )
  }

  try {
    const body = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[]
      context?: ChatContext
    }

    const { messages, context } = body
    if (!messages?.length || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    const systemParts: string[] = [
      `You are a warm, supportive AI therapist using CBT principles. You're here to listen, validate, and gently guide. Keep responses concise (2-4 sentences). Use simple, kind language. Never diagnose or replace professional care.`,
    ]

    if (context?.sessionInsights) {
      const si = context.sessionInsights
      systemParts.push(
        `\n## Session context (from last therapy/coaching session):`,
        `Summary: ${si.summary}`,
        `Emotions discussed: ${(si.emotions || []).join(", ") || "none noted"}`,
        `Themes: ${(si.themes || []).join(", ") || "none noted"}`,
        `Check-in: ${si.checkIn}`
      )
      if (si.spotTheDistortionThought) {
        systemParts.push(`Client's thought (Spot the Distortion): "${si.spotTheDistortionThought}"`)
      }
      if (si.suggestedPractices?.length) {
        systemParts.push(
          `Suggested practices for this client: ${si.suggestedPractices.map((s) => s.reason).join("; ")}`
        )
      }
    }

    if (context?.lastExercises?.length) {
      systemParts.push(`\n## Recent practice answers (from CBT exercises in the app):`)
      for (const ex of context.lastExercises) {
        const respText = ex.responses
          .filter((r) => typeof r === "string" && r.trim())
          .join(" | ")
        if (respText) {
          systemParts.push(`- ${ex.exerciseTitle} (${ex.completedAt.split("T")[0]}): ${respText}`)
        }
      }
      systemParts.push(
        `\nUse this context to personalize your responses. Reference what they've shared when relevant.`
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemParts.join("\n") },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
    })

    const reply = completion.choices[0]?.message?.content ?? "I'm here for you. How are you feeling right now?"
    return NextResponse.json({ message: reply })
  } catch (err) {
    console.error("Chat therapist error:", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to get response",
      },
      { status: 500 }
    )
  }
}
