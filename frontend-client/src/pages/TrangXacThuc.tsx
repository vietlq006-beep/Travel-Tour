import { ArrowLeft, ArrowRight, Compass, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiError } from '../dich-vu-api'
import { useAuth } from '../ngu-canh-xac-thuc'
import { Alert } from '../components/DungChung'
import type { RegisterForm } from '../types/du-lieu'

interface AuthPageProps {
  mode: 'login' | 'register'
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register'
  const [form, setForm] = useState<RegisterForm>({ fullName: '', email: '', phoneNumber: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (auth.user) return <Navigate to="/" replace />
  const routeState = location.state as { from?: { pathname?: string } } | null
  const destination = routeState?.from?.pathname || '/'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isRegister) await auth.register(form)
      else await auth.login({ email: form.email, password: form.password })
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(apiError(requestError, isRegister ? 'Không thể đăng ký.' : 'Không thể đăng nhập.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-112px)] bg-[#f4f8f6] lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden overflow-hidden bg-[url('https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center lg:block">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/25 to-emerald-950/10" />
        <div className="relative flex h-full items-end p-12 xl:p-16">
          <div className="max-w-xl text-white"><span className="grid size-14 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur"><Compass size={29} /></span><p className="mt-7 text-4xl font-black leading-tight tracking-tight">Mỗi hành trình đáng nhớ đều bắt đầu từ một bước nhỏ.</p><p className="mt-4 max-w-lg leading-7 text-emerald-100/75">Đăng nhập để giữ chỗ, thanh toán VietQR và theo dõi mọi chuyến đi của bạn tại một nơi.</p><p className="mt-7 flex items-center gap-2 text-sm font-semibold text-emerald-100/75"><ShieldCheck size={17} className="text-emerald-300" /> Thông tin của bạn luôn được bảo mật</p></div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-14 sm:px-8 lg:px-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(15,64,51,.45)] sm:p-9">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-700"><ArrowLeft size={16} /> Về trang chủ</Link>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[.18em] text-brand-600">Lê Việt Travel</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{isRegister ? 'Tạo tài khoản' : 'Chào bạn trở lại'}</h1>
          <p className="mt-2 leading-6 text-slate-500">{isRegister ? 'Chỉ mất một phút để bắt đầu hành trình.' : 'Đăng nhập để tiếp tục chuyến đi của bạn.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && <Alert>{error}</Alert>}
            {isRegister && <>
              <label className="block"><span className="mb-2 block text-sm font-extrabold">Họ và tên</span><input required minLength={2} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder="Nguyễn Văn An" /></label>
              <label className="block"><span className="mb-2 block text-sm font-extrabold">Số điện thoại</span><input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder="0901234567" /></label>
            </>}
            <label className="block"><span className="mb-2 block text-sm font-extrabold">Email</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder="ban@example.com" /></label>
            <label className="block"><span className="mb-2 block text-sm font-extrabold">Mật khẩu</span><span className="relative block"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 pr-12 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder={isRegister ? 'Ít nhất 8 ký tự, có hoa, thường và số' : 'Mật khẩu'} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 grid size-12 place-items-center text-slate-400 transition hover:text-brand-700" aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {!isRegister && <div className="text-right"><Link to="/forgot-password" className="text-sm font-bold text-brand-700">Quên mật khẩu?</Link></div>}
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 font-extrabold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl disabled:opacity-60">{loading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'} <ArrowRight size={18} /></button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link to={isRegister ? '/login' : '/register'} className="font-bold text-brand-700">{isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}</Link></p>
        </div>
      </div>
    </section>
  )
}
