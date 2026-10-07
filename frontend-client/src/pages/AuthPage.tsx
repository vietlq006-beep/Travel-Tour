import { ArrowRight, Compass, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiError } from '../api'
import { useAuth } from '../authContext'
import { Alert } from '../components/Shared'
import type { RegisterForm } from '../types'

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
    <section className="grid min-h-[calc(100vh-72px)] bg-white lg:grid-cols-2">
      <div className="hidden bg-[url('https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center lg:block">
        <div className="flex h-full items-end bg-gradient-to-t from-emerald-950/85 via-emerald-950/10 to-transparent p-12">
          <div className="max-w-lg text-white"><Compass size={36} /><p className="mt-5 text-3xl font-black leading-tight">Mỗi hành trình đáng nhớ đều bắt đầu từ một bước nhỏ.</p><p className="mt-3 text-emerald-100/80">Đăng nhập để giữ chỗ, thanh toán và theo dõi mọi chuyến đi của bạn.</p></div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm font-bold text-brand-700">← Về trang chủ</Link>
          <h1 className="mt-8 text-3xl font-black">{isRegister ? 'Tạo tài khoản' : 'Chào bạn trở lại'}</h1>
          <p className="mt-2 text-slate-500">{isRegister ? 'Chỉ mất một phút để bắt đầu hành trình.' : 'Đăng nhập để tiếp tục chuyến đi của bạn.'}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && <Alert>{error}</Alert>}
            {isRegister && <>
              <label className="block"><span className="mb-1.5 block text-sm font-bold">Họ và tên</span><input required minLength={2} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="h-12 w-full rounded border border-slate-300 px-3 outline-none focus:border-brand-600" placeholder="Nguyễn Văn An" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-bold">Số điện thoại</span><input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className="h-12 w-full rounded border border-slate-300 px-3 outline-none focus:border-brand-600" placeholder="0901234567" /></label>
            </>}
            <label className="block"><span className="mb-1.5 block text-sm font-bold">Email</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-12 w-full rounded border border-slate-300 px-3 outline-none focus:border-brand-600" placeholder="ban@example.com" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-bold">Mật khẩu</span><span className="relative block"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-12 w-full rounded border border-slate-300 px-3 pr-12 outline-none focus:border-brand-600" placeholder={isRegister ? 'Ít nhất 8 ký tự, có hoa, thường và số' : 'Mật khẩu'} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 grid size-12 place-items-center text-slate-400" aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-700 font-extrabold text-white hover:bg-brand-800 disabled:opacity-60">{loading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'} <ArrowRight size={18} /></button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <Link to={isRegister ? '/login' : '/register'} className="font-bold text-brand-700">{isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}</Link></p>
        </div>
      </div>
    </section>
  )
}
