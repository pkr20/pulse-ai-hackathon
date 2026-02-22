import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    const audio = formData.get("audio") as File | null
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "en",
    })

    return NextResponse.json({
      transcript: transcription.text?.trim() || "",
    })
  } catch (err) {
    console.error("Transcription error:", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to transcribe audio",
      },
      { status: 500 }
    )
  }
}
