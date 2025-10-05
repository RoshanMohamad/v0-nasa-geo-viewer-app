"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { SolarSystem } from "@/components/solar-system"
import { ControlPanel } from "@/components/control-panel"
import { PlanetSelector } from "@/components/planet-selector"
import { CustomObjectManager } from "@/components/custom-object-manager"
import { AsteroidControlPanel } from "@/components/asteroid-control-panel"
import { ImpactAnalysisModal } from "@/components/impact-analysis-modal"
import { ImpactVisualization } from "@/components/impact-visualization"
import { ImpactVisualizationAdvanced } from "@/components/impact-visualization-advanced"
import { ObjectDetailsPanel } from "@/components/object-details-panel"
import { OrbitPathViewer } from "@/components/orbit-path-viewer"
import { fetchRealAsteroid } from "@/lib/nasa-horizons-api"
import { SimulationTimeControls } from "@/components/simulation-time-controls"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Rocket, Settings, Info, AlertTriangle, Target, Atom, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { calculateImpact, type ImpactResults } from "@/lib/impact-calculator"
import { calculateImpactProbability, type CelestialBody, type ImpactAnalysis } from "@/lib/orbital-mechanics"
import { generateRandomAsteroid, type CustomAsteroid } from "@/lib/asteroid-system"
import type * as THREE from "three"

