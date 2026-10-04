'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/kirish')
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? 'Chiqilmoqda...' : 'Chiqish'}
    </Button>
  )
}
