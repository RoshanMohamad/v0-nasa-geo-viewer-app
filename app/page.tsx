"use client"

import { useState, useCallback } from "react"
import { SolarSystem } from "@/components/solar-system"
import { ControlPanel } from "@/components/control-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Rocket, Settings, Info, AlertTriangle, Target } from "lucide-react"
import { calculateImpact, type ImpactResults } from "@/lib/impact-calculator"
import type * as THREE from "three"

export default function HomePage() {
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
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
