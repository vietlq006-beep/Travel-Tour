import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, dataOf } from './dich-vu-api'
import { AuthContext } from './ngu-canh-xac-thuc'
import type { ApiEnvelope, AuthContextValue, AuthState, LoginCredentials, RegisterForm } from './types/du-lieu'

const STORAGE_KEY = 'leviet_client_auth'
const EMPTY_AUTH: AuthState = { user: null, token: null }

function readStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : EMPTY_AUTH
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return EMPTY_AUTH
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState>(readStoredAuth)

  useEffect(() => {
    const clear = () => setAuth(EMPTY_AUTH)
    window.addEventListener('leviet:unauthorized', clear)
    return () => window.removeEventListener('leviet:unauthorized', clear)
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const persist = (next: AuthState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setAuth(next)
      return next
    }

    return {
      ...auth,
      login: async (credentials: LoginCredentials) => persist(dataOf<AuthState>(await api.post<ApiEnvelope<AuthState>>('/auth/login', credentials))),
      register: async (form: RegisterForm) => persist(dataOf<AuthState>(await api.post<ApiEnvelope<AuthState>>('/auth/register', form))),
      logout: () => {
        localStorage.removeItem(STORAGE_KEY)
        setAuth(EMPTY_AUTH)
      },
    }
  }, [auth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
