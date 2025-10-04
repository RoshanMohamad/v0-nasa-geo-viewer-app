"use client"

import { useState, useEffect } from "react"
import { SolarSystem3DView } from "@/components/solar-system-3d-view"
import { CustomObjectManager } from "@/components/custom-object-manager"
import { ImpactAnalysisModalEnhanced } from "@/components/impact-analysis-modal-enhanced"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Zap, Globe, Orbit } from "lucide-react"
import type { CelestialBody } from "@/lib/orbital-mechanics"
import { fetchNASAHorizonsData, addRealAsteroid } from "@/lib/nasa-horizons-api"

export default function ImpactAnalysis3DPage() {
  // Simulation state
  const [customObjects, setCustomObjects] = useState<CelestialBody[]>([])
  const [simulationTime, setSimulationTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1000) // 1000x speed
  const [startDate] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(new Date())

  // Impact analysis state
  const [selectedObject, setSelectedObject] = useState<CelestialBody | null>(null)
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  // UI state
  const [focusPlanet, setFocusPlanet] = useState<string | null>(null)
  const [showObjectManager, setShowObjectManager] = useState(true)

  // Simulation time loop
  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = prev + (simulationSpeed / 60) // 60 FPS
        
        // Update current date
        const newDate = new Date(startDate)
        newDate.setSeconds(newDate.getSeconds() + newTime)
        setCurrentDate(newDate)
        
        return newTime
      })
    }, 16) // ~60 FPS
    
    return () => clearInterval(interval)
  }, [isPaused, simulationSpeed, startDate])

  // Handle adding custom object
  const handleAddObject = (obj: CelestialBody) => {
    setCustomObjects(prev => [...prev, obj])
  }

  // Handle removing custom object
  const handleRemoveObject = (id: string) => {
    setCustomObjects(prev => prev.filter(o => o.id !== id))
    // Clear analysis if the analyzed object is removed
    if (selectedObject?.id === id) {
      setSelectedObject(null)
      setImpactAnalysis(null)
      setShowAnalysisModal(false)
    }
  }

  // Handle adding real asteroid from NASA
  const handleAddRealAsteroid = async (presetKey: string) => {
    try {
      const asteroid = await addRealAsteroid(presetKey)
      if (asteroid) {
        setCustomObjects(prev => [...prev, asteroid])
      }
    } catch (error) {
      console.error('Failed to add real asteroid:', error)
      alert('Failed to fetch asteroid data from NASA. Please try again.')
    }
  }

  // Handle impact analysis from 3D view
  const handleImpactAnalysis = (obj: CelestialBody, analysis: any) => {
    setSelectedObject(obj)
    setImpactAnalysis(analysis)
    setShowAnalysisModal(true)
  }

  // Handle object click in 3D view
  const handleObjectClick = (obj: CelestialBody) => {
    setSelectedObject(obj)
    // Analysis will be triggered automatically by the 3D view
  }

  // Reset simulation
  const handleReset = () => {
    setSimulationTime(0)
    setCurrentDate(new Date(startDate))
  }

  // Clear all custom objects
  const handleClearAll = () => {
    setCustomObjects([])
    setSelectedObject(null)
    setImpactAnalysis(null)
    setShowAnalysisModal(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar: Object Manager */}
      {showObjectManager && (
        <div className="w-[450px] border-r border-border overflow-y-auto">
          <div className="p-4">
            <CustomObjectManager
              onAddObject={handleAddObject}
              onRemoveObject={handleRemoveObject}
              customObjects={customObjects}
              onAddRealAsteroid={handleAddRealAsteroid}
              onAnalyzeImpact={(obj) => {
                setSelectedObject(obj)
                // Will trigger analysis in 3D view on next click
              }}
              onViewObject={(obj) => {
                setFocusPlanet(null) // Clear planet focus
                setSelectedObject(obj)
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content: 3D Solar System */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar: Simulation Info */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Simulation Date</p>
                <p className="text-sm font-bold">
                  {currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Simulation Speed</p>
                <p className="text-sm font-bold">
                  {simulationSpeed >= 86400 
                    ? `${(simulationSpeed / 86400).toFixed(0)} days/sec`
                    : `${simulationSpeed.toFixed(0)}x`}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Custom Objects</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  {customObjects.length}
                  {customObjects.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {customObjects.filter(o => impactAnalysis?.objectId === o.id).length} analyzed
                    </Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowObjectManager(!showObjectManager)}
              >
                {showObjectManager ? '← Hide' : 'Show →'} Manager
              </Button>
            </div>
          </div>
        </div>

        {/* 3D View */}
        <div className="flex-1 relative">
          <SolarSystem3DView
            customObjects={customObjects}
            simulationTime={simulationTime}
            isPaused={isPaused}
            focusPlanet={focusPlanet}
            onObjectClick={handleObjectClick}
            onImpactAnalysis={handleImpactAnalysis}
          />

          {/* Floating Info Panel */}
          <div className="absolute top-4 left-4 right-4 pointer-events-none">
            <div className="flex gap-4">
              {selectedObject && impactAnalysis && (
                <Card className="p-4 bg-card/90 backdrop-blur-md border-2 border-yellow-500 pointer-events-auto">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold">Impact Analysis Active</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedObject.name} • {impactAnalysis.riskLevel} Risk
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="destructive">
                          {impactAnalysis.impactProbability?.toFixed(2)}% probability
                        </Badge>
                        <Badge variant="outline">
                          {(impactAnalysis.closestApproach / 1000000).toFixed(2)}M km closest
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowAnalysisModal(true)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant={isPaused ? "default" : "secondary"}
                size="lg"
                onClick={() => setIsPaused(!isPaused)}
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Time
              </Button>

              {customObjects.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  className="gap-2"
                >
                  Clear All Objects
                </Button>
              )}

              <div className="flex-1" />

              {/* Planet Focus Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusPlanet('Earth')}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Focus Earth
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusPlanet('Mars')}
                >
                  Focus Mars
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFocusPlanet(null)}
                  className="gap-2"
                >
                  <Orbit className="w-4 h-4" />
                  Reset View
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Simulation Speed</label>
                <span className="text-sm text-muted-foreground">
                  {simulationSpeed < 86400 
                    ? `${simulationSpeed.toFixed(0)}x real-time`
                    : `${(simulationSpeed / 86400).toFixed(0)} days per second`}
                </span>
              </div>
              <Slider
                value={[Math.log10(simulationSpeed)]}
                onValueChange={(v) => setSimulationSpeed(Math.pow(10, v[0]))}
                min={0}
                max={8}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <button onClick={() => setSimulationSpeed(1)} className="hover:text-foreground">
                  Real-time
                </button>
                <button onClick={() => setSimulationSpeed(3600)} className="hover:text-foreground">
                  1 hour/sec
                </button>
                <button onClick={() => setSimulationSpeed(86400)} className="hover:text-foreground">
                  1 day/sec
                </button>
                <button onClick={() => setSimulationSpeed(604800)} className="hover:text-foreground">
                  1 week/sec
                </button>
                <button onClick={() => setSimulationSpeed(2592000)} className="hover:text-foreground">
                  1 month/sec
                </button>
                <button onClick={() => setSimulationSpeed(31536000)} className="hover:text-foreground">
                  1 year/sec
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Analysis Modal */}
      {showAnalysisModal && selectedObject && impactAnalysis && (
        <ImpactAnalysisModalEnhanced
          object={selectedObject}
          analysis={impactAnalysis}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  )
}
