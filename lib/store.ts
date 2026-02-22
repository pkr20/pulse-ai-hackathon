// CBT Practice types and local storage management

export type CBTExerciseType =
  | "thought-record"
  | "cognitive-distortion"
  | "behavioral-activation"
  | "grounding"
  | "gratitude"
  | "breathing"
  | "reframing"

export interface CBTExercise {
  id: string
  type: CBTExerciseType
  title: string
  description: string
  prompts: string[]
  /** Options for each prompt - when set, show buttons instead of textarea */
  promptOptions?: string[][]
  /** When set, prepend to prompts (e.g. "Based on your last session, ") */
  promptPrefix?: string
  dailyLifeExample: string[]
  reflectionPrompt: string
  reflectionOptions: string[]
  watchNotification: string
  treeReward: TreeType
  /** When set, shows a check-in step first: "Based on your last session you felt X. How much do you feel like this now?" with 1-5 scale */
  personalizedCheckIn?: { text: string }
  /** When set for Spot the Distortion, uses custom flow: thought → distortion → feel same/better → add thoughts */
  spotTheDistortionFlow?: { thought: string; addThoughtsOptions?: string[] }
}

export type TreeType = "oak" | "pine" | "cherry" | "birch" | "willow" | "maple"
export type TreeStage = "seed" | "sprout" | "sapling" | "young" | "mature"

export interface Tree {
  id: string
  type: TreeType
  stage: TreeStage
  x: number
  y: number
  plantedAt: string
  exerciseType: CBTExerciseType
}

export interface CompletedExercise {
  id: string
  exerciseType: CBTExerciseType
  completedAt: string
  responses: string[]
  treeId: string
}

export interface UserState {
  trees: Tree[]
  completedExercises: CompletedExercise[]
  streak: number
  lastPracticeDate: string | null
  totalExercises: number
  level: number
  fertilizer: number
}

/** Transcript-based options to personalize exercises - all from the session */
export interface PersonalizedOptions {
  situations?: string[]      // What happened - from transcript (3-5)
  thoughts?: string[]       // Negative thoughts expressed (3-5)
  supportingFacts?: string[] // Facts that support the thought (2-4)
  opposingFacts?: string[]   // Facts that go against it (2-4)
  kinderThoughts?: string[]  // Kinder reframes (3-5)
  friendAdvice?: string[]    // What to tell a friend (3-5)
  activities?: string[]      // Activities put off or discussed (3-5)
  smallSteps?: string[]      // Small steps mentioned (2-4)
  whenOptions?: string[]     // When to do it (2-4)
  howFeelNow?: string[]      // How they feel now (3-5)
  addThoughts?: string[]     // For Spot the Distortion step 3 (2-4)
}

/** Suggested daily practice based on transcript (e.g. OCD → Spot the Distortion) */
export interface SuggestedPractice {
  exerciseType: CBTExerciseType
  reason: string
}

/** Session insights from transcript analysis - used to personalize exercise prompts */
export interface SessionInsights {
  summary: string
  emotions: string[]
  themes: string[]
  checkIn: string
  spotTheDistortionThought?: string
  /** Options derived from transcript - used to personalize all exercises */
  personalizedOptions?: PersonalizedOptions
  /** AI-suggested exercises based on themes (e.g. OCD → cognitive-distortion, depression → gratitude) */
  suggestedPractices?: SuggestedPractice[]
}

const STORAGE_KEY = "mindgrove-state"
const SESSION_INSIGHTS_KEY = "mindgrove-session-insights"

const defaultState: UserState = {
  trees: [],
  completedExercises: [],
  streak: 0,
  lastPracticeDate: null,
  totalExercises: 0,
  level: 1,
  fertilizer: 0,
}

export function getState(): UserState {
  if (typeof window === "undefined") return defaultState
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultState
    return { ...defaultState, ...JSON.parse(stored) }
  } catch {
    return defaultState
  }
}

