"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface FertilizerOrbProps {
  position: [number, number, number]
}

export default function FertilizerOrb({ position }: FertilizerOrbProps) {
  const orbRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const bobY = 0.6 + Math.sin(t * 2 + position[0]) * 0.2
    if (orbRef.current) {
      orbRef.current.position.y = bobY
      orbRef.current.rotation.y = t * 1.5
    }
    if (glowRef.current) {
      glowRef.current.position.y = bobY
    }
    if (lightRef.current) {
      lightRef.current.position.y = bobY
      lightRef.current.intensity = 1.5 + Math.sin(t * 3) * 0.5
    }
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh ref={orbRef} position={[0, 0.6, 0]}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#7CFC00"
          emissive="#4ADE40"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh ref={glowRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial
          color="#7CFC00"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 0.6, 0]}
        color="#7CFC00"
        intensity={2}
        distance={4}
      />
    </group>
  )
}
