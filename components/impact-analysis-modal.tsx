"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Target, Zap, Globe, X } from "lucide-react"
import { CraterVisualization } from "@/components/crater-visualization"
import type { CelestialBody, ImpactAnalysis } from "@/lib/orbital-mechanics"

interface ImpactAnalysisModalProps {
  asteroid: CelestialBody
  analysis: ImpactAnalysis
  onClose: () => void
}

export function ImpactAnalysisModal({ asteroid, analysis, onClose }: ImpactAnalysisModalProps) {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'bg-red-600'
      case 'High': return 'bg-orange-600'
      case 'Moderate': return 'bg-yellow-600'
      case 'Low': return 'bg-blue-600'
      default: return 'bg-gray-600'
    }
  }

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'text-red-600'
      case 'High': return 'text-orange-600'
      case 'Moderate': return 'text-yellow-600'
      case 'Low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="max-w-4xl max-h-[90vh] overflow-auto bg-card/95 backdrop-blur-md border-2 border-border">
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border z-10">
          <div className="flex items-start justify-between p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getRiskColor(analysis.riskLevel)}`}>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{asteroid.name}</h2>
                <p className="text-sm text-muted-foreground">Impact Risk Analysis Report</p>
                <Badge className={`mt-2 ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel} Risk
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orbital">Orbital Data</TabsTrigger>
              <TabsTrigger value="impact">Impact Effects</TabsTrigger>
              <TabsTrigger value="crater">Crater</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Risk Summary */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Risk Assessment
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Impact Probability</p>
                    <p className={`text-3xl font-bold ${getRiskTextColor(analysis.riskLevel)}`}>
                      {analysis.impactProbability.toFixed(4)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                    <p className={`text-3xl font-bold ${getRiskTextColor(analysis.riskLevel)}`}>
                      {analysis.riskLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Closest Approach</p>
                    <p className="text-lg font-semibold text-foreground">
                      {analysis.closestApproach.toLocaleString()} km
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({analysis.closestApproachEarthRadii.toFixed(2)} Earth radii)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Classification</p>
                    <p className="text-lg font-semibold text-foreground">{analysis.classification || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Estimated Damage */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Estimated Damage</h3>
                <p className="text-muted-foreground">{analysis.estimatedDamage || 'Assessment pending'}</p>
              </div>

              {/* Object Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Object Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{asteroid.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-medium">{asteroid.radius.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mass:</span>
                    <span className="font-medium">{asteroid.mass.toExponential(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Composition:</span>
                    <span className="font-medium capitalize">{asteroid.composition}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orbital" className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Orbital Elements</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Semi-major Axis (a):</span>
                    <span className="font-mono font-medium">{asteroid.orbitalElements.semiMajorAxis.toFixed(4)} AU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Eccentricity (e):</span>
                    <span className="font-mono font-medium">{asteroid.orbitalElements.eccentricity.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Inclination (i):</span>
                    <span className="font-mono font-medium">{asteroid.orbitalElements.inclination.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Argument of Perihelion (ω):</span>
                    <span className="font-mono font-medium">{asteroid.orbitalElements.argumentOfPerihelion.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Longitude of Ascending Node (Ω):</span>
                    <span className="font-mono font-medium">{asteroid.orbitalElements.longitudeOfAscendingNode.toFixed(2)}°</span>
                  </div>
                  {asteroid.orbitalElements.period && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Orbital Period:</span>
                      <span className="font-mono font-medium">{asteroid.orbitalElements.period.toFixed(2)} years</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Orbital Intersection Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Minimum distance between {asteroid.name}'s orbit and Earth's orbit:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Kilometers</p>
                    <p className="text-lg font-bold">{analysis.closestApproach.toLocaleString()}</p>
                  </Card>
                  <Card className="p-4 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Astronomical Units</p>
                    <p className="text-lg font-bold">{analysis.closestApproachAU.toFixed(6)}</p>
                  </Card>
                  <Card className="p-4 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Earth Radii</p>
                    <p className="text-lg font-bold">{analysis.closestApproachEarthRadii.toFixed(2)}</p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Impact Energy
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Kinetic Energy</p>
                    <p className="text-2xl font-bold text-foreground">{analysis.kineticEnergy.toExponential(2)} J</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">TNT Equivalent</p>
                    <p className="text-2xl font-bold text-foreground">{analysis.kineticEnergyMT.toFixed(2)} MT</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Crater Dimensions
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Crater Diameter</p>
                    <p className="text-xl font-bold text-foreground">{analysis.craterDiameter.toFixed(2)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Crater Depth</p>
                    <p className="text-xl font-bold text-foreground">{analysis.craterDepth.toFixed(2)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ejecta Radius</p>
                    <p className="text-xl font-bold text-foreground">{analysis.ejectaRadius.toFixed(2)} km</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Potential Impact Zones</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Simulated strike zones based on orbital intersection:
                </p>
                {analysis.impactZones && analysis.impactZones.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {analysis.impactZones.map((zone, index) => (
                      <Card key={index} className="p-3 bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">Zone {index + 1}</p>
                        <p className="text-xs font-mono mt-1">
                          {zone.lat.toFixed(2)}°, {zone.lng.toFixed(2)}°
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No impact zones calculated</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Historical Comparison</h3>
                <div className="space-y-4">
                  <ComparisonCard
                    name="Hiroshima Atomic Bomb"
                    energy="15 kilotons (0.015 MT)"
                    description="First nuclear weapon used in warfare, 1945"
                    isLarger={analysis.kineticEnergyMT > 0.015}
                  />
                  <ComparisonCard
                    name="Chelyabinsk Meteor"
                    energy="500 kilotons (0.5 MT)"
                    description="Airburst over Russia, 2013, injured 1,500 people"
                    isLarger={analysis.kineticEnergyMT > 0.5}
                  />
                  <ComparisonCard
                    name="Tunguska Event"
                    energy="3-5 Megatons"
                    description="Flattened 2,000 km² of Siberian forest, 1908"
                    isLarger={analysis.kineticEnergyMT > 5}
                  />
                  <ComparisonCard
                    name="Tsar Bomba"
                    energy="50 Megatons"
                    description="Largest nuclear weapon ever detonated, 1961"
                    isLarger={analysis.kineticEnergyMT > 50}
                  />
                  <ComparisonCard
                    name="Chicxulub Impact"
                    energy="100 million Megatons"
                    description="Caused dinosaur extinction, 66 million years ago"
                    isLarger={analysis.kineticEnergyMT > 100000000}
                  />
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-6">
                <h4 className="font-semibold mb-2">Current Assessment</h4>
                <p className="text-sm text-muted-foreground">
                  {asteroid.name} has an estimated impact energy of{' '}
                  <span className="font-bold text-foreground">{analysis.kineticEnergyMT?.toFixed(2) || '0.00'} MT</span>.{' '}
                  {analysis.classification || 'Classification pending'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="crater" className="space-y-6">
              <CraterVisualization analysis={analysis} asteroidName={asteroid.name} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Data based on orbital mechanics simulation
            </p>
            <Button onClick={onClose}>Close Analysis</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface ComparisonCardProps {
  name: string
  energy: string
  description: string
  isLarger: boolean
}

function ComparisonCard({ name, energy, description, isLarger }: ComparisonCardProps) {
  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">{energy}</p>
        </div>
        <Badge variant={isLarger ? "destructive" : "secondary"}>
          {isLarger ? "Larger" : "Smaller"}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  )
}
