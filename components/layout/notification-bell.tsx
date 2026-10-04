'use client'

// Bildirishnoma bell (FR-68): o'qilmaganlar soni bilan.
// Sessiya yo'q bo'lsa (401) — umuman ko'rinmaydi.
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/api/v1/notifications?limit=1')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!alive || !json?.success) return
        setUnread(json.data?.unreadCount ?? 0)
        setVisible(true)
      })
      .catch(() => null)
    return () => {
      alive = false
    }
  }, [])

  if (!visible) return null

  return (
    <Link
      href="/bildirishnomalar"
      aria-label="Bildirishnomalar"
      title="Bildirishnomalar"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-navy hover:bg-slate-100 transition-colors"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
