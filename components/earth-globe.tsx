"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Navigation } from "lucide-react"

interface GlobeProps {
  onHover?: (coordinates: { lat: number; lng: number } | null) => void
}

export function EarthGlobe({ onHover }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState<"satellite" | "terrain" | "hybrid">("satellite")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const drawEarth = () => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = (Math.min(centerX, centerY) - 20) * zoom

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius,
      )

      if (viewMode === "satellite") {
        gradient.addColorStop(0, "#4A90E2")
        gradient.addColorStop(0.3, "#2563EB")
        gradient.addColorStop(0.7, "#1E40AF")
        gradient.addColorStop(1, "#1E3A8A")
      } else if (viewMode === "terrain") {
        gradient.addColorStop(0, "#059669")
        gradient.addColorStop(0.3, "#047857")
        gradient.addColorStop(0.7, "#065F46")
        gradient.addColorStop(1, "#064E3B")
      } else {
        gradient.addColorStop(0, "#7C3AED")
        gradient.addColorStop(0.3, "#6D28D9")
        gradient.addColorStop(0.7, "#5B21B6")
        gradient.addColorStop(1, "#4C1D95")
      }

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.fillStyle = viewMode === "satellite" ? "#10B981" : viewMode === "terrain" ? "#F59E0B" : "#EC4899"
      ctx.globalAlpha = 0.9

      // More detailed continent shapes
      const continents = [
        // North America
        { x: 0.15, y: 0.25, width: 0.25, height: 0.3, shape: "irregular" },
        // South America
        { x: 0.2, y: 0.55, width: 0.15, height: 0.35, shape: "narrow" },
        // Europe
        { x: 0.45, y: 0.3, width: 0.12, height: 0.15, shape: "small" },
        // Africa
        { x: 0.48, y: 0.45, width: 0.18, height: 0.4, shape: "long" },
        // Asia
        { x: 0.6, y: 0.2, width: 0.3, height: 0.35, shape: "large" },
        // Australia
        { x: 0.75, y: 0.65, width: 0.12, height: 0.1, shape: "small" },
      ]

      continents.forEach((continent) => {
        const angle = (rotation * Math.PI) / 180
        const x = centerX + (continent.x - 0.5) * radius * 1.8 * Math.cos(angle)
        const y = centerY + (continent.y - 0.5) * radius * 1.4
        const width = continent.width * radius * 0.9
        const height = continent.height * radius * 0.7

        if (x + width / 2 > centerX - radius && x - width / 2 < centerX + radius) {
          ctx.beginPath()
          if (continent.shape === "irregular") {
            // Draw irregular shape for North America
            ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI)
          } else {
            ctx.fillRect(x - width / 2, y - height / 2, width, height)
          }
          ctx.fill()
        }
      })

      ctx.globalAlpha = 1

      const atmosphereGradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 8)
      atmosphereGradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
      atmosphereGradient.addColorStop(1, "rgba(59, 130, 246, 0)")

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI)
      ctx.fillStyle = atmosphereGradient
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.lineWidth = 0.5

      // Latitude lines
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.ellipse(centerX, centerY + i * radius * 0.25, radius * 0.95, radius * 0.15, 0, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // Longitude lines
      for (let i = 0; i < 8; i++) {
        const angle = ((i * 22.5 + rotation) * Math.PI) / 180
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, radius * 0.95 * Math.abs(Math.cos(angle)), radius * 0.95, angle, 0, 2 * Math.PI)
        ctx.stroke()
      }
    }

    drawEarth()
  }, [rotation, zoom, viewMode])

  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.2) % 360)
    }, 100)

    return () => clearInterval(interval)
  }, [autoRotate])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      const deltaX = x - lastMousePos.x
      setRotation((prev) => prev + deltaX * 0.5)
      setLastMousePos({ x, y })
    }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = (Math.min(centerX, centerY) - 20) * zoom

    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

    if (distance <= radius) {
      const lat = ((centerY - y) / radius) * 90
      const lng = ((x - centerX) / radius) * 180
      onHover?.({ lat: Math.round(lat), lng: Math.round(lng) })
      setIsHovered(true)
    } else {
      onHover?.(null)
      setIsHovered(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setAutoRotate(false)
    const rect = canvasRef.current!.getBoundingClientRect()
    setLastMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    onHover?.(null)
    setIsHovered(false)
    setIsDragging(false)
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setAutoRotate(true)
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button size="sm" variant="secondary" onClick={handleZoomIn} className="w-10 h-10 p-0 glass-effect">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleZoomOut} className="w-10 h-10 p-0 glass-effect">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset} className="w-10 h-10 p-0 glass-effect">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-10 flex gap-1">
        {(["satellite", "terrain", "hybrid"] as const).map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={viewMode === mode ? "default" : "secondary"}
            onClick={() => setViewMode(mode)}
            className="glass-effect capitalize"
          >
            {mode}
          </Button>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setAutoRotate(!autoRotate)}
          className="w-12 h-12 p-0 glass-effect"
        >
          <Navigation className={`w-5 h-5 transition-transform ${autoRotate ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className={`transition-all duration-300 ${isHovered ? "cursor-pointer" : isDragging ? "cursor-grabbing" : "cursor-grab"} rounded-lg shadow-lg`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  )
}
