'use client'

interface ScoreBadgeProps {
  score: number
  showTooltip?: boolean
}

export default function ScoreBadge({ score, showTooltip = false }: ScoreBadgeProps) {
  // Determine color based on score
  let colorClass = 'bg-neutral-100 text-neutral-700' // Low (< 40)
  if (score >= 70) {
    colorClass = 'bg-green-100 text-green-800' // High
  } else if (score >= 40) {
    colorClass = 'bg-yellow-100 text-yellow-800' // Medium
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      title={showTooltip ? `Score: ${score}/100` : undefined}
    >
      {score}
    </span>
  )
}

