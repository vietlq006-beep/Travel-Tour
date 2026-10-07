import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { AdminSession } from '../../types/du-lieu'

interface ProtectedRouteProps {
  session: AdminSession | null
}

export function ProtectedRoute({ session }: ProtectedRouteProps) {
  const location = useLocation()

  if (!session?.token || session.user.role !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