export function setState(state: UserState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function getTreeStageByCount(count: number): TreeStage {
  if (count <= 2) return "seed"
  if (count <= 5) return "sprout"
  if (count <= 10) return "sapling"
  if (count <= 20) return "young"
  return "mature"
}

function calculateLevel(totalExercises: number): number {
  if (totalExercises < 5) return 1
  if (totalExercises < 15) return 2
  if (totalExercises < 30) return 3
  if (totalExercises < 50) return 4
  if (totalExercises < 80) return 5
  return Math.min(10, 5 + Math.floor((totalExercises - 80) / 30))
}

function calculateStreak(lastPracticeDate: string | null, currentStreak: number): number {
  if (!lastPracticeDate) return 1
  const last = new Date(lastPracticeDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return currentStreak // Same day
  if (diffDays === 1) return currentStreak + 1 // Consecutive day
  return 1 // Streak broken
}

function getTreePosition(existingTrees: Tree[]): { x: number; y: number } {
  // Place trees in a natural-looking pattern
  const maxAttempts = 50
  for (let i = 0; i < maxAttempts; i++) {
    const x = 5 + Math.random() * 90
    const y = 20 + Math.random() * 65

    // Check minimum distance from existing trees
    const tooClose = existingTrees.some((tree) => {
      const dx = tree.x - x
      const dy = tree.y - y
      return Math.sqrt(dx * dx + dy * dy) < 8
    })

    if (!tooClose) return { x, y }
  }
  return { x: 5 + Math.random() * 90, y: 20 + Math.random() * 65 }
}

export function completeExercise(
  exerciseType: CBTExerciseType,
  responses: string[],
  treeType: TreeType
): UserState {
  const state = getState()
  const treeId = generateId()
  const exerciseId = generateId()
  const now = new Date().toISOString()

  // Count exercises of this type to determine tree stage
  const typeCount = state.completedExercises.filter(
    (e) => e.exerciseType === exerciseType
  ).length

  const position = getTreePosition(state.trees)

  const newTree: Tree = {
    id: treeId,
    type: treeType,
    stage: getTreeStageByCount(typeCount + 1),
    x: position.x,
    y: position.y,
    plantedAt: now,
    exerciseType,
  }

  const newExercise: CompletedExercise = {
    id: exerciseId,
    exerciseType,
    completedAt: now,
    responses,
    treeId,
  }

  const totalExercises = state.totalExercises + 1
  const today = new Date().toISOString().split("T")[0]

  const newState: UserState = {
    ...state,
    trees: [...state.trees, newTree],
    completedExercises: [...state.completedExercises, newExercise],
    streak: calculateStreak(state.lastPracticeDate, state.streak),
    lastPracticeDate: today,
    totalExercises,
    level: calculateLevel(totalExercises),
  }

  setState(newState)
  return newState
}

// Exercises data
export const exercises: CBTExercise[] = [
  {
    id: "thought-record-1",
    type: "thought-record",
    title: "Thought Record",
    description: "Look at your thoughts in a new way.",
    prompts: [
      "What happened?",
      "What did you think?",
      "How did you feel?",
      "What is one fact that supports this thought?",
      "What is one fact that goes against it?",
      "What is a kinder way to think about it?",
    ],
    promptOptions: [
      ["Work mistake", "Argument", "Something didn't go my way", "I felt left out", "I was alone"],
      ["I'm not good enough", "They don't like me", "Something bad will happen", "It's my fault", "I can't do it"],
      ["1 - Very bad", "2", "3", "4", "5 - Okay"],
      ["It happened before", "Someone said so", "I saw it", "I feel it's true"],
      ["Someone said otherwise", "It worked before", "I'm not sure"],
      ["I'm doing my best", "It's okay to make mistakes", "I can learn", "One thing doesn't mean everything"],
    ],
    dailyLifeExample: [
      "When you make a mistake.",
      "When you think 'I'm not good at this.'",
      "Use this to see the facts.",
    ],
    reflectionPrompt: "When will you try this today?",
    reflectionOptions: [
      "If I make a mistake.",
      "When I feel stressed.",
      "When I finish work.",
    ],
    watchNotification: "High heart rate? Let's check your thoughts for a moment.",
    treeReward: "oak",
  },
  {
    id: "cognitive-distortion-1",
    type: "cognitive-distortion",
    title: "Spot the Distortion",
    description: "Find unhelpful thinking patterns.",
    prompts: [
      "What thought bothered you?",
      "Which one fits?",
      "Is it a fact or a guess?",
      "What would you tell a friend?",
    ],
    promptOptions: [
      ["I'm not good enough", "They don't like me", "Something bad will happen", "It's my fault", "I can't do it"],
      ["All or nothing", "Thinking the worst", "Guessing what others think", "Blaming yourself"],
      ["Fact", "Guess"],
      ["You're doing your best", "It's not your fault", "Don't worry", "Try again"],
    ],
    dailyLifeExample: [
      "When a friend doesn't text back.",
      "When you think 'They are mad at me.'",
      "Use this to stop guessing.",
    ],
    reflectionPrompt: "What will you watch for tomorrow?",
    reflectionOptions: [
      "Guessing what others think.",
      "Thinking the worst.",
      "Blaming myself.",
    ],
    watchNotification: "Is your heart racing? Maybe it's a 'mental trap.' Check now?",
    treeReward: "pine",
  },
  {
    id: "behavioral-activation-1",
    type: "behavioral-activation",
    title: "Activity Planning",
    description: "Plan one thing to do.",
    prompts: [
      "What have you put off?",
      "How good would it feel?",
      "What is one small step?",
      "When will you do it?",
    ],
    promptOptions: [
      ["Chores", "Exercise", "Calling someone", "Work task", "Going out"],
      ["1 - Not much", "2", "3", "4", "5 - A lot"],
      ["Do 5 minutes", "Just start", "Ask for help", "Break it down"],
      ["Today", "Tomorrow morning", "Tomorrow afternoon", "This week"],
    ],
    dailyLifeExample: [
      "When you have chores.",
      "When you feel like doing nothing.",
      "Use this to start small.",
    ],
    reflectionPrompt: "What will you do tonight?",
    reflectionOptions: [
      "Finishing one task.",
      "Going for a walk.",
      "Calling a friend.",
    ],
    watchNotification: "Feeling stuck? Plan one small thing to do.",
    treeReward: "cherry",
  },
  {
    id: "grounding-1",
    type: "grounding",
    title: "5-4-3-2-1 Grounding",
    description: "Use your senses to focus on the present moment.",
    prompts: [
      "Name 5 things you can see right now.",
      "Name 4 things you can feel (like your chair).",
      "Name 3 things you can hear (like a clock).",
      "Name 2 things you can smell (or like to smell).",
      "Name 1 thing you can taste (or like to taste).",
    ],
    dailyLifeExample: [
      "When your mind is racing.",
      "When you feel very worried or scared.",
      "Use this to feel safe in the present.",
    ],
    reflectionPrompt: "When is the next time you might use this today?",
    reflectionOptions: [
      "If I start to feel worried.",
      "When things get too loud.",
      "Before I go to a new place.",
      "Whenever I need to feel calm.",
    ],
    watchNotification: "You seem stressed. Use your senses to find 5 things you see?",
    treeReward: "cherry",
  },
  {
    id: "gratitude-1",
    type: "gratitude",
    title: "Gratitude Journal",
    description: "Notice what's good today.",
    prompts: [
      "What are you grateful for?",
      "Your gratitude words so far.",
    ],
    dailyLifeExample: [
      "On a busy day.",
      "When someone says thank you.",
      "Use this to see good things.",
    ],
    reflectionPrompt: "Who would you tell?",
    reflectionOptions: [
      "Family.",
      "A friend.",
      "Just me.",
    ],
    watchNotification: "Take a beat. What's one good thing that happened just now?",
    treeReward: "birch",
  },
  {
    id: "breathing-1",
    type: "breathing",
    title: "Mindful Breathing",
    description: "Calm down with breathing.",
    prompts: [
      "Follow the box: breathe in, hold, breathe out, hold.",
      "How do you feel now?",
    ],
    promptOptions: [
      [], // breathing animation - no options
      ["Calm", "A bit better", "Same", "More relaxed", "Tired"],
    ],
    dailyLifeExample: [
      "Before something scary.",
      "When you wait in line.",
      "Use this to calm down.",
    ],
    reflectionPrompt: "Where can you breathe today?",
    reflectionOptions: [
      "In my chair.",
      "Outside.",
      "Before bed.",
    ],
    watchNotification: "Heart rate is 105bpm. Want to take 3 deep breaths with me?",
    treeReward: "willow",
  },
  {
    id: "reframing-1",
    type: "reframing",
    title: "Kind Thoughts",
    description: "Change a thought to be kinder.",
    prompts: [
      "What thought bothers you?",
      "What would you tell a friend?",
      "What is a kinder way to think it?",
      "How does that feel?",
    ],
    promptOptions: [
      ["I'm not good enough", "They don't like me", "Something bad will happen", "It's my fault", "I can't do it"],
      ["You're doing your best", "It's not your fault", "Don't worry", "Try again"],
      ["I'm doing my best", "It's okay to make mistakes", "I can learn", "One thing doesn't mean everything"],
      ["Better", "A bit better", "Same", "Relief"],
    ],
    dailyLifeExample: [
      "When you feel bad about yourself.",
      "When you think 'I look tired.'",
      "Use this to be kind to yourself.",
    ],
    reflectionPrompt: "What will you tell yourself tomorrow?",
    reflectionOptions: [
      "I am doing my best.",
      "I am a good person.",
      "It is okay to be tired.",
    ],
    watchNotification: "Don't be hard on yourself. Use this time to be kind.",
    treeReward: "maple",
  },
]

export function getMonthActivityMap(): Record<string, number> {
  const state = getState()
  const map: Record<string, number> = {}
  for (const ex of state.completedExercises) {
    const day = ex.completedAt.split("T")[0]
    map[day] = (map[day] || 0) + 1
  }
  return map
}

export function getAllGratitudeWords(): string[] {
  const state = getState()
  const words: string[] = []
  for (const ex of state.completedExercises) {
    if (ex.exerciseType === "gratitude") {
      // Each response might be comma-separated tags
      for (const r of ex.responses) {
        if (typeof r !== "string") continue
        r.split(",")
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean)
          .forEach((w) => words.push(w))
      }
    }
  }
  return words
}

export function getTodayExerciseCount(): number {
  const state = getState()
  const today = new Date().toISOString().split("T")[0]
  return state.completedExercises.filter(
    (e) => e.completedAt.split("T")[0] === today
  ).length
}

export function addFertilizer(amount: number): UserState {
  const state = getState()
  const newState = { ...state, fertilizer: (state.fertilizer || 0) + amount }
  setState(newState)
  return newState
}

export function useFertilizerOnTree(treeId: string, cost: number): UserState | null {
  const state = getState()
  if ((state.fertilizer || 0) < cost) return null

  const stages: TreeStage[] = ["seed", "sprout", "sapling", "young", "mature"]
  const treeIndex = state.trees.findIndex((t) => t.id === treeId)
  if (treeIndex === -1) return null

  const tree = state.trees[treeIndex]
  const currentStageIdx = stages.indexOf(tree.stage)
  if (currentStageIdx >= stages.length - 1) return null // already mature

  const updatedTrees = [...state.trees]
  updatedTrees[treeIndex] = { ...tree, stage: stages[currentStageIdx + 1] }

  const newState = {
    ...state,
    trees: updatedTrees,
    fertilizer: (state.fertilizer || 0) - cost,
  }
  setState(newState)
  return newState
}

export function getExerciseTypeStats(): Record<CBTExerciseType, number> {
  const state = getState()
  const stats: Record<string, number> = {}
  for (const ex of state.completedExercises) {
    stats[ex.exerciseType] = (stats[ex.exerciseType] || 0) + 1
  }
  return stats as Record<CBTExerciseType, number>
}

export function getSessionInsights(): SessionInsights | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(SESSION_INSIGHTS_KEY)
    if (!stored) return null
    return JSON.parse(stored) as SessionInsights
  } catch {
    return null
  }
}

