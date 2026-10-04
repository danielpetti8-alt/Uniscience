import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variantClass: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-light',
  gold: 'bg-gold text-navy hover:bg-gold-dark hover:text-white font-bold',
  outline: 'border border-slate-300 bg-white text-navy hover:border-navy',
  ghost: 'text-navy hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700',
}

const sizeClass: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2'

type CommonProps = {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`} {...rest}>
      {children}
    </a>
  )
}
