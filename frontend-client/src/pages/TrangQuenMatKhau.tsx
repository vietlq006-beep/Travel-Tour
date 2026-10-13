import { ArrowLeft, KeyRound, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '../components/DungChung'
import { api, apiError, dataOf } from '../dich-vu-api'
import type { ApiEnvelope } from '../types/du-lieu'

interface RecoveryResult { accepted?: boolean; delivered?: boolean; developmentToken?: string; expiresAt?: string }

export default function PasswordRecoveryPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState(params.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [requested, setRequested] = useState(Boolean(params.get('token')))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const requestReset = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const result = dataOf<RecoveryResult>(await api.post<ApiEnvelope<RecoveryResult>>('/auth/forgot-password', { email }))
      setRequested(true)
      if (result.developmentToken) setToken(result.developmentToken)
      setNotice('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.')
    } catch (requestError) { setError(apiError(requestError)) } finally { setLoading(false) }
  }

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      setNotice('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.')
      setToken(''); setNewPassword('')
    } catch (requestError) { setError(apiError(requestError)) } finally { setLoading(false) }
  }

  return <section className="min-h-[70vh] bg-slate-50 py-16"><div className="mx-auto max-w-lg px-4"><div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-9"><Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-brand-700"><ArrowLeft size={16} /> Quay lại đăng nhập</Link><span className="mt-7 grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">{requested ? <KeyRound /> : <Mail />}</span><h1 className="mt-4 text-3xl font-black">{requested ? 'Tạo mật khẩu mới' : 'Quên mật khẩu'}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{requested ? 'Nhập mã trong email và mật khẩu mới đủ mạnh.' : 'Nhập email đã đăng ký để nhận mã bảo mật.'}</p>{notice && <div className="mt-5"><Alert tone="success">{notice}</Alert></div>}{error && <div className="mt-5"><Alert>{error}</Alert></div>}{!requested ? <form onSubmit={requestReset} className="mt-6 space-y-4"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand-500" /><button disabled={loading} className="h-12 w-full rounded-xl bg-brand-700 font-bold text-white disabled:opacity-60">Gửi hướng dẫn</button></form> : <form onSubmit={resetPassword} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-sm font-bold">Mã đặt lại mật khẩu</span><input required value={token} onChange={(event) => setToken(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 font-mono outline-none focus:border-brand-500" /></label><label className="block"><span className="mb-2 block text-sm font-bold">Mật khẩu mới</span><input required type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Có chữ hoa, chữ thường và chữ số" className="h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-brand-500" /></label><button disabled={loading} className="h-12 w-full rounded-xl bg-brand-700 font-bold text-white disabled:opacity-60">Đặt lại mật khẩu</button><button type="button" onClick={() => setRequested(false)} className="w-full text-sm font-bold text-slate-500">Gửi lại mã</button></form>}</div></div></section>
}