export function setSessionInsights(insights: SessionInsights): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_INSIGHTS_KEY, JSON.stringify(insights))
}

export function clearSessionInsights(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_INSIGHTS_KEY)
}

const DISTORTION_TYPES = [
  "All or nothing",
  "Thinking the worst",
  "Guessing what others think",
  "Blaming yourself",
] as const

/** Returns an exercise with transcript-based personalization when session insights are available */
export function getPersonalizedExercise(
  exercise: CBTExercise,
  sessionInsights: SessionInsights | null
): CBTExercise {
  if (!sessionInsights) return exercise

  const result: CBTExercise = { ...exercise }
  const opts = sessionInsights.personalizedOptions

  if (exercise.type === "cognitive-distortion" && sessionInsights.checkIn) {
    result.personalizedCheckIn = {
      text: `Last time you felt ${sessionInsights.checkIn}. How much now?`,
    }
  }

  if (exercise.type === "cognitive-distortion" && (sessionInsights.summary || sessionInsights.themes?.length)) {
    result.promptPrefix = "Based on your last session, "
  }

  if (
    exercise.type === "cognitive-distortion" &&
    sessionInsights.spotTheDistortionThought
  ) {
    result.spotTheDistortionFlow = {
      thought: sessionInsights.spotTheDistortionThought,
      addThoughtsOptions: opts?.addThoughts ?? [
        "I want to work on this",
        "I feel a bit better",
        "No more thoughts",
      ],
    }
  }

  if (opts && exercise.type !== "gratitude") {
    const built = buildPersonalizedPromptOptions(exercise.type, opts, exercise.promptOptions)
    if (built.some((arr) => arr.length > 0)) {
      result.promptOptions = built
    }
  }

  return result
}

