// CBT Practice types and local storage management

export type CBTExerciseType =
  | "thought-record"
  | "cognitive-distortion"
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
  dailyLifeExample: string[]
  reflectionPrompt: string
  reflectionOptions: string[]
  watchNotification: string
  treeReward: TreeType
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

const STORAGE_KEY = "mindgrove-state"

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
    description: "Challenge negative thoughts with evidence.",
    prompts: [
      "What situation triggered this thought?",
      "What automatic thought came to mind?",
      "What emotions did you feel? (Rate intensity 1-10)",
      "What evidence supports this thought?",
      "What evidence goes against this thought?",
      "What is a more balanced thought?",
    ],
    dailyLifeExample: [
      "When you make a mistake at work.",
      "When you think 'I'm not good at this.'",
      "Use this to find the real facts.",
    ],
    reflectionPrompt: "When is the best time for you to use this today?",
    reflectionOptions: [
      "If I make a mistake later.",
      "When I feel overwhelmed.",
      "During my lunch break.",
      "When I finish my work.",
    ],
    watchNotification: "High heart rate? Let's check your thoughts for a moment.",
    treeReward: "oak",
  },
  {
    id: "cognitive-distortion-1",
    type: "cognitive-distortion",
    title: "Spot the Distortion",
    description: "Identify distortions in your thinking.",
    prompts: [
      "Describe a recent negative thought you had.",
      "Which distortion might this be? (All-or-nothing, catastrophizing, mind-reading, fortune-telling, personalization, etc.)",
      "Why do you think this is a distortion rather than a fact?",
      "How would you advise a friend who had this same thought?",
    ],
    dailyLifeExample: [
      "When a friend doesn't text back.",
      "When you think 'They are mad at me.'",
      "Use this to stop guessing feelings.",
    ],
    reflectionPrompt: "Which 'mental trap' is your biggest challenge tomorrow?",
    reflectionOptions: [
      "Guessing what others think.",
      "Thinking the worst will happen.",
      "Thinking in 'good' or 'bad' only.",
      "Taking things too personally.",
    ],
    watchNotification: "Is your heart racing? Maybe it's a 'mental trap.' Check now?",
    treeReward: "pine",
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
    description: "Notice what's going well in your life.",
    prompts: [
      "Pick or type what you're grateful for today.",
      "Your gratitude word cloud so far.",
    ],
    dailyLifeExample: [
      "During a very busy day.",
      "When someone says 'thank you.'",
      "Use this to see the good things.",
    ],
    reflectionPrompt: "Who would you like to share a happy moment with?",
    reflectionOptions: [
      "My family or partner.",
      "A close friend.",
      "A coworker.",
      "Just keeping it for myself.",
    ],
    watchNotification: "Take a beat. What's one good thing that happened just now?",
    treeReward: "birch",
  },
  {
    id: "breathing-1",
    type: "breathing",
    title: "Mindful Breathing",
    description: "Calm your mind with focused breathing.",
    prompts: [
      "Follow the box: 4s breathe in, 4s hold, 4s breathe out, 4s hold.",
      "How do you feel now? What did you notice?",
    ],
    dailyLifeExample: [
      "Before a scary meeting.",
      "When stuck in a long line.",
      "Use this to calm your body fast.",
    ],
    reflectionPrompt: "Where is a quiet place you can breathe today?",
    reflectionOptions: [
      "In my car or on the bus.",
      "In my favorite chair.",
      "Outside in the fresh air.",
      "Right before I go to sleep.",
    ],
    watchNotification: "Heart rate is 105bpm. Want to take 3 deep breaths with me?",
    treeReward: "willow",
  },
  {
    id: "reframing-1",
    type: "reframing",
    title: "Cognitive Reframing",
    description: "Rewrite unhelpful thoughts constructively.",
    prompts: [
      "What negative thought keeps coming back to you?",
      "What would you say to a loved one who had this thought?",
      "Write a reframed version of this thought that is kind but realistic.",
      "How does the reframed thought make you feel compared to the original?",
    ],
    dailyLifeExample: [
      "When you feel bad about yourself.",
      "When you think 'I look tired.'",
      "Use this to be kind to yourself.",
    ],
    reflectionPrompt: "What kind word will you say to yourself tomorrow?",
    reflectionOptions: [
      "I am doing my best.",
      "I am a good person.",
      "It is okay to be tired.",
      "I am proud of my work.",
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
