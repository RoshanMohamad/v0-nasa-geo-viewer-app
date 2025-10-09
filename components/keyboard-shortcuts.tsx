"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Command,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Space,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Info
} from "lucide-react"

export function KeyboardShortcuts() {
  return (
    <Card className="p-6 bg-black/80 backdrop-blur-md border-purple-500/30 max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Command className="w-5 h-5 text-purple-300" />
          <h2 className="text-lg font-semibold text-purple-100">Keyboard Shortcuts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Simulation Controls */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Simulation
            </h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["Space"]} description="Play/Pause" icon={<Pause />} />
              <ShortcutRow keys={["R"]} description="Reset simulation" icon={<RotateCcw />} />
              <ShortcutRow keys={["S"]} description="Start new asteroid" icon={<Plus />} />
            </div>
          </div>

          {/* Time Controls */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <ArrowUp className="w-4 h-4" />
              Time Speed
            </h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["+", "="]} description="Increase speed" icon={<Plus />} />
              <ShortcutRow keys={["-", "_"]} description="Decrease speed" icon={<Minus />} />
              <ShortcutRow keys={["1"]} description="1x Real-time" />
              <ShortcutRow keys={["2"]} description="1,000x Fast" />
              <ShortcutRow keys={["3"]} description="100,000x Very Fast" />
              <ShortcutRow keys={["4"]} description="1,000,000x Ultra Fast" />
            </div>
          </div>

          {/* Camera Controls */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Camera
            </h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["↑"]} description="Rotate up" icon={<ArrowUp />} />
              <ShortcutRow keys={["↓"]} description="Rotate down" icon={<ArrowDown />} />
              <ShortcutRow keys={["←"]} description="Rotate left" icon={<ArrowLeft />} />
              <ShortcutRow keys={["→"]} description="Rotate right" icon={<ArrowRight />} />
              <ShortcutRow keys={["H"]} description="Reset camera" icon={<RotateCcw />} />
            </div>
          </div>

          {/* View Controls */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              View
            </h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["V"]} description="Toggle visual mode" />
              <ShortcutRow keys={["T"]} description="Toggle trails" />
              <ShortcutRow keys={["O"]} description="Toggle orbits" />
              <ShortcutRow keys={["L"]} description="Toggle labels" />
              <ShortcutRow keys={["["]} description="Hide left panel" />
              <ShortcutRow keys={["]"]} description="Hide right panel" />
            </div>
          </div>

          {/* Planet Focus */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2">Planet Focus</h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["M"]} description="Focus Mercury" />
              <ShortcutRow keys={["V"]} description="Focus Venus" />
              <ShortcutRow keys={["E"]} description="Focus Earth" />
              <ShortcutRow keys={["A"]} description="Focus Mars" />
              <ShortcutRow keys={["J"]} description="Focus Jupiter" />
              <ShortcutRow keys={["Esc"]} description="Clear focus" />
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Help
            </h3>
            <div className="space-y-2 text-sm">
              <ShortcutRow keys={["?"]} description="Show this help" />
              <ShortcutRow keys={["I"]} description="Show info panel" />
              <ShortcutRow keys={["F"]} description="Toggle fullscreen" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-purple-500/30">
          <p className="text-xs text-purple-300/70 flex items-center gap-2">
            <Info className="w-3 h-3" />
            Press <Badge variant="outline" className="mx-1 text-xs border-purple-500/50">?</Badge> 
            anytime to see these shortcuts
          </p>
        </div>
      </div>
    </Card>
  )
}

function ShortcutRow({ 
  keys, 
  description, 
  icon 
}: { 
  keys: string[]
  description: string
  icon?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-purple-300/90 flex items-center gap-2">
        {icon && <span className="text-purple-400">{icon}</span>}
        {description}
      </span>
      <div className="flex gap-1">
        {keys.map((key) => (
          <Badge
            key={key}
            variant="outline"
            className="text-xs font-mono border-purple-500/50 text-purple-200 px-2 py-0.5"
          >
            {key}
          </Badge>
        ))}
      </div>
    </div>
  )
}

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcuts({
  onPlayPause,
  onReset,
  onSpawnAsteroid,
  onIncreaseSpeed,
  onDecreaseSpeed,
  onSetTimeScale,
  onToggleMode,
  onTogglePanel,
  onFocusPlanet,
}: {
  onPlayPause?: () => void
  onReset?: () => void
  onSpawnAsteroid?: () => void
  onIncreaseSpeed?: () => void
  onDecreaseSpeed?: () => void
  onSetTimeScale?: (scale: number) => void
  onToggleMode?: () => void
  onTogglePanel?: (panel: 'left' | 'right') => void
  onFocusPlanet?: (planet: string | null) => void
}) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        // Simulation controls
        case ' ':
          e.preventDefault()
          onPlayPause?.()
          break
        case 'r':
          onReset?.()
          break
        case 's':
          onSpawnAsteroid?.()
          break

        // Time speed controls
        case '+':
        case '=':
          onIncreaseSpeed?.()
          break
        case '-':
        case '_':
          onDecreaseSpeed?.()
          break
        case '1':
          onSetTimeScale?.(1)
          break
        case '2':
          onSetTimeScale?.(1000)
          break
        case '3':
          onSetTimeScale?.(100000)
          break
        case '4':
          onSetTimeScale?.(1000000)
          break

        // View controls
        case 'v':
          onToggleMode?.()
          break
        case '[':
          onTogglePanel?.('left')
          break
        case ']':
          onTogglePanel?.('right')
          break

        // Planet focus
        case 'm':
          onFocusPlanet?.('Mercury')
          break
        case 'e':
          onFocusPlanet?.('Earth')
          break
        case 'a':
          onFocusPlanet?.('Mars')
          break
        case 'j':
          onFocusPlanet?.('Jupiter')
          break
        case 'escape':
          onFocusPlanet?.(null)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    onPlayPause,
    onReset,
    onSpawnAsteroid,
    onIncreaseSpeed,
    onDecreaseSpeed,
    onSetTimeScale,
    onToggleMode,
    onTogglePanel,
    onFocusPlanet,
  ])
}
