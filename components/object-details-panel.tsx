"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Info, Orbit, Zap, Ruler } from "lucide-react"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface ObjectDetailsPanelProps {
  object: CelestialBody
  onClose: () => void
}

export function ObjectDetailsPanel({ object, onClose }: ObjectDetailsPanelProps) {
  const calculateAphelion = () => {
    return object.orbitalElements.semiMajorAxis * (1 + object.orbitalElements.eccentricity)
  }

  const calculatePerihelion = () => {
    return object.orbitalElements.semiMajorAxis * (1 - object.orbitalElements.eccentricity)
  }

  const getDensity = () => {
    if (!object.composition) return 2600
    const densities = {
      rocky: 2600,
      icy: 1000,
      metallic: 7800,
      carbonaceous: 1500
    }
    return densities[object.composition]
  }

  const calculateVolume = () => {
    return (4/3) * Math.PI * Math.pow(object.radius * 1000, 3) // m³
  }

  const calculateSurfaceArea = () => {
    return 4 * Math.PI * Math.pow(object.radius, 2) // km²
  }

  const getTypeIcon = () => {
    switch (object.type) {
      case 'asteroid': return '🪨'
      case 'comet': return '☄️'
      case 'dwarf-planet': return '🌑'
      case 'trans-neptunian': return '🌌'
      default: return '⚫'
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">{getTypeIcon()}</span>
            {object.name}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Physical Properties */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-500" />
              Physical Properties
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Object Type:</span>
                <span className="font-medium capitalize">{object.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Composition:</span>
                <span className="font-medium capitalize">{object.composition || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Radius:</span>
                <span className="font-medium">{object.radius.toFixed(3)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Diameter:</span>
                <span className="font-medium">{(object.radius * 2).toFixed(3)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Surface Area:</span>
                <span className="font-medium">{calculateSurfaceArea().toExponential(2)} km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Volume:</span>
                <span className="font-medium">{calculateVolume().toExponential(2)} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mass:</span>
                <span className="font-medium">{object.mass.toExponential(3)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Density:</span>
                <span className="font-medium">{getDensity()} kg/m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Display Color:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-border" 
                    style={{ backgroundColor: object.color }}
                  />
                  <span className="font-mono text-xs">{object.color}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Orbital Elements */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Orbit className="w-5 h-5 text-purple-500" />
              Orbital Elements
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Semi-Major Axis (a):</span>
                <span className="font-medium">{object.orbitalElements.semiMajorAxis.toFixed(4)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Eccentricity (e):</span>
                <span className="font-medium">{object.orbitalElements.eccentricity.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Inclination (i):</span>
                <span className="font-medium">{object.orbitalElements.inclination.toFixed(3)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Longitude Asc. Node (Ω):</span>
                <span className="font-medium">{object.orbitalElements.longitudeOfAscendingNode.toFixed(3)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Argument Perihelion (ω):</span>
                <span className="font-medium">{object.orbitalElements.argumentOfPerihelion.toFixed(3)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mean Anomaly (M):</span>
                <span className="font-medium">{object.orbitalElements.meanAnomaly.toFixed(3)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Orbital Period:</span>
                <span className="font-medium">{object.orbitalElements.period?.toFixed(3)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Orbital Velocity:</span>
                <span className="font-medium">{object.orbitalElements.velocity?.toFixed(3)} km/s</span>
              </div>
            </div>
          </Card>

          {/* Orbital Distances */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-green-500" />
              Orbital Distances
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Perihelion (closest):</span>
                <span className="font-medium">{calculatePerihelion().toFixed(4)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Aphelion (farthest):</span>
                <span className="font-medium">{calculateAphelion().toFixed(4)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Perihelion (km):</span>
                <span className="font-medium">{(calculatePerihelion() * 149597870.7).toExponential(3)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Aphelion (km):</span>
                <span className="font-medium">{(calculateAphelion() * 149597870.7).toExponential(3)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Distance from Sun:</span>
                <span className="font-medium">{(object.orbitalElements.semiMajorAxis * 149597870.7).toExponential(3)} km</span>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Additional Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Object ID:</span>
                <span className="font-mono text-xs">{object.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data Source:</span>
                <span className="font-medium">{object.nasaState ? 'NASA Horizons' : 'Custom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Orbit Type:</span>
                <span className="font-medium">
                  {object.orbitalElements.eccentricity < 0.1 ? 'Nearly Circular' :
                   object.orbitalElements.eccentricity < 0.5 ? 'Elliptical' :
                   object.orbitalElements.eccentricity < 0.9 ? 'Highly Elliptical' :
                   'Extreme Ellipse'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Orbit Class:</span>
                <span className="font-medium">
                  {object.orbitalElements.semiMajorAxis < 1 ? 'Inner Solar System' :
                   object.orbitalElements.semiMajorAxis < 5 ? 'Main Belt' :
                   object.orbitalElements.semiMajorAxis < 30 ? 'Outer Solar System' :
                   'Trans-Neptunian'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Visual Representation */}
        <Card className="p-4 bg-muted/30 mt-6">
          <h3 className="font-semibold mb-4">Orbit Visualization (Schematic)</h3>
          <div className="relative w-full h-64 bg-black/50 rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {/* Sun */}
              <circle cx="200" cy="100" r="10" fill="#FDB813" />
              <text x="200" y="120" textAnchor="middle" className="text-xs fill-yellow-400">☉ Sun</text>
              
              {/* Orbit ellipse */}
              <ellipse
                cx="200"
                cy="100"
                rx={object.orbitalElements.semiMajorAxis * 30}
                ry={object.orbitalElements.semiMajorAxis * 30 * (1 - object.orbitalElements.eccentricity)}
                fill="none"
                stroke={object.color}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              
              {/* Object */}
              <circle
                cx={200 + object.orbitalElements.semiMajorAxis * 30 * Math.cos((object.orbitalElements.meanAnomaly * Math.PI) / 180)}
                cy={100 + object.orbitalElements.semiMajorAxis * 30 * (1 - object.orbitalElements.eccentricity) * Math.sin((object.orbitalElements.meanAnomaly * Math.PI) / 180)}
                r="5"
                fill={object.color}
              />
              
              {/* Earth orbit reference (1 AU) */}
              <circle
                cx="200"
                cy="100"
                r="30"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
              <text x="230" y="105" className="text-[8px] fill-blue-400">Earth</text>
            </svg>
          </div>
        </Card>
      </Card>
    </div>
  )
}
