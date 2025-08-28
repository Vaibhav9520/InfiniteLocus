import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'canteen_user_id'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) {
      setUserId(existing)
    } else {
      const generated = `user_${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(STORAGE_KEY, generated)
      setUserId(generated)
    }
  }, [])

  const value = useMemo(() => ({ userId }), [userId])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

