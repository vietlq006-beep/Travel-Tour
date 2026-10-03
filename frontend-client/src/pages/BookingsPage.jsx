import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, CreditCard, MapPin, ReceiptText, RotateCcw, Users, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, apiError, assetUrl, dataOf, FALLBACK_IMAGE, formatDate, formatMoney } from '../api'
import { Alert, EmptyState } from '../components/Shared'

const STATUS = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', style: 'bg-slate-100 text-slate-600 border-slate-200' },
  COMPLETED: { label: 'Hoàn thành', style: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const PAYMENT = {
  PENDING: 'Đang xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền',
}

export default function BookingsPage() {
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState([])
  const [details, setDetails] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(searchParams.get('created') ? `Đơn ${searchParams.get('created')} đã được tạo. Bạn có thể thanh toán lại tại đây.` : '')

  const load = useCallback(() => {
    api.get('/bookings', { params: { page: 1, limit: 100, ...(filter && { status: filter }) } })
      .then((response) => setBookings(dataOf(response).items || []))
      .catch((requestError) => setError(apiError(requestError)))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const toggleDetails = async (booking) => {
    if (expanded === booking.id) return setExpanded(null)
    setExpanded(booking.id)
    if (details[booking.id]) return
    try {
      const value = dataOf(await api.get(`/bookings/${booking.id}`))
      setDetails((current) => ({ ...current, [booking.id]: value }))
    } catch (requestError) { setError(apiError(requestError)) }
  }

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Hủy đơn ${booking.bookingCode}? Ghế và mã giảm giá sẽ được hoàn lại.`)) return
    setBusy(booking.id); setError(''); setNotice('')
    try {
      await api.post(`/bookings/${booking.id}/cancel`)
      setNotice(`Đã hủy đơn ${booking.bookingCode}.`); setDetails({}); setLoading(true); load()
    } catch (requestError) { setError(apiError(requestError)) }
    finally { setBusy(null) }
  }

  const pay = async (booking) => {
    setBusy(booking.id); setError(''); setNotice('')
    try {
      const result = dataOf(await api.post('/payments', { bookingId: booking.id, paymentMethod: 'VNPAY' }))
      if (result.paymentUrl) window.location.assign(result.paymentUrl)
      else setError('Không nhận được đường dẫn thanh toán VNPay.')
    } catch (requestError) { setError(apiError(requestError, 'Không thể khởi tạo thanh toán.')) }
    finally { setBusy(null) }
  }

  return (
    <section className="min-h-[70vh] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Hành trình của bạn</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Đơn của tôi</h1><p className="mt-2 text-slate-500">Theo dõi trạng thái đặt chỗ và thanh toán.</p></div><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 rounded border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-brand-600"><option value="">Tất cả trạng thái</option>{Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></div>
        {notice && <div className="mt-6"><Alert tone="success">{notice}</Alert></div>}{error && <div className="mt-6"><Alert>{error}</Alert></div>}
        <div className="mt-8 space-y-5">{loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-md bg-slate-200" />) : bookings.length ? bookings.map((booking) => {
          const status = STATUS[booking.status] || STATUS.CANCELLED
          const detail = details[booking.id]
          return <article key={booking.id} className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr] sm:p-6"><img src={assetUrl(booking.departure?.tour?.thumbnail) || FALLBACK_IMAGE} alt="" className="aspect-[4/3] w-full rounded object-cover sm:h-full" /><div className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-brand-700">{booking.bookingCode}</p><h2 className="mt-1 text-lg font-extrabold">{booking.departure?.tour?.name || 'Tour du lịch'}</h2></div><span className={`rounded border px-2.5 py-1 text-xs font-bold ${status.style}`}>{status.label}</span></div><div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(booking.departure?.startDate)}</p><p className="flex items-center gap-2"><Users size={16} /> {booking.numAdults} người lớn · {booking.numChildren} trẻ em</p><p className="flex items-center gap-2"><ReceiptText size={16} /> Ngày đặt {formatDate(booking.bookingDate)}</p><p className="font-extrabold text-rose-600">{formatMoney(booking.finalAmount)}</p></div><div className="mt-5 flex flex-wrap gap-2">{booking.status === 'PENDING_PAYMENT' && <><button type="button" disabled={busy === booking.id} onClick={() => pay(booking)} className="flex h-10 items-center gap-2 rounded bg-rose-600 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"><CreditCard size={17} /> Thanh toán VNPay</button><button type="button" disabled={busy === booking.id} onClick={() => cancelBooking(booking)} className="flex h-10 items-center gap-2 rounded border border-slate-300 px-4 text-sm font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"><XCircle size={17} /> Hủy đơn</button></>}<button type="button" onClick={() => toggleDetails(booking)} className="ml-auto flex h-10 items-center gap-2 text-sm font-bold text-brand-700">Chi tiết {expanded === booking.id ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button></div></div></div>
            {expanded === booking.id && <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6">{detail ? <div className="grid gap-7 md:grid-cols-2"><div><h3 className="font-extrabold">Danh sách hành khách</h3><div className="mt-3 space-y-2">{detail.participants?.map((person) => <div key={person.id} className="flex justify-between rounded bg-white px-3 py-2 text-sm"><span className="font-semibold">{person.fullName}</span><span className="text-slate-400">{person.passengerType === 'ADULT' ? 'Người lớn' : 'Trẻ em'}</span></div>)}</div></div><div><h3 className="font-extrabold">Lịch sử thanh toán</h3><div className="mt-3 space-y-2">{detail.payments?.length ? detail.payments.map((payment) => <div key={payment.id} className="rounded bg-white px-3 py-2 text-sm"><div className="flex justify-between"><span className="font-semibold">{payment.paymentMethod === 'VNPAY' ? 'VNPay' : payment.paymentMethod}</span><span>{PAYMENT[payment.status] || payment.status}</span></div><p className="mt-1 text-slate-400">{formatMoney(payment.amount)}</p></div>) : <p className="text-sm text-slate-400">Chưa có giao dịch.</p>}</div></div></div> : <p className="text-sm text-slate-400">Đang tải chi tiết...</p>}</div>}
          </article>
        }) : <EmptyState title="Bạn chưa có đơn đặt nào" description="Chọn một hành trình và bắt đầu chuyến đi tiếp theo." action={<Link to="/tours" className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-700 px-5 font-bold text-white"><MapPin size={17} /> Khám phá tour</Link>} />}</div>
        {!loading && bookings.length > 0 && <button type="button" onClick={load} className="mx-auto mt-7 flex items-center gap-2 text-sm font-bold text-slate-500"><RotateCcw size={16} /> Làm mới trạng thái</button>}
      </div>
    </section>
  )
}
