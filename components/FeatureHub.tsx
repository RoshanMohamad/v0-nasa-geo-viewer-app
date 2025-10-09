"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, Target, Map, Globe, Zap, Database, 
  Camera, Clock, Layers, TrendingUp, ChevronRight,
  Sparkles, BookOpen, Play, Settings, Eye,
  Star, AlertTriangle, Calculator, TestTube
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FeatureHubProps {
  onFeatureSelect: (feature: string) => void
}

export function FeatureHub({ onFeatureSelect }: FeatureHubProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('quick-start')

  const features = {
    'quick-start': [
      {
        id: 'impact-simulator',
        title: 'Impact Simulator',
        description: 'Simulate asteroid impacts on Earth with real physics',
        icon: Target,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        action: () => onFeatureSelect('impact-simulator'),
        tags: ['Popular', 'Interactive']
      },
      {
        id: 'solar-system',
        title: '3D Solar System',
        description: 'Explore planets with real-time orbits and scaling',
        icon: Globe,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        action: () => onFeatureSelect('solar-system'),
        tags: ['3D', 'Real-time']
      },
      {
        id: 'nasa-asteroids',
        title: 'NASA Asteroids',
        description: 'Load real Near-Earth Objects from NASA database',
        icon: Rocket,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        action: () => onFeatureSelect('nasa-asteroids'),
        tags: ['Live Data', 'NASA']
      },
      {
        id: 'map-impact',
        title: 'Map Impact Analysis',
        description: 'Click anywhere on Earth to simulate impact location',
        icon: Map,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        action: () => router.push('/impact-analysis'),
        tags: ['New', 'Interactive']
      }
    ],
    'simulation': [
      {
        id: 'custom-asteroid',
        title: 'Custom Asteroid',
        description: 'Create asteroids with custom size, velocity, and trajectory',
        icon: Zap,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        action: () => onFeatureSelect('custom-asteroid'),
        tags: ['Advanced']
      },
      {
        id: 'historical-presets',
        title: 'Historical Impacts',
        description: 'Simulate Tunguska, Chicxulub, and other famous impacts',
        icon: BookOpen,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        action: () => onFeatureSelect('presets'),
        tags: ['Educational']
      },
      {
        id: 'multiple-asteroids',
        title: 'Multiple Asteroids',
        description: 'Add multiple asteroids and compare trajectories',
        icon: Sparkles,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        action: () => onFeatureSelect('multiple-asteroids'),
        tags: ['Advanced']
      },
      {
        id: 'time-controls',
        title: 'Time Controls',
        description: 'Speed up, slow down, or pause orbital simulations',
        icon: Clock,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
        action: () => onFeatureSelect('time-controls'),
        tags: ['Essential']
      }
    ],
    'analysis': [
      {
        id: 'impact-calculator',
        title: 'Impact Calculator',
        description: 'Calculate energy, crater size, and damage zones',
        icon: Calculator,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        action: () => onFeatureSelect('calculator'),
        tags: ['Essential']
      },
      {
        id: 'orbital-analysis',
        title: 'Orbital Analysis',
        description: 'Analyze orbital intersections and collision probability',
        icon: TrendingUp,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        action: () => router.push('/impact-analysis'),
        tags: ['Advanced']
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment',
        description: 'Get risk levels from LOW to EXTREME based on orbital data',
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        action: () => onFeatureSelect('risk-assessment'),
        tags: ['NASA']
      },
      {
        id: 'damage-zones',
        title: 'Damage Zones',
        description: 'View thermal, airblast, and seismic damage radii',
        icon: Target,
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10',
        action: () => onFeatureSelect('damage-zones'),
        tags: ['Visualization']
      }
    ],
    'visualization': [
      {
        id: 'realistic-mode',
        title: 'Realistic Mode',
        description: 'Toggle between visual and scientifically accurate scales',
        icon: Eye,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        action: () => onFeatureSelect('realistic-mode'),
        tags: ['Essential']
      },
      {
        id: 'camera-focus',
        title: 'Planet Focus',
        description: 'Focus camera on any planet with smooth GSAP animations',
        icon: Camera,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        action: () => onFeatureSelect('camera-focus'),
        tags: ['3D']
      },
      {
        id: 'orbit-paths',
        title: 'Orbit Paths',
        description: 'Compare orbital paths with interactive 2D viewer',
        icon: Layers,
        color: 'text-teal-500',
        bgColor: 'bg-teal-500/10',
        action: () => onFeatureSelect('orbit-paths'),
        tags: ['Advanced']
      },
      {
        id: '3d-crater',
        title: '3D Crater View',
        description: 'See crater formation from orbit and surface perspectives',
        icon: Globe,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        action: () => router.push('/impact-analysis-3d'),
        tags: ['3D', 'Popular']
      }
    ],
    'data': [
      {
        id: 'nasa-integration',
        title: 'NASA NEO API',
        description: 'Access real asteroid data from NASA JPL',
        icon: Database,
        color: 'text-blue-600',
        bgColor: 'bg-blue-600/10',
        action: () => onFeatureSelect('nasa-data'),
        tags: ['NASA', 'Live Data']
      },
      {
        id: 'horizons-api',
        title: 'JPL Horizons',
        description: 'Get precise orbital elements from NASA Horizons',
        icon: Star,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-600/10',
        action: () => onFeatureSelect('horizons-api'),
        tags: ['NASA', 'Advanced']
      },
      {
        id: 'object-details',
        title: 'Object Details',
        description: 'View comprehensive data for any celestial object',
        icon: Settings,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        action: () => onFeatureSelect('object-details'),
        tags: ['Info']
      },
      {
        id: 'export-data',
        title: 'Export Results',
        description: 'Download impact analysis and orbital data',
        icon: Database,
        color: 'text-green-600',
        bgColor: 'bg-green-600/10',
        action: () => onFeatureSelect('export-data'),
        tags: ['Advanced']
      }
    ]
  }

  const categories = [
    { id: 'quick-start', label: 'Quick Start', icon: Zap },
    { id: 'simulation', label: 'Simulation', icon: Play },
    { id: 'analysis', label: 'Analysis', icon: Calculator },
    { id: 'visualization', label: 'Visualization', icon: Eye },
    { id: 'data', label: 'Data & API', icon: Database }
  ]

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-950/20 to-blue-950/20 border-purple-500/30 backdrop-blur-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Feature Hub
        </h2>
        <p className="text-purple-200/80 text-sm">
          Explore all features and capabilities of the Solar System Simulator
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features[cat.id as keyof typeof features]?.map(feature => {
                const Icon = feature.icon
                return (
                  <Card 
                    key={feature.id}
                    className={`p-4 ${feature.bgColor} border border-white/10 hover:border-white/30 transition-all cursor-pointer group`}
                    onClick={feature.action}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${feature.bgColor} border border-white/20`}>
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                      {feature.title}
                      {feature.tags && feature.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </h3>
                    
                    <p className="text-sm text-white/70">
                      {feature.description}
                    </p>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">20+</div>
            <div className="text-xs text-white/60">Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">3D</div>
            <div className="text-xs text-white/60">Visualization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">NASA</div>
            <div className="text-xs text-white/60">Live Data</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">Real</div>
            <div className="text-xs text-white/60">Physics</div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-200 flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          <span>Pro tip: Press <kbd className="px-1 py-0.5 bg-white/10 rounded">?</kbd> for keyboard shortcuts</span>
        </p>
      </div>
    </Card>
  )
}
