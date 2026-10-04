'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button'
import { NotificationBell } from '@/components/layout/notification-bell'

const navLinks = [
  { href: '/reyting', label: 'Reyting' },
  { href: '/yoriqnoma', label: "Yo'riqnoma" },
  { href: '/yangiliklar', label: 'Yangiliklar' },
  { href: '/matching', label: 'Rahbarlik' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="UniScience" className="h-9 w-auto" />
          <span className="hidden sm:inline text-lg font-extrabold tracking-tight text-navy">
            UniScience<span className="text-gold">.uz</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg hover:text-navy hover:bg-slate-100 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ButtonLink href="/kirish" variant="ghost" size="sm">
            Kirish
          </ButtonLink>
          <ButtonLink href="/royhat" variant="gold" size="sm">
            Ro'yxatdan o'tish
          </ButtonLink>
        </div>

        <button
          type="button"
          aria-label="Menyu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-navy"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 items-center">
            <NotificationBell />
            <ButtonLink href="/kirish" variant="outline" size="sm" className="flex-1">
              Kirish
            </ButtonLink>
            <ButtonLink href="/royhat" variant="gold" size="sm" className="flex-1">
              Ro'yxatdan o'tish
            </ButtonLink>
          </div>
        </div>
      )}
    </nav>
  )
}
