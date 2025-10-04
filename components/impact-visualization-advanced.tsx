"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, AlertTriangle, Target, Layers } from "lucide-react"
import type { ImpactAnalysis } from "@/lib/orbital-mechanics"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface ImpactVisualizationAdvancedProps {
  analysis: ImpactAnalysis
  object: CelestialBody
  onClose: () => void
}

export function ImpactVisualizationAdvanced({
  analysis,
  object,
  onClose,
}: ImpactVisualizationAdvancedProps) {
  const topViewCanvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceViewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    drawTopDownView()
    drawSurfaceView()

    // Animation loop for dynamic effects
    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 60)
    }, 50)

    return () => clearInterval(interval)
  }, [analysis, animationFrame])

  const drawTopDownView = () => {
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

    // Draw Earth (simplified circular view)
    const earthRadius = 180
    
    // Earth gradient
    const earthGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, earthRadius)
    earthGradient.addColorStop(0, '#1e40af')
    earthGradient.addColorStop(0.7, '#1e3a8a')
    earthGradient.addColorStop(1, '#0f172a')
    
    ctx.fillStyle = earthGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw continents (simplified)
    ctx.fillStyle = '#166534'
    ctx.globalAlpha = 0.6
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + Math.PI / 4
      const x = centerX + Math.cos(angle) * (earthRadius * 0.6)
      const y = centerY + Math.sin(angle) * (earthRadius * 0.6)
      ctx.beginPath()
      ctx.arc(x, y, earthRadius * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Draw impact zones with ripple effect
    if (analysis.impactZones && analysis.impactZones.length > 0) {
      analysis.impactZones.forEach((zone, index) => {
        const angle = (zone.lng * Math.PI) / 180
        const distance = ((90 - zone.lat) / 90) * earthRadius
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        // Pulsating impact point
        const pulseRadius = 5 + Math.sin(animationFrame / 10) * 2
        
        // Impact glow
        const impactGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius * 4)
        impactGradient.addColorStop(0, 'rgba(255, 50, 50, 0.8)')
        impactGradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.4)')
        impactGradient.addColorStop(1, 'rgba(255, 150, 50, 0)')
        
        ctx.fillStyle = impactGradient
        ctx.beginPath()
        ctx.arc(x, y, pulseRadius * 4, 0, Math.PI * 2)
        ctx.fill()

        // Impact point
        ctx.fillStyle = '#ff3333'
        ctx.beginPath()
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2)
        ctx.fill()

        // Crater diameter circle
        const craterScale = (analysis.craterDiameter / 6371) * earthRadius * 50 // Exaggerated for visibility
        ctx.strokeStyle = 'rgba(255, 100, 50, 0.6)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(x, y, Math.min(craterScale, earthRadius), 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Damage radius zones
        const damageRadii = [
          { radius: analysis.craterDiameter * 2, color: 'rgba(255, 50, 50, 0.3)', label: 'Total Destruction' },
          { radius: analysis.ejectaRadius, color: 'rgba(255, 100, 50, 0.2)', label: 'Ejecta Zone' },
          { radius: analysis.damage?.airblastRadius || analysis.craterDiameter * 5, color: 'rgba(255, 150, 50, 0.1)', label: 'Blast Wave' },
        ]

        damageRadii.forEach(({ radius, color }) => {
          const scaledRadius = (radius / 6371) * earthRadius * 30
          if (scaledRadius < earthRadius * 2) {
            ctx.strokeStyle = color
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.arc(x, y, scaledRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
        })
      })
    }

    // Draw object trajectory
    const trajectoryAngle = (animationFrame / 60) * Math.PI * 2
    const trajectoryDistance = earthRadius * 1.5
    const objectX = centerX + Math.cos(trajectoryAngle) * trajectoryDistance
    const objectY = centerY + Math.sin(trajectoryAngle) * trajectoryDistance

    // Object with glow
    const objectGradient = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, 15)
    objectGradient.addColorStop(0, object.color)
    objectGradient.addColorStop(0.5, object.color + '88')
    objectGradient.addColorStop(1, object.color + '00')
    
    ctx.fillStyle = objectGradient
    ctx.beginPath()
    ctx.arc(objectX, objectY, 15, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = object.color
    ctx.beginPath()
    ctx.arc(objectX, objectY, 6, 0, Math.PI * 2)
    ctx.fill()

    // Trajectory line
    ctx.strokeStyle = object.color + '44'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(objectX, objectY)
    ctx.lineTo(centerX, centerY)
    ctx.stroke()
    ctx.setLineDash([])

    // Labels
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('EARTH - TOP VIEW', centerX, 30)
    
    ctx.font = '12px Arial'
    ctx.fillText(object.name, objectX, objectY - 25)
    
    // Distance label
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px Arial'
    ctx.fillText(
      `Distance: ${analysis.closestApproach.toFixed(0)} km`,
      centerX,
      height - 20
    )
  }

  const drawSurfaceView = () => {
    const canvas = surfaceViewCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, height * 0.6, 0, height)
    groundGradient.addColorStop(0, '#654321')
    groundGradient.addColorStop(0.5, '#8B4513')
    groundGradient.addColorStop(1, '#A0522D')
    
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, height * 0.6, width, height * 0.4)

    // Draw sky with atmospheric glow
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6)
    skyGradient.addColorStop(0, '#000033')
    skyGradient.addColorStop(0.5, '#1a1a3a')
    skyGradient.addColorStop(1, '#8B4513')
    
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, height * 0.6)

    // Draw crater (3D perspective view)
    const centerX = width / 2
    const groundLevel = height * 0.6
    const craterWidth = Math.min(analysis.craterDiameter * 50, width * 0.8)
    const craterDepth = analysis.craterDepth * 100

    // Crater ellipse (perspective)
    ctx.fillStyle = '#2a2a2a'
    ctx.beginPath()
    ctx.ellipse(centerX, groundLevel + 20, craterWidth / 2, craterDepth * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Crater inner shadow
    const craterGradient = ctx.createRadialGradient(
      centerX, groundLevel + 20, 0,
      centerX, groundLevel + 20, craterWidth / 2
    )
    craterGradient.addColorStop(0, '#000000')
    craterGradient.addColorStop(0.7, '#1a1a1a')
    craterGradient.addColorStop(1, '#654321')
    
    ctx.fillStyle = craterGradient
    ctx.beginPath()
    ctx.ellipse(centerX, groundLevel + 20, craterWidth / 2, craterDepth * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Crater rim highlights
    ctx.strokeStyle = '#A0522D'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(centerX, groundLevel, craterWidth / 2, craterDepth * 0.2, 0, Math.PI, 0)
    ctx.stroke()

    // Ejecta debris
    ctx.fillStyle = '#8B4513'
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI
      const distance = craterWidth / 2 + Math.random() * craterWidth
      const x = centerX + Math.cos(angle) * distance
      const y = groundLevel + Math.sin(angle) * 30
      const size = 2 + Math.random() * 8
      
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Impact flash (animated)
    if (animationFrame % 30 < 15) {
      const flashIntensity = 1 - (animationFrame % 30) / 15
      ctx.fillStyle = `rgba(255, 200, 100, ${flashIntensity * 0.5})`
      ctx.beginPath()
      ctx.arc(centerX, groundLevel - craterDepth * 0.5, 50 * flashIntensity, 0, Math.PI * 2)
      ctx.fill()
    }

    // Shockwave rings
    const shockwaveRadius = (animationFrame * 10) % (width / 2)
    ctx.strokeStyle = `rgba(255, 150, 50, ${1 - shockwaveRadius / (width / 2)})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, groundLevel, shockwaveRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Labels
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('CRATER CROSS-SECTION', centerX, 30)
    
    ctx.font = '12px Arial'
    ctx.fillStyle = '#fbbf24'
    ctx.fillText(`Diameter: ${analysis.craterDiameter.toFixed(2)} km`, centerX, height - 40)
    ctx.fillText(`Depth: ${analysis.craterDepth.toFixed(2)} km`, centerX, height - 20)
  }

  const getRiskColor = () => {
    switch (analysis.riskLevel) {
      case 'Extreme': return 'text-red-600'
      case 'High': return 'text-orange-600'
      case 'Moderate': return 'text-yellow-600'
      case 'Low': return 'text-blue-600'
      default: return 'text-green-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-red-500" />
            Impact Analysis: {object.name}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Risk Summary */}
        <div className={`p-4 rounded-lg mb-6 border-2 ${
          analysis.riskLevel === 'Extreme' ? 'bg-red-950/30 border-red-600' :
          analysis.riskLevel === 'High' ? 'bg-orange-950/30 border-orange-600' :
          analysis.riskLevel === 'Moderate' ? 'bg-yellow-950/30 border-yellow-600' :
          'bg-blue-950/30 border-blue-600'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={`w-6 h-6 ${getRiskColor()}`} />
            <div>
              <div className="font-bold text-lg">
                Risk Level: <span className={getRiskColor()}>{analysis.riskLevel}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Impact Probability: {analysis.impactProbability.toFixed(4)}%
              </div>
            </div>
          </div>
          <div className="text-sm mt-2">
            <strong>Classification:</strong> {analysis.classification}
          </div>
        </div>

        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="details">Impact Details</TabsTrigger>
            <TabsTrigger value="damage">Damage Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Top-Down View */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Orbital Intersection - Top View
                </h3>
                <canvas
                  ref={topViewCanvasRef}
                  width={500}
                  height={500}
                  className="w-full border border-border rounded-lg"
                />
              </div>

              {/* Surface View */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Surface Impact - Side View
                </h3>
                <canvas
                  ref={surfaceViewCanvasRef}
                  width={500}
                  height={500}
                  className="w-full border border-border rounded-lg"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Object Properties</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{object.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Composition:</span>
                    <span className="font-medium capitalize">{object.composition || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-medium">{object.radius.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mass:</span>
                    <span className="font-medium">{object.mass.toExponential(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Velocity:</span>
                    <span className="font-medium">{object.orbitalElements.velocity?.toFixed(2)} km/s</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Orbital Elements</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semi-major Axis:</span>
                    <span className="font-medium">{object.orbitalElements.semiMajorAxis.toFixed(3)} AU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Eccentricity:</span>
                    <span className="font-medium">{object.orbitalElements.eccentricity.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inclination:</span>
                    <span className="font-medium">{object.orbitalElements.inclination.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">{object.orbitalElements.period?.toFixed(2)} years</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Closest Approach Data</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Distance (km)</div>
                  <div className="text-2xl font-bold">{analysis.closestApproach.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Distance (AU)</div>
                  <div className="text-2xl font-bold">{analysis.closestApproachAU.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Earth Radii</div>
                  <div className="text-2xl font-bold">{analysis.closestApproachEarthRadii.toFixed(2)}</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="damage" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Impact Energy</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Kinetic Energy</div>
                  <div className="text-2xl font-bold">{analysis.kineticEnergy.toExponential(2)} J</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">TNT Equivalent</div>
                  <div className="text-2xl font-bold">{analysis.kineticEnergyMT.toFixed(2)} Megatons</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Crater Dimensions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Crater Diameter</div>
                  <div className="text-2xl font-bold text-orange-500">{analysis.craterDiameter.toFixed(2)} km</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm mb-1">Crater Depth</div>
                  <div className="text-2xl font-bold text-orange-500">{analysis.craterDepth.toFixed(2)} km</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Damage Zones</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-red-950/30 rounded">
                  <span className="text-sm">Ejecta Radius</span>
                  <span className="font-bold">{analysis.ejectaRadius.toFixed(2)} km</span>
                </div>
                {analysis.damage?.airblastRadius && (
                  <div className="flex justify-between items-center p-2 bg-orange-950/30 rounded">
                    <span className="text-sm">Airblast Radius</span>
                    <span className="font-bold">{analysis.damage.airblastRadius.toFixed(2)} km</span>
                  </div>
                )}
                {analysis.damage?.thermalRadius && (
                  <div className="flex justify-between items-center p-2 bg-yellow-950/30 rounded">
                    <span className="text-sm">Thermal Radiation Radius</span>
                    <span className="font-bold">{analysis.damage.thermalRadius.toFixed(2)} km</span>
                  </div>
                )}
                {analysis.damage?.seismicMagnitude && (
                  <div className="flex justify-between items-center p-2 bg-blue-950/30 rounded">
                    <span className="text-sm">Seismic Magnitude</span>
                    <span className="font-bold">{analysis.damage.seismicMagnitude.toFixed(1)} Richter</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-amber-950/20 border-amber-600">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Estimated Damage
              </h3>
              <p className="text-sm">{analysis.estimatedDamage}</p>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
