"use client"

import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { useMemo } from "react"

interface GroundProps {
  size?: number
}

export default function Ground({ size = 80 }: GroundProps) {
  // Scatter some grass tufts
  const grassPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * size * 0.9
      const z = (Math.random() - 0.5) * size * 0.9
      positions.push([x, 0.05, z])
    }
    return positions
  }, [size])

  return (
    <>
      {/* Ground plane with physics */}
      <RigidBody type="fixed" friction={1}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#4A7C3F" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Subtle grid lines for ground texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#3D6B34" roughness={1} transparent opacity={0.3} />
      </mesh>

      {/* Grass tufts */}
      {grassPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, Math.random() * Math.PI, 0]}>
          <coneGeometry args={[0.08, 0.3, 4]} />
          <meshStandardMaterial color="#5A9E4B" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Edge border - simple low walls to keep player in bounds */}
      {[
        { pos: [0, 0.5, -size / 2] as [number, number, number], rot: [0, 0, 0] as [number, number, number], args: [size, 1, 0.5] as [number, number, number] },
        { pos: [0, 0.5, size / 2] as [number, number, number], rot: [0, 0, 0] as [number, number, number], args: [size, 1, 0.5] as [number, number, number] },
        { pos: [-size / 2, 0.5, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number], args: [0.5, 1, size] as [number, number, number] },
        { pos: [size / 2, 0.5, 0] as [number, number, number], rot: [0, 0, 0] as [number, number, number], args: [0.5, 1, size] as [number, number, number] },
      ].map((wall, i) => (
        <RigidBody key={i} type="fixed" position={wall.pos}>
          <mesh>
            <boxGeometry args={wall.args} />
            <meshStandardMaterial color="#3D6B34" transparent opacity={0} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}
