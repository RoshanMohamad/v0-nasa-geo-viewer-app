"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DataPanelProps {
  coordinates: { lat: number; lng: number } | null
}

export function DataPanel({ coordinates }: DataPanelProps) {
  // Dummy data that changes based on coordinates
  const getRegionData = (coords: { lat: number; lng: number } | null) => {
    if (!coords) {
      return {
        region: "Global View",
        temperature: "15°C",
        cloudCover: "45%",
        humidity: "62%",
        windSpeed: "12 km/h",
        pressure: "1013 hPa",
        visibility: "10 km",
      }
    }

    // Generate different data based on coordinates
    const tempBase = 20 + Math.sin((coords.lat * Math.PI) / 180) * 15
    const cloudBase = 50 + Math.cos((coords.lng * Math.PI) / 180) * 30

    return {
      region: getRegionName(coords),
      temperature: `${Math.round(tempBase)}°C`,
      cloudCover: `${Math.round(Math.abs(cloudBase))}%`,
      humidity: `${Math.round(60 + Math.sin((coords.lat * Math.PI) / 90) * 20)}%`,
      windSpeed: `${Math.round(8 + Math.abs(coords.lng) / 20)} km/h`,
      pressure: `${Math.round(1013 + Math.sin((coords.lat * Math.PI) / 180) * 20)} hPa`,
      visibility: `${Math.round(8 + Math.random() * 4)} km`,
    }
  }

  const getRegionName = (coords: { lat: number; lng: number }) => {
    if (coords.lat > 60) return "Arctic Region"
    if (coords.lat < -60) return "Antarctic Region"
    if (coords.lat > 30 && coords.lng > -30 && coords.lng < 60) return "Europe/Asia"
    if (coords.lat > 0 && coords.lng > -120 && coords.lng < -60) return "North America"
    if (coords.lat < 0 && coords.lng > -80 && coords.lng < -30) return "South America"
    if (coords.lat > -30 && coords.lng > 10 && coords.lng < 50) return "Africa"
    if (coords.lat < -10 && coords.lng > 110 && coords.lng < 160) return "Australia"
    if (coords.lat > 0 && coords.lng > 60 && coords.lng < 140) return "Asia Pacific"
    return "Ocean Region"
  }

  const data = getRegionData(coordinates)

  return (
    <div className="w-80 space-y-4">
      <Card className="glass-effect p-6 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Earth Data</h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Live
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Region:</span>
              <span className="font-medium text-accent">{data.region}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Temperature:</span>
              <span className="font-medium">{data.temperature}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Cloud Cover:</span>
              <span className="font-medium">{data.cloudCover}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Humidity:</span>
              <span className="font-medium">{data.humidity}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wind Speed:</span>
              <span className="font-medium">{data.windSpeed}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pressure:</span>
              <span className="font-medium">{data.pressure}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Visibility:</span>
              <span className="font-medium">{data.visibility}</span>
            </div>
          </div>

          {coordinates && (
            <div className="pt-3 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Coordinates: {coordinates.lat}°, {coordinates.lng}°
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-effect p-4 border-primary/20">
        <h4 className="text-sm font-medium text-foreground mb-2">Mission Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Satellite Connection: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Data Stream: Nominal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Processing: Real-time</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
