'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABELS, ROLE_LABELS } from '@/lib/constants'

type PendingUser = {
  id: string
  username: string
  email: string
  role: string
  category: string | null
  createdAt: string
  profile: {
    universitet: string | null
    fakultet: string | null
    kafedra: string | null
    daraja: string | null
    lavozim: string | null
  } | null
}

export function PendingApprovals({ canApprove }: { canApprove: boolean }) {
  const [users, setUsers] = useState<PendingUser[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/users/pending')
      const data = await res.json()
      if (data.success) setUsers(data.data)
      else setError(data.error?.message ?? 'Yuklashda xato')
    } catch {
      setError("Server bilan bog'lanishda xato")
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function act(id: string, action: 'approve' | 'reject') {
    setBusy(id)
    await fetch(`/api/v1/admin/users/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setBusy('')
    await load()
  }

  if (error) {
    return <div className="px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-semibold">{error}</div>
  }
  if (users === null) {
    return <div className="skeleton h-24 w-full" />
  }
  if (users.length === 0) {
    return (
      <Card>
        <CardBody className="text-center text-sm text-slate-500 py-10">
          Tasdiqlashni kutayotgan hisoblar yo'q. ✅
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-navy text-sm">Tasdiqlashni kutayotgan hisoblar ({users.length})</h2>
      {users.map((u) => (
        <Card key={u.id}>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-bold text-navy">{u.username}</div>
              <div className="text-sm text-slate-500">{u.email}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge tone="cyan">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                {u.category && <Badge tone="neutral">{CATEGORY_LABELS[u.category] ?? u.category}</Badge>}
                {u.profile?.universitet && <Badge tone="neutral">{u.profile.universitet}</Badge>}
                {u.profile?.kafedra && <Badge tone="neutral">Kafedra: {u.profile.kafedra}</Badge>}
                {u.profile?.daraja && <Badge tone="neutral">Daraja: {u.profile.daraja}</Badge>}
              </div>
            </div>
            {canApprove && (
              <div className="flex gap-2">
                <Button
                  variant="gold"
                  size="sm"
                  disabled={busy === u.id}
                  onClick={() => act(u.id, 'approve')}
                >
                  Qabul qilish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy === u.id}
                  onClick={() => act(u.id, 'reject')}
                >
                  Rad etish
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
