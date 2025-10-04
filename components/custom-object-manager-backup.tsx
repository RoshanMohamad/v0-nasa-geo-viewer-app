"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Rocket, Database } from "lucide-react"
import { ASTEROID_PRESETS, CUSTOM_PRESETS } from "@/lib/nasa-horizons-api"
import type { CelestialBody } from "@/lib/orbital-mechanics"

interface CustomObjectManagerProps {
  onAddObject: (body: CelestialBody) => void
  onRemoveObject: (id: string) => void
  customObjects: CelestialBody[]
  onAddRealAsteroid: (presetKey: string) => void
}

export function CustomObjectManager({
  onAddObject,
  onRemoveObject,
  customObjects,
  onAddRealAsteroid,
}: CustomObjectManagerProps) {
  const [objectName, setObjectName] = useState('')
  const [objectType, setObjectType] = useState<'asteroid' | 'comet' | 'dwarf-planet' | 'trans-neptunian'>('asteroid')
  const [semiMajorAxis, setSemiMajorAxis] = useState(1.5)
  const [eccentricity, setEccentricity] = useState(0.3)
  const [inclination, setInclination] = useState(5)
  const [mass, setMass] = useState(1e14)
  const [radius, setRadius] = useState(1)
  const [composition, setComposition] = useState<'rocky' | 'icy' | 'metallic' | 'carbonaceous'>('rocky')
  const [objectColor, setObjectColor] = useState('#FF6B35')

  const handleAddCustomObject = () => {
    if (!objectName.trim()) {
      alert('Please enter a name for the object')
      return
    }

    const period = Math.sqrt(Math.pow(semiMajorAxis, 3))
    const circumference = 2 * Math.PI * semiMajorAxis * 149597870.7 // AU to km
    const velocity = circumference / (period * 365.25 * 24 * 3600) // km/s

    const newObject: CelestialBody = {
      id: `custom-${Date.now()}`,
      name: objectName,
      type: objectType,
      radius,
      mass,
      color: objectColor,
      composition,
      orbitalElements: {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode: Math.random() * 360,
        argumentOfPerihelion: Math.random() * 360,
        meanAnomaly: Math.random() * 360,
        period,
        velocity,
      },
    }

    onAddObject(newObject)
    
    // Reset form
    setObjectName('')
    setSemiMajorAxis(1.5)
    setEccentricity(0.3)
    setInclination(5)
    setMass(1e14)
    setRadius(1)
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
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/50 w-96">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        Object Manager
      </h3>

      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="nasa">NASA Data</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Object Name</label>
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="e.g., My Asteroid"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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

          <div>
            <label className="text-sm font-medium mb-2 block">
              Semi-major Axis: {semiMajorAxis.toFixed(2)} AU
            </label>
            <Slider
              value={[semiMajorAxis]}
              onValueChange={(v) => setSemiMajorAxis(v[0])}
              min={0.5}
              max={50}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground mt-1">Distance from Sun</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Eccentricity: {eccentricity.toFixed(3)}
            </label>
            <Slider
              value={[eccentricity]}
              onValueChange={(v) => setEccentricity(v[0])}
              min={0}
              max={0.99}
              step={0.01}
            />
            <p className="text-xs text-muted-foreground mt-1">0 = circle, 1 = extreme ellipse</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Inclination: {inclination.toFixed(1)}°
            </label>
            <Slider
              value={[inclination]}
              onValueChange={(v) => setInclination(v[0])}
              min={0}
              max={180}
              step={1}
            />
            <p className="text-xs text-muted-foreground mt-1">Orbital tilt</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Radius: {radius.toFixed(2)} km
            </label>
            <Slider
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
              min={0.1}
              max={500}
              step={0.1}
            />
          </div>

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
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Composition</label>
            <Select value={composition} onValueChange={(v) => setComposition(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rocky">Rocky</SelectItem>
                <SelectItem value="icy">Icy</SelectItem>
                <SelectItem value="metallic">Metallic</SelectItem>
                <SelectItem value="carbonaceous">Carbonaceous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={objectColor}
                onChange={(e) => setObjectColor(e.target.value)}
                className="h-10 w-20 rounded cursor-pointer border border-border"
              />
              <input
                type="text"
                value={objectColor}
                onChange={(e) => setObjectColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono"
                placeholder="#FF6B35"
              />
            </div>
          </div>

          <Button onClick={handleAddCustomObject} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Object
          </Button>
        </TabsContent>

        <TabsContent value="presets" className="space-y-3">
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
                  a={preset.semiMajorAxis} AU, e={preset.eccentricity}
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

      {customObjects.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold mb-3">Active Objects ({customObjects.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customObjects.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium">{obj.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{obj.type}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveObject(obj.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
