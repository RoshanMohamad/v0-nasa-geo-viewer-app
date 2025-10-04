"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, Sun, Target } from "lucide-react"

interface PlanetSelectorProps {
  selectedPlanet: string | null
  onSelectPlanet: (planet: string | null) => void
}

const PLANETS = [
  { name: "Sun", icon: Sun, color: "text-yellow-500" },
  { name: "Mercury", icon: Globe, color: "text-gray-400" },
  { name: "Venus", icon: Globe, color: "text-orange-300" },
  { name: "Earth", icon: Globe, color: "text-blue-500" },
  { name: "Mars", icon: Globe, color: "text-red-500" },
  { name: "Jupiter", icon: Globe, color: "text-orange-400" },
  { name: "Saturn", icon: Globe, color: "text-yellow-300" },
  { name: "Uranus", icon: Globe, color: "text-cyan-400" },
  { name: "Neptune", icon: Globe, color: "text-blue-600" },
]

export function PlanetSelector({ selectedPlanet, onSelectPlanet }: PlanetSelectorProps) {
  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Focus Camera</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PLANETS.map((planet) => {
          const Icon = planet.icon
          return (
            <Button
              key={planet.name}
              onClick={() => onSelectPlanet(selectedPlanet === planet.name ? null : planet.name)}
              variant={selectedPlanet === planet.name ? "default" : "outline"}
              size="sm"
              className="h-auto py-2 flex flex-col items-center gap-1"
            >
              <Icon className={`w-4 h-4 ${planet.color}`} />
              <span className="text-xs">{planet.name}</span>
            </Button>
          )
        })}
      </div>
      {selectedPlanet && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Camera focused on <span className="font-semibold text-foreground">{selectedPlanet}</span>
          </p>
          <Button
            onClick={() => onSelectPlanet(null)}
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
          >
            Reset View
          </Button>
        </div>
      )}
    </Card>
  )
}
