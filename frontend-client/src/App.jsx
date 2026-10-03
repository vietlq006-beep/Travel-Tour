import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './auth'
import { useAuth } from './authContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import BookingsPage from './pages/BookingsPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import PaymentReturnPage from './pages/PaymentReturnPage'
import TourDetailPage from './pages/TourDetailPage'
import ToursPage from './pages/ToursPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname])
  return null
}

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

function NotFound() {
  return <section className="grid min-h-[65vh] place-items-center px-4 text-center"><div><p className="text-7xl font-black text-emerald-100">404</p><h1 className="mt-2 text-2xl font-black">Trang này không tồn tại</h1><a href="/" className="mt-5 inline-flex h-11 items-center rounded-md bg-brand-700 px-5 font-bold text-white">Về trang chủ</a></div></section>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
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
      </AuthProvider>
    </BrowserRouter>
  )
}
