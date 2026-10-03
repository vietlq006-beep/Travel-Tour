import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Compass, LogIn, LogOut, Menu, Phone, ReceiptText, UserRound, X } from 'lucide-react'
import { useAuth } from '../authContext'

const navClass = ({ isActive }) => `text-sm font-semibold transition ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`

function Brand({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Lê Việt Travel - Trang chủ">
      <span className={`grid size-9 place-items-center rounded-md ${light ? 'bg-white text-brand-700' : 'bg-brand-700 text-white'}`}>
        <Compass size={21} strokeWidth={2.2} />
      </span>
      <span className={`text-lg font-extrabold ${light ? 'text-white' : 'text-ink'}`}>Lê Việt <span className="font-medium">Travel</span></span>
    </Link>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const signOut = () => {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  const links = <>
    <NavLink to="/" className={navClass} onClick={() => setMobileOpen(false)}>Trang chủ</NavLink>
    <NavLink to="/tours" className={navClass} onClick={() => setMobileOpen(false)}>Tour du lịch</NavLink>
    {user && <NavLink to="/my-bookings" className={navClass} onClick={() => setMobileOpen(false)}>Đơn của tôi</NavLink>}
  </>

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex">{links}</nav>
          <div className="hidden items-center gap-3 md:flex">
            <a href="tel:19001234" className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Phone size={16} /> 1900 1234</a>
            {user ? (
              <div className="relative">
                <button type="button" onClick={() => setAccountOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold hover:border-brand-600">
                  <UserRound size={17} /> <span className="max-w-32 truncate">{user.fullName}</span><ChevronDown size={14} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl">
                    <Link to="/my-bookings" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-brand-50"><ReceiptText size={16} /> Đơn của tôi</Link>
                    <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"><LogOut size={16} /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" state={{ from: location }} className="flex h-10 items-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800"><LogIn size={17} /> Đăng nhập</Link>
            )}
          </div>
          <button type="button" aria-label="Mở menu" onClick={() => setMobileOpen((value) => !value)} className="grid size-10 place-items-center rounded-md border border-slate-200 md:hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-4">{links}</nav>
            <div className="mt-4 border-t border-slate-100 pt-4">
              {user ? <button type="button" onClick={signOut} className="flex items-center gap-2 text-sm font-semibold text-rose-700"><LogOut size={17} /> Đăng xuất</button>
                : <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-semibold text-brand-700"><LogIn size={17} /> Đăng nhập / Đăng ký</Link>}
            </div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-[#123c32] text-emerald-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
          <div><Brand light /><p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/75">Những hành trình được chọn lọc kỹ, lịch trình rõ ràng và hỗ trợ tận tâm từ lúc tìm tour đến khi trở về.</p></div>
          <div><p className="font-bold text-white">Khám phá</p><div className="mt-4 flex flex-col gap-2 text-sm text-emerald-100/75"><Link to="/tours">Tất cả tour</Link><Link to="/my-bookings">Đơn của tôi</Link></div></div>
          <div><p className="font-bold text-white">Liên hệ</p><div className="mt-4 space-y-2 text-sm text-emerald-100/75"><p>Hotline: 1900 1234</p><p>hello@leviettravel.vn</p><p>Đà Nẵng, Việt Nam</p></div></div>
        </div>
        <div className="border-t border-emerald-800/70 py-5 text-center text-xs text-emerald-100/55">© 2026 Lê Việt Travel. Đi để nhớ.</div>
      </footer>
    </div>
  )
}
