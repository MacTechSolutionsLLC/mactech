'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

type BadgeSize = 'small' | 'medium' | 'large'

interface ComplianceBadgesProps {
  size?: BadgeSize
  className?: string
  showLabels?: boolean
}

const badgeConfig = [
  {
    src: '/images/badges/CMMC2.png',
    alt: 'CMMC 2.0 Level 2 Compliance',
    label: 'CMMC 2.0 Level 2',
    emoji: '🛡️',
    title: 'CMMC 2.0 Level 2 — Certified',
    tooltip: 'Independently certified implementation of NIST SP 800-171 controls for protecting Controlled Unclassified Information (CUI).',
  },
  {
    src: '/images/badges/fedramp.png',
    alt: 'FedRAMP Moderate Design Alignment',
    label: 'FedRAMP Moderate',
    emoji: '☁️',
    title: 'FedRAMP Moderate — Design Aligned',
    tooltip: 'Security architecture and control design aligned with the FedRAMP Moderate baseline. No FedRAMP authorization or ATO implied.',
  },
  {
    src: '/images/badges/rmf.png',
    alt: 'NIST RMF Alignment',
    label: 'NIST RMF',
    emoji: '🔁',
    title: 'NIST RMF — Governance Aligned',
    tooltip: 'Security risk governance structured around NIST Risk Management Framework (RMF) principles.',
  },
  {
    src: '/images/badges/soc.png',
    alt: 'SOC 2 Type I Readiness',
    label: 'SOC 2 Type I',
    emoji: '🔒',
    title: 'SOC 2 Type I — Internal Readiness',
    tooltip: 'Internal SOC 2 Type I readiness completed for security control design. No independent audit performed.',
  },
]

const sizeClasses = {
  small: 'h-12 md:h-14',
  medium: 'h-16 md:h-20',
  large: 'h-20 md:h-24',
}

function Tooltip({ badge, isVisible, badgeRef }: { 
  badge: typeof badgeConfig[0], 
  isVisible: boolean,
  badgeRef: React.RefObject<HTMLDivElement>
}) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')

  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !badgeRef.current) return

    const updatePosition = () => {
      const badgeRect = badgeRef.current?.getBoundingClientRect()
      if (!badgeRect) return

      const viewportHeight = window.innerHeight
      const spaceAbove = badgeRect.top
      const spaceBelow = viewportHeight - badgeRect.bottom
      const tooltipHeight = 150 // Approximate tooltip height

      // Position tooltip below by default, only use top if not enough space below
      setPosition(spaceBelow < tooltipHeight && spaceAbove > spaceBelow ? 'top' : 'bottom')
    }

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(updatePosition)
  }, [isVisible, badgeRef])

  return (
    <div
      ref={tooltipRef}
      className={`
        absolute left-1/2 -translate-x-1/2 z-[100] pointer-events-none
        ${position === 'top' ? 'bottom-full mb-4' : 'top-full mt-4'}
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-1 scale-[0.96] pointer-events-none'
        }
      `}
      style={{
        transitionProperty: 'opacity, transform',
        willChange: 'opacity, transform',
      }}
    >
      <div className="
        bg-white/98 backdrop-blur-2xl
        text-neutral-900
        rounded-2xl
        shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)]
        border border-neutral-200/60
        p-6
        w-[calc(100vw-2rem)] max-w-[480px]
        sm:w-[420px]
        relative
        overflow-hidden
      ">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-neutral-50/20 rounded-2xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3.5">
            <span className="text-2xl flex-shrink-0 leading-none filter drop-shadow-sm">{badge.emoji}</span>
            <h4 className="font-semibold text-neutral-900 text-sm leading-tight tracking-[-0.01em]">
              {badge.title}
            </h4>
          </div>
          <p className="text-neutral-600 text-xs leading-relaxed tracking-wide">
            {badge.tooltip}
          </p>
        </div>

        {/* Arrow */}
        <div className={`
          absolute left-1/2 -translate-x-1/2 z-10
          ${position === 'top' ? 'top-full -mt-[6px]' : 'bottom-full -mb-[6px] rotate-180'}
        `}>
          <div className="
            w-3.5 h-3.5
            bg-white/98 backdrop-blur-2xl
            border-r border-b border-neutral-200/60
            transform rotate-45
            shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)]
          " />
        </div>
      </div>
    </div>
  )
}

export default function ComplianceBadges({ 
  size = 'medium', 
  className = '',
  showLabels = false 
}: ComplianceBadgesProps) {
  const heightClass = sizeClasses[size]
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)
  const badgeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 ${className}`}>
      {badgeConfig.map((badge) => (
        <div 
          key={badge.src}
          ref={(el) => { badgeRefs.current[badge.src] = el }}
          className="flex flex-col items-center gap-2 relative"
          onMouseEnter={() => setHoveredBadge(badge.src)}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          <div className="
            relative
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            cursor-help
            group
          ">
            <div className={`
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${hoveredBadge === badge.src 
                ? 'scale-[1.08] opacity-95' 
                : 'scale-100 opacity-100'
              }
            `}>
              <Image
                src={badge.src}
                alt={badge.alt}
                width={200}
                height={200}
                className={`${heightClass} w-auto object-contain transition-all duration-300`}
                unoptimized
              />
            </div>
            
            {/* Tooltip */}
            <Tooltip 
              badge={badge} 
              isVisible={hoveredBadge === badge.src}
              badgeRef={{ current: badgeRefs.current[badge.src] } as React.RefObject<HTMLDivElement>}
            />
          </div>
          
          {showLabels && (
            <span className="text-body-xs text-neutral-600 text-center max-w-[120px] transition-colors duration-200">
              {badge.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
