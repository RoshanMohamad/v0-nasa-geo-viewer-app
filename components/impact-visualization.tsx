"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Target, Layers, Info, ZoomIn, ZoomOut } from "lucide-react"
import type { ImpactAnalysis, CelestialBody } from "@/lib/orbital-mechanics"

interface ImpactVisualizationProps {
  object: CelestialBody
  analysis: ImpactAnalysis
  onClose: () => void
}

export function ImpactVisualization({
  object,
  analysis,
  onClose,
}: ImpactVisualizationProps) {
  const topViewCanvasRef = useRef<HTMLCanvasElement>(null)
  const craterViewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showDetails, setShowDetails] = useState(true)

  // Draw top-down impact view
  useEffect(() => {
    const canvas = topViewCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Draw Earth surface grid
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    const gridSize = 50 * zoomLevel
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Scale factor for visualization (km to pixels)
    const scale = 3 * zoomLevel

    // Draw damage zones (from outer to inner)
    const zones = [
      { radius: analysis.ejectaRadius, color: 'rgba(139, 69, 19, 0.2)', label: 'Ejecta' },
      { radius: analysis.craterDiameter * 2, color: 'rgba(255, 140, 0, 0.3)', label: 'Thermal' },
      { radius: analysis.craterDiameter, color: 'rgba(255, 69, 0, 0.4)', label: 'Crater' },
      { radius: analysis.craterDiameter * 0.5, color: 'rgba(139, 0, 0, 0.6)', label: 'Vaporization' },
    ]

    zones.forEach((zone, index) => {
      const radiusPixels = zone.radius * scale
      
      // Draw circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2)
      ctx.fillStyle = zone.color
      ctx.fill()
      ctx.strokeStyle = zone.color.replace(/0\.\d+/, '0.8')
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw label
      if (radiusPixels < width / 2) {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
          `${zone.label} (${zone.radius.toFixed(1)} km)`,
          centerX,
          centerY - radiusPixels - 10
        )
      }
    })

    // Draw impact point
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#ff0000'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw impact vector (trajectory)
    const vectorLength = 100
    ctx.beginPath()
    ctx.moveTo(centerX - vectorLength, centerY - vectorLength)
    ctx.lineTo(centerX, centerY)
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw arrowhead
    const arrowSize = 15
    const angle = Math.PI / 4
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX - arrowSize * Math.cos(angle - Math.PI / 6),
      centerY - arrowSize * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX - arrowSize * Math.cos(angle + Math.PI / 6),
      centerY - arrowSize * Math.sin(angle + Math.PI / 6)
    )
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw scale bar
    const scaleBarLength = 100 // km
    const scaleBarPixels = scaleBarLength * scale
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(20, height - 40, scaleBarPixels, 4)
    ctx.font = '12px sans-serif'
    ctx.fillText(`${scaleBarLength} km`, 20, height - 20)

  }, [analysis, zoomLevel])

  // Draw crater cross-section view
  useEffect(() => {
    const canvas = craterViewCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Scale factors
    const horizontalScale = width / (analysis.craterDiameter * 1.5)
    const verticalScale = height / (analysis.craterDepth * 3)

    const centerX = width / 2
    const groundY = height * 0.4

    // Draw surface layers (different geological layers)
    const layers = [
      { depth: 0, height: height * 0.1, color: '#8B4513', label: 'Soil/Regolith' },
      { depth: height * 0.1, height: height * 0.15, color: '#654321', label: 'Sedimentary' },
      { depth: height * 0.25, height: height * 0.2, color: '#4a3728', label: 'Bedrock' },
      { depth: height * 0.45, height: height * 0.55, color: '#2d1f1a', label: 'Deep Crust' },
    ]

    layers.forEach(layer => {
      ctx.fillStyle = layer.color
      ctx.fillRect(0, groundY + layer.depth, width, layer.height)
      
      // Layer labels
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(layer.label, 10, groundY + layer.depth + 15)
    })

    // Draw crater shape
    const craterWidth = analysis.craterDiameter * horizontalScale
    const craterDepth = analysis.craterDepth * verticalScale

    ctx.beginPath()
    ctx.moveTo(centerX - craterWidth / 2, groundY)
    
    // Crater walls with realistic shape
    ctx.quadraticCurveTo(
      centerX - craterWidth / 3,
      groundY + craterDepth * 0.6,
      centerX,
      groundY + craterDepth
    )
    ctx.quadraticCurveTo(
      centerX + craterWidth / 3,
      groundY + craterDepth * 0.6,
      centerX + craterWidth / 2,
      groundY
    )
    
    ctx.strokeStyle = '#ff4400'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 68, 0, 0.1)'
    ctx.fill()

    // Draw ejecta blanket
    ctx.beginPath()
    ctx.moveTo(centerX - craterWidth / 2, groundY)
    ctx.quadraticCurveTo(
      centerX - craterWidth,
      groundY - 20,
      centerX - craterWidth * 1.5,
      groundY
    )
    ctx.lineTo(centerX + craterWidth * 1.5, groundY)
    ctx.quadraticCurveTo(
      centerX + craterWidth,
      groundY - 20,
      centerX + craterWidth / 2,
      groundY
    )
    ctx.fillStyle = 'rgba(139, 69, 19, 0.4)'
    ctx.fill()

    // Draw impact object (incoming)
    const impactorSize = Math.max(10, object.radius / 10)
    ctx.beginPath()
    ctx.arc(centerX - 80, groundY - 100, impactorSize, 0, Math.PI * 2)
    ctx.fillStyle = object.color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw trajectory line
    ctx.beginPath()
    ctx.moveTo(centerX - 150, groundY - 150)
    ctx.lineTo(centerX, groundY)
    ctx.strokeStyle = '#ffff00'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Measurements
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    // Diameter measurement
    ctx.beginPath()
    ctx.moveTo(centerX - craterWidth / 2, groundY - 10)
    ctx.lineTo(centerX + craterWidth / 2, groundY - 10)
    ctx.stroke()
    
    ctx.fillStyle = '#00ff00'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      `Diameter: ${analysis.craterDiameter.toFixed(2)} km`,
      centerX,
      groundY - 20
    )

    // Depth measurement
    ctx.beginPath()
    ctx.moveTo(centerX + craterWidth / 2 + 10, groundY)
    ctx.lineTo(centerX + craterWidth / 2 + 10, groundY + craterDepth)
    ctx.stroke()
    
    ctx.textAlign = 'left'
    ctx.fillText(
      `Depth: ${analysis.craterDepth.toFixed(2)} km`,
      centerX + craterWidth / 2 + 20,
      groundY + craterDepth / 2
    )

    ctx.setLineDash([])

  }, [analysis, object])

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'bg-red-600'
      case 'High': return 'bg-orange-600'
      case 'Moderate': return 'bg-yellow-600'
      case 'Low': return 'bg-blue-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <Card className="w-full max-w-6xl bg-card/95 backdrop-blur-sm border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-red-500" />
              Impact Analysis: {object.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive impact assessment and visualization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getRiskColor(analysis.riskLevel)} text-white px-3 py-1`}>
              {analysis.riskLevel} Risk
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top-Down View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Top-Down Impact View
              </h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden bg-black">
              <canvas
                ref={topViewCanvasRef}
                width={600}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Crater Cross-Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Crater Cross-Section
            </h3>
            <div className="border border-border rounded-lg overflow-hidden bg-black">
              <canvas
                ref={craterViewCanvasRef}
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Object Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-semibold">{object.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-semibold capitalize">{object.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Radius:</span>
                <span className="font-semibold">{object.radius.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Mass:</span>
                <span className="font-semibold">{object.mass.toExponential(2)} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Composition:</span>
                <span className="font-semibold capitalize">{object.composition || 'Unknown'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Orbital Intersection</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Closest Approach:</span>
                <span className="font-semibold">{analysis.closestApproach.toFixed(0)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Distance (AU):</span>
                <span className="font-semibold">{analysis.closestApproachAU.toFixed(4)} AU</span>
              </div>
              <div className="flex justify-between">
                <span>Earth Radii:</span>
                <span className="font-semibold">{analysis.closestApproachEarthRadii.toFixed(2)} R⊕</span>
              </div>
              <div className="flex justify-between">
                <span>Impact Probability:</span>
                <span className="font-semibold text-red-500">{analysis.impactProbability.toFixed(2)}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Impact Energy</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Kinetic Energy:</span>
                <span className="font-semibold">{analysis.kineticEnergy.toExponential(2)} J</span>
              </div>
              <div className="flex justify-between">
                <span>TNT Equivalent:</span>
                <span className="font-semibold">{analysis.kineticEnergyMT.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between">
                <span>Classification:</span>
                <span className="font-semibold">{analysis.classification}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Crater Dimensions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Crater Diameter:</span>
                <span className="font-semibold">{analysis.craterDiameter.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Crater Depth:</span>
                <span className="font-semibold">{analysis.craterDepth.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Ejecta Radius:</span>
                <span className="font-semibold">{analysis.ejectaRadius.toFixed(2)} km</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/30 md:col-span-2">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Risk Assessment</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Risk Level:</span>
                <Badge className={`${getRiskColor(analysis.riskLevel)} text-white`}>
                  {analysis.riskLevel}
                </Badge>
              </div>
              <div className="pt-2 border-t border-border/50">
                <p className="text-muted-foreground italic">{analysis.estimatedDamage}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Visualization Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span>Impact Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-600/40"></div>
              <span>Crater Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: 'rgba(139, 69, 19, 0.4)' }}></div>
              <span>Ejecta Blanket</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span>Trajectory</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
