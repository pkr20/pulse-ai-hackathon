"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { TreeType, TreeStage } from "@/lib/store"

const stageScales: Record<TreeStage, number> = {
  seed: 0.4,
  sprout: 0.9,
  sapling: 1.3,
  young: 1.7,
  mature: 2.0,
}

// Color palettes per tree type
const treeColors: Record<TreeType, { trunk: string; foliage: string; accent?: string }> = {
  oak: { trunk: "#5C3D2E", foliage: "#2D5A27", accent: "#3A7D32" },
  pine: { trunk: "#4A3728", foliage: "#1B4D2E", accent: "#2A6B3F" },
  cherry: { trunk: "#6B4226", foliage: "#3B7A3A", accent: "#F9A8C9" },
  birch: { trunk: "#E8DCC8", foliage: "#5FA55A", accent: "#C8E6C0" },
  willow: { trunk: "#5C4033", foliage: "#3A7340", accent: "#6BAF5E" },
  maple: { trunk: "#5E3A22", foliage: "#C44D21", accent: "#E8A020" },
}

interface Tree3DProps {
  type: TreeType
  stage: TreeStage
  position: [number, number, number]
  id: string
  isNearby?: boolean
  onClick?: () => void
}

function OakTree({ scale, colors }: { scale: number; colors: typeof treeColors.oak }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.05
  })
  return (
    <group ref={group} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 2.4, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      {/* Main canopy */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
      {/* Secondary canopy */}
      <mesh position={[0.5, 3.5, 0.3]}>
        <sphereGeometry args={[0.9, 10, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.8} />
      </mesh>
      <mesh position={[-0.4, 3.3, -0.3]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.8} />
      </mesh>
    </group>
  )
}

function PineTree({ scale, colors }: { scale: number; colors: typeof treeColors.pine }) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.1, 0.18, 2.0, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      {/* Bottom tier */}
      <mesh position={[0, 2.0, 0]}>
        <coneGeometry args={[1.3, 1.5, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
      {/* Middle tier */}
      <mesh position={[0, 3.0, 0]}>
        <coneGeometry args={[1.0, 1.4, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.8} />
      </mesh>
      {/* Top tier */}
      <mesh position={[0, 3.8, 0]}>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
    </group>
  )
}

function CherryTree({ scale, colors }: { scale: number; colors: typeof treeColors.cherry }) {
  const blossomPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 12; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.6
      const r = 0.8 + Math.random() * 0.7
      positions.push([
        Math.sin(phi) * Math.cos(theta) * r,
        2.8 + Math.cos(phi) * r * 0.6,
        Math.sin(phi) * Math.sin(theta) * r,
      ])
    }
    return positions
  }, [])

  return (
    <group scale={scale}>
      {/* Trunk - slightly curved */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.12, 0.2, 2.4, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[1.2, 12, 10]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
      {/* Blossoms */}
      {blossomPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12 + Math.random() * 0.08, 6, 6]} />
          <meshStandardMaterial color={colors.accent} roughness={0.5} emissive={colors.accent} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

function BirchTree({ scale, colors }: { scale: number; colors: typeof treeColors.birch }) {
  return (
    <group scale={scale}>
      {/* Trunk - white with marks */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 3.0, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.6} />
      </mesh>
      {/* Bark marks */}
      {[0.6, 1.2, 1.8, 2.4].map((y, i) => (
        <mesh key={i} position={[0.11, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.04, 0.08, 0.02]} />
          <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
      ))}
      {/* Foliage clusters */}
      <mesh position={[0, 3.3, 0]}>
        <sphereGeometry args={[0.9, 10, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 3.6, 0.2]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 3.5, -0.2]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
    </group>
  )
}

function WillowTree({ scale, colors }: { scale: number; colors: typeof treeColors.willow }) {
  const droopRefs = useRef<THREE.Mesh[]>([])
  
  useFrame((state) => {
    droopRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + i * 0.8) * 0.06
        mesh.rotation.z = Math.cos(state.clock.elapsedTime * 0.4 + i * 1.2) * 0.04
      }
    })
  })

  const branches = useMemo(() => {
    const b: { angle: number; length: number }[] = []
    for (let i = 0; i < 10; i++) {
      b.push({ angle: (i / 10) * Math.PI * 2, length: 1.5 + Math.random() * 1.0 })
    }
    return b
  }, [])

  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.15, 0.22, 2.6, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      {/* Canopy base */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.8} />
      </mesh>
      {/* Drooping branches */}
      {branches.map((b, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => { if (el) droopRefs.current[i] = el }}
          position={[
            Math.cos(b.angle) * 0.6,
            3.0 - b.length * 0.4,
            Math.sin(b.angle) * 0.6,
          ]}
        >
          <cylinderGeometry args={[0.04, 0.02, b.length, 4]} />
          <meshStandardMaterial color={colors.accent} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function MapleTree({ scale, colors }: { scale: number; colors: typeof treeColors.maple }) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 2.4, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={0.9} />
      </mesh>
      {/* Broad autumn canopy */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[1.5, 12, 10]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.7} />
      </mesh>
      <mesh position={[0.6, 3.3, 0.3]}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 3.4, -0.4]}>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color={colors.foliage} roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 3.8, 0.1]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.7} />
      </mesh>
    </group>
  )
}

const treeComponents: Record<TreeType, React.ComponentType<{ scale: number; colors: typeof treeColors.oak }>> = {
  oak: OakTree,
  pine: PineTree,
  cherry: CherryTree,
  birch: BirchTree,
  willow: WillowTree,
  maple: MapleTree,
}

export default function Tree3D({ type, stage, position, id, isNearby, onClick }: Tree3DProps) {
  const scale = stageScales[stage]
  const colors = treeColors[type]
  const TreeComponent = treeComponents[type]

  return (
    <group position={position} onClick={onClick}>
      <TreeComponent scale={scale} colors={colors} />
      {/* Glow ring when nearby */}
      {isNearby && stage !== "mature" && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshStandardMaterial color="#6BAF5E" transparent opacity={0.4} emissive="#6BAF5E" emissiveIntensity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
