"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowLeft, Droplets, TreePine, Sprout } from "lucide-react"
import { getState, addFertilizer, useFertilizerOnTree } from "@/lib/store"
import type { UserState } from "@/lib/store"

const Forest3DScene = dynamic(() => import("@/components/forest-3d/scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#1a2e1a]">
      <div className="text-center">
        <Sprout className="mx-auto mb-3 h-10 w-10 text-[#6BAF5E] animate-pulse" />
        <p className="text-sm font-medium text-[#6BAF5E]/80">Entering the forest...</p>
      </div>
    </div>
  ),
})

const FERTILIZER_COST = 3

export default function ForestPage() {
  const router = useRouter()
  const [state, setState] = useState<UserState | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [nearbyTree, setNearbyTree] = useState(false)

  useEffect(() => {
    setState(getState())
  }, [])

  const showNotification = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2000)
  }, [])

  const handleCollectFertilizer = useCallback(() => {
    const newState = addFertilizer(1)
    setState(newState)
    showNotification("+1 Fertilizer")
  }, [showNotification])

  const handleFertilizeTree = useCallback(
    (treeId: string): boolean => {
      if (!state) return false
      if ((state.fertilizer || 0) < FERTILIZER_COST) {
        showNotification(`Need ${FERTILIZER_COST} fertilizer!`)
        return false
      }
      const tree = state.trees.find((t) => t.id === treeId)
      if (!tree) return false
      if (tree.stage === "mature") {
        showNotification("Tree is already fully grown!")
        return false
      }
      const newState = useFertilizerOnTree(treeId, FERTILIZER_COST)
      if (newState) {
        setState(newState)
        showNotification("Tree grew a stage!")
        return true
      }
      return false
    },
    [state, showNotification]
  )

  if (!state) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1a2e1a]">
        <Sprout className="h-10 w-10 text-[#6BAF5E] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a2e1a]">
      {/* 3D Scene */}
      <Forest3DScene
        state={state}
        onCollectFertilizer={handleCollectFertilizer}
        onFertilizeTree={handleFertilizeTree}
      />

      {/* HUD Overlay */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top bar */}
        <div className="pointer-events-auto flex items-center justify-between p-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Forest
          </button>

          <div className="flex items-center gap-3">
            {/* Fertilizer count */}
            <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-md">
              <Droplets className="h-4 w-4 text-[#7CFC00]" />
              <span className="text-sm font-bold text-white">{state.fertilizer || 0}</span>
            </div>

            {/* Tree count */}
            <div className="flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2.5 backdrop-blur-md">
              <TreePine className="h-4 w-4 text-[#6BAF5E]" />
              <span className="text-sm font-bold text-white">{state.trees.length}</span>
            </div>
          </div>
        </div>

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-white/60" />
        </div>

        {/* Interaction prompt */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 pb-8">
          {/* Notification */}
          {notification && (
            <div className="rounded-xl bg-[#6BAF5E]/90 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              {notification}
            </div>
          )}

          {/* Controls hint */}
          <div className="flex items-center gap-4 rounded-xl bg-black/30 px-5 py-2.5 text-xs text-white/50 backdrop-blur-md">
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">WASD</kbd> Move
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">Mouse</kbd> Look
            </span>
            <span>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70">E</kbd> Fertilize tree
            </span>
          </div>
        </div>
      </div>

      {/* Click to start overlay */}
      <ClickToStartOverlay />
    </div>
  )
}

function ClickToStartOverlay() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handler = () => setVisible(false)
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement) setVisible(false)
    })
    document.addEventListener("click", handler, { once: true })
    return () => document.removeEventListener("click", handler)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="text-center">
        <Sprout className="mx-auto mb-4 h-12 w-12 text-[#6BAF5E]" />
        <h2 className="mb-2 text-xl font-bold text-white">Your Forest</h2>
        <p className="mb-4 text-sm text-white/60">Click anywhere to enter and look around</p>
        <div className="flex items-center justify-center gap-4 text-xs text-white/40">
          <span>WASD to move</span>
          <span>Mouse to look</span>
          <span>E to fertilize</span>
        </div>
      </div>
    </div>
  )
}
