import { lazy, Suspense, useEffect, type ReactElement } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './NhaCungCapXacThuc'
import { useAuth } from './ngu-canh-xac-thuc'
import Layout from './components/BoCuc'

const AuthPage = lazy(() => import('./pages/TrangXacThuc'))
const BookingsPage = lazy(() => import('./pages/TrangDonDat'))
const CheckoutPage = lazy(() => import('./pages/TrangThanhToan'))
const HomePage = lazy(() => import('./pages/TrangChu'))
const InformationPage = lazy(() => import('./pages/TrangThongTin'))
const TourDetailPage = lazy(() => import('./pages/TrangChiTietTour'))
const ToursPage = lazy(() => import('./pages/TrangDanhSachTour'))
const ProfilePage = lazy(() => import('./pages/TrangHoSo'))
const PasswordRecoveryPage = lazy(() => import('./pages/TrangQuenMatKhau'))
const SavedToursPage = lazy(() => import('./pages/TrangTourDaLuu'))

function PageLoader() {
  return <div className="grid min-h-[65vh] place-items-center"><div className="text-center"><span className="mx-auto block size-11 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" /><p className="mt-4 text-sm font-bold text-slate-400">Đang chuẩn bị hành trình...</p></div></div>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function NotFound() {
  return (
    <section className="grid min-h-[65vh] place-items-center px-4 py-16 text-center">
      <div className="surface-card w-full max-w-lg rounded-3xl p-10">
        <p className="text-8xl font-black tracking-tighter text-emerald-100">404</p>
        <h1 className="mt-2 text-2xl font-black">Có vẻ bạn đã đi lạc</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Trang này không tồn tại hoặc đã được chuyển sang một hành trình khác.</p>
        <Link to="/" className="mt-7 inline-flex h-12 items-center rounded-full bg-brand-700 px-6 font-extrabold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-brand-800">Về trang chủ</Link>
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
              <Route path="information" element={<InformationPage />} />
              <Route path="tours" element={<ToursPage />} />
              <Route path="tours/:id" element={<TourDetailPage />} />
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
              <Route path="forgot-password" element={<PasswordRecoveryPage />} />
              <Route path="reset-password" element={<PasswordRecoveryPage />} />
              <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="saved-tours" element={<SavedToursPage />} />
              <Route path="booking/:tourId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
              <Route path="my-bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
