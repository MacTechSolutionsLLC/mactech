import Image from 'next/image'

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

export default function ComplianceBadges({ 
  size = 'medium', 
  className = '',
  showLabels = false 
}: ComplianceBadgesProps) {
  const heightClass = sizeClasses[size]

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-6 ${className}`}>
      {badgeConfig.map((badge) => (
        <div 
          key={badge.src}
          className="flex flex-col items-center gap-2 group relative"
        >
          <div className="relative transition-opacity duration-200 group-hover:opacity-80 cursor-help">
            <Image
              src={badge.src}
              alt={badge.alt}
              width={200}
              height={200}
              className={`${heightClass} w-auto object-contain`}
              unoptimized
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none">
              <div className="bg-neutral-900 text-white text-sm rounded-lg shadow-xl p-4 max-w-xs">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg flex-shrink-0 mt-0.5">{badge.emoji}</span>
                  <h4 className="font-semibold text-white leading-tight">{badge.title}</h4>
                </div>
                <p className="text-neutral-200 text-xs leading-relaxed">
                  {badge.tooltip}
                </p>
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-neutral-900"></div>
                </div>
              </div>
            </div>
          </div>
          {showLabels && (
            <span className="text-body-xs text-neutral-600 text-center max-w-[120px]">
              {badge.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
