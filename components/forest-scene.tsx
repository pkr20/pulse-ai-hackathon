"use client"

import { useRef, useEffect, useCallback } from "react"
import type { Tree, TreeType, TreeStage } from "@/lib/store"

interface ForestSceneProps {
  trees: Tree[]
  level: number
}

interface TreeColors {
  trunk: string
  canopy: string[]
  accent?: string
}

function getTreeColors(type: TreeType): TreeColors {
  switch (type) {
    case "oak":
      return { trunk: "#6B4226", canopy: ["#2D5F2D", "#3A7A3A", "#4E8C4E"] }
    case "pine":
      return { trunk: "#5C3A1E", canopy: ["#1B4D1B", "#2A6B2A", "#1F5C1F"] }
    case "cherry":
      return { trunk: "#8B5E3C", canopy: ["#E8A0BF", "#D48BA5", "#F0B6D0"], accent: "#FFD1E8" }
    case "birch":
      return { trunk: "#E8DCC8", canopy: ["#7CB87C", "#8FCA8F", "#A3D4A3"] }
    case "willow":
      return { trunk: "#6B5B3E", canopy: ["#5CA05C", "#73B873", "#85C585"] }
    case "maple":
      return { trunk: "#7A4A2A", canopy: ["#CC5533", "#DD7744", "#E89955"], accent: "#FFAA44" }
  }
}

function getTreeScale(stage: TreeStage): number {
  switch (stage) {
    case "seed": return 0.3
    case "sprout": return 0.5
    case "sapling": return 0.7
    case "young": return 0.85
    case "mature": return 1.0
  }
}

function drawSingleTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: TreeType,
  stage: TreeStage,
  time: number,
  baseSize: number
) {
  const colors = getTreeColors(type)
  const scale = getTreeScale(stage) * baseSize
  const sway = Math.sin(time * 0.001 + x * 0.1) * 2 * (scale / baseSize)

  ctx.save()
  ctx.translate(x, y)

  if (stage === "seed") {
    // Draw a small seed/mound
    ctx.fillStyle = "#8B6914"
    ctx.beginPath()
    ctx.ellipse(0, 0, scale * 0.5, scale * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()
    // Little sprout line
    ctx.strokeStyle = "#4E8C4E"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(sway * 0.5, -scale * 0.8)
    ctx.stroke()
    ctx.restore()
    return
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)"
  ctx.beginPath()
  ctx.ellipse(0, scale * 0.1, scale * 0.6, scale * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()

  // Trunk
  const trunkWidth = scale * 0.12
  const trunkHeight = scale * 0.7
  ctx.fillStyle = colors.trunk
  ctx.beginPath()
  ctx.moveTo(-trunkWidth, 0)
  ctx.lineTo(-trunkWidth * 0.6 + sway * 0.3, -trunkHeight)
  ctx.lineTo(trunkWidth * 0.6 + sway * 0.3, -trunkHeight)
  ctx.lineTo(trunkWidth, 0)
  ctx.closePath()
  ctx.fill()

  // Canopy based on tree type
  const canopyY = -trunkHeight
  
  if (type === "pine") {
    // Triangular layers
    for (let i = 0; i < 3; i++) {
      const layerScale = 1 - i * 0.25
      const layerY = canopyY + i * scale * 0.2
      ctx.fillStyle = colors.canopy[i] || colors.canopy[0]
      ctx.beginPath()
      ctx.moveTo(sway + 0, layerY - scale * 0.6 * layerScale)
      ctx.lineTo(sway + -scale * 0.4 * layerScale, layerY + scale * 0.1)
      ctx.lineTo(sway + scale * 0.4 * layerScale, layerY + scale * 0.1)
      ctx.closePath()
      ctx.fill()
    }
  } else if (type === "willow") {
    // Round top with hanging branches
    ctx.fillStyle = colors.canopy[0]
    ctx.beginPath()
    ctx.arc(sway, canopyY - scale * 0.15, scale * 0.35, 0, Math.PI * 2)
    ctx.fill()
    // Drooping branches
    ctx.strokeStyle = colors.canopy[1]
    ctx.lineWidth = 1.5
    for (let i = -3; i <= 3; i++) {
      const branchSway = Math.sin(time * 0.002 + i) * 3
      ctx.beginPath()
      ctx.moveTo(sway + i * scale * 0.08, canopyY)
      ctx.quadraticCurveTo(
        sway + i * scale * 0.12 + branchSway,
        canopyY + scale * 0.3,
        sway + i * scale * 0.15 + branchSway,
        canopyY + scale * 0.5
      )
      ctx.stroke()
    }
  } else {
    // Round canopy (oak, cherry, birch, maple)
    for (let i = colors.canopy.length - 1; i >= 0; i--) {
      const r = scale * (0.35 + i * 0.05)
      const offsetX = (i - 1) * scale * 0.08 + sway
      const offsetY = canopyY - scale * 0.15 + i * scale * 0.03
      ctx.fillStyle = colors.canopy[i]
      ctx.beginPath()
      ctx.arc(offsetX, offsetY, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Accent blossoms/leaves for cherry and maple
    if (colors.accent && stage !== "sprout") {
      const dots = type === "cherry" ? 8 : 5
      for (let i = 0; i < dots; i++) {
        const angle = (i / dots) * Math.PI * 2 + time * 0.0005
        const dotR = scale * 0.25
        const dotX = sway + Math.cos(angle) * dotR
        const dotY = canopyY - scale * 0.15 + Math.sin(angle) * dotR * 0.7
        ctx.fillStyle = colors.accent
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(dotX, dotY, scale * 0.04, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }
  }

  ctx.restore()
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  level: number,
  time: number
) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  skyGrad.addColorStop(0, "#B8D8E8")
  skyGrad.addColorStop(0.5, "#D4E8D0")
  skyGrad.addColorStop(1, "#E8F0E4")
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.55)

  // Distant hills
  ctx.fillStyle = "#9BBF8D"
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(0, h * 0.45)
  for (let x = 0; x <= w; x += 20) {
    const y = h * 0.45 + Math.sin(x * 0.005 + 1) * 30 + Math.sin(x * 0.012) * 15
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Mid hills
  ctx.fillStyle = "#7DAA6E"
  ctx.globalAlpha = 0.25
  ctx.beginPath()
  ctx.moveTo(0, h * 0.52)
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.52 + Math.sin(x * 0.008 + 2) * 20 + Math.sin(x * 0.015) * 10
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Ground
  const groundY = h * 0.6
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, h)
  
  // Ground gets greener with level
  const greenIntensity = Math.min(level / 10, 1)
  const baseGreen = Math.floor(140 + greenIntensity * 60)
  groundGrad.addColorStop(0, `rgb(${120 - greenIntensity * 20}, ${baseGreen}, ${80 - greenIntensity * 10})`)
  groundGrad.addColorStop(0.5, `rgb(${100 - greenIntensity * 20}, ${baseGreen - 20}, ${70 - greenIntensity * 10})`)
  groundGrad.addColorStop(1, `rgb(${80 - greenIntensity * 15}, ${baseGreen - 40}, ${55 - greenIntensity * 10})`)
  
  ctx.fillStyle = groundGrad
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  for (let x = 0; x <= w; x += 10) {
    const y = groundY + Math.sin(x * 0.01 + time * 0.0002) * 5
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  // Grass blades
  if (level >= 2) {
    const grassCount = Math.min(level * 15, 120)
    ctx.strokeStyle = `rgba(${70 - greenIntensity * 15}, ${baseGreen + 20}, ${60}, 0.4)`
    ctx.lineWidth = 1.2
    for (let i = 0; i < grassCount; i++) {
      const gx = (i / grassCount) * w + Math.sin(i * 7.3) * 20
      const gy = groundY + Math.sin(gx * 0.01) * 5 + 2
      const grassSway = Math.sin(time * 0.0015 + i * 0.5) * 3
      ctx.beginPath()
      ctx.moveTo(gx, gy)
      ctx.quadraticCurveTo(gx + grassSway, gy - 12, gx + grassSway * 1.5, gy - 18)
      ctx.stroke()
    }
  }

  // Small flowers at higher levels
  if (level >= 3) {
    const flowerCount = Math.min((level - 2) * 4, 20)
    const flowerColors = ["#FFD1E8", "#FFF0B3", "#D4E8FF", "#FFE0CC"]
    for (let i = 0; i < flowerCount; i++) {
      const fx = (i / flowerCount) * w + Math.sin(i * 13.7) * 40
      const fy = groundY + Math.sin(fx * 0.01) * 5 + 5 + Math.sin(i * 3.1) * 8
      ctx.fillStyle = flowerColors[i % flowerColors.length]
      ctx.beginPath()
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
  const clouds = [
    { x: 100, y: 60, s: 1 },
    { x: 350, y: 40, s: 0.8 },
    { x: 600, y: 70, s: 1.2 },
  ]
  for (const cloud of clouds) {
    const cx = ((cloud.x + time * 0.01) % (w + 200)) - 100
    const cy = cloud.y
    const s = cloud.s
    ctx.beginPath()
    ctx.arc(cx, cy, 25 * s, 0, Math.PI * 2)
    ctx.arc(cx + 20 * s, cy - 10 * s, 20 * s, 0, Math.PI * 2)
    ctx.arc(cx + 40 * s, cy, 22 * s, 0, Math.PI * 2)
    ctx.arc(cx + 20 * s, cy + 5 * s, 18 * s, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function ForestScene({ trees, level }: ForestSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const draw = useCallback(
    (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      drawGround(ctx, w, h, level, time)
      drawClouds(ctx, w, h, time)

      // Sort trees by y position for depth
      const sortedTrees = [...trees].sort((a, b) => a.y - b.y)
      const baseSize = Math.min(w, h) * 0.14

      for (const tree of sortedTrees) {
        const tx = (tree.x / 100) * w
        const groundY = h * 0.6 + Math.sin(tx * 0.01 + time * 0.0002) * 5
        const ty = groundY + ((tree.y - 20) / 65) * (h * 0.35)
        drawSingleTree(ctx, tx, ty, tree.type, tree.stage, time, baseSize)
      }

      // Sun
      const sunX = w - 80
      const sunY = 50
      ctx.fillStyle = "#FFF4D4"
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.arc(sunX, sunY, 45, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(sunX, sunY, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = "#FFEBB0"
      ctx.beginPath()
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2)
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    },
    [trees, level]
  )

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-lg"
      style={{ imageRendering: "auto" }}
      aria-label={`Your forest with ${trees.length} trees at level ${level}`}
      role="img"
    />
  )
}
