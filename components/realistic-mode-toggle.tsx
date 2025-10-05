"use client"

/**
 * 🌌 Realistic Mode Toggle Component
 * 
 * Allows users to switch between Visual, Realistic, and Hybrid scale modes
 * with info tooltips explaining the differences
 */

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Telescope, Gauge, Info, Zap, Sun, Globe2 } from "lucide-react"
import { SCALE_MODES, TIME_SCALES, type ScaleMode, type TimeScale } from "@/lib/realistic-mode"

interface RealisticModeToggleProps {
  currentMode: ScaleMode
  onModeChange: (mode: ScaleMode) => void
  currentTimeScale: TimeScale
  onTimeScaleChange: (scale: TimeScale) => void
  showTimeControls?: boolean
}

export function RealisticModeToggle({
  currentMode,
  onModeChange,
  currentTimeScale,
  onTimeScaleChange,
  showTimeControls = true,
}: RealisticModeToggleProps) {
  const [showInfo, setShowInfo] = useState(false)
  const config = SCALE_MODES[currentMode]

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-md border-purple-500/30">
      <div className="space-y-4">
        {/* Scale Mode Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Telescope className="w-4 h-4 text-purple-400" />
              Scale Mode
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className="h-6 px-2"
            >
              <Info className="w-3 h-3" />
            </Button>
          </div>

          <Tabs value={currentMode} onValueChange={(v) => onModeChange(v as ScaleMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Visual
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="text-xs">
                <Gauge className="w-3 h-3 mr-1" />
                Hybrid
              </TabsTrigger>
              <TabsTrigger value="realistic" className="text-xs">
                <Telescope className="w-3 h-3 mr-1" />
                Realistic
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Mode Description */}
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            {config.description}
          </div>

          {/* Info Panel */}
          {showInfo && (
            <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Sun Size:</span>
                  <span className="ml-1 font-mono text-foreground">{config.sunSize.toFixed(1)}x</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Planet Scale:</span>
                  <span className="ml-1 font-mono text-foreground">{(config.planetSizeMultiplier * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="ml-1 font-mono text-foreground">{(config.distanceMultiplier * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lighting:</span>
                  <Badge variant={config.lightingRealistic ? "default" : "secondary"} className="h-4 text-xs ml-1">
                    {config.lightingRealistic ? "Realistic" : "Uniform"}
                  </Badge>
                </div>
              </div>

              {/* Comparison Examples */}
              <div className="mt-2 pt-2 border-t border-purple-500/20">
                <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                  <Sun className="w-3 h-3" /> Examples:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {currentMode === 'visual' && (
                    <>
                      <li>• Sun: Easy to see (5 units)</li>
                      <li>• Earth: Visible and clickable (1.3 units)</li>
                      <li>• Neptune: Within view (88 units away)</li>
                    </>
                  )}
                  {currentMode === 'hybrid' && (
                    <>
                      <li>• Sun: Larger and more realistic (25 units)</li>
                      <li>• Earth: Smaller but proportional (0.65 units)</li>
                      <li>• Neptune: Farther but viewable (132 units)</li>
                    </>
                  )}
                  {currentMode === 'realistic' && (
                    <>
                      <li className="text-yellow-500">⚠️ Sun: Huge! (139 units - 109x Earth)</li>
                      <li className="text-yellow-500">⚠️ Earth: Tiny! (0.046 units - use zoom)</li>
                      <li className="text-yellow-500">⚠️ Neptune: VERY far (176 units away)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Time Scale Selector */}
        {showTimeControls && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Time Speed
            </h3>

            <div className="space-y-2">
              {Object.entries(TIME_SCALES).map(([key, scale]) => (
                <Button
                  key={key}
                  variant={currentTimeScale === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeScaleChange(key as TimeScale)}
                  className="w-full justify-start text-xs h-8"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono">{scale.label}</span>
                    {currentTimeScale === key && (
                      <Badge variant="secondary" className="h-4 text-xs ml-2">Active</Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
              {TIME_SCALES[currentTimeScale].description}
            </div>
          </div>
        )}

        {/* NASA Data Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Globe2 className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-muted-foreground">NASA JPL Data</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Horizons API
          </Badge>
        </div>
      </div>
    </Card>
  )
}
