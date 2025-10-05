"use client"

/**
 * 🎮 ASTEROID CONTROL PANEL - Add and manage custom asteroids
 * 
 * Features:
 * - Add random asteroids with Kepler orbital mechanics
 * - Add targeted asteroids (toward Earth or other planets)
 * - Add custom orbital objects (asteroids, comets, dwarf planets)
 * - List all active asteroids
 * - Remove asteroids
 * - View impact predictions
 * - Adjust orbital parameters
 * - NASA real asteroid integration
 * - Three.js Kepler orbit calculations
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomAsteroid, generateRandomAsteroid } from "@/lib/asteroid-system"
import { Rocket, Trash2, Target, Zap, Sparkles, AlertTriangle, Atom, Database, Eye, Palette, Info } from "lucide-react"
import type { CelestialBody } from "@/lib/orbital-mechanics"
import { ASTEROID_PRESETS, CUSTOM_PRESETS } from "@/lib/nasa-horizons-api"

/**
 * Convert simple asteroid parameters to full CelestialBody with Kepler orbital elements
 * This enables proper Three.js Kepler orbit calculations in the solar system
 * EXPORTED for external use
 */
export function createCustomAsteroidObject(params: {
  name?: string
  color?: string
  radius?: number
  distanceAU?: number
  eccentricity?: number
  perihelionArg?: number
  periodYears?: number
  inclination?: number
  type?: 'asteroid' | 'comet'
}): CelestialBody {
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Default values matching your standalone component
  const distanceAU = params.distanceAU || (2.0 + Math.random() * 1.5) // 2-3.5 AU (asteroid belt range)
  const eccentricity = Math.min(0.99, params.eccentricity || Math.random() * 0.4) // 0-0.4 eccentricity
  const inclination = params.inclination || Math.random() * 20 // 0-20 degrees inclination
  const perihelionArg = params.perihelionArg || Math.random() * 360
  const meanAnomaly = Math.random() * 360 // Random starting position in orbit
  const longitudeOfAscendingNode = Math.random() * 360
  
  // Calculate orbital period using Kepler's 3rd Law: T² = a³ (for AU and years)
  const periodYears = params.periodYears || Math.sqrt(Math.pow(distanceAU, 3))
  
  return {
    id,
    name: params.name || `Custom-${Date.now()}`,
    type: params.type || 'asteroid',
    radius: params.radius || 5, // km
    mass: 1e12, // kg (typical small asteroid)
    color: params.color || '#ff6b6b',
    composition: params.type === 'comet' ? 'icy' : 'rocky',
    orbitalElements: {
      semiMajorAxis: distanceAU,
      eccentricity,
      inclination,
      longitudeOfAscendingNode,
      argumentOfPerihelion: perihelionArg,
      meanAnomaly,
      period: periodYears,
    },
  }
}

interface AsteroidControlPanelProps {
  customAsteroids: CustomAsteroid[]
  onAddAsteroid: (asteroid: CustomAsteroid) => void
  onRemoveAsteroid: (asteroidId: string) => void
  onUpdateAsteroid?: (asteroid: CustomAsteroid) => void
  impactPredictions?: Array<{
    asteroidId: string
    planetName: string
    timeToImpact: number
  }>
  // Extended props for custom objects
  customObjects?: CelestialBody[]
  onAddCustomObject?: (object: CelestialBody) => void
  onRemoveCustomObject?: (id: string) => void
  onAddRealAsteroid?: (presetKey: string) => void
  onAnalyzeImpact?: (object: CelestialBody) => void
  onViewObject?: (object: CelestialBody) => void
}

