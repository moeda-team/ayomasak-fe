import { useId } from 'react'
import { cn } from '@/lib/utils'

const WIDTH = 64
const HEIGHT = 24
const PADDING = 2

type SparklineProps = {
  values: number[]
  className?: string
}

const toPoints = (values: number[]) => {
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const stepX = (WIDTH - PADDING * 2) / Math.max(values.length - 1, 1)

  return values.map((value, index) => ({
    x: PADDING + index * stepX,
    y: HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2),
  }))
}

/** Decorative trend line. Colored through `currentColor`, so set a text color class. */
export const Sparkline = ({ values, className }: SparklineProps) => {
  const gradientId = useId()
  if (values.length < 2) return null

  const points = toPoints(values)
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${WIDTH - PADDING} ${HEIGHT} L${PADDING} ${HEIGHT} Z`

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden
      className={cn('h-6 w-16 shrink-0', className)}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
