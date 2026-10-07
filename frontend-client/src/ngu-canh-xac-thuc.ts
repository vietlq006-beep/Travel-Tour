import { createContext, useContext } from 'react'
import type { AuthContextValue } from './types/du-lieu'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  return context
}
