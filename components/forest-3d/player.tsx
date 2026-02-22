"use client"

import { useRef, useEffect, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import type { RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"

const SPEED = 5
const MOUSE_SENSITIVITY = 0.002

// Reusable objects to avoid GC thrash in useFrame
const _euler = new THREE.Euler(0, 0, 0, "YXZ")
const _yawEuler = new THREE.Euler()
const _quat = new THREE.Quaternion()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _move = new THREE.Vector3()
const _pos = new THREE.Vector3()

interface PlayerProps {
  position: [number, number, number]
  onPositionChange?: (pos: THREE.Vector3) => void
}

export default function Player({ position, onPositionChange }: PlayerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const { camera, gl } = useThree()
  const keys = useRef<Record<string, boolean>>({})
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isLocked = useRef(false)

  const requestLock = useCallback(() => {
    gl.domElement.requestPointerLock()
  }, [gl])

  useEffect(() => {
    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement
    }
    document.addEventListener("pointerlockchange", handleLockChange)
    return () => document.removeEventListener("pointerlockchange", handleLockChange)
  }, [gl])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return
      yaw.current -= e.movementX * MOUSE_SENSITIVITY
      pitch.current -= e.movementY * MOUSE_SENSITIVITY
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current))
    }
    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
    }
  }, [])

  useEffect(() => {
    gl.domElement.addEventListener("click", requestLock)
    return () => gl.domElement.removeEventListener("click", requestLock)
  }, [gl, requestLock])

  useFrame(() => {
    if (!rigidBodyRef.current) return

    const pos = rigidBodyRef.current.translation()

    // Camera rotation - reuse objects
    _euler.set(pitch.current, yaw.current, 0, "YXZ")
    camera.quaternion.setFromEuler(_euler)
    camera.position.set(pos.x, pos.y + 1.5, pos.z)

    // Movement
    _yawEuler.set(0, yaw.current, 0)
    _quat.setFromEuler(_yawEuler)
    _forward.set(0, 0, -1).applyQuaternion(_quat)
    _right.set(1, 0, 0).applyQuaternion(_quat)

    _move.set(0, 0, 0)
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) _move.add(_forward)
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) _move.sub(_forward)
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) _move.add(_right)
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) _move.sub(_right)

    if (_move.lengthSq() > 0) {
      _move.normalize().multiplyScalar(SPEED)
    }

    const currentVel = rigidBodyRef.current.linvel()
    rigidBodyRef.current.setLinvel({ x: _move.x, y: currentVel.y, z: _move.z }, true)

    if (onPositionChange) {
      _pos.set(pos.x, pos.y, pos.z)
      onPositionChange(_pos)
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      enabledRotations={[false, false, false]}
      mass={1}
      linearDamping={4}
    >
      <CapsuleCollider args={[0.5, 0.3]} />
    </RigidBody>
  )
}
