import { useCallback, useEffect, useState } from 'react'
import type { AdminSession } from '../types'
import { clearAdminSession, readAdminSession, writeAdminSession } from '../utils/storage'

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(readAdminSession)

  useEffect(() => {
    const clear = () => setSession(null)
    window.addEventListener('leviet:admin-unauthorized', clear)
    return () => window.removeEventListener('leviet:admin-unauthorized', clear)
  }, [])

  const login = useCallback((nextSession: AdminSession) => {
    writeAdminSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearAdminSession()
    setSession(null)
  }, [])

  return { session, login, logout }
}