export function AsteroidControlPanel({
  customAsteroids,
  onAddAsteroid,
  onRemoveAsteroid,
  onUpdateAsteroid,
  impactPredictions = [],
  customObjects = [],
  onAddCustomObject,
  onRemoveCustomObject,
  onAddRealAsteroid,
  onAnalyzeImpact,
  onViewObject,
}: AsteroidControlPanelProps) {
  const [asteroidSize, setAsteroidSize] = useState([0.3])
  const [orbitDistance, setOrbitDistance] = useState([25])
  const [eccentricity, setEccentricity] = useState([0.3])
  const [inclination, setInclination] = useState([0])
  
  // Custom Object Manager state
  const [objectName, setObjectName] = useState('')
  const [objectType, setObjectType] = useState<'asteroid' | 'comet' | 'dwarf-planet' | 'trans-neptunian'>('asteroid')
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.5) // AU
  const [objectEccentricity, setObjectEccentricity] = useState(0.3)
  const [objectInclination, setObjectInclination] = useState(5) // degrees
  const [longitudeAscending, setLongitudeAscending] = useState(0)
  const [argumentPerihelion, setArgumentPerihelion] = useState(0)
  const [mass, setMass] = useState(1e14) // kg
  const [radius, setRadius] = useState(1) // km
  const [visualSize, setVisualSize] = useState(1)
  const [composition, setComposition] = useState<'rocky' | 'icy' | 'metallic' | 'carbonaceous'>('rocky')
  const [objectColor, setObjectColor] = useState('#FF6B35')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const compositionColors = {
    rocky: '#FF6B35',
    icy: '#3498DB',
    metallic: '#95A5A6',
    carbonaceous: '#2C3E50'
  }

  const handleAddRandomAsteroid = () => {
    const asteroid = generateRandomAsteroid()
    asteroid.size = asteroidSize[0]
    asteroid.semiMajorAxis = orbitDistance[0]
    asteroid.eccentricity = eccentricity[0]
    asteroid.inclination = (inclination[0] * Math.PI) / 180 // Convert to radians
    
    onAddAsteroid(asteroid)
  }

  const handleAddTargetedAsteroid = (targetPlanet: string) => {
    const asteroid = generateRandomAsteroid(targetPlanet, orbitDistance[0])
    asteroid.size = asteroidSize[0]
    asteroid.eccentricity = 0.8 // High eccentricity for collision course
    asteroid.targetPlanet = targetPlanet
    asteroid.color = "#ff0000" // Red for danger
    asteroid.glowColor = "#ff3300"
    
    onAddAsteroid(asteroid)
  }

  const handleRemoveAll = () => {
    customAsteroids.forEach(a => onRemoveAsteroid(a.id))
  }
  
  const handleAddCustomOrbitalObject = () => {
    if (!onAddCustomObject) return
    
    if (!objectName.trim()) {
      alert('⚠️ Please enter a name for the object')
      return
    }

    if (semiMajorAxis <= 0) {
      alert('⚠️ Semi-major axis must be greater than 0')
      return
    }

    if (objectEccentricity < 0 || objectEccentricity >= 1) {
      alert('⚠️ Eccentricity must be between 0 and 0.99')
      return
    }

    const period = Math.sqrt(Math.pow(semiMajorAxis, 3))
    const circumference = 2 * Math.PI * semiMajorAxis * 149597870.7
    const velocity = circumference / (period * 365.25 * 24 * 3600)

    const newObject: CelestialBody = {
      id: `custom-${Date.now()}`,
      name: objectName,
      type: objectType,
      radius: radius * visualSize,
      mass,
      color: objectColor,
      composition,
      orbitalElements: {
        semiMajorAxis,
        eccentricity: objectEccentricity,
        inclination: objectInclination,
        longitudeOfAscendingNode: longitudeAscending,
        argumentOfPerihelion: argumentPerihelion,
        meanAnomaly: Math.random() * 360,
        period,
        velocity,
      },
    }

    onAddCustomObject(newObject)
    
    alert(
      `✅ Added "${objectName}"!\n\n` +
      `Distance: ${semiMajorAxis.toFixed(2)} AU\n` +
      `Period: ${period.toFixed(2)} years\n` +
      `Type: ${objectType}`
    )

    // Reset form
    setObjectName('')
    setSemiMajorAxis(1.5)
    setObjectEccentricity(0.3)
    setObjectInclination(5)
    setRadius(1)
    setVisualSize(1)
  }

  const handleAddPreset = (presetKey: keyof typeof CUSTOM_PRESETS) => {
    if (!onAddCustomObject) return
    
    const preset = CUSTOM_PRESETS[presetKey]
    const period = Math.sqrt(Math.pow(preset.semiMajorAxis, 3))
    const circumference = 2 * Math.PI * preset.semiMajorAxis * 149597870.7
    const velocity = circumference / (period * 365.25 * 24 * 3600)

    const newObject: CelestialBody = {
      id: `preset-${presetKey}-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      radius: preset.radius,
      mass: preset.mass,
      color: '#FF6B35',
      composition: preset.composition,
      orbitalElements: {
        semiMajorAxis: preset.semiMajorAxis,
        eccentricity: preset.eccentricity,
        inclination: preset.inclination,
        longitudeOfAscendingNode: preset.longitudeOfAscendingNode,
        argumentOfPerihelion: preset.argumentOfPerihelion,
        meanAnomaly: Math.random() * 360,
        period,
        velocity,
      },
    }

    onAddCustomObject(newObject)
  }

  return (
    <Card className="p-4 bg-black/40 backdrop-blur-md border-purple-500/30">
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40">
          <TabsTrigger value="quick">
            <Rocket className="w-4 h-4 mr-2" />
            Quick
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Atom className="w-4 h-4 mr-2" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="manage">
            <Sparkles className="w-4 h-4 mr-2" />
            All ({customAsteroids.length + customObjects.length})
          </TabsTrigger>
          <TabsTrigger value="impacts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Risks
          </TabsTrigger>
        </TabsList>

        {/* QUICK ADD TAB (Original) */}
        <TabsContent value="quick" className="space-y-4">
          {/* NEW: Quick Kepler Orbit Asteroid Generator */}
          <div className="border border-purple-500/30 rounded-lg p-3 bg-purple-900/20">
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Atom className="w-4 h-4" />
              Quick Add with Kepler Orbits
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  if (!onAddCustomObject) return
                  const asteroid = createCustomAsteroidObject({
                    name: `Asteroid-${Date.now()}`,
                    color: '#ff6b6b',
                    radius: 5,
                    distanceAU: 2.2 + Math.random() * 0.8, // Main asteroid belt (2.2-3.0 AU)
                    eccentricity: Math.random() * 0.3,
                    inclination: Math.random() * 15,
                    type: 'asteroid'
                  })
                  onAddCustomObject(asteroid)
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-xs"
                size="sm"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Belt Asteroid
              </Button>

              <Button
                onClick={() => {
                  if (!onAddCustomObject) return
                  const comet = createCustomAsteroidObject({
                    name: `Comet-${Date.now()}`,
                    color: '#66ccff',
                    radius: 3,
                    distanceAU: 5 + Math.random() * 15, // Distant orbit (5-20 AU)
                    eccentricity: 0.6 + Math.random() * 0.35, // High eccentricity (0.6-0.95)
                    inclination: Math.random() * 60, // Can be highly inclined
                    type: 'comet'
                  })
                  onAddCustomObject(comet)
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-xs"
                size="sm"
              >
                <Zap className="w-3 h-3 mr-1" />
                Icy Comet
              </Button>

              <Button
                onClick={() => {
                  if (!onAddCustomObject) return
                  const neo = createCustomAsteroidObject({
                    name: `NEO-${Date.now()}`,
                    color: '#ff3366',
                    radius: 8,
                    distanceAU: 0.8 + Math.random() * 0.7, // Near Earth (0.8-1.5 AU)
                    eccentricity: 0.3 + Math.random() * 0.5, // Moderate to high eccentricity
                    inclination: Math.random() * 30,
                    type: 'asteroid'
                  })
                  onAddCustomObject(neo)
                }}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-xs"
                size="sm"
              >
                <Target className="w-3 h-3 mr-1" />
                Near Earth
              </Button>

              <Button
                onClick={() => {
                  if (!onAddCustomObject) return
                  const tno = createCustomAsteroidObject({
                    name: `TNO-${Date.now()}`,
                    color: '#9966ff',
                    radius: 12,
                    distanceAU: 30 + Math.random() * 20, // Trans-Neptunian (30-50 AU)
                    eccentricity: 0.1 + Math.random() * 0.3,
                    inclination: Math.random() * 40,
                    type: 'asteroid'
                  })
                  onAddCustomObject(tno)
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs"
                size="sm"
              >
                <Database className="w-3 h-3 mr-1" />
                Trans-Neptunian
              </Button>
            </div>

            <div className="text-xs text-purple-300/70 mt-2">
              ✨ Asteroids with realistic Three.js Kepler orbit calculations!
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Asteroid Size: {asteroidSize[0].toFixed(2)} units
              </label>
              <Slider
                value={asteroidSize}
                onValueChange={setAsteroidSize}
                min={0.1}
                max={1.0}
                step={0.05}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Orbit Distance: {orbitDistance[0].toFixed(0)} units
              </label>
              <Slider
                value={orbitDistance}
                onValueChange={setOrbitDistance}
                min={10}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Eccentricity: {eccentricity[0].toFixed(2)} (0=circle, 1=line)
              </label>
              <Slider
                value={eccentricity}
                onValueChange={setEccentricity}
                min={0}
                max={0.9}
                step={0.05}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-purple-200 mb-2 block">
                Inclination: {inclination[0].toFixed(0)}° from ecliptic
              </label>
              <Slider
                value={inclination}
                onValueChange={setInclination}
                min={-45}
                max={45}
                step={5}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAddRandomAsteroid}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Add Random Asteroid
              </Button>
              
              <Button
                onClick={() => handleAddTargetedAsteroid("Earth")}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Target Earth
              </Button>
            </div>

            <div className="text-xs text-purple-300/70 mt-2">
              💡 Tip: Higher eccentricity = more elliptical orbit. 
              Target Earth creates a collision-course asteroid!
            </div>
          </div>
        </TabsContent>

        {/* CUSTOM OBJECTS TAB - Enhanced orbital object creator */}
        <TabsContent value="custom" className="space-y-3 max-h-96 overflow-y-auto">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/60">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="nasa">NASA</TabsTrigger>
            </TabsList>

            {/* CREATE TAB */}
            <TabsContent value="create" className="space-y-3">
              <div>
                <label className="text-xs text-purple-200 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  placeholder="e.g., My Asteroid"
                  className="w-full px-2 py-1.5 bg-black/60 border border-purple-500/30 rounded text-sm text-white placeholder:text-purple-300/50"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 block">Type</label>
                <Select value={objectType} onValueChange={(v) => setObjectType(v as any)}>
                  <SelectTrigger className="bg-black/60 border-purple-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asteroid">Asteroid</SelectItem>
                    <SelectItem value="comet">Comet</SelectItem>
                    <SelectItem value="dwarf-planet">Dwarf Planet</SelectItem>
                    <SelectItem value="trans-neptunian">Trans-Neptunian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                  Distance to Sun: {semiMajorAxis.toFixed(2)} AU
                  <Info className="w-3 h-3 text-purple-300/50" />
                </label>
                <Slider
                  value={[semiMajorAxis]}
                  onValueChange={(v) => setSemiMajorAxis(v[0])}
                  min={0.1}
                  max={50}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-purple-300/50 mt-0.5">Earth=1 AU, Mars=1.5 AU, Jupiter=5.2 AU</p>
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 block">
                  Eccentricity: {objectEccentricity.toFixed(3)}
                </label>
                <Slider
                  value={[objectEccentricity]}
                  onValueChange={(v) => setObjectEccentricity(v[0])}
                  min={0}
                  max={0.99}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-purple-300/50 mt-0.5">0=circle, 0.5=ellipse, 0.9+=very elongated</p>
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 block">
                  Inclination: {objectInclination.toFixed(1)}°
                </label>
                <Slider
                  value={[objectInclination]}
                  onValueChange={(v) => setObjectInclination(v[0])}
                  min={0}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 block">
                  Radius: {radius.toFixed(2)} km
                </label>
                <Slider
                  value={[radius]}
                  onValueChange={(v) => setRadius(v[0])}
                  min={0.1}
                  max={500}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-purple-200 mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={objectColor}
                    onChange={(e) => setObjectColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={objectColor}
                    onChange={(e) => setObjectColor(e.target.value)}
                    className="flex-1 px-2 py-1 bg-black/60 border border-purple-500/30 rounded text-xs text-white"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddCustomOrbitalObject}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="sm"
              >
                <Atom className="w-3 h-3 mr-2" />
                Add Custom Object
              </Button>
            </TabsContent>

            {/* PRESETS TAB */}
            <TabsContent value="presets" className="space-y-2">
              <p className="text-xs text-purple-300/70 mb-2">Famous objects with real orbital data</p>
              {Object.entries(CUSTOM_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  onClick={() => handleAddPreset(key as any)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-black/40 border-purple-500/30 hover:bg-purple-500/20"
                >
                  <div className="text-left flex-1">
                    <div className="text-xs font-semibold text-white">{preset.name}</div>
                    <div className="text-xs text-purple-300/70">
                      {preset.semiMajorAxis} AU • {preset.type}
                    </div>
                  </div>
                </Button>
              ))}
            </TabsContent>

            {/* NASA TAB */}
            <TabsContent value="nasa" className="space-y-2">
              <div className="p-2 bg-blue-950/40 border border-blue-500/30 rounded">
                <p className="text-xs text-blue-200 flex items-start gap-1">
                  <Database className="w-3 h-3 mt-0.5" />
                  Real asteroids from NASA Horizons API
                </p>
              </div>

              {Object.entries(ASTEROID_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  onClick={() => onAddRealAsteroid && onAddRealAsteroid(key)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-black/40 border-blue-500/30 hover:bg-blue-500/20"
                >
                  <div className="text-left flex-1">
                    <div className="text-xs font-semibold text-white">{preset.name}</div>
                    <div className="text-xs text-blue-300/70">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* MANAGE ALL OBJECTS TAB */}
        <TabsContent value="manage" className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-purple-200">
              Quick: {customAsteroids.length} | Custom: {customObjects.length}
            </span>
            {(customAsteroids.length > 0 || customObjects.length > 0) && (
              <Button
                onClick={() => {
                  customAsteroids.forEach(a => onRemoveAsteroid(a.id))
                  if (onRemoveCustomObject) {
                    customObjects.forEach(o => onRemoveCustomObject(o.id))
                  }
                }}
                size="sm"
                variant="destructive"
                className="h-7"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove All
              </Button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {customAsteroids.length === 0 && customObjects.length === 0 ? (
              <div className="text-center py-8 text-purple-300/50">
                No objects added yet. Use "Quick" or "Custom" tabs!
              </div>
            ) : (
              <>
                {/* Custom Orbital Objects (from Custom tab) */}
                {customObjects.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-purple-300/70 font-semibold">
                      Custom Orbital Objects ({customObjects.length})
                    </div>
                    {customObjects.map((obj) => (
                      <Card
                        key={obj.id}
                        className="p-3 bg-black/60 border-purple-500/20 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: obj.color }}
                              />
                              <span className="text-sm font-medium text-white">
                                {obj.name}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                                {obj.type}
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-purple-200/70">
                              <div>Distance: {obj.orbitalElements.semiMajorAxis.toFixed(2)} AU</div>
                              <div>Period: {obj.orbitalElements.period?.toFixed(1) || '?'} yr</div>
                              <div>Ecc: {obj.orbitalElements.eccentricity.toFixed(3)}</div>
                              <div>Inc: {obj.orbitalElements.inclination.toFixed(0)}°</div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {onAnalyzeImpact && (
                              <Button
                                onClick={() => onAnalyzeImpact(obj)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-yellow-500/20 hover:text-yellow-300"
                                title="Analyze Impact"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {onViewObject && (
                              <Button
                                onClick={() => onViewObject(obj)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-300"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {onRemoveCustomObject && (
                              <Button
                                onClick={() => onRemoveCustomObject(obj.id)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Quick Asteroids (from Quick tab) */}
                {customAsteroids.length > 0 && (
                  <div className="space-y-2">
                    {customObjects.length > 0 && (
                      <div className="text-xs text-purple-300/70 font-semibold mt-3">
                        Quick Asteroids ({customAsteroids.length})
                      </div>
                    )}
                    {customAsteroids.map((asteroid) => (
                      <Card
                        key={asteroid.id}
                        className="p-3 bg-black/60 border-purple-500/20 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: asteroid.color }}
                              />
                              <span className="text-sm font-medium text-white">
                                {asteroid.name}
                              </span>
                              {asteroid.targetPlanet && (
                                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                                  → {asteroid.targetPlanet}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-purple-200/70">
                              <div>Size: {asteroid.size.toFixed(2)}</div>
                              <div>Orbit: {asteroid.semiMajorAxis.toFixed(1)}</div>
                              <div>Ecc: {asteroid.eccentricity.toFixed(2)}</div>
                              <div>Inc: {((asteroid.inclination * 180) / Math.PI).toFixed(0)}°</div>
                            </div>

                            {asteroid.impacted && (
                              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                IMPACTED!
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => onRemoveAsteroid(asteroid.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* IMPACT PREDICTIONS TAB */}
        <TabsContent value="impacts" className="space-y-2">
          <div className="text-sm text-purple-200 mb-2">
            Predicted Impacts
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {impactPredictions.length === 0 ? (
              <div className="text-center py-8 text-green-300/50">
                ✅ No collision courses detected!
              </div>
            ) : (
              impactPredictions.map((prediction, index) => {
                const asteroid = customAsteroids.find(a => a.id === prediction.asteroidId)
                if (!asteroid) return null

                const timeInSeconds = prediction.timeToImpact
                const minutes = Math.floor(timeInSeconds / 60)
                const seconds = Math.floor(timeInSeconds % 60)

                return (
                  <Card
                    key={index}
                    className="p-3 bg-red-950/40 border-red-500/50 hover:border-red-500/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">
                        COLLISION WARNING
                      </span>
                    </div>

                    <div className="text-xs text-purple-200 space-y-1">
                      <div className="flex justify-between">
                        <span>Asteroid:</span>
                        <span className="font-medium">{asteroid.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-medium text-red-300">
                          {prediction.planetName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time to Impact:</span>
                        <span className="font-medium">
                          {minutes}m {seconds}s
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => onRemoveAsteroid(prediction.asteroidId)}
                      size="sm"
                      variant="destructive"
                      className="w-full mt-2 h-7"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Destroy Asteroid
                    </Button>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
