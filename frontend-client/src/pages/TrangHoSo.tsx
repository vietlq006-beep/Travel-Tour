import { BadgeCheck, KeyRound, MailCheck, Phone, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert } from '../components/DungChung'
import { api, apiError, dataOf } from '../dich-vu-api'
import { useAuth } from '../ngu-canh-xac-thuc'
import type { ApiEnvelope } from '../types/du-lieu'

interface VerificationResult { verified?: boolean; developmentToken?: string; delivered?: boolean }

export default function ProfilePage() {
  const auth = useAuth()
  const [form, setForm] = useState({ fullName: auth.user?.fullName || '', phoneNumber: auth.user?.phoneNumber || '', oldPassword: '', newPassword: '' })
  const [emailCode, setEmailCode] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const updateProfile = async (event: FormEvent) => {
    event.preventDefault(); setBusy('profile'); setError('')
    try {
      await api.put('/auth/profile', { fullName: form.fullName, phoneNumber: form.phoneNumber, ...(form.newPassword && { oldPassword: form.oldPassword, newPassword: form.newPassword }) })
      await auth.refresh(); setForm((current) => ({ ...current, oldPassword: '', newPassword: '' })); setNotice('Đã cập nhật hồ sơ.')
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy('') }
  }

  const requestCode = async (kind: 'email' | 'phone') => {
    setBusy(kind); setError('')
    try {
      const payload = kind === 'phone' ? { phoneNumber: form.phoneNumber } : undefined
      const result = dataOf<VerificationResult>(await api.post<ApiEnvelope<VerificationResult>>(`/auth/verification/${kind}/request`, payload))
      if (result.developmentToken) {
        if (kind === 'email') setEmailCode(result.developmentToken)
        else setPhoneCode(result.developmentToken)
      }
      setNotice(`Đã gửi mã xác thực ${kind === 'email' ? 'email' : 'số điện thoại'}.`)
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy('') }
  }

  const confirmCode = async (kind: 'email' | 'phone') => {
    const token = kind === 'email' ? emailCode : phoneCode
    setBusy(kind); setError('')
    try {
      await api.post(`/auth/verification/${kind}/confirm`, { token })
      await auth.refresh(); setNotice('Xác thực thành công.')
      if (kind === 'email') setEmailCode('')
      else setPhoneCode('')
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy('') }
  }

  const field = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-brand-500 focus:bg-white'
  return <section className="min-h-[70vh] bg-slate-50 py-12 sm:py-16"><div className="mx-auto max-w-4xl px-4"><p className="section-kicker">Tài khoản</p><h1 className="mt-3 text-3xl font-black">Hồ sơ & bảo mật</h1>{notice && <div className="mt-5"><Alert tone="success">{notice}</Alert></div>}{error && <div className="mt-5"><Alert>{error}</Alert></div>}<div className="mt-8 grid gap-6 lg:grid-cols-2"><form onSubmit={updateProfile} className="surface-card rounded-3xl p-6"><h2 className="flex items-center gap-2 text-lg font-black"><Save className="text-brand-600" /> Thông tin cá nhân</h2><div className="mt-5 space-y-4"><label className="block"><span className="mb-2 block text-sm font-bold">Họ tên</span><input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className={field} /></label><label className="block"><span className="mb-2 block text-sm font-bold">Số điện thoại</span><input value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} className={field} /></label><div className="border-t border-slate-100 pt-4"><p className="flex items-center gap-2 font-bold"><KeyRound size={17} /> Đổi mật khẩu</p><input type="password" value={form.oldPassword} onChange={(event) => setForm({ ...form, oldPassword: event.target.value })} placeholder="Mật khẩu hiện tại" className={`${field} mt-3`} /><input type="password" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} placeholder="Mật khẩu mới" className={`${field} mt-3`} /></div><button disabled={busy === 'profile'} className="h-12 w-full rounded-xl bg-brand-700 font-bold text-white disabled:opacity-60">Lưu thay đổi</button></div></form><div className="surface-card rounded-3xl p-6"><h2 className="flex items-center gap-2 text-lg font-black"><BadgeCheck className="text-brand-600" /> Xác thực liên hệ</h2><div className="mt-5 space-y-5"><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="flex items-center gap-2 font-bold"><MailCheck size={17} /> Email</p><p className="mt-1 text-sm text-slate-500">{auth.user?.email}</p></div>{auth.user?.emailVerifiedAt ? <span className="text-sm font-bold text-emerald-600">Đã xác thực</span> : <button type="button" onClick={() => void requestCode('email')} className="text-sm font-bold text-brand-700">Gửi mã</button>}</div>{!auth.user?.emailVerifiedAt && <div className="mt-3 flex gap-2"><input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} placeholder="Mã xác thực" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3" /><button type="button" disabled={!emailCode} onClick={() => void confirmCode('email')} className="rounded-xl bg-brand-700 px-4 text-sm font-bold text-white disabled:opacity-40">Xác nhận</button></div>}</div><div className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="flex items-center gap-2 font-bold"><Phone size={17} /> Số điện thoại</p><p className="mt-1 text-sm text-slate-500">{form.phoneNumber || 'Chưa cập nhật'}</p></div>{auth.user?.phoneVerifiedAt ? <span className="text-sm font-bold text-emerald-600">Đã xác thực</span> : <button type="button" disabled={!form.phoneNumber} onClick={() => void requestCode('phone')} className="text-sm font-bold text-brand-700 disabled:opacity-40">Gửi OTP</button>}</div>{!auth.user?.phoneVerifiedAt && <div className="mt-3 flex gap-2"><input value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} placeholder="OTP 6 số" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3" /><button type="button" disabled={!phoneCode} onClick={() => void confirmCode('phone')} className="rounded-xl bg-brand-700 px-4 text-sm font-bold text-white disabled:opacity-40">Xác nhận</button></div>}</div></div></div></div></div></section>
}
