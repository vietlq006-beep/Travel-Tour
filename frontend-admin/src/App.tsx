import { App as AntApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminLayout } from './components/layout/AdminLayout'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { useAdminSession } from './hooks/useAdminSession'

const LoginPage = lazy(async () => ({ default: (await import('./pages/LoginPage')).LoginPage }))
const DashboardPage = lazy(async () => ({ default: (await import('./pages/DashboardPage')).DashboardPage }))
const CatalogPage = lazy(async () => ({ default: (await import('./pages/CatalogPage')).CatalogPage }))
const DeparturesPage = lazy(async () => ({ default: (await import('./pages/DeparturesPage')).DeparturesPage }))
const PaymentsPage = lazy(async () => ({ default: (await import('./pages/PaymentsPage')).PaymentsPage }))
const ReportsPage = lazy(async () => ({ default: (await import('./pages/ReportsPage')).ReportsPage }))

function PageLoader() {
  return <div className="route-loader">Đang tải...</div>
}

export default function App() {
  const { session, login, logout } = useAdminSession()

  return (
    <ConfigProvider theme={{ token: {
      colorPrimary: '#0f766e',
      borderRadius: 8,
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    } }}>
      <AntApp>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage onLogin={login} />} />
              <Route element={<ProtectedRoute session={session} />}>
                {session && (
                  <Route element={<AdminLayout session={session} onLogout={logout} />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="catalog" element={<CatalogPage />} />
                    <Route path="departures" element={<DeparturesPage />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                  </Route>
                )}
              </Route>
              <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}
