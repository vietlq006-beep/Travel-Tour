import { Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export function PaymentCountdown({ dueAt, onExpired, compact = false }: { dueAt?: string | null; onExpired?: () => void; compact?: boolean }) {
  const deadline = useMemo(() => dueAt ? new Date(dueAt).getTime() : 0, [dueAt])
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()))

  useEffect(() => {
    if (!deadline) return
    const timer = window.setInterval(() => {
      const next = Math.max(0, deadline - Date.now())
      setRemaining(next)
      if (next === 0) {
        window.clearInterval(timer)
        onExpired?.()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [deadline, onExpired])

  if (!deadline) return null
  const totalSeconds = Math.ceil(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const value = `${hours ? `${String(hours).padStart(2, '0')}:` : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return (
    <div className={`flex items-center gap-2 rounded-xl border font-bold ${remaining ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-700'} ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
      <Clock3 size={compact ? 15 : 18} />
      {remaining ? <>Giữ chỗ còn <span className="font-black tabular-nums">{value}</span></> : 'Đã hết thời gian thanh toán'}
    </div>
  )
}
