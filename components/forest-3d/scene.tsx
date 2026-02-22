"use client"

import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import * as THREE from "three"
import Player from "./player"
import Ground from "./ground"
import Tree3D from "./trees"
import FertilizerOrb from "./fertilizer-orb"
import type { Tree, UserState } from "@/lib/store"

const GROUND_SIZE = 60
const ORB_COUNT = 8

interface Forest3DSceneProps {
  state: UserState
  onCollectFertilizer: (orbIndex: number) => Promise<boolean>
  onFertilizeTree: (treeId: string) => boolean
}

function mapTreeTo3DPosition(tree: Tree): [number, number, number] {
  const x = ((tree.x / 100) - 0.5) * GROUND_SIZE * 0.8
  const z = ((tree.y / 100) - 0.5) * GROUND_SIZE * 0.8
  return [x, 0, z]
}

function generateOrbPositions(trees: Tree[], count: number): [number, number, number][] {
  const positions: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    let x: number, z: number
    let tries = 0
    do {
      x = (Math.random() - 0.5) * GROUND_SIZE * 0.7
      z = (Math.random() - 0.5) * GROUND_SIZE * 0.7
      tries++
    } while (
      tries < 20 &&
      trees.some((t) => {
        const tp = mapTreeTo3DPosition(t)
        return Math.hypot(tp[0] - x, tp[2] - z) < 3
      })
    )
    positions.push([x, 0, z])
  }
  return positions
}

const ORB_COLLECT_RADIUS = 2.5

// Proximity-based orb collection - more reliable than Rapier sensors after removing bodies
function OrbProximityChecker({
  playerPosRef,
  orbPositions,
  collectedOrbs,
  disabled,
  onCollectOrb,
}: {
  playerPosRef: React.RefObject<THREE.Vector3>
  orbPositions: [number, number, number][]
  collectedOrbs: Set<number>
  disabled: boolean
  onCollectOrb: (index: number) => void
}) {
  const triggeredForVisitRef = useRef<Record<number, boolean>>({})

  useFrame(() => {
    if (disabled || !playerPosRef.current) return
    const px = playerPosRef.current.x
    const pz = playerPosRef.current.z

    for (let i = 0; i < orbPositions.length; i++) {
      if (collectedOrbs.has(i)) continue
      const [ox, , oz] = orbPositions[i]
      const dist = Math.hypot(px - ox, pz - oz)

      if (dist < ORB_COLLECT_RADIUS) {
        if (!triggeredForVisitRef.current[i]) {
          triggeredForVisitRef.current[i] = true
          onCollectOrb(i)
        }
      } else {
        triggeredForVisitRef.current[i] = false
      }
    }
  })

  return null
}

// Proximity checker runs inside the Canvas to use useFrame
function ProximityChecker({
  trees,
  playerPosRef,
  nearbyTreeIdRef,
  onFertilizeTree,
}: {
  trees: Tree[]
  playerPosRef: React.RefObject<THREE.Vector3>
  nearbyTreeIdRef: React.MutableRefObject<string | null>
  onFertilizeTree: (treeId: string) => boolean
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && nearbyTreeIdRef.current) {
        onFertilizeTree(nearbyTreeIdRef.current)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [nearbyTreeIdRef, onFertilizeTree])

  useFrame(() => {
    if (!playerPosRef.current) return
    const px = playerPosRef.current.x
    const pz = playerPosRef.current.z

    let closest: string | null = null
    let closestDist = Infinity

    for (const tree of trees) {
      const treePos = mapTreeTo3DPosition(tree)
      const dist = Math.hypot(px - treePos[0], pz - treePos[2])
      if (dist < 4 && dist < closestDist && tree.stage !== "mature") {
        closest = tree.id
        closestDist = dist
      }
    }

    nearbyTreeIdRef.current = closest
  })

  return null
}

export default function Forest3DScene({
  state,
  onCollectFertilizer,
  onFertilizeTree,
  fertilizerDialogOpen = false,
}: Forest3DSceneProps) {
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 8))
  const nearbyTreeIdRef = useRef<string | null>(null)
  const [collectedOrbs, setCollectedOrbs] = useState<Set<number>>(new Set())
  const [retryKeys, setRetryKeys] = useState<Record<number, number>>({})

  const orbPositions = useMemo(
    () => generateOrbPositions(state.trees, ORB_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.trees.length]
  )

  const handlePlayerMove = useCallback((pos: THREE.Vector3) => {
    playerPosRef.current.copy(pos)
  }, [])

  const handleCollectOrb = useCallback(
    async (index: number) => {
      const completed = await onCollectFertilizer(index)
      if (completed) {
        requestAnimationFrame(() => {
          setCollectedOrbs((prev) => {
            const next = new Set(prev)
            next.add(index)
            return next
          })
        })
      } else {
        setRetryKeys((prev) => ({ ...prev, [index]: (prev[index] ?? 0) + 1 }))
      }
    },
    [onCollectFertilizer]
  )

  // Pre-compute tree positions to avoid recalculating every frame
  const treePositions = useMemo(
    () => state.trees.map((t) => ({ ...t, pos3d: mapTreeTo3DPosition(t) })),
    [state.trees]
  )

  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        camera={{ fov: 70, near: 0.1, far: 200 }}
        gl={{ alpha: false, antialias: true }}
      >
        <color attach="background" args={["#87CEEB"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Environment preset="forest" background={false} />
        <fog attach="fog" args={["#87CEAB", 40, 80]} />

        <Physics gravity={[0, -20, 0]}>
          <Ground size={GROUND_SIZE} />

          <Player position={[0, 2, 8]} onPositionChange={handlePlayerMove} />

          <ProximityChecker
            trees={state.trees}
            playerPosRef={playerPosRef}
            nearbyTreeIdRef={nearbyTreeIdRef}
            onFertilizeTree={onFertilizeTree}
          />

          <OrbProximityChecker
            playerPosRef={playerPosRef}
            orbPositions={orbPositions}
            collectedOrbs={collectedOrbs}
            disabled={fertilizerDialogOpen}
            onCollectOrb={handleCollectOrb}
          />

          {treePositions.map((tree) => (
            <Tree3D
              key={tree.id}
              id={tree.id}
              type={tree.type}
              stage={tree.stage}
              position={tree.pos3d}
              isNearby={false}
            />
          ))}

          {orbPositions.map((pos, i) =>
            collectedOrbs.has(i) ? null : (
              <FertilizerOrb key={`${i}-${retryKeys[i] ?? 0}`} position={pos} />
            )
          )}
        </Physics>
      </Canvas>
    </div>
  )
}
