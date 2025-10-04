"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, AlertTriangle, Zap, Target, Mountain, Radio, Flame, Activity } from "lucide-react"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface ImpactAnalysisModalProps {
  object: CelestialBody
  analysis: any
  onClose: () => void
}

export function ImpactAnalysisModalEnhanced({ object, analysis, onClose }: ImpactAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Extreme': return 'bg-red-500'
      case 'High': return 'bg-orange-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'Low': return 'bg-blue-500'
      default: return 'bg-green-500'
    }
  }

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Extreme': return 'text-red-500'
      case 'High': return 'text-orange-500'
      case 'Moderate': return 'text-yellow-500'
      case 'Low': return 'text-blue-500'
      default: return 'text-green-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md border-2 border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Impact Analysis: {object.name}
              </h2>
              <p className="text-muted-foreground">
                Comprehensive risk assessment and damage projection
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Risk Level Banner */}
          <div className={`mt-4 p-4 rounded-lg ${getRiskColor(analysis.riskLevel)} bg-opacity-20 border-2 border-current`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${getRiskTextColor(analysis.riskLevel)}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className={`text-2xl font-bold ${getRiskTextColor(analysis.riskLevel)}`}>
                    {analysis.riskLevel}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Impact Probability</p>
                <p className="text-2xl font-bold">{analysis.impactProbability.toFixed(4)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crater">Crater Analysis</TabsTrigger>
              <TabsTrigger value="damage">Damage Zones</TabsTrigger>
              <TabsTrigger value="comparison">Comparisons</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Orbital Intersection</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orbits Can Intersect:</span>
                      <Badge variant={analysis.orbitsIntersect ? "destructive" : "default"}>
                        {analysis.orbitsIntersect ? 'Yes ⚠️' : 'No ✓'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Distance:</span>
                      <span className="font-medium">{analysis.closestApproach.toFixed(2)} million km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">In Earth Radii:</span>
                      <span className="font-medium">{analysis.closestApproachEarthRadii.toFixed(0)}×</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold">Impact Energy</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impact Velocity:</span>
                      <span className="font-medium">{analysis.impactVelocity?.toFixed(1)} km/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kinetic Energy:</span>
                      <span className="font-medium">{analysis.kineticEnergy?.toExponential(2)} J</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TNT Equivalent:</span>
                      <span className="font-medium text-yellow-500">{analysis.kineticEnergyMT?.toFixed(2)} MT</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Mountain className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold">Object Properties</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="capitalize">{object.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mass:</span>
                      <span className="font-medium">{object.mass.toExponential(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Composition:</span>
                      <span className="font-medium capitalize">{object.composition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eccentricity:</span>
                      <span className="font-medium">{object.orbitalElements.eccentricity.toFixed(3)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Orbital Parameters</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Semi-Major Axis:</span>
                      <span className="font-medium">{object.orbitalElements.semiMajorAxis.toFixed(2)} AU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inclination:</span>
                      <span className="font-medium">{object.orbitalElements.inclination.toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orbital Period:</span>
                      <span className="font-medium">{object.orbitalElements.period?.toFixed(1)} years</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Crater Analysis Tab */}
            <TabsContent value="crater" className="space-y-6">
              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mountain className="w-6 h-6 text-orange-500" />
                  Crater Dimensions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Crater Diameter</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {(analysis.craterDiameter / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Crater Depth</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {(analysis.craterDepth / 1000).toFixed(2)} km
                    </p>
                  </div>
                  {analysis.centralPeakHeight > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Central Peak Height</p>
                      <p className="text-3xl font-bold text-orange-500">
                        {(analysis.centralPeakHeight / 1000).toFixed(2)} km
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ejecta Radius</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {(analysis.craterZones?.ejectaBlanket / 1000).toFixed(2)} km
                    </p>
                  </div>
                </div>
              </Card>

              {/* Radial Crater Zones */}
              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4">Crater Zone Structure</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-500/20 border-l-4 border-red-500 rounded">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-400">Shockwave Zone</p>
                      <p className="text-sm text-muted-foreground">
                        Seismic damage, broken windows up to {(analysis.craterZones?.shockwave / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-500/20 border-l-4 border-orange-500 rounded">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-400">Ejecta Blanket</p>
                      <p className="text-sm text-muted-foreground">
                        Debris fallout, fires, total destruction within {(analysis.craterZones?.ejectaBlanket / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-500/20 border-l-4 border-yellow-600 rounded">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-400">Crater Rim</p>
                      <p className="text-sm text-muted-foreground">
                        Raised rim with terraced walls, {(analysis.craterZones?.ejectaRim / 1000).toFixed(2)} km radius
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-500/20 border-l-4 border-gray-500 rounded">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-300">Central Peak</p>
                      <p className="text-sm text-muted-foreground">
                        {analysis.centralPeakHeight > 0 
                          ? `Rebounded material, ${(analysis.centralPeakHeight / 1000).toFixed(2)} km high`
                          : 'Simple crater - no central peak'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cross-section ASCII visualization */}
              <Card className="p-6 bg-muted/50 font-mono text-xs">
                <h3 className="text-lg font-bold mb-4 font-sans">Crater Cross-Section (Schematic)</h3>
                <pre className="text-muted-foreground whitespace-pre overflow-x-auto">
{`
    Ejecta Blanket →                    ← Ejecta Blanket
         ↓                                        ↓
    ═════════════════════════════════════════════════  ← Ground Level
         ╲                                    ╱
          ╲  Terraced Rim                    ╱
           ╲                                ╱
            ╲══════════════════════════════╱  ← Crater Rim
             ╲                            ╱
              ╲      Crater Bowl         ╱
               ╲                        ╱
                ╲══════════════════════╱
                 ╲     /\\            ╱
                  ╲   /  \\          ╱
                   ╲ /____\\        ╱  ← Central Peak
                    ╲      ╱       ╱
                     ╲════════════╱  ← Crater Floor
                      
Diameter: ${(analysis.craterDiameter / 1000).toFixed(2)} km
Depth: ${(analysis.craterDepth / 1000).toFixed(2)} km
`}
                </pre>
              </Card>
            </TabsContent>

            {/* Damage Zones Tab */}
            <TabsContent value="damage" className="space-y-6">
              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-500" />
                  Damage Assessment
                </h3>
                
                {analysis.impactResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Airblast Radius</p>
                        <p className="text-2xl font-bold text-red-400">
                          {analysis.impactResults.damage.airblastRadius.toFixed(1)} km
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Severe structural damage, lethal overpressure
                        </p>
                      </div>

                      <div className="p-4 bg-orange-500/20 border border-orange-500 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Thermal Radius</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {analysis.impactResults.damage.thermalRadius.toFixed(1)} km
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          3rd degree burns, ignition of flammables
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-500/20 border border-yellow-600 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Seismic Magnitude</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {analysis.impactResults.damage.seismicMagnitude.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Richter scale earthquake equivalent
                        </p>
                      </div>
                    </div>

                    {/* Severity indicator */}
                    <div className={`p-4 rounded-lg ${
                      analysis.impactResults.severity === 'extinction' ? 'bg-red-500/30 border-red-500' :
                      analysis.impactResults.severity === 'catastrophic' ? 'bg-orange-500/30 border-orange-500' :
                      analysis.impactResults.severity === 'severe' ? 'bg-yellow-500/30 border-yellow-600' :
                      analysis.impactResults.severity === 'moderate' ? 'bg-blue-500/30 border-blue-500' :
                      'bg-green-500/30 border-green-500'
                    } border-2`}>
                      <p className="text-sm font-semibold mb-1">Impact Severity Classification</p>
                      <p className="text-2xl font-bold capitalize">{analysis.impactResults.severity}</p>
                      <p className="text-sm mt-2">{analysis.impactResults.comparison}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Impact zones on Earth */}
              {analysis.impactZones && analysis.impactZones.length > 0 && (
                <Card className="p-6 bg-muted/50">
                  <h3 className="text-xl font-bold mb-4">Potential Impact Zones</h3>
                  <div className="space-y-2">
                    {analysis.impactZones.map((zone: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded">
                        <div>
                          <p className="font-medium">Zone {idx + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            Lat: {zone.lat.toFixed(2)}°, Lon: {zone.lng.toFixed(2)}°
                          </p>
                        </div>
                        <Badge variant="destructive">
                          {((analysis.impactProbability / analysis.impactZones.length) * (1 - idx * 0.15)).toFixed(2)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Impact zones calculated based on orbital mechanics and closest approach vectors
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card className="p-6 bg-muted/50">
                <h3 className="text-xl font-bold mb-4">Historical Comparisons</h3>
                
                {analysis.impactResults && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/20 border-l-4 border-blue-500 rounded">
                      <p className="font-semibold mb-2">Energy Comparison</p>
                      <p className="text-sm">{analysis.impactResults.comparison}</p>
                    </div>

                    {/* Scale comparison */}
                    <div className="space-y-3">
                      <div className={`p-3 rounded ${analysis.kineticEnergyMT < 0.001 ? 'bg-green-500/20' : 'bg-muted'}`}>
                        <p className="text-sm">
                          <strong>💥 Small Meteorite:</strong> Burns up in atmosphere (harmless)
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded ${
                        analysis.kineticEnergyMT >= 0.001 && analysis.kineticEnergyMT < 15 ? 'bg-yellow-500/20' : 'bg-muted'
                      }`}>
                        <p className="text-sm">
                          <strong>💥 Hiroshima Bomb (15 kt):</strong> Local devastation
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded ${
                        analysis.kineticEnergyMT >= 15 && analysis.kineticEnergyMT < 1000 ? 'bg-orange-500/20' : 'bg-muted'
                      }`}>
                        <p className="text-sm">
                          <strong>💥 Tunguska Event (1908):</strong> Regional devastation, ~2000 km² flattened
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded ${
                        analysis.kineticEnergyMT >= 1000 && analysis.kineticEnergyMT < 100000 ? 'bg-red-500/20' : 'bg-muted'
                      }`}>
                        <p className="text-sm">
                          <strong>💥 Large Asteroid:</strong> Continental damage, climate effects
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded ${
                        analysis.kineticEnergyMT >= 100000 ? 'bg-red-700/30' : 'bg-muted'
                      }`}>
                        <p className="text-sm">
                          <strong>💥 Chicxulub Impact:</strong> Dinosaur extinction event - global mass extinction
                        </p>
                      </div>
                    </div>

                    {/* Warnings */}
                    {analysis.craterDiameter > 1000 && (
                      <div className="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg">
                        <p className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Warning: Widespread Devastation
                        </p>
                        <p className="text-sm">
                          Crater diameter exceeds 1 km - would cause widespread regional devastation and long-term climate effects.
                        </p>
                      </div>
                    )}
                    
                    {analysis.craterDiameter > 10000 && (
                      <div className="p-4 bg-red-500/30 border-2 border-red-500 rounded-lg">
                        <p className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          CATASTROPHIC: Extinction-Level Event
                        </p>
                        <p className="text-sm">
                          This impact would cause global climate change, mass extinctions, and potentially end human civilization.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Analysis based on real physics equations and crater scaling laws
            </p>
            <Button onClick={onClose} size="lg">
              Close Analysis
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
