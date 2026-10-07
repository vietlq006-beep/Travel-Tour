import { ADMIN_AUTH_KEY } from '../constants/xac-thuc'
import type { AdminSession } from '../types/du-lieu'

export function readAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
  } catch {
    localStorage.removeItem(ADMIN_AUTH_KEY)
    return null
  }
}

export function writeAdminSession(session: AdminSession): void {
  localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session))
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY)
}
