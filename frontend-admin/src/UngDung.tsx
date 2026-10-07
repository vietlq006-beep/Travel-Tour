import { App as AntApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './ung-dung.css'
import { AdminLayout } from './components/layout/BoCucQuanTri'
import { ProtectedRoute } from './components/routing/TuyenDuongBaoVe'
import { useAdminSession } from './hooks/usePhienQuanTri'

const LoginPage = lazy(async () => ({ default: (await import('./pages/TrangDangNhap')).LoginPage }))
const DashboardPage = lazy(async () => ({ default: (await import('./pages/TrangTongQuan')).DashboardPage }))
const CatalogPage = lazy(async () => ({ default: (await import('./pages/TrangDanhMucTour')).CatalogPage }))
const DeparturesPage = lazy(async () => ({ default: (await import('./pages/TrangKhoiHanh')).DeparturesPage }))
const PaymentsPage = lazy(async () => ({ default: (await import('./pages/TrangThanhToan')).PaymentsPage }))
const ReportsPage = lazy(async () => ({ default: (await import('./pages/TrangBaoCao')).ReportsPage }))

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
