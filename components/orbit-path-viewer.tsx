"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Eye, EyeOff, Orbit } from "lucide-react"
import { useState } from "react"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface OrbitPathViewerProps {
  customObjects: CelestialBody[]
  onToggleOrbit?: (objectId: string) => void
  onFocusObject?: (object: CelestialBody) => void
}

export function OrbitPathViewer({ 
  customObjects, 
  onToggleOrbit,
  onFocusObject 
}: OrbitPathViewerProps) {
  const [visibleOrbits, setVisibleOrbits] = useState<Set<string>>(
    new Set(customObjects.map(obj => obj.id))
  )
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleOrbitVisibility = (objectId: string) => {
    const newVisible = new Set(visibleOrbits)
    if (newVisible.has(objectId)) {
      newVisible.delete(objectId)
    } else {
      newVisible.add(objectId)
    }
    setVisibleOrbits(newVisible)
    onToggleOrbit?.(objectId)
  }

  const planetOrbits = [
    { name: "Mercury", distance: 0.387, color: "#8C7853", period: 0.24 },
    { name: "Venus", distance: 0.723, color: "#FFC649", period: 0.62 },
    { name: "Earth", distance: 1.0, color: "#4A90E2", period: 1.0 },
    { name: "Mars", distance: 1.524, color: "#E27B58", period: 1.88 },
    { name: "Jupiter", distance: 5.203, color: "#C88B3A", period: 11.86 },
    { name: "Saturn", distance: 9.537, color: "#FAD5A5", period: 29.46 },
    { name: "Uranus", distance: 19.191, color: "#4FD0E7", period: 84.01 },
    { name: "Neptune", distance: 30.069, color: "#4166F5", period: 164.79 },
  ]

  const getOrbitType = (eccentricity: number) => {
    if (eccentricity < 0.1) return "Circular"
    if (eccentricity < 0.5) return "Elliptical"
    if (eccentricity < 0.9) return "Highly Elliptical"
    return "Extreme"
  }

  const getProximityWarning = (object: CelestialBody) => {
    const earthDistance = 1.0
    const perihelion = object.orbitalElements.semiMajorAxis * (1 - object.orbitalElements.eccentricity)
    const aphelion = object.orbitalElements.semiMajorAxis * (1 + object.orbitalElements.eccentricity)
    
    if (perihelion <= earthDistance && aphelion >= earthDistance) {
      return { warning: true, message: "⚠️ Crosses Earth's orbit!" }
    }
    if (Math.abs(object.orbitalElements.semiMajorAxis - earthDistance) < 0.3) {
      return { warning: true, message: "⚠️ Near Earth orbit" }
    }
    return { warning: false, message: "✓ Safe distance" }
  }

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-20"
      >
        <Orbit className="w-4 h-4 mr-2" />
        Show Orbit Comparison
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-20 w-96 max-h-[600px] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm">
        <h3 className="font-semibold flex items-center gap-2">
          <Orbit className="w-5 h-5 text-primary" />
          Orbit Path Comparison
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(true)}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Solar System Reference */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
            Solar System Planets
          </h4>
          <div className="space-y-1">
            {planetOrbits.map((planet) => (
              <div
                key={planet.name}
                className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{ borderColor: planet.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{planet.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {planet.distance.toFixed(2)} AU • {planet.period.toFixed(1)} yr
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {planet.distance < 2 ? "Inner" : planet.distance < 5 ? "Mid" : "Outer"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Objects */}
        {customObjects.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
              Custom Objects ({customObjects.length})
            </h4>
            <div className="space-y-2">
              {customObjects.map((object) => {
                const isVisible = visibleOrbits.has(object.id)
                const proximity = getProximityWarning(object)
                const orbitType = getOrbitType(object.orbitalElements.eccentricity)
                
                return (
                  <div
                    key={object.id}
                    className={`p-3 rounded-lg border transition-all ${
                      proximity.warning 
                        ? 'border-yellow-600/50 bg-yellow-950/20' 
                        : 'border-border bg-muted/30'
                    } ${!isVisible ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: object.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm truncate">{object.name}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleOrbitVisibility(object.id)}
                            className="h-6 w-6 flex-shrink-0"
                          >
                            {isVisible ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span>Distance:</span>
                            <span className="font-mono">
                              {object.orbitalElements.semiMajorAxis.toFixed(2)} AU
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Eccentricity:</span>
                            <span className="font-mono">
                              {object.orbitalElements.eccentricity.toFixed(3)} ({orbitType})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Period:</span>
                            <span className="font-mono">
                              {object.orbitalElements.period?.toFixed(2)} yr
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Inclination:</span>
                            <span className="font-mono">
                              {object.orbitalElements.inclination.toFixed(1)}°
                            </span>
                          </div>
                        </div>

                        <div className={`text-xs mt-2 px-2 py-1 rounded ${
                          proximity.warning 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {proximity.message}
                        </div>

                        {onFocusObject && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFocusObject(object)}
                            className="w-full mt-2 h-7 text-xs"
                          >
                            Focus in 3D View
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Orbit comparison bars */}
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-muted-foreground">Orbit Range</div>
                      <div className="relative h-6 bg-muted/50 rounded overflow-hidden">
                        {/* Earth orbit reference */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-blue-500"
                          style={{ left: '20%' }}
                          title="Earth (1 AU)"
                        />
                        
                        {/* Object orbit range */}
                        <div
                          className="absolute top-1/2 h-2 -translate-y-1/2 rounded"
                          style={{
                            left: `${Math.min((object.orbitalElements.semiMajorAxis * (1 - object.orbitalElements.eccentricity) / 10) * 100, 100)}%`,
                            width: `${Math.min(((object.orbitalElements.semiMajorAxis * object.orbitalElements.eccentricity * 2) / 10) * 100, 100)}%`,
                            backgroundColor: object.color,
                            opacity: 0.7
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 AU</span>
                        <span className="text-blue-400">🌍 1 AU</span>
                        <span>10+ AU</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {customObjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Orbit className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No custom objects added yet.</p>
            <p className="text-xs mt-1">Create objects to compare their orbits!</p>
          </div>
        )}
      </div>
    </Card>
  )
}