export default function HomePage() {
  const router = useRouter()
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const [asteroidSize, setAsteroidSize] = useState(1)
  const [asteroidSpeed, setAsteroidSpeed] = useState(15)
  const [asteroidAngle, setAsteroidAngle] = useState(45)
  const [startPosition, setStartPosition] = useState("Near Mars")
  const [simulationActive, setSimulationActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [impactResults, setImpactResults] = useState<ImpactResults | null>(null)
  const [meteorData, setMeteorData] = useState<{
    position: THREE.Vector3
    velocity: number
    orbitRadius: number
    timeToImpact: number | null
  } | null>(null)
  const [asteroidSpawnCounter, setAsteroidSpawnCounter] = useState(0)
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null)
  
  // Custom Objects & NASA Integration
  const [customObjects, setCustomObjects] = useState<CelestialBody[]>([])
  const [customAsteroids, setCustomAsteroids] = useState<CustomAsteroid[]>([])
  const [isObjectManagerOpen, setIsObjectManagerOpen] = useState(false)
  const [isAsteroidPanelOpen, setIsAsteroidPanelOpen] = useState(false)
  const [isImpactAnalysisOpen, setIsImpactAnalysisOpen] = useState(false)
  const [isImpactVisualizationOpen, setIsImpactVisualizationOpen] = useState(false)
  const [isAdvancedImpactOpen, setIsAdvancedImpactOpen] = useState(false)
  const [isObjectDetailsOpen, setIsObjectDetailsOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<CelestialBody | null>(null)
  const [selectedImpactAnalysis, setSelectedImpactAnalysis] = useState<{
    analysis: ImpactAnalysis
    object: CelestialBody
  } | null>(null)
  const [isLoadingNASA, setIsLoadingNASA] = useState(false)
  const [simulationTime, setSimulationTime] = useState(0)
  const [timeSpeed, setTimeSpeed] = useState(1000) // Start at 1000x speed for visible orbital motion
  const [simulationStartDate] = useState(new Date())
  const [currentSimulationDate, setCurrentSimulationDate] = useState(new Date())
  const elapsedSecondsRef = useRef(0)
  const lastUpdateTimeRef = useRef(Date.now())

  // Update simulation time based on speed
  useEffect(() => {
    if (isPaused) return

    const updateInterval = setInterval(() => {
      const now = Date.now()
      const deltaMs = now - lastUpdateTimeRef.current
      lastUpdateTimeRef.current = now

      const simulatedSeconds = (deltaMs / 1000) * timeSpeed
      elapsedSecondsRef.current += simulatedSeconds
      setSimulationTime(elapsedSecondsRef.current)

      // Update date display
      const newDate = new Date(simulationStartDate)
      newDate.setSeconds(newDate.getSeconds() + elapsedSecondsRef.current)
      setCurrentSimulationDate(newDate)
    }, 100) // Update 10 times per second

    return () => clearInterval(updateInterval)
  }, [isPaused, timeSpeed, simulationStartDate])

  const handleResetTime = useCallback(() => {
    elapsedSecondsRef.current = 0
    setSimulationTime(0)
    setCurrentSimulationDate(new Date(simulationStartDate))
    lastUpdateTimeRef.current = Date.now()
  }, [simulationStartDate])

  const handleStartSimulation = () => {
    setSimulationActive(true)
    setImpactResults(null)
    setAsteroidSpawnCounter((prev) => prev + 1)
  }

  const handleReset = () => {
    setSimulationActive(false)
    setIsPaused(false)
    setImpactResults(null)
    setMeteorData(null)
    setAsteroidSpawnCounter(0)
  }

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev)
  }

  const handleSpawnAsteroid = () => {
    setAsteroidSpawnCounter((prev) => prev + 1)
  }

  const handleImpact = useCallback(
    (data: { location: { lat: number; lng: number }; energy: number; asteroidId: string }) => {
      const results = calculateImpact({
        diameter: asteroidSize,
        velocity: asteroidSpeed,
        angle: asteroidAngle,
      })
      setImpactResults(results)
    },
    [asteroidSize, asteroidSpeed, asteroidAngle],
  )

  const handleMeteorPlaced = useCallback(
    (data: {
      position: THREE.Vector3
      velocity: number
      orbitRadius: number
      timeToImpact: number | null
    }) => {
      setMeteorData(data)
    },
    [],
  )

  const handleAddCustomObject = useCallback((object: CelestialBody) => {
    setCustomObjects((prev) => [...prev, object])
  }, [])

  const handleRemoveCustomObject = useCallback((id: string) => {
    setCustomObjects((prev) => prev.filter((obj) => obj.id !== id))
  }, [])

  // Handlers for AsteroidControlPanel
  const handleAddAsteroid = useCallback((asteroid: CustomAsteroid) => {
    // Convert CustomAsteroid to CelestialBody format
    const celestialBody: CelestialBody = {
      id: asteroid.id,
      name: asteroid.name,
      type: 'asteroid',
      radius: asteroid.size * 100, // Scale size to km
      mass: asteroid.mass,
      color: asteroid.color,
      composition: 'rocky',
      orbitalElements: {
        semiMajorAxis: asteroid.semiMajorAxis / 28, // Convert scene units to AU
        eccentricity: asteroid.eccentricity,
        inclination: (asteroid.inclination * 180) / Math.PI, // Convert radians to degrees
        longitudeOfAscendingNode: (asteroid.longitudeOfAscendingNode * 180) / Math.PI,
        argumentOfPerihelion: (asteroid.argumentOfPeriapsis * 180) / Math.PI,
        meanAnomaly: (asteroid.meanAnomalyAtEpoch * 180) / Math.PI,
      },
    }
    setCustomObjects((prev) => [...prev, celestialBody])
    setCustomAsteroids((prev) => [...prev, asteroid])
  }, [])

  const handleRemoveAsteroid = useCallback((asteroidId: string) => {
    setCustomObjects((prev) => prev.filter((obj) => obj.id !== asteroidId))
    setCustomAsteroids((prev) => prev.filter((ast) => ast.id !== asteroidId))
  }, [])

  const handleAnalyzeImpact = useCallback((object: CelestialBody, openInModal = false) => {
    // Earth's orbital elements for comparison
    const earthOrbit = {
      semiMajorAxis: 1.0, // AU
      eccentricity: 0.0167,
      inclination: 0,
      longitudeOfAscendingNode: 0,
      argumentOfPerihelion: 102.9,
      meanAnomaly: 0,
    }
    const analysis = calculateImpactProbability(object, earthOrbit)
    setSelectedImpactAnalysis({ analysis, object })
    
    if (openInModal) {
      setIsAdvancedImpactOpen(true)
    } else {
      // Navigate to dedicated impact analysis page
      const objectData = encodeURIComponent(JSON.stringify(object))
      router.push(`/impact-analysis?object=${objectData}`)
    }
  }, [router])

  const handleViewObject = useCallback((object: CelestialBody) => {
    setSelectedObject(object)
    setIsObjectDetailsOpen(true)
  }, [])

  const handleAddRealAsteroid = useCallback(async (presetKey: string) => {
    setIsLoadingNASA(true)
    try {
      const asteroid = await fetchRealAsteroid(presetKey as any)
      if (asteroid) {
        setCustomObjects((prev) => [...prev, asteroid])
        alert(
          `✅ Successfully loaded ${asteroid.name} from NASA Horizons!\n\n` +
          `Orbital Details:\n` +
          `• Distance: ${asteroid.orbitalElements.semiMajorAxis.toFixed(3)} AU\n` +
          `• Eccentricity: ${asteroid.orbitalElements.eccentricity.toFixed(4)}\n` +
          `• Inclination: ${asteroid.orbitalElements.inclination.toFixed(2)}°\n` +
          `• Mass: ${asteroid.mass.toExponential(2)} kg`
        )
      } else {
        alert(
          '❌ Failed to load asteroid from NASA Horizons.\n\n' +
          'Using approximate orbital data instead. ' +
          'Please check your internet connection.'
        )
      }
    } catch (error) {
      console.error('Error loading asteroid:', error)
      alert(
        '❌ Error loading asteroid from NASA.\n\n' +
        `Details: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
        'Please try again later.'
      )
    } finally {
      setIsLoadingNASA(false)
    }
  }, [])

  const handleViewDetailedImpact = useCallback(() => {
    if (selectedImpactAnalysis) {
      setIsImpactAnalysisOpen(false)
      setIsImpactVisualizationOpen(true)
    }
  }, [selectedImpactAnalysis])

  const previewImpact = calculateImpact({
    diameter: asteroidSize,
    velocity: asteroidSpeed,
    angle: asteroidAngle,
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "text-yellow-500"
      case "moderate":
        return "text-orange-500"
      case "severe":
        return "text-red-500"
      case "catastrophic":
        return "text-red-600"
      case "extinction":
        return "text-purple-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen space-gradient">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Solar System & Asteroid Impact Simulator</h1>
            </div>
            <nav className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsObjectManagerOpen(true)}
                className="hover:bg-primary/10"
              >
                <Atom className="w-4 h-4 mr-2" />
                Custom Objects
              </Button>
              <Button variant="ghost" size="sm">
                <Info className="w-4 h-4 mr-2" />
                About
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-[calc(100vh-73px)]">
        <div className="absolute inset-0">
          <SolarSystem
            onPlanetHover={setHoveredPlanet}
            asteroidConfig={{
              size: asteroidSize,
              speed: asteroidSpeed,
              angle: asteroidAngle,
              active: simulationActive,
              startPosition: startPosition,
            }}
            onImpact={handleImpact}
            onMeteorPlaced={handleMeteorPlaced}
            isPaused={isPaused}
            onSpawnAsteroid={handleSpawnAsteroid}
            asteroidSpawnCounter={asteroidSpawnCounter}
            focusPlanet={focusedPlanet}
            customObjects={customObjects}
            simulationTime={simulationTime}
            onObjectClick={handleAnalyzeImpact}
          />
        </div>

        {/* Control Panel */}
        <div className="absolute top-6 left-6 z-10 space-y-4">
          <ControlPanel
            asteroidSize={asteroidSize}
            asteroidSpeed={asteroidSpeed}
            asteroidAngle={asteroidAngle}
            onSizeChange={setAsteroidSize}
            onSpeedChange={setAsteroidSpeed}
            onAngleChange={setAsteroidAngle}
            onStart={handleStartSimulation}
            onReset={handleReset}
            simulationActive={simulationActive}
            isPaused={isPaused}
            onPauseToggle={handlePauseToggle}
            startPosition={startPosition}
            onStartPositionChange={setStartPosition}
            onSpawnAsteroid={handleSpawnAsteroid}
          />

          {/* Planet Focus Selector with GSAP Camera Animation */}
          <PlanetSelector
            selectedPlanet={focusedPlanet}
            onSelectPlanet={setFocusedPlanet}
          />

          {/* Simulation Time Controls */}
          <SimulationTimeControls
            isPaused={isPaused}
            onPauseToggle={handlePauseToggle}
            timeSpeed={timeSpeed}
            onTimeSpeedChange={setTimeSpeed}
            simulationDate={currentSimulationDate}
            onReset={handleResetTime}
          />

          {meteorData && (
            <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/50 w-96">
              <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                Meteor Orbit Data
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Orbit Radius</span>
                    <div className="font-semibold text-foreground">{meteorData.orbitRadius.toFixed(2)} AU</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Velocity</span>
                    <div className="font-semibold text-foreground">{meteorData.velocity.toFixed(2)} km/s</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Position</span>
                    <div className="font-mono text-xs text-foreground">
                      x: {meteorData.position.x.toFixed(1)}, z: {meteorData.position.z.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <span className="text-muted-foreground text-xs block mb-1">Earth Impact:</span>
                  {meteorData.timeToImpact ? (
                    <div className="font-semibold text-red-500">
                      Impact in ~{meteorData.timeToImpact.toFixed(0)} seconds
                    </div>
                  ) : (
                    <div className="font-semibold text-green-500">No intersection detected</div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Impact Preview */}
          {!simulationActive && !meteorData && (
            <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/50 w-96">
              <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Impact Preview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Energy</span>
                    <div className="font-semibold text-foreground">
                      {previewImpact.energy.megatonsTNT.toFixed(2)} MT
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Crater</span>
                    <div className="font-semibold text-foreground">{previewImpact.crater.diameter.toFixed(2)} km</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Airblast</span>
                    <div className="font-semibold text-foreground">
                      {previewImpact.damage.airblastRadius.toFixed(1)} km
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Magnitude</span>
                    <div className="font-semibold text-foreground">
                      {previewImpact.damage.seismicMagnitude.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <span className="text-muted-foreground text-xs block mb-1">Severity:</span>
                  <div className={`font-semibold capitalize ${getSeverityColor(previewImpact.severity)}`}>
                    {previewImpact.severity}
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground italic">{previewImpact.comparison}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Impact Results */}
        {impactResults && (
          <div className="absolute top-6 right-6 z-10">
            <Card className="p-6 bg-destructive/90 backdrop-blur-sm border-destructive w-96">
              <h2 className="text-xl font-semibold mb-4 text-destructive-foreground flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Impact Analysis
              </h2>
              <div className="space-y-4 text-sm text-destructive-foreground">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Energy Release</h3>
                  <div className="ml-2 space-y-1">
                    <div>{impactResults.energy.megatonsTNT.toFixed(2)} Megatons TNT</div>
                    <div className="text-xs opacity-90">{impactResults.energy.joules.toExponential(2)} Joules</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Crater Formation</h3>
                  <div className="ml-2 space-y-1">
                    <div>Diameter: {impactResults.crater.diameter.toFixed(2)} km</div>
                    <div>Depth: {impactResults.crater.depth.toFixed(2)} km</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-base">Damage Zones</h3>
                  <div className="ml-2 space-y-1">
                    <div>Airblast: {impactResults.damage.airblastRadius.toFixed(1)} km radius</div>
                    <div>Thermal: {impactResults.damage.thermalRadius.toFixed(1)} km radius</div>
                    <div>Seismic: {impactResults.damage.seismicMagnitude.toFixed(1)} magnitude</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-destructive-foreground/30">
                  <div className="font-semibold mb-1">Comparison:</div>
                  <div className="text-xs italic">{impactResults.comparison}</div>
                </div>

                <div className="pt-2">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      impactResults.severity === "extinction"
                        ? "bg-purple-600"
                        : impactResults.severity === "catastrophic"
                          ? "bg-red-600"
                          : impactResults.severity === "severe"
                            ? "bg-orange-600"
                            : "bg-yellow-600"
                    }`}
                  >
                    {impactResults.severity} Event
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Panel */}
        <div className="absolute bottom-6 right-6 z-10">
          <Card className="p-4 bg-card/90 backdrop-blur-sm border-border/50">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    simulationActive && !isPaused
                      ? "bg-green-500 animate-pulse"
                      : simulationActive
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                  }`}
                ></div>
                <span className="text-muted-foreground">
                  {simulationActive && !isPaused ? "Running" : simulationActive ? "Paused" : "Ready"}
                </span>
              </div>
              <div className="text-muted-foreground">8 Planets Orbiting</div>
              {customObjects.length > 0 && (
                <div className="text-muted-foreground">
                  {customObjects.length} Custom Object{customObjects.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Orbit Path Comparison Viewer */}
        <OrbitPathViewer
          customObjects={customObjects}
          onFocusObject={(object) => {
            // Focus camera on object in 3D view
            console.log('Focus on:', object.name)
          }}
        />
      </main>

      {/* Custom Object Manager Modal */}
      {isObjectManagerOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-foreground hover:text-primary"
              onClick={() => setIsObjectManagerOpen(false)}
            >
              ✕
            </Button>
            <CustomObjectManager
              onAddObject={handleAddCustomObject}
              onRemoveObject={handleRemoveCustomObject}
              customObjects={customObjects}
              onAddRealAsteroid={handleAddRealAsteroid}
              onAnalyzeImpact={handleAnalyzeImpact}
              onViewObject={handleViewObject}
            />
            {isLoadingNASA && (
              <div className="absolute top-4 right-4 bg-blue-950/90 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading NASA data...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Impact Analysis Modal */}
      {selectedImpactAnalysis && isImpactAnalysisOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-foreground hover:text-primary"
              onClick={() => {
                setIsImpactAnalysisOpen(false)
                setSelectedImpactAnalysis(null)
              }}
            >
              ✕
            </Button>
            <ImpactAnalysisModal
              asteroid={selectedImpactAnalysis.object}
              analysis={selectedImpactAnalysis.analysis}
              onClose={() => {
                setIsImpactAnalysisOpen(false)
                setSelectedImpactAnalysis(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Detailed Impact Visualization Modal */}
      {selectedImpactAnalysis && isImpactVisualizationOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <ImpactVisualization
            object={selectedImpactAnalysis.object}
            analysis={selectedImpactAnalysis.analysis}
            onClose={() => {
              setIsImpactVisualizationOpen(false)
              setSelectedImpactAnalysis(null)
            }}
          />
        </div>
      )}

      {/* Advanced Impact Visualization with Top-Down & Surface Views */}
      {selectedImpactAnalysis && isAdvancedImpactOpen && (
        <ImpactVisualizationAdvanced
          analysis={selectedImpactAnalysis.analysis}
          object={selectedImpactAnalysis.object}
          onClose={() => {
            setIsAdvancedImpactOpen(false)
            setSelectedImpactAnalysis(null)
          }}
        />
      )}

      {/* Object Details Panel */}
      {selectedObject && isObjectDetailsOpen && (
        <ObjectDetailsPanel
          object={selectedObject}
          onClose={() => {
            setIsObjectDetailsOpen(false)
            setSelectedObject(null)
          }}
        />
      )}
    </div>
  )
}
