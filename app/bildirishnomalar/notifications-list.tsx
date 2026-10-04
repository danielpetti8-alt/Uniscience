'use client'

// Bildirishnomalar lenta klient logikasi: ro'yxat, bittasini/barchasini o'qish.
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Item = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'hozir'
  if (min < 60) return `${min} daqiqa oldin`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} soat oldin`
  const d = Math.floor(h / 24)
  return `${d} kun oldin`
}

export function NotificationsList() {
  const router = useRouter()
  const [items, setItems] = useState<Item[] | null>(null)
  const [unread, setUnread] = useState(0)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/v1/notifications')
    if (!res.ok) {
      setItems([])
      return
    }
    const json = await res.json()
    setItems(json.data?.items ?? [])
    setUnread(json.data?.unreadCount ?? 0)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function markAll() {
    setBusy(true)
    await fetch('/api/v1/notifications/read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    await load()
    setBusy(false)
    router.refresh()
  }

  async function markOne(id: string) {
    await fetch('/api/v1/notifications/read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    router.refresh()
  }

  if (items === null) {
    return <p className="text-sm text-slate-500 py-8 text-center">Yuklanmoqda...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Badge tone={unread > 0 ? 'danger' : 'neutral'}>
          {unread > 0 ? `${unread} ta o'qilmagan` : "Barchasi o'qilgan"}
        </Badge>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAll} disabled={busy}>
            Barchasini o'qilgan qilish
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-slate-500 text-sm">Hozircha bildirishnomalar yo'q. Muhim voqealar shu yerda ko'rinadi.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`border rounded-2xl p-4 transition-colors ${
                n.readAt ? 'border-slate-200 bg-white' : 'border-gold/40 bg-gold/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-navy text-sm">
                    {!n.readAt && <span className="inline-block w-2 h-2 rounded-full bg-danger mr-2 align-middle" />}
                    {n.title}
                  </p>
                  {n.body && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.body}</p>}
                  <p className="text-xs text-slate-400 mt-2">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <a href={n.link} className="text-xs font-bold text-cyan-dark hover:underline">
                      Ochish
                    </a>
                  )}
                  {!n.readAt && (
                    <button
                      type="button"
                      onClick={() => markOne(n.id)}
                      className="text-xs font-semibold text-slate-400 hover:text-navy"
                    >
                      O'qildi
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
