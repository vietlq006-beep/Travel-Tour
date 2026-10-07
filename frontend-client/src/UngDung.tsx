import { lazy, Suspense, useEffect, type ReactElement } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './NhaCungCapXacThuc'
import { useAuth } from './ngu-canh-xac-thuc'
import Layout from './components/BoCuc'

const AuthPage = lazy(() => import('./pages/TrangXacThuc'))
const BookingsPage = lazy(() => import('./pages/TrangDonDat'))
const CheckoutPage = lazy(() => import('./pages/TrangThanhToan'))
const HomePage = lazy(() => import('./pages/TrangChu'))
const PaymentReturnPage = lazy(() => import('./pages/TrangKetQuaThanhToan'))
const TourDetailPage = lazy(() => import('./pages/TrangChiTietTour'))
const ToursPage = lazy(() => import('./pages/TrangDanhSachTour'))

function PageLoader() {
  return <div className="min-h-[65vh] animate-pulse bg-slate-100" />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname])
  return null
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function NotFound() {
  return (
    <section className="grid min-h-[65vh] place-items-center px-4 text-center">
      <div>
        <p className="text-7xl font-black text-emerald-100">404</p>
        <h1 className="mt-2 text-2xl font-black">Trang này không tồn tại</h1>
        <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-md bg-brand-700 px-5 font-bold text-white">Về trang chủ</Link>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="tours" element={<ToursPage />} />
              <Route path="tours/:id" element={<TourDetailPage />} />
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
              <Route path="booking/:tourId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
              <Route path="my-bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
              <Route path="payment-result" element={<RequireAuth><PaymentReturnPage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
