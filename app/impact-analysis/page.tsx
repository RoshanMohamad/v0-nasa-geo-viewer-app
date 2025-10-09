"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, AlertTriangle, Target, TrendingUp, Globe, Database } from "lucide-react"
import { ImpactVisualizationAdvanced } from "@/components/impact-visualization-advanced"
import { ObjectDetailsPanel } from "@/components/object-details-panel"
import { OrbitalIntersectionViewer } from "@/components/orbital-intersection-viewer"
import { SurfaceImpactViewer } from "@/components/surface-impact-viewer"
import { calculateImpactProbability, type CelestialBody, type ImpactAnalysis } from "@/lib/orbital-mechanics"
import dynamic from "next/dynamic"
const ImpactSandbox = dynamic(() => import("@/components/ImpactSandbox"), { ssr: false })

export default function ImpactAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedObject, setSelectedObject] = useState<CelestialBody | null>(null)
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [riskLevel, setRiskLevel] = useState<{
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
    color: string
    bgColor: string
    reasons: string[]
  } | null>(null)

  // Calculate risk level based on orbital parameters
  const calculateRiskLevel = (obj: CelestialBody): {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
    color: string
    bgColor: string
    reasons: string[]
  } => {
    const reasons: string[] = []
    let score = 0

    const a = obj.orbitalElements.semiMajorAxis
    const e = obj.orbitalElements.eccentricity

    // Check if Near-Earth Object (< 1.3 AU)
    if (a < 1.3) {
      score += 3
      reasons.push('Near-Earth orbit')
    }

    // Check eccentricity (high = crosses Earth's orbit)
    if (e > 0.5) {
      score += 2
      reasons.push('Highly eccentric orbit')
    }

    // Check if orbit crosses Earth's (around 1.0 AU)
    const perihelion = a * (1 - e) // Closest point to Sun
    const aphelion = a * (1 + e)   // Farthest point from Sun
    
    if (perihelion < 1.05 && aphelion > 0.95) {
      score += 4
      reasons.push('Crosses Earth\'s orbit')
    }

    // Check size (larger = more dangerous)
    if (obj.radius > 100) {
      score += 2
      reasons.push('Large size (>100 km)')
    } else if (obj.radius > 10) {
      score += 1
      reasons.push('Significant size (>10 km)')
    }

    // Check inclination (low = same plane as Earth)
    if (obj.orbitalElements.inclination < 10) {
      score += 1
      reasons.push('Low inclination')
    }

    // Determine risk level
    if (score >= 7) {
      return { level: 'EXTREME', color: '#ff0000', bgColor: 'bg-red-500/20', reasons }
    } else if (score >= 5) {
      return { level: 'HIGH', color: '#ff6600', bgColor: 'bg-orange-500/20', reasons }
    } else if (score >= 3) {
      return { level: 'MODERATE', color: '#ffaa00', bgColor: 'bg-yellow-500/20', reasons }
    } else {
      return { level: 'LOW', color: '#00ff00', bgColor: 'bg-green-500/20', reasons }
    }
  }

  useEffect(() => {
    // Try to get object data from URL params or localStorage
    const objectData = searchParams.get('object')
    if (objectData) {
      try {
        const object: CelestialBody = JSON.parse(decodeURIComponent(objectData))
        setSelectedObject(object)
        
        // Calculate risk level
        const risk = calculateRiskLevel(object)
        setRiskLevel(risk)
        
        // Calculate impact analysis
        const earthOrbit = {
          semiMajorAxis: 1.0,
          eccentricity: 0.0167,
          inclination: 0,
          longitudeOfAscendingNode: 0,
          argumentOfPerihelion: 102.9,
          meanAnomaly: 0,
        }
        const impactAnalysis = calculateImpactProbability(object, earthOrbit)
        setAnalysis(impactAnalysis)
      } catch (error) {
        console.error('Error parsing object data:', error)
      }
    }
  }, [searchParams])

  if (!selectedObject || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold mb-2">No Object Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select an object from the main page to analyze its impact potential.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Solar System
          </Button>
        </Card>
      </div>
    )
  }

  const getRiskColor = () => {
    if (!riskLevel) return 'border-green-600 bg-green-950/30'
    switch (riskLevel.level) {
      case 'EXTREME': return 'border-red-600 bg-red-950/30'
      case 'HIGH': return 'border-orange-600 bg-orange-950/30'
      case 'MODERATE': return 'border-yellow-600 bg-yellow-950/30'
      case 'LOW': return 'border-green-600 bg-green-950/30'
      default: return 'border-green-600 bg-green-950/30'
    }
  }

  const getRiskTextColor = () => {
    if (!riskLevel) return 'text-green-600'
    switch (riskLevel.level) {
      case 'EXTREME': return 'text-red-600'
      case 'HIGH': return 'text-orange-600'
      case 'MODERATE': return 'text-yellow-600'
      case 'LOW': return 'text-green-600'
      default: return 'text-green-600'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="w-6 h-6 text-red-500" />
                  Impact Analysis
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive threat assessment for {selectedObject.name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowDetails(true)}>
              <Database className="w-4 h-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </div>
      </div>

      {/* Risk Summary Banner */}
      <div className="container mx-auto px-4 py-6">
        <Card className={`p-6 border-2 ${getRiskColor()}`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-12 h-12 ${getRiskTextColor()}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">
                  Risk Level: <span className={getRiskTextColor()}>{riskLevel?.level || 'LOW'}</span>
                </h2>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Impact Probability</div>
                  <div className={`text-3xl font-bold ${getRiskTextColor()}`}>
                    {analysis.impactProbability.toFixed(4)}%
                  </div>
                </div>
              </div>
              
              {/* Show risk reasons if HIGH or EXTREME */}
              {riskLevel && (riskLevel.level === 'HIGH' || riskLevel.level === 'EXTREME') && riskLevel.reasons.length > 0 && (
                <div className={`mt-3 p-3 rounded-lg ${riskLevel.bgColor} border ${riskLevel.level === 'EXTREME' ? 'border-red-500/50' : 'border-orange-500/50'}`}>
                  <div className="text-sm font-semibold mb-2">Risk Factors:</div>
                  <ul className="text-sm space-y-1">
                    {riskLevel.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-sm text-muted-foreground">Classification</div>
                  <div className="font-semibold">{analysis.classification}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Closest Approach</div>
                  <div className="font-semibold">{analysis.closestApproach.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Kinetic Energy</div>
                  <div className="font-semibold">{analysis.kineticEnergyMT.toFixed(2)} MT</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="visualization">
              <Globe className="w-4 h-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="damage">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Damage Assessment
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <Database className="w-4 h-4 mr-2" />
              Historical Comparison
            </TabsTrigger>
          </TabsList>

          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Orbital Intersection - Top View */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Orbital Intersection - Top View
                </h3>
                <div className="aspect-square bg-black/50 rounded-lg overflow-hidden">
                  <OrbitalIntersectionViewer
                    asteroidOrbit={selectedObject.orbitalElements}
                    asteroidName={selectedObject.name}
                    viewType="top"
                  />
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Red orbit: {selectedObject.name}</p>
                  <p>Blue orbit: Earth</p>
                  <p>Yellow markers: Potential intersection points</p>
                </div>
              </Card>

              {/* Surface Impact - Side View */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Surface Impact - Side View
                </h3>
                <div className="aspect-square bg-black/50 rounded-lg overflow-hidden">
                  <SurfaceImpactViewer
                    asteroidRadius={selectedObject.radius}
                    impactVelocity={selectedObject.orbitalElements.velocity || 20}
                    craterDiameter={analysis.craterDiameter}
                    craterDepth={analysis.craterDepth}
                    ejectaRadius={analysis.ejectaRadius}
                    asteroidName={selectedObject.name}
                  />
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Crater diameter: {analysis.craterDiameter.toFixed(2)} km</p>
                  <p>Crater depth: {analysis.craterDepth.toFixed(2)} km</p>
                  <p>Ejecta radius: {analysis.ejectaRadius.toFixed(2)} km</p>
                </div>
              </Card>
            </div>

            {/* 3D Impact Visualization */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                3D Impact Scenario
              </h3>
              <ImpactVisualizationAdvanced
                object={selectedObject}
                analysis={analysis}
                onClose={() => {}}
              />
            </Card>

            {/* Interactive Impact Sandbox (map + controls + results) */}
            <div className="mt-4">
              <ImpactSandbox />
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Closest Approach</h3>
                <div className="text-3xl font-bold mb-1">{analysis.closestApproach.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">kilometers</div>
                <div className="mt-2 text-sm">
                  {analysis.closestApproachEarthRadii.toFixed(2)} Earth radii
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Impact Velocity</h3>
                <div className="text-3xl font-bold mb-1">
                  {selectedObject.orbitalElements.velocity?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">km/s</div>
                <div className="mt-2 text-sm">
                  {((selectedObject.orbitalElements.velocity || 0) * 3600).toFixed(0)} km/h
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Object Mass</h3>
                <div className="text-3xl font-bold mb-1">{selectedObject.mass.toExponential(2)}</div>
                <div className="text-sm text-muted-foreground">kilograms</div>
                <div className="mt-2 text-sm capitalize">
                  {selectedObject.composition || 'Unknown'} composition
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Kinetic Energy</h3>
                <div className="text-3xl font-bold mb-1">{analysis.kineticEnergy.toExponential(2)}</div>
                <div className="text-sm text-muted-foreground">Joules</div>
                <div className="mt-2 text-sm">
                  {analysis.kineticEnergyMT.toFixed(2)} Megatons TNT
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Crater Diameter</h3>
                <div className="text-3xl font-bold mb-1">{analysis.craterDiameter.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">kilometers</div>
                <div className="mt-2 text-sm">
                  Depth: {analysis.craterDepth.toFixed(2)} km
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Ejecta Radius</h3>
                <div className="text-3xl font-bold mb-1">{analysis.ejectaRadius.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">kilometers</div>
                <div className="mt-2 text-sm">
                  Total devastation zone
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Damage Assessment Tab */}
          <TabsContent value="damage" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Impact Effects</h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-red-400">Ejecta Zone</div>
                      <div className="text-sm text-muted-foreground">Complete destruction</div>
                    </div>
                    <div className="text-2xl font-bold">{analysis.ejectaRadius.toFixed(2)} km</div>
                  </div>
                </div>

                {analysis.damage?.airblastRadius && (
                  <div className="p-4 bg-orange-950/20 border border-orange-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-orange-400">Airblast Zone</div>
                        <div className="text-sm text-muted-foreground">Structural damage</div>
                      </div>
                      <div className="text-2xl font-bold">{analysis.damage.airblastRadius.toFixed(2)} km</div>
                    </div>
                  </div>
                )}

                {analysis.damage?.thermalRadius && (
                  <div className="p-4 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-yellow-400">Thermal Radiation</div>
                        <div className="text-sm text-muted-foreground">Burns and fires</div>
                      </div>
                      <div className="text-2xl font-bold">{analysis.damage.thermalRadius.toFixed(2)} km</div>
                    </div>
                  </div>
                )}

                {analysis.damage?.seismicMagnitude && (
                  <div className="p-4 bg-blue-950/20 border border-blue-900/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-blue-400">Seismic Effects</div>
                        <div className="text-sm text-muted-foreground">Earthquake magnitude</div>
                      </div>
                      <div className="text-2xl font-bold">{analysis.damage.seismicMagnitude.toFixed(1)} Richter</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-amber-950/20 border-amber-600">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Estimated Damage Assessment
              </h3>
              <p className="text-sm leading-relaxed">{analysis.estimatedDamage}</p>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Historical Event Comparison</h3>
              <div className="text-center mb-4">
                <div className="text-sm text-muted-foreground mb-2">This impact would be classified as:</div>
                <div className="text-2xl font-bold text-primary">{analysis.classification}</div>
              </div>

              <div className="space-y-4 mt-6">
                <div className={`p-4 rounded-lg border ${
                  analysis.kineticEnergyMT < 0.015 ? 'bg-green-950/20 border-green-900/50' : 'bg-muted/50'
                }`}>
                  <div className="font-semibold">Chelyabinsk Meteor (2013)</div>
                  <div className="text-sm text-muted-foreground">~0.5 Megatons - Minor damage</div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  analysis.kineticEnergyMT >= 0.5 && analysis.kineticEnergyMT < 10 ? 'bg-yellow-950/20 border-yellow-900/50' : 'bg-muted/50'
                }`}>
                  <div className="font-semibold">Tunguska Event (1908)</div>
                  <div className="text-sm text-muted-foreground">~10 Megatons - Regional devastation</div>
                </div>

                <div className={`p-4 rounded-lg border ${
                  analysis.kineticEnergyMT >= 1000 ? 'bg-red-950/20 border-red-900/50' : 'bg-muted/50'
                }`}>
                  <div className="font-semibold">Chicxulub Impact (66 MYA)</div>
                  <div className="text-sm text-muted-foreground">~100 million Megatons - Mass extinction</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Energy Scale</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-24 text-sm text-muted-foreground">0.015 MT</div>
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                      style={{ width: `${Math.min((analysis.kineticEnergyMT / 100) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="w-24 text-sm text-muted-foreground text-right">100+ MT</div>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  This object: <span className="font-bold text-foreground">{analysis.kineticEnergyMT.toFixed(2)} Megatons</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Object Details Modal */}
      {showDetails && selectedObject && (
        <ObjectDetailsPanel
          object={selectedObject}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  )
}
