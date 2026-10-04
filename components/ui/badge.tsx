import { type ReactNode } from 'react'

type Tone = 'navy' | 'gold' | 'cyan' | 'success' | 'danger' | 'warning' | 'neutral'

const toneClass: Record<Tone, string> = {
  navy: 'bg-navy text-white',
  gold: 'bg-gold/15 text-gold-dark',
  cyan: 'bg-cyan/15 text-cyan-dark',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/15 text-warning',
  neutral: 'bg-slate-100 text-slate-600',
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
