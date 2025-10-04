"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, RotateCcw, Zap, Loader2, AlertCircle, Pause, Plus, Target } from "lucide-react"
import { fetchNearEarthObjects, type NeoData } from "@/lib/nasa-neo-api"

interface ControlPanelProps {
  asteroidSize: number
  asteroidSpeed: number
  asteroidAngle: number
  onSizeChange: (value: number) => void
  onSpeedChange: (value: number) => void
  onAngleChange: (value: number) => void
  onStart: () => void
  onReset: () => void
  simulationActive: boolean
  isPaused?: boolean
  onPauseToggle?: () => void
  startPosition?: string
  onStartPositionChange?: (value: string) => void
  onSpawnAsteroid?: () => void
  manualPlacementMode?: boolean
  onManualPlacementToggle?: () => void
}

/**
 * ControlPanel Component - Asteroid simulation configuration interface
 * 
 * Provides three modes of asteroid configuration:
 * 1. Custom - Manual parameter adjustment
 * 2. Presets - Historical impact events
 * 3. NASA Data - Real near-Earth objects from NASA API
 */
export function ControlPanel({
  asteroidSize,
  asteroidSpeed,
  asteroidAngle,
  onSizeChange,
  onSpeedChange,
  onAngleChange,
  onStart,
  onReset,
  simulationActive,
  isPaused = false,
  onPauseToggle,
  startPosition = "Near Mars",
  onStartPositionChange,
  onSpawnAsteroid,
  manualPlacementMode = false,
  onManualPlacementToggle,
}: ControlPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [neoData, setNeoData] = useState<NeoData[]>([])
  const [selectedNeo, setSelectedNeo] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real-time NASA Near-Earth Objects data on component mount
  useEffect(() => {
    const loadNeoData = async () => {
      setLoading(true)
      setError(null)
      const data = await fetchNearEarthObjects()
      if (data.length === 0) {
        setError("NASA data temporarily unavailable. Use Custom or Presets tab instead.")
      } else {
        setNeoData(data)
      }
      setLoading(false)
    }
    loadNeoData()
  }, [])

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey)
    setSelectedNeo("")
    const preset = PRESETS[presetKey as keyof typeof PRESETS]
    if (preset) {
      onSizeChange(preset.diameter)
      onSpeedChange(preset.velocity)
      onAngleChange(preset.angle)
    }
  }

  const handleNeoChange = (neoId: string) => {
    setSelectedNeo(neoId)
    setSelectedPreset("")
    const neo = neoData.find((n) => n.id === neoId)
    if (neo) {
      onSizeChange(neo.diameter.estimated)
      onSpeedChange(neo.velocity)
      onAngleChange(45) // Default angle for real asteroids
    }
  }

  const PRESETS = {
    chelyabinsk: {
      name: "Chelyabinsk (2013)",
      diameter: 0.02,
      velocity: 19,
      angle: 20,
      description: "Russian meteor that injured 1,500 people",
    },
    tunguska: {
      name: "Tunguska (1908)",
      diameter: 0.06,
      velocity: 15,
      angle: 30,
      description: "Flattened 2,000 km² of Siberian forest",
    },
    barringer: {
      name: "Barringer Crater",
      diameter: 0.05,
      velocity: 12.8,
      angle: 45,
      description: "Created famous Arizona meteor crater",
    },
    chicxulub: {
      name: "Chicxulub (Dinosaurs)",
      diameter: 10,
      velocity: 20,
      angle: 60,
      description: "Caused mass extinction 66 million years ago",
    },
    apophis: {
      name: "Apophis (Hypothetical)",
      diameter: 0.37,
      velocity: 12.6,
      angle: 45,
      description: "Near-Earth asteroid, close approach in 2029",
    },
  }

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/50 w-96">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Asteroid Configuration</h2>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="nasa">NASA Data</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Starting Position</label>
            <Select value={startPosition} onValueChange={onStartPositionChange} disabled={simulationActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Near Mars">Near Mars</SelectItem>
                <SelectItem value="Near Jupiter">Near Jupiter</SelectItem>
                <SelectItem value="Near Saturn">Near Saturn</SelectItem>
                <SelectItem value="Asteroid Belt">Asteroid Belt</SelectItem>
                <SelectItem value="Outer System">Outer System</SelectItem>
                <SelectItem value="Random">Random Position</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Diameter: {asteroidSize.toFixed(2)} km
            </label>
            <Slider
              value={[asteroidSize]}
              onValueChange={(v) => onSizeChange(v[0])}
              min={0.01}
              max={10}
              step={0.01}
              disabled={simulationActive}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10m</span>
              <span>10km</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Velocity: {asteroidSpeed.toFixed(1)} km/s
            </label>
            <Slider
              value={[asteroidSpeed]}
              onValueChange={(v) => onSpeedChange(v[0])}
              min={5}
              max={70}
              step={0.5}
              disabled={simulationActive}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5 km/s</span>
              <span>70 km/s</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Impact Angle: {asteroidAngle}°</label>
            <Slider
              value={[asteroidAngle]}
              onValueChange={(v) => onAngleChange(v[0])}
              min={15}
              max={90}
              step={5}
              disabled={simulationActive}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Shallow</span>
              <span>Vertical</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Select value={selectedPreset} onValueChange={handlePresetChange} disabled={simulationActive}>
            <SelectTrigger>
              <SelectValue placeholder="Select a historical event" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPreset && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">{PRESETS[selectedPreset as keyof typeof PRESETS].name}</h4>
              <p className="text-xs text-muted-foreground mb-3">
                {PRESETS[selectedPreset as keyof typeof PRESETS].description}
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diameter:</span>
                  <span className="font-medium">{PRESETS[selectedPreset as keyof typeof PRESETS].diameter} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocity:</span>
                  <span className="font-medium">{PRESETS[selectedPreset as keyof typeof PRESETS].velocity} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Angle:</span>
                  <span className="font-medium">{PRESETS[selectedPreset as keyof typeof PRESETS].angle}°</span>
                </div>
              </div>
            </div>
          )}

          {!selectedPreset && (
            <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
              Select a preset to load historical asteroid parameters
            </div>
          )}
        </TabsContent>

        <TabsContent value="nasa" className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                The NASA NEO API may have rate limits or connectivity issues. You can still use the Custom and Presets
                tabs to simulate asteroid impacts.
              </p>
            </div>
          )}

          {!loading && !error && neoData.length > 0 && (
            <>
              <Select value={selectedNeo} onValueChange={handleNeoChange} disabled={simulationActive}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a real asteroid" />
                </SelectTrigger>
                <SelectContent>
                  {neoData.slice(0, 20).map((neo) => (
                    <SelectItem key={neo.id} value={neo.id}>
                      {neo.name} {neo.isPotentiallyHazardous && "⚠️"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedNeo && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  {(() => {
                    const neo = neoData.find((n) => n.id === selectedNeo)
                    if (!neo) return null
                    return (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{neo.name}</h4>
                          {neo.isPotentiallyHazardous && (
                            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                              Hazardous
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Close approach: {new Date(neo.closeApproachDate).toLocaleDateString()}
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Diameter:</span>
                            <span className="font-medium">{neo.diameter.estimated.toFixed(3)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Velocity:</span>
                            <span className="font-medium">{neo.velocity.toFixed(2)} km/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Miss Distance:</span>
                            <span className="font-medium">{(neo.missDistance / 384400).toFixed(2)} LD</span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {!selectedNeo && (
                <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
                  Select a real asteroid from NASA's database
                  <div className="mt-2 text-xs">Showing {neoData.length} upcoming close approaches</div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 pt-6 border-t border-border/50 mt-6">
        {/* Manual Placement Mode Toggle */}
        {simulationActive && onManualPlacementToggle && (
          <Button 
            onClick={onManualPlacementToggle} 
            variant={manualPlacementMode ? "default" : "outline"}
            className="w-full"
          >
            <Target className="w-4 h-4 mr-2" />
            {manualPlacementMode ? "Click Mode: ON" : "Click to Place Asteroids"}
          </Button>
        )}
        
        <div className="flex gap-2">
          {!simulationActive ? (
            <Button onClick={onStart} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Simulation
            </Button>
          ) : (
            <>
              <Button onClick={onPauseToggle} variant="outline" className="flex-1 bg-transparent">
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={onSpawnAsteroid} variant="secondary" className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Asteroid
              </Button>
            </>
          )}
          <Button onClick={onReset} variant="outline" disabled={!simulationActive}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-start gap-2">
        <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          {simulationActive
            ? "Simulation uses real gravitational physics. Add multiple asteroids to compare trajectories."
            : "Adjust parameters to see how size, speed, angle, and position affect impact severity"}
        </p>
      </div>
    </Card>
  )
}
