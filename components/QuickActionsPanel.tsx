"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, Target, Map, Database, Play, Pause, 
  RotateCcw, ChevronDown, BookOpen, Rocket,
  Settings, Eye, HelpCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface QuickActionsPanelProps {
  simulationActive: boolean
  isPaused: boolean
  onStartSimulation: () => void
  onPauseToggle: () => void
  onReset: () => void
  onLoadPreset: (preset: string) => void
  onLoadNASA: () => void
  onOpenMapImpact: () => void
  onToggleFeatureHub: () => void
  onToggleSettings: () => void
}

export function QuickActionsPanel({
  simulationActive,
  isPaused,
  onStartSimulation,
  onPauseToggle,
  onReset,
  onLoadPreset,
  onLoadNASA,
  onOpenMapImpact,
  onToggleFeatureHub,
  onToggleSettings
}: QuickActionsPanelProps) {
  const presets = [
    { key: 'chelyabinsk', name: '🌠 Chelyabinsk (2013)', description: 'Small meteor, 1,500 injured' },
    { key: 'tunguska', name: '💥 Tunguska (1908)', description: '2,000 km² devastation' },
    { key: 'barringer', name: '🌑 Barringer Crater', description: 'Arizona meteor crater' },
    { key: 'chicxulub', name: '🦕 Chicxulub', description: 'Dinosaur extinction' },
    { key: 'apophis', name: '☄️ Apophis', description: 'Future close approach' }
  ]

  return (
    <Card className="p-4 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/30 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Quick Actions
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFeatureHub}
          className="text-indigo-300 hover:text-white"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          All Features
        </Button>
      </div>

      <div className="space-y-3">
        {/* Simulation Controls */}
        <div className="space-y-2">
          <div className="text-xs text-indigo-200 font-medium mb-2">Simulation</div>
          <div className="grid grid-cols-3 gap-2">
            {!simulationActive ? (
              <Button 
                onClick={onStartSimulation}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={onPauseToggle}
                variant={isPaused ? "default" : "secondary"}
                size="sm"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={onReset}
              variant="outline"
              size="sm"
              disabled={!simulationActive}
              className="col-span-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Quick Load Options */}
        <div className="space-y-2">
          <div className="text-xs text-indigo-200 font-medium mb-2">Quick Load</div>
          <div className="grid grid-cols-2 gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Presets
                  <ChevronDown className="w-3 h-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Historical Impacts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {presets.map(preset => (
                  <DropdownMenuItem 
                    key={preset.key}
                    onClick={() => onLoadPreset(preset.key)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={onLoadNASA}
              variant="outline"
              size="sm"
              className="border-blue-500/50 hover:bg-blue-500/20"
            >
              <Rocket className="w-3 h-3 mr-1" />
              NASA Data
            </Button>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-2">
          <div className="text-xs text-indigo-200 font-medium mb-2">Advanced</div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onOpenMapImpact}
              variant="outline"
              size="sm"
              className="border-green-500/50 hover:bg-green-500/20"
            >
              <Map className="w-3 h-3 mr-1" />
              Map Impact
            </Button>

            <Button 
              onClick={onToggleSettings}
              variant="outline"
              size="sm"
            >
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              simulationActive && !isPaused ? 'bg-green-500 animate-pulse' : 
              simulationActive ? 'bg-yellow-500' : 
              'bg-gray-500'
            }`} />
            <span className="text-white/70">
              {simulationActive && !isPaused ? 'Running' : 
               simulationActive ? 'Paused' : 
               'Ready'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-indigo-300 hover:text-white"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Guide
          </Button>
        </div>
      </div>
    </Card>
  )
}
