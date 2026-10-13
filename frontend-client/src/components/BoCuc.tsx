import { ArrowUpRight, ChevronDown, Compass, Headphones, LogIn, LogOut, Mail, MapPin, Menu, Phone, ReceiptText, ShieldCheck, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, type NavLinkRenderProps } from 'react-router-dom'
import { useAuth } from '../ngu-canh-xac-thuc'

const navClass = ({ isActive }: NavLinkRenderProps) =>
  `relative rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'}`

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Lê Việt Travel - Trang chủ">
      <span className={`relative grid size-11 place-items-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${light ? 'bg-white text-brand-700 shadow-emerald-950/20' : 'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-emerald-900/20'}`}>
        <Compass size={24} strokeWidth={2.3} />
        <span className={`absolute -right-1 -top-1 size-3 rounded-full border-2 ${light ? 'border-brand-800 bg-orange-400' : 'border-white bg-orange-400'}`} />
      </span>
      <span className={`leading-none ${light ? 'text-white' : 'text-ink'}`}>
        <span className="block text-[1.08rem] font-black tracking-tight">Lê Việt</span>
        <span className={`mt-1 block text-[.63rem] font-bold uppercase tracking-[.24em] ${light ? 'text-emerald-100/70' : 'text-brand-600'}`}>Travel & Tours</span>
      </span>
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

  const links = (
    <>
      <NavLink to="/" className={navClass} onClick={() => { setMobileOpen(false); setAccountOpen(false) }}>Trang chủ</NavLink>
      <NavLink to="/tours" className={navClass} onClick={() => { setMobileOpen(false); setAccountOpen(false) }}>Tour du lịch</NavLink>
      <NavLink to="/saved-tours" className={navClass} onClick={() => { setMobileOpen(false); setAccountOpen(false) }}>Tour đã lưu</NavLink>
      {user && <NavLink to="/my-bookings" className={navClass} onClick={() => { setMobileOpen(false); setAccountOpen(false) }}>Đơn của tôi</NavLink>}
    </>
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-[0_8px_30px_-24px_rgba(15,64,51,.45)] backdrop-blur-xl">
        <div className="hidden border-b border-emerald-900/10 bg-brand-900 text-emerald-50 lg:block">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-8 text-[11px] font-semibold tracking-wide">
            <p className="flex items-center gap-2 text-emerald-100/80"><ShieldCheck size={13} /> Đặt tour minh bạch · Hỗ trợ tận tâm · Thanh toán an toàn</p>
            <div className="flex items-center gap-5 text-emerald-50/90"><a href="mailto:hello@leviettravel.vn" className="flex items-center gap-1.5 hover:text-white"><Mail size={12} /> hello@leviettravel.vn</a><span className="flex items-center gap-1.5"><MapPin size={12} /> Đà Nẵng, Việt Nam</span></div>
          </div>
        </div>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-1 md:flex">{links}</nav>
          <div className="hidden items-center gap-3 md:flex">
            <a href="tel:19001234" className="group flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-brand-700">
              <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-700 transition group-hover:bg-brand-100"><Phone size={15} /></span>
              <span className="hidden xl:block"><small className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Hotline 24/7</small>1900 1234</span>
            </a>
            {user ? (
              <div className="relative">
                <button type="button" onClick={() => setAccountOpen((value) => !value)} className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-bold shadow-sm transition hover:border-brand-300 hover:shadow-md">
                  <span className="grid size-7 place-items-center rounded-full bg-brand-100 text-brand-700"><UserRound size={15} /></span><span className="max-w-32 truncate">{user.fullName}</span><ChevronDown size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div className="animate-fade-in absolute right-0 top-14 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-emerald-950/10">
                    <div className="border-b border-slate-100 px-3 py-2.5"><p className="truncate text-sm font-extrabold">{user.fullName}</p><p className="mt-0.5 truncate text-xs text-slate-400">{user.email}</p></div>
                    <Link to="/my-bookings" className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-brand-50 hover:text-brand-700"><ReceiptText size={16} /> Đơn của tôi</Link>
                    <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-brand-50 hover:text-brand-700"><UserRound size={16} /> Hồ sơ & bảo mật</Link>
                    <button type="button" onClick={signOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut size={16} /> Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" state={{ from: location }} className="flex h-11 items-center gap-2 rounded-full bg-brand-700 px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl"><LogIn size={17} /> Đăng nhập</Link>
            )}
          </div>
          <button type="button" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setMobileOpen((value) => !value)} className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm md:hidden">
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="animate-fade-in border-t border-slate-100 bg-white px-4 py-5 shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">{links}</nav>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <a href="tel:19001234" className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600"><Phone size={17} className="text-brand-600" /> Hotline 1900 1234</a>
              {user
                ? <button type="button" onClick={signOut} className="flex items-center gap-2 text-sm font-bold text-rose-700"><LogOut size={17} /> Đăng xuất</button>
                : <Link to="/login" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-white"><LogIn size={17} /> Đăng nhập / Đăng ký</Link>}
            </div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="relative overflow-hidden bg-[#092f26] text-emerald-50">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-emerald-400/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-between gap-7 rounded-3xl border border-white/10 bg-white/[.055] p-6 shadow-2xl backdrop-blur sm:p-8 lg:flex-row lg:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-emerald-300">Sẵn sàng lên đường?</p><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Tìm hành trình khiến bạn nhớ mãi.</h2><p className="mt-2 text-sm text-emerald-100/65">30+ tour chọn lọc, lịch trình rõ ràng và đội ngũ hỗ trợ xuyên suốt.</p></div>
            <Link to="/tours" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-extrabold text-brand-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50">Khám phá ngay <ArrowUpRight size={18} /></Link>
          </div>
          <div className="grid gap-10 pb-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.15fr]">
            <div><Brand light /><p className="mt-5 max-w-sm text-sm leading-7 text-emerald-100/65">Chúng tôi thiết kế những hành trình vừa đủ trải nghiệm, rõ ràng từng chi tiết và tận tâm trong mọi điểm chạm.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-emerald-100/70"><ShieldCheck size={15} className="text-emerald-300" /> Đồng hành an tâm trên mọi hành trình</div></div>
            <div><p className="font-extrabold text-white">Khám phá</p><div className="mt-5 flex flex-col gap-3 text-sm text-emerald-100/65"><Link className="transition hover:translate-x-1 hover:text-white" to="/tours">Tất cả tour</Link><Link className="transition hover:translate-x-1 hover:text-white" to="/my-bookings">Đơn của tôi</Link><Link className="transition hover:translate-x-1 hover:text-white" to="/register">Tạo tài khoản</Link></div></div>
            <div><p className="font-extrabold text-white">Thông tin</p><div className="mt-5 flex flex-col gap-3 text-sm text-emerald-100/65"><span>Về Lê Việt Travel</span><span>Chính sách đặt tour</span><span>Điều khoản sử dụng</span></div></div>
            <div><p className="font-extrabold text-white">Liên hệ</p><div className="mt-5 space-y-4 text-sm text-emerald-100/65"><a href="tel:19001234" className="flex items-center gap-3 hover:text-white"><Headphones size={17} className="text-emerald-300" /> 1900 1234</a><a href="mailto:hello@leviettravel.vn" className="flex items-center gap-3 hover:text-white"><Mail size={17} className="text-emerald-300" /> hello@leviettravel.vn</a><p className="flex items-center gap-3"><MapPin size={17} className="text-emerald-300" /> Đà Nẵng, Việt Nam</p></div></div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-emerald-100/45 sm:flex-row sm:px-6 lg:px-8"><p>© 2026 Lê Việt Travel. Đi để nhớ.</p><p>Thiết kế cho những hành trình Việt Nam.</p></div></div>
      </footer>
    </div>
  )
}
