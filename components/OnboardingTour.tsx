"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  X, ChevronRight, ChevronLeft, Check, Sparkles,
  Target, Map, Rocket, Play, Eye, Settings
} from 'lucide-react'

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenTour) {
      setIsVisible(true)
    }
  }, [])

  const steps = [
    {
      title: 'Welcome to Solar System Simulator! 🚀',
      description: 'Let\'s take a quick tour of all the amazing features available to you.',
      icon: Sparkles,
      color: 'text-purple-400',
      image: '🌌'
    },
    {
      title: 'Impact Simulator',
      description: 'Simulate asteroid impacts with real physics. Adjust size, velocity, and angle to see different outcomes.',
      icon: Target,
      color: 'text-red-400',
      highlights: ['Left Panel → Quick Tab', 'Click "Start Simulation"'],
      image: '💥'
    },
    {
      title: 'Map-Based Impact Analysis',
      description: 'Click anywhere on Earth to simulate impacts. See damage zones, crater formation, and energy calculations.',
      icon: Map,
      color: 'text-green-400',
      highlights: ['Left Panel → Map Impact Button', 'Click on map → View results'],
      image: '🗺️'
    },
    {
      title: 'NASA Real Data',
      description: 'Load real Near-Earth Objects from NASA\'s database. See actual asteroids and their orbits.',
      icon: Rocket,
      color: 'text-blue-400',
      highlights: ['Left Panel → Custom Tab', 'Select NASA presets', 'View orbital paths'],
      image: '🛰️'
    },
    {
      title: 'Time & Camera Controls',
      description: 'Control simulation speed (1x to 100,000x), pause/resume, focus on planets, and switch between visual/realistic modes.',
      icon: Play,
      color: 'text-yellow-400',
      highlights: ['Right Panel → Time Controls', 'Planet Focus Selector', 'Realistic Mode Toggle'],
      image: '⏱️'
    },
    {
      title: 'Advanced Visualizations',
      description: 'View 3D crater formations, orbital intersections, surface impacts, and comprehensive damage assessments.',
      icon: Eye,
      color: 'text-cyan-400',
      highlights: ['Impact Analysis Page', '3D Views', 'Damage Zones on Map'],
      image: '🔭'
    },
    {
      title: 'You\'re All Set! ✨',
      description: 'Start exploring! Click on any asteroid in the manage tab to analyze its impact potential.',
      icon: Check,
      color: 'text-green-400',
      image: '🎉'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-purple-950/90 to-blue-950/90 border-purple-500/50 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="text-6xl">{step.image}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-6 h-6 ${step.color}`} />
                <h2 className="text-2xl font-bold text-white">{step.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-lg text-white/90 mb-6">
            {step.description}
          </p>

          {step.highlights && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
              <div className="text-sm font-semibold text-white/80 mb-2">📍 Where to find it:</div>
              <ul className="space-y-2">
                {step.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStep 
                      ? 'bg-purple-500 w-6' 
                      : idx < currentStep 
                        ? 'bg-green-500' 
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Get Started
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-xs text-white/60">
            You can always access the help menu by clicking the "?" icon
          </p>
        </div>
      </Card>
    </div>
  )
}
