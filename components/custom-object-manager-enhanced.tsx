"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Rocket, Database, AlertTriangle, Info, Eye, Palette } from "lucide-react"
import { ASTEROID_PRESETS, CUSTOM_PRESETS } from "@/lib/nasa-horizons-api"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface CustomObjectManagerProps {
  onAddObject: (body: CelestialBody) => void
  onRemoveObject: (id: string) => void
  customObjects: CelestialBody[]
  onAddRealAsteroid: (presetKey: string) => void
  onAnalyzeImpact?: (object: CelestialBody) => void
  onViewObject?: (object: CelestialBody) => void
}

export function CustomObjectManager({
  onAddObject,
  onRemoveObject,
  customObjects,
  onAddRealAsteroid,
  onAnalyzeImpact,
  onViewObject,
}: CustomObjectManagerProps) {
  // Enhanced form state with all requested parameters
  const [objectName, setObjectName] = useState('')
  const [objectType, setObjectType] = useState<'asteroid' | 'comet' | 'dwarf-planet' | 'trans-neptunian'>('asteroid')
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.5) // AU - Average distance to Sun
  const [eccentricity, setEccentricity] = useState(0.3) // 0 = circle, 1 = extreme ellipse
  const [inclination, setInclination] = useState(5) // degrees - orbital tilt
  const [longitudeAscending, setLongitudeAscending] = useState(0) // degrees - Ω
  const [argumentPerihelion, setArgumentPerihelion] = useState(0) // degrees - ω
  const [mass, setMass] = useState(1e14) // kg
  const [radius, setRadius] = useState(1) // km - physical size
  const [visualSize, setVisualSize] = useState(1) // Display size multiplier
  const [composition, setComposition] = useState<'rocky' | 'icy' | 'metallic' | 'carbonaceous'>('rocky')
  const [objectColor, setObjectColor] = useState('#FF6B35')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Composition colors
  const compositionColors = {
    rocky: '#FF6B35',
    icy: '#3498DB',
    metallic: '#95A5A6',
    carbonaceous: '#2C3E50'
  }

  const handleAddCustomObject = () => {
    if (!objectName.trim()) {
      alert('⚠️ Please enter a name for the object')
      return
    }

    // Validate orbital parameters
    if (semiMajorAxis <= 0) {
      alert('⚠️ Semi-major axis must be greater than 0')
      return
    }

    if (eccentricity < 0 || eccentricity >= 1) {
      alert('⚠️ Eccentricity must be between 0 and 0.99')
      return
    }

    // Calculate orbital period using Kepler's Third Law (P² = a³)
    const period = Math.sqrt(Math.pow(semiMajorAxis, 3)) // years

    // Calculate orbital velocity
    const circumference = 2 * Math.PI * semiMajorAxis * 149597870.7 // AU to km
    const velocity = circumference / (period * 365.25 * 24 * 3600) // km/s

    const newObject: CelestialBody = {
      id: `custom-${Date.now()}`,
      name: objectName,
      type: objectType,
      radius: radius * visualSize, // Apply visual size multiplier
      mass,
      color: objectColor,
      composition,
      orbitalElements: {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode: longitudeAscending,
        argumentOfPerihelion: argumentPerihelion,
        meanAnomaly: Math.random() * 360, // Random starting position
        period,
        velocity,
      },
    }

    onAddObject(newObject)
    
    // Show success message with orbital details
    alert(
      `✅ Successfully added "${objectName}"!\n\n` +
      `Orbital Details:\n` +
      `• Type: ${objectType}\n` +
      `• Distance: ${semiMajorAxis.toFixed(2)} AU\n` +
      `• Period: ${period.toFixed(2)} years\n` +
      `• Velocity: ${velocity.toFixed(2)} km/s\n` +
      `• Eccentricity: ${eccentricity.toFixed(3)}\n` +
      `• Mass: ${mass.toExponential(2)} kg\n` +
      `• Composition: ${composition}`
    )

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setObjectName('')
    setSemiMajorAxis(1.5)
    setEccentricity(0.3)
    setInclination(5)
    setLongitudeAscending(0)
    setArgumentPerihelion(0)
    setMass(1e14)
    setRadius(1)
    setVisualSize(1)
    setComposition('rocky')
    setObjectColor('#FF6B35')
  }

  const handleAddPreset = (presetKey: keyof typeof CUSTOM_PRESETS) => {
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

    onAddObject(newObject)
  }

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/50 w-[450px] max-h-[90vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        Custom Object Creator
      </h3>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="nasa">NASA Data</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          {/* Object Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Object Name *</label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="e.g., Asteroid X-1"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
            />
          </div>

          {/* Object Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Object Type</label>
            <Select value={objectType} onValueChange={(v) => setObjectType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asteroid">Asteroid</SelectItem>
                <SelectItem value="comet">Comet</SelectItem>
                <SelectItem value="dwarf-planet">Dwarf Planet</SelectItem>
                <SelectItem value="trans-neptunian">Trans-Neptunian Object</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Semi-Major Axis */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              Semi-Major Axis (Average Distance to Sun): {semiMajorAxis.toFixed(2)} AU
              <Info className="w-3 h-3 text-muted-foreground" />
            </label>
            <Slider
              value={[semiMajorAxis]}
              onValueChange={(v) => setSemiMajorAxis(v[0])}
              min={0.1}
              max={50}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              1 AU = 150M km (Earth's distance). Mars ~1.5 AU, Jupiter ~5.2 AU
            </p>
          </div>

          {/* Eccentricity */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Eccentricity (Orbital Shape): {eccentricity.toFixed(3)}
            </label>
            <Slider
              value={[eccentricity]}
              onValueChange={(v) => setEccentricity(v[0])}
              min={0}
              max={0.99}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground mt-1">
              0 = perfect circle, 0.5 = ellipse, 0.9+ = very elongated
            </p>
          </div>

          {/* Inclination */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Inclination (Orbital Tilt): {inclination.toFixed(1)}°
            </label>
            <Slider
              value={[inclination]}
              onValueChange={(v) => setInclination(v[0])}
              min={0}
              max={180}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Angle from ecliptic plane (0° = flat, 90° = perpendicular)
            </p>
          </div>

          {/* Mass */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mass: {mass.toExponential(2)} kg
            </label>
            <Slider
              value={[Math.log10(mass)]}
              onValueChange={(v) => setMass(Math.pow(10, v[0]))}
              min={10}
              max={22}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Small asteroid: ~10¹⁴ kg, Large asteroid: ~10²⁰ kg
            </p>
          </div>

          {/* Radius */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Physical Radius: {radius.toFixed(2)} km
            </label>
            <Slider
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
              min={0.1}
              max={500}
              step={0.1}
            />
          </div>

          {/* Visual Size Multiplier */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual Size: {visualSize.toFixed(1)}x
            </label>
            <Slider
              value={[visualSize]}
              onValueChange={(v) => setVisualSize(v[0])}
              min={0.5}
              max={5}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Display size multiplier (doesn't affect physics)
            </p>
          </div>

          {/* Composition */}
          <div>
            <label className="text-sm font-medium mb-2 block">Composition</label>
            <Select 
              value={composition} 
              onValueChange={(v) => {
                setComposition(v as any)
                setObjectColor(compositionColors[v as keyof typeof compositionColors])
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rocky">Rocky (Silicate)</SelectItem>
                <SelectItem value="icy">Icy (Water/CO₂)</SelectItem>
                <SelectItem value="metallic">Metallic (Iron/Nickel)</SelectItem>
                <SelectItem value="carbonaceous">Carbonaceous (Carbon-rich)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Display Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={objectColor}
                onChange={(e) => setObjectColor(e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={objectColor}
                onChange={(e) => setObjectColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
              />
            </div>
          </div>

          {/* Advanced Parameters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Orbital Parameters
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              {/* Longitude of Ascending Node */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Longitude of Ascending Node (Ω): {longitudeAscending.toFixed(1)}°
                </label>
                <Slider
                  value={[longitudeAscending]}
                  onValueChange={(v) => setLongitudeAscending(v[0])}
                  min={0}
                  max={360}
                  step={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Where orbit crosses ecliptic plane upward
                </p>
              </div>

              {/* Argument of Perihelion */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Argument of Perihelion (ω): {argumentPerihelion.toFixed(1)}°
                </label>
                <Slider
                  value={[argumentPerihelion]}
                  onValueChange={(v) => setArgumentPerihelion(v[0])}
                  min={0}
                  max={360}
                  step={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Angle to closest approach to Sun
                </p>
              </div>
            </div>
          )}

          {/* Add Button */}
          <Button onClick={handleAddCustomObject} className="w-full" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Object
          </Button>

          <Button onClick={resetForm} variant="outline" className="w-full">
            Reset Form
          </Button>
        </TabsContent>

        <TabsContent value="presets" className="space-y-3">
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Pre-configured famous objects with realistic orbital parameters
            </p>
          </div>
          {Object.entries(CUSTOM_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              onClick={() => handleAddPreset(key as any)}
              variant="outline"
              className="w-full justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">{preset.name}</div>
                <div className="text-xs text-muted-foreground">
                  a={preset.semiMajorAxis} AU, e={preset.eccentricity}, type={preset.type}
                </div>
              </div>
            </Button>
          ))}
        </TabsContent>

        <TabsContent value="nasa" className="space-y-3">
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Database className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Real asteroids from NASA Horizons API. May take a few seconds to load orbital data.
            </p>
          </div>

          {Object.entries(ASTEROID_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              onClick={() => onAddRealAsteroid(key)}
              variant="outline"
              className="w-full justify-start"
            >
              <div className="text-left flex-1">
                <div className="font-semibold">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </div>
            </Button>
          ))}
        </TabsContent>
      </Tabs>

      {/* Active Objects List */}
      {customObjects.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold mb-3">Active Objects ({customObjects.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {customObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded text-sm hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: obj.color }}
                    />
                    {obj.name}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {obj.type} • {obj.orbitalElements.semiMajorAxis.toFixed(2)} AU • 
                    {obj.composition}
                  </div>
                </div>
                <div className="flex gap-1">
                  {onAnalyzeImpact && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAnalyzeImpact(obj)}
                      className="h-8 w-8"
                      title="Analyze Impact Risk"
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </Button>
                  )}
                  {onViewObject && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewObject(obj)}
                      className="h-8 w-8"
                      title="View Object Details"
                    >
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveObject(obj.id)}
                    className="h-8 w-8"
                    title="Remove Object"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