function pickOpts<T>(from: T[] | undefined, fallback: T[] | undefined): T[] {
  const arr = from ?? fallback ?? []
  return arr.length > 0 ? arr : (fallback ?? [])
}

function buildPersonalizedPromptOptions(
  type: CBTExerciseType,
  opts: PersonalizedOptions,
  fallback: string[][] | undefined
): string[][] {
  const def = fallback ?? []
  switch (type) {
    case "thought-record":
      return [
        pickOpts(opts.situations, def[0]),
        pickOpts(opts.thoughts, def[1]),
        def[2]?.length ? def[2] : ["1 - Very bad", "2", "3", "4", "5 - Okay"],
        pickOpts(opts.supportingFacts, def[3]),
        pickOpts(opts.opposingFacts, def[4]),
        pickOpts(opts.kinderThoughts, def[5]),
      ]
    case "cognitive-distortion": {
      const distortionFallback: string[] = ["All or nothing", "Thinking the worst", "Guessing what others think", "Blaming yourself"]
      const factGuessFallback: string[] = ["Fact", "Guess"]
      return [
        pickOpts(opts.thoughts, def[0]),
        pickOpts(def[1], distortionFallback),
        pickOpts(def[2], factGuessFallback),
        pickOpts(opts.friendAdvice, def[3]),
      ]
    }
    case "behavioral-activation": {
      const scaleFallback: string[] = ["1 - Not much", "2", "3", "4", "5 - A lot"]
      return [
        pickOpts(opts.activities, def[0]),
        pickOpts(def[1], scaleFallback),
        pickOpts(opts.smallSteps, def[2]),
        pickOpts(opts.whenOptions, def[3]),
      ]
    }
    case "breathing":
      return [
        [],
        pickOpts(opts.howFeelNow, def[1] ?? ["Calm", "A bit better", "Same", "More relaxed", "Tired"]),
      ]
    case "reframing":
      return [
        pickOpts(opts.thoughts, def[0]),
        pickOpts(opts.friendAdvice, def[1]),
        pickOpts(opts.kinderThoughts, def[2]),
        pickOpts(opts.howFeelNow, def[3] ?? ["Better", "A bit better", "Same", "Relief"]),
      ]
    default:
      return def
  }
}

export { DISTORTION_TYPES }
