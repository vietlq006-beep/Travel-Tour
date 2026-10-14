import { BadgeCheck, CircleCheckBig, KeyRound, Mail, Phone, Save, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Alert } from '../components/DungChung'
import { api, apiError } from '../dich-vu-api'
import { useAuth } from '../ngu-canh-xac-thuc'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const vietnamPhonePattern = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/

export default function ProfilePage() {
  const auth = useAuth()
  const [profile, setProfile] = useState({
    fullName: auth.user?.fullName || '',
    oldPassword: '',
    newPassword: '',
  })
  const [contact, setContact] = useState({
    email: auth.user?.email || '',
    phoneNumber: auth.user?.phoneNumber || '',
    currentPassword: '',
  })
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const updateProfile = async (event: FormEvent) => {
    event.preventDefault()
    setBusy('profile')
    setError('')
    setNotice('')
    try {
      await api.put('/auth/profile', {
        fullName: profile.fullName,
        ...(profile.newPassword && { oldPassword: profile.oldPassword, newPassword: profile.newPassword }),
      })
      await auth.refresh()
      setProfile((current) => ({ ...current, oldPassword: '', newPassword: '' }))
      setNotice('Đã cập nhật hồ sơ.')
    } catch (requestError) {
      setError(apiError(requestError))
    } finally {
      setBusy('')
    }
  }

  const confirmContact = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const email = contact.email.trim().toLowerCase()
    const phoneNumber = contact.phoneNumber.trim()
    if (!emailPattern.test(email)) {
      setError('Email không đúng định dạng. Ví dụ: tenban@gmail.com.')
      return
    }
    if (!vietnamPhonePattern.test(phoneNumber)) {
      setError('Số điện thoại phải là số di động Việt Nam hợp lệ, bắt đầu bằng 0 hoặc +84.')
      return
    }

    setBusy('contact')
    try {
      const result = await auth.confirmContact({ email, phoneNumber, currentPassword: contact.currentPassword })
      setContact({
        email: result.user?.email || email,
        phoneNumber: result.user?.phoneNumber || phoneNumber,
        currentPassword: '',
      })
      setNotice('Đã xác nhận và cập nhật thông tin liên hệ bằng mật khẩu tài khoản.')
    } catch (requestError) {
      setError(apiError(requestError))
    } finally {
      setBusy('')
    }
  }

  const field = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50'

  return (
    <section className="min-h-[70vh] bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        <p className="section-kicker">Tài khoản</p>
        <h1 className="mt-3 text-3xl font-black">Hồ sơ & bảo mật</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Quản lý thông tin cá nhân và xác nhận kênh liên hệ dùng cho đơn đặt tour.</p>

        {notice && <div className="mt-5"><Alert tone="success">{notice}</Alert></div>}
        {error && <div className="mt-5"><Alert>{error}</Alert></div>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={updateProfile} className="surface-card rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-black"><Save className="text-brand-600" /> Thông tin cá nhân</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Họ tên</span>
                <input required minLength={2} maxLength={100} value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} className={field} />
              </label>
              <div className="border-t border-slate-100 pt-4">
                <p className="flex items-center gap-2 font-bold"><KeyRound size={17} /> Đổi mật khẩu</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Chỉ cần nhập hai ô dưới đây khi bạn muốn đổi mật khẩu.</p>
                <input type="password" autoComplete="current-password" value={profile.oldPassword} onChange={(event) => setProfile({ ...profile, oldPassword: event.target.value })} placeholder="Mật khẩu hiện tại" className={`${field} mt-3`} />
                <input type="password" autoComplete="new-password" value={profile.newPassword} onChange={(event) => setProfile({ ...profile, newPassword: event.target.value })} placeholder="Mật khẩu mới" className={`${field} mt-3`} />
              </div>
              <button disabled={busy === 'profile'} className="h-12 w-full rounded-xl bg-brand-700 font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60">
                {busy === 'profile' ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>

          <form onSubmit={confirmContact} className="surface-card rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-lg font-black"><BadgeCheck className="text-brand-600" /> Xác nhận thông tin liên hệ</h2>
            <div className="mt-4 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={19} />
              <p>Hệ thống không gửi mã email hoặc OTP. Thông tin mới được xác nhận bằng mật khẩu tài khoản hiện tại.</p>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold"><Mail size={16} /> Email/Gmail</span>
                <input type="email" required autoComplete="email" placeholder="tenban@gmail.com" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className={field} />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold"><Phone size={16} /> Số điện thoại</span>
                <input type="tel" required autoComplete="tel" inputMode="tel" pattern="(?:\+84|0)(?:3|5|7|8|9)[0-9]{8}" title="Số di động Việt Nam, ví dụ 0987654321" placeholder="0987654321" value={contact.phoneNumber} onChange={(event) => setContact({ ...contact, phoneNumber: event.target.value })} className={field} />
              </label>
              <label className="block border-t border-slate-100 pt-4">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold"><KeyRound size={16} /> Mật khẩu xác nhận</span>
                <input type="password" required autoComplete="current-password" placeholder="Nhập mật khẩu tài khoản" value={contact.currentPassword} onChange={(event) => setContact({ ...contact, currentPassword: event.target.value })} className={field} />
              </label>
              <button disabled={busy === 'contact'} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60">
                <CircleCheckBig size={18} /> {busy === 'contact' ? 'Đang xác nhận...' : 'Xác nhận thông tin liên hệ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
