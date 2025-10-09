"use client"

import { useState } from 'react'
import InteractiveMap from '@/components/Map/InteractiveMap'
import ResultsPanel from '@/components/ui/ResultsPanel'
import { calculateImpact, type AsteroidData as CalcAsteroidData, type ImpactResults as CalcImpactResults } from '@/lib/impact-calculator'
import { ImpactZone, MeteorParameters, ImpactResults } from '@/types/impact.types'

// Small adapter to map composition -> density (kg/m^3)
const DENSITY_MAP: Record<string, number> = {
  iron: 7870,
  stony: 3300,
  carbonaceous: 2200,
  comet: 500,
}

export default function ImpactSandbox() {
  const [impactLocation, setImpactLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [impactZones, setImpactZones] = useState<ImpactZone[]>([])
  const [results, setResults] = useState<ImpactResults | null>(null)
  const [loading, setLoading] = useState(false)

  // Simple UI state for parameters (UI uses meters for diameter)
  const [diameterMeters, setDiameterMeters] = useState<number>(100) // 100 m default
  const [velocity, setVelocity] = useState<number>(20) // km/s
  const [angle, setAngle] = useState<number>(45) // degrees
  const [composition, setComposition] = useState<'iron'|'stony'|'carbonaceous'|'comet'>('stony')

  const handleMapClick = async (lat: number, lng: number) => {
    setLoading(true)
    setImpactLocation({ lat, lng })

    // Convert UI inputs to calculator inputs
    const diameterKm = diameterMeters / 1000
    const density = DENSITY_MAP[composition]

    const asteroid: CalcAsteroidData = {
      diameter: diameterKm,
      velocity,
      density,
      angle,
    }

    try {
      const calc = calculateImpact(asteroid)

      // Build ImpactResults in the shape expected by ResultsPanel / types
      const uiResults: ImpactResults = {
        impactType: calc.crater.diameter > 0 ? 'surface' : 'airburst',
        craterDiameter: Math.round(calc.crater.diameter * 1000), // km -> meters
        energyTNT: calc.energy.megatonsTNT,
        seismicMagnitude: calc.damage.seismicMagnitude,
        thermalRadius: calc.damage.thermalRadius, // km (ResultsPanel expects km)
        blastRadius: {
          onePsi: calc.damage.airblastRadius, // note: legacy mapping, both are in km
          fivePsi: calc.damage.airblastRadius * 0.6,
          twentyPsi: calc.damage.airblastRadius * 0.3,
        },
      }

      setResults(uiResults)

      // Create simple impact zones for visualization (use distances from calc)
      const zones: ImpactZone[] = []
      // Ejecta / crater zone
      zones.push({ lat, lng, radius: Math.max(1000, Math.round(calc.crater.diameter * 1000)), color: '#ff6b6b', label: 'Crater / Ejecta' })
      // Airblast radii (convert km -> m)
      zones.push({ lat, lng, radius: Math.round(calc.damage.airblastRadius * 1000), color: '#ffa94d', label: 'Airblast (approx)' })
      // Thermal
      zones.push({ lat, lng, radius: Math.round(calc.damage.thermalRadius * 1000), color: '#ffd43b', label: 'Thermal' })

      setImpactZones(zones)
    } catch (err) {
      console.error('Impact calculation failed', err)
      setResults(null)
      setImpactZones([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-[600px] bg-card rounded-lg overflow-hidden">
        <InteractiveMap impactLocation={impactLocation} impactZones={impactZones} onLocationSelect={handleMapClick} />
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border" style={{ background: 'rgb(30, 30, 48)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          <h3 className="font-semibold mb-2">Asteroid Parameters</h3>

          <label className="text-sm text-muted-foreground">Diameter (meters)</label>
          <input type="range" min={1} max={20000} value={diameterMeters} onChange={(e) => setDiameterMeters(Number(e.target.value))} className="w-full" />
          <div className="text-xs mb-2">{diameterMeters} m</div>

          <label className="text-sm text-muted-foreground">Velocity (km/s)</label>
          <input type="range" min={11} max={72} value={velocity} onChange={(e) => setVelocity(Number(e.target.value))} className="w-full" />
          <div className="text-xs mb-2">{velocity} km/s</div>

          <label className="text-sm text-muted-foreground">Impact Angle (°)</label>
          <input type="range" min={15} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full" />
          <div className="text-xs mb-2">{angle}°</div>

          <label className="text-sm text-muted-foreground">Composition</label>
          <select value={composition} onChange={(e) => setComposition(e.target.value as any)} className="w-full mb-2">
            <option value="stony">Stony</option>
            <option value="iron">Iron</option>
            <option value="carbonaceous">Carbonaceous</option>
            <option value="comet">Comet</option>
          </select>

          <div className="text-sm text-muted-foreground">Tip: click on the map to run the simulation at that location.</div>
        </div>

        <ResultsPanel results={results} hasLocation={!!impactLocation} />
      </div>
    </div>
  )
}
