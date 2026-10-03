import { useEffect, useMemo, useState } from 'react'
import { api, dataOf } from './api'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'leviet_client_auth'
const readStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { user: null, token: null }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { user: null, token: null }
  }
}

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  useEffect(() => {
    const clear = () => setAuth({ user: null, token: null })
    window.addEventListener('leviet:unauthorized', clear)
    return () => window.removeEventListener('leviet:unauthorized', clear)
  }, [])

  const persist = (next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setAuth(next)
    return next
  }

  const value = useMemo(() => ({
    ...auth,
    login: async (credentials) => persist(dataOf(await api.post('/auth/login', credentials))),
    register: async (form) => persist(dataOf(await api.post('/auth/register', form))),
    logout: () => {
      localStorage.removeItem(STORAGE_KEY)
      setAuth({ user: null, token: null })
    },
  }), [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
