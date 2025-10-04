"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Calendar, Clock, Play, Pause, RotateCcw } from "lucide-react"

interface SimulationTimeControlsProps {
  isPaused: boolean
  onPauseToggle: () => void
  timeSpeed: number
  onTimeSpeedChange: (speed: number) => void
  simulationDate: Date
  onReset: () => void
}

export function SimulationTimeControls({
  isPaused,
  onPauseToggle,
  timeSpeed,
  onTimeSpeedChange,
  simulationDate,
  onReset,
}: SimulationTimeControlsProps) {
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch - only render date on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatTimeSpeed = (speed: number): string => {
    if (speed === 1) return 'Real-time'
    if (speed < 86400) return `${speed.toFixed(0)}x`
    if (speed < 604800) return `${(speed / 86400).toFixed(0)} days/sec`
    if (speed < 2592000) return `${(speed / 604800).toFixed(0)} weeks/sec`
    if (speed < 31536000) return `${(speed / 2592000).toFixed(0)} months/sec`
    return `${(speed / 31536000).toFixed(1)} years/sec`
  }

  const presetSpeeds = [
    { label: '1x', value: 1 },
    { label: '1 hr/s', value: 3600 },
    { label: '1 day/s', value: 86400 },
    { label: '1 wk/s', value: 604800 },
    { label: '1 mo/s', value: 2592000 },
    { label: '1 yr/s', value: 31536000 },
  ]

  return (
    <Card className="p-4 bg-card/90 backdrop-blur-sm border-border/50 w-96">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Time Controls
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8"
            title="Reset to current time"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Current Simulation Date */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-200">Simulation Date</span>
          </div>
          {isClient ? (
            <>
              <div className="text-white font-semibold">
                {simulationDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="text-blue-300 text-xs mt-1">
                {simulationDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </>
          ) : (
            <div className="text-white font-semibold">
              Loading...
            </div>
          )}
        </div>

        {/* Play/Pause */}
        <div className="flex gap-2">
          <Button
            onClick={onPauseToggle}
            className="flex-1"
            variant={isPaused ? "default" : "secondary"}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
        </div>

        {/* Time Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">Time Speed</label>
            <span className="text-xs font-semibold text-foreground">
              {formatTimeSpeed(timeSpeed)}
            </span>
          </div>
          <Slider
            value={[Math.log10(timeSpeed)]}
            onValueChange={([value]) => onTimeSpeedChange(Math.pow(10, value))}
            min={0}
            max={7.5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Preset Speed Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {presetSpeeds.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => onTimeSpeedChange(preset.value)}
              className={`text-xs ${timeSpeed === preset.value ? 'bg-primary/20 border-primary' : ''}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className={`w-2 h-2 rounded-full ${
              isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'
            }`}
          />
          <span>{isPaused ? 'Simulation Paused' : 'Simulation Running'}</span>
        </div>
      </div>
    </Card>
  )
}
