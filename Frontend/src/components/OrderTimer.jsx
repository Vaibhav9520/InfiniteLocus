import { useEffect, useState } from 'react'

export default function OrderTimer({ expiresAt, onExpired }) {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, new Date(expiresAt).getTime() - Date.now()))

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemainingMs(next)
      if (next === 0) onExpired?.()
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpired])

  const seconds = Math.floor(remainingMs / 1000) % 60
  const minutes = Math.floor(remainingMs / 1000 / 60)
  const pad = (n) => String(n).padStart(2, '0')

  return <span>{pad(minutes)}:{pad(seconds)}</span>
}

