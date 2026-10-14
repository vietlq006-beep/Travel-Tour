import { BadgePercent, CalendarDays, ChevronDown, ChevronUp, CreditCard, FileUp, MapPin, QrCode, ReceiptText, RefreshCcw, Send, Star, Users, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, apiError, assetUrl, dataOf, FALLBACK_IMAGE, formatDate, formatMoney } from '../dich-vu-api'
import { Alert, EmptyState } from '../components/DungChung'
import { PaymentCountdown } from '../components/DemNguocThanhToan'
import { VietQrDialog } from '../components/ThanhToanVietQr'
import type { ApiEnvelope, Booking, BookingStatus, CheckInTicket, Departure, EntityId, PaginatedResult, Payment, PaymentCreation, PaymentStatus, Tour, VietQrDetails } from '../types/du-lieu'

const STATUS: Record<BookingStatus, { label: string; style: string }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', style: 'bg-slate-100 text-slate-600 border-slate-200' },
  COMPLETED: { label: 'Hoàn thành', style: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const PAYMENT: Record<PaymentStatus, string> = { PENDING: 'Đang xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền' }
const PAYMENT_METHOD = { VIETQR: 'VietQR', BANK_TRANSFER: 'Chuyển khoản', CASH: 'Tiền mặt' } as const
const PASSENGER = { ADULT: 'Người lớn', CHILD: 'Trẻ em', INFANT: 'Em bé', SENIOR: 'Người cao tuổi' } as const
const REQUEST = { CANCEL: 'Yêu cầu hủy', RESCHEDULE: 'Yêu cầu đổi lịch', REFUND: 'Yêu cầu hoàn tiền' } as const

export default function BookingsPage() {
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [details, setDetails] = useState<Record<EntityId, Booking>>({})
  const [expanded, setExpanded] = useState<EntityId | null>(null)
  const [filter, setFilter] = useState<BookingStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<EntityId | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(searchParams.get('created') ? `Đơn ${searchParams.get('created')} đã được tạo. Hãy hoàn tất thanh toán trước khi đồng hồ kết thúc.` : '')
  const [vietQr, setVietQr] = useState<VietQrDetails | null>(null)
  const [vietQrDueAt, setVietQrDueAt] = useState<string | null>(null)
  const [ticket, setTicket] = useState<CheckInTicket | null>(null)
  const [requestBookingId, setRequestBookingId] = useState<EntityId | null>(null)
  const [requestType, setRequestType] = useState<'CANCEL' | 'RESCHEDULE' | 'REFUND'>('CANCEL')
  const [requestReason, setRequestReason] = useState('')
  const [requestedDepartureId, setRequestedDepartureId] = useState('')
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const [rescheduleOptions, setRescheduleOptions] = useState<Record<string, Departure[]>>({})

  const load = useCallback(() => {
    setLoading(true)
    api.get<ApiEnvelope<PaginatedResult<Booking>>>('/bookings', { params: { page: 1, limit: 100, ...(filter && { status: filter }) } })
      .then((response) => { setBookings(dataOf(response).items || []); setError('') })
      .catch((requestError: unknown) => setError(apiError(requestError)))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { void Promise.resolve().then(load) }, [load])

  const loadDetail = async (bookingId: EntityId) => {
    const value = dataOf<Booking>(await api.get<ApiEnvelope<Booking>>(`/bookings/${bookingId}`))
    setDetails((current) => ({ ...current, [bookingId]: value }))
    return value
  }

  const toggleDetails = async (booking: Booking) => {
    if (expanded === booking.id) { setExpanded(null); return }
    setExpanded(booking.id)
    if (details[booking.id]) return
    try { await loadDetail(booking.id) } catch (requestError) { setError(apiError(requestError)) }
  }

  const cancelBooking = async (booking: Booking) => {
    const reason = window.prompt(`Lý do hủy đơn ${booking.bookingCode}:`, 'Tôi không thể tiếp tục chuyến đi.')
    if (!reason) return
    setBusy(booking.id); setError(''); setNotice('')
    try {
      await api.post(`/bookings/${booking.id}/cancel`, { reason })
      setNotice(`Đã hủy đơn ${booking.bookingCode}; ghế và lượt voucher đã được hoàn.`)
      setDetails({}); load()
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy(null) }
  }

  const pay = async (booking: Booking) => {
    setBusy(booking.id); setError(''); setNotice('')
    try {
      const result = dataOf<PaymentCreation>(await api.post<ApiEnvelope<PaymentCreation>>('/payments', { bookingId: booking.id, paymentMethod: 'VIETQR' }))
      if (!result.vietQr) throw new Error('Không nhận được dữ liệu VietQR.')
      setVietQr(result.vietQr); setVietQrDueAt(booking.paymentDueAt || null)
    } catch (requestError) { setError(apiError(requestError, 'Không thể khởi tạo thanh toán.')) } finally { setBusy(null) }
  }

  const uploadProof = async (bookingId: EntityId, payment: Payment, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(payment.id); setError('')
    const form = new FormData(); form.append('proof', file)
    try {
      await api.post(`/payments/${payment.id}/proof`, form)
      setNotice('Đã tải chứng từ. Bộ phận vận hành sẽ đối soát giao dịch.')
      await loadDetail(bookingId)
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy(null); event.target.value = '' }
  }

  const openTicket = async (booking: Booking) => {
    setBusy(booking.id); setError('')
    try { setTicket(dataOf<CheckInTicket>(await api.get<ApiEnvelope<CheckInTicket>>(`/bookings/${booking.id}/ticket`))) }
    catch (requestError) { setError(apiError(requestError)) } finally { setBusy(null) }
  }

  const toggleRequestForm = async (booking: Booking) => {
    if (requestBookingId === booking.id) { setRequestBookingId(null); return }
    setRequestBookingId(booking.id)
    const tourId = booking.departure?.tour?.id
    if (!tourId || rescheduleOptions[String(booking.id)]) return
    try {
      const tour = dataOf<Tour>(await api.get<ApiEnvelope<Tour>>(`/tours/${tourId}`))
      setRescheduleOptions((current) => ({ ...current, [String(booking.id)]: (tour.departures || []).filter((item) => item.id !== booking.departure?.id) }))
    } catch (requestError) { setError(apiError(requestError)) }
  }

  const sendChangeRequest = async (bookingId: EntityId) => {
    if (requestReason.trim().length < 10) { setError('Lý do cần ít nhất 10 ký tự.'); return }
    setBusy(bookingId); setError('')
    try {
      await api.post(`/bookings/${bookingId}/change-requests`, {
        requestType, reason: requestReason.trim(),
        ...(requestType === 'RESCHEDULE' && { requestedDepartureId: Number(requestedDepartureId) }),
      })
      setNotice('Yêu cầu đã được gửi tới bộ phận vận hành.')
      setRequestBookingId(null); setRequestReason(''); setRequestedDepartureId('')
      await loadDetail(bookingId)
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy(null) }
  }

  const submitReview = async (bookingId: EntityId) => {
    setBusy(bookingId); setError('')
    try {
      await api.post('/reviews', { bookingId, rating: review.rating, comment: review.comment.trim() || undefined })
      setNotice('Cảm ơn bạn đã đánh giá chuyến đi.')
      await loadDetail(bookingId)
    } catch (requestError) { setError(apiError(requestError)) } finally { setBusy(null) }
  }

  return (
    <section className="min-h-[70vh] py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="section-kicker">Hành trình của bạn</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Đơn của tôi</h1><p className="mt-2 text-slate-500">Thanh toán, chứng từ, vé check-in và các yêu cầu sau đặt tour.</p></div>
          <select value={filter} onChange={(event) => setFilter(event.target.value as BookingStatus | '')} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm outline-none focus:border-brand-500"><option value="">Tất cả trạng thái</option>{Object.entries(STATUS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select>
        </div>
        {notice && <div className="mt-6"><Alert tone="success">{notice}</Alert></div>}
        {error && <div className="mt-6"><Alert>{error}</Alert></div>}
        <div className="mt-8 space-y-5">
          {loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="skeleton-shimmer h-52 rounded-3xl bg-slate-200" />) : bookings.length ? bookings.map((booking) => {
            const status = STATUS[booking.status]
            const detail = details[booking.id]
            return (
              <article key={booking.id} className="surface-card group overflow-hidden rounded-3xl transition hover:border-brand-200 hover:shadow-xl">
                <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr] sm:p-6">
                  <img src={assetUrl(booking.departure?.tour?.thumbnail) || FALLBACK_IMAGE} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover sm:h-full" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">{booking.bookingCode}</p><h2 className="mt-1 text-lg font-black group-hover:text-brand-700">{booking.departure?.tour?.name || 'Tour du lịch'}</h2></div><span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${status.style}`}>{status.label}</span></div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-500 sm:grid-cols-2"><p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(booking.departure?.startDate)}</p><p className="flex items-center gap-2"><Users size={16} /> {(booking.numAdults || 0) + (booking.numChildren || 0) + (booking.numInfants || 0) + (booking.numSeniors || 0)} hành khách</p><p className="flex items-center gap-2"><ReceiptText size={16} /> Đặt ngày {formatDate(booking.bookingDate)}</p><p className="font-extrabold text-rose-600">{formatMoney(booking.finalAmount)}</p></div>
                    {Number(booking.discountAmount || 0) > 0 && <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700"><BadgePercent size={15} /> Voucher {booking.voucher?.code} · giảm {formatMoney(booking.discountAmount)}</p>}
                    {booking.status === 'PENDING_PAYMENT' && <div className="mt-4"><PaymentCountdown dueAt={booking.paymentDueAt} compact /></div>}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {booking.status === 'PENDING_PAYMENT' && <><button type="button" disabled={busy === booking.id} onClick={() => void pay(booking)} className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 text-sm font-bold text-white disabled:opacity-60"><CreditCard size={17} /> Thanh toán</button><button type="button" disabled={busy === booking.id} onClick={() => void cancelBooking(booking)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"><XCircle size={17} /> Hủy đơn</button></>}
                      {['CONFIRMED', 'COMPLETED'].includes(booking.status) && <button type="button" disabled={busy === booking.id} onClick={() => void openTicket(booking)} className="flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white"><QrCode size={17} /> Vé QR</button>}
                      <button type="button" onClick={() => void toggleDetails(booking)} className="ml-auto flex h-10 items-center gap-2 text-sm font-bold text-brand-700">Chi tiết {expanded === booking.id ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
                    </div>
                  </div>
                </div>
                {expanded === booking.id && <div className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6">{detail ? <div className="space-y-7">
                  <div className="rounded-2xl bg-white p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-extrabold"><ReceiptText size={18} className="text-brand-600" /> Chi tiết hóa đơn</h3>{detail.voucher?.code && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Voucher {detail.voucher.code}</span>}</div><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between text-slate-600"><span>Tạm tính</span><span>{formatMoney(detail.totalAmount)}</span></div><div className="flex justify-between font-semibold text-emerald-700"><span>Giảm giá{detail.voucher?.code ? ` (${detail.voucher.code})` : ''}</span><span>-{formatMoney(detail.discountAmount || 0)}</span></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base font-black"><span>Thành tiền</span><span className="text-rose-600">{formatMoney(detail.finalAmount)}</span></div><div className="flex justify-between text-slate-500"><span>Khoản thanh toán ban đầu</span><span>{formatMoney(detail.depositAmount || detail.finalAmount)}</span></div></div></div>
                  <div className="grid gap-7 md:grid-cols-2">
                    <div><h3 className="font-extrabold">Danh sách hành khách</h3><div className="mt-3 space-y-2">{detail.participants?.map((person) => <div key={person.id} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm"><span className="font-semibold">{person.fullName}</span><span className="text-slate-400">{PASSENGER[person.passengerType]}</span></div>)}</div></div>
                    <div><h3 className="font-extrabold">Lịch sử thanh toán</h3><div className="mt-3 space-y-2">{detail.payments?.length ? detail.payments.map((payment) => <div key={payment.id} className="rounded-xl bg-white px-3 py-3 text-sm"><div className="flex justify-between"><span className="font-semibold">{PAYMENT_METHOD[payment.paymentMethod]}</span><span>{PAYMENT[payment.status]}</span></div><p className="mt-1 text-slate-500">{formatMoney(payment.amount)} · {payment.paymentPurpose === 'DEPOSIT' ? 'Tiền cọc' : payment.paymentPurpose === 'BALANCE' ? 'Phần còn lại' : 'Toàn bộ'}</p>{payment.status === 'PENDING' && <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-brand-700"><FileUp size={15} /> {payment.proofUrl ? 'Thay chứng từ' : 'Tải chứng từ thanh toán'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadProof(detail.id, payment, event)} /></label>}{payment.proofUrl && <a href={assetUrl(payment.proofUrl)} target="_blank" rel="noreferrer" className="ml-3 text-xs font-bold text-brand-700">Xem ảnh</a>}</div>) : <p className="text-sm text-slate-400">Chưa có giao dịch.</p>}</div></div>
                  </div>
                  {detail.policySnapshot && <details className="rounded-2xl bg-white p-4"><summary className="cursor-pointer font-extrabold">Chính sách đã chốt tại thời điểm đặt</summary><div className="mt-4 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">{Object.entries(detail.policySnapshot).filter(([, value]) => value).map(([key, value]) => <div key={key}><strong className="block text-slate-800">{key.replace(/([A-Z])/g, ' $1')}</strong>{Array.isArray(value) ? value.join(', ') : String(value)}</div>)}</div></details>}
                  {['PENDING_PAYMENT', 'CONFIRMED'].includes(detail.status) && <div className="rounded-2xl bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-extrabold">Đổi lịch, hủy hoặc hoàn tiền</h3><p className="mt-1 text-sm text-slate-500">Đơn đã xác nhận sẽ được nhân viên xem xét theo chính sách đã chốt.</p></div><button type="button" onClick={() => void toggleRequestForm(detail)} className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-bold text-brand-700">Tạo yêu cầu</button></div>{requestBookingId === detail.id && <div className="mt-4 grid gap-3 sm:grid-cols-2"><select value={requestType} onChange={(event) => setRequestType(event.target.value as typeof requestType)} className="h-11 rounded-xl border border-slate-200 px-3"><option value="CANCEL">Yêu cầu hủy</option><option value="RESCHEDULE">Đổi lịch khởi hành</option><option value="REFUND">Yêu cầu hoàn tiền</option></select>{requestType === 'RESCHEDULE' && <select value={requestedDepartureId} onChange={(event) => setRequestedDepartureId(event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3"><option value="">Chọn lịch mới</option>{(rescheduleOptions[String(detail.id)] || []).map((item) => <option key={item.id} value={item.id}>{formatDate(item.startDate)} · còn {item.remainingSeats} chỗ</option>)}</select>}<textarea value={requestReason} onChange={(event) => setRequestReason(event.target.value)} placeholder="Nêu lý do (ít nhất 10 ký tự)" rows={3} className="rounded-xl border border-slate-200 p-3 sm:col-span-2" /><button type="button" disabled={busy === detail.id || (requestType === 'RESCHEDULE' && !requestedDepartureId)} onClick={() => void sendChangeRequest(detail.id)} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 font-bold text-white sm:col-span-2"><Send size={16} /> Gửi yêu cầu</button></div>}{detail.changeRequests?.map((item) => <p key={item.id} className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm"><strong>{REQUEST[item.requestType]}</strong> · {item.status} — {item.reason}</p>)}</div>}
                  {detail.status === 'COMPLETED' && !detail.review && <div className="rounded-2xl bg-white p-4"><h3 className="font-extrabold">Đánh giá chuyến đi</h3><div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setReview((current) => ({ ...current, rating: value }))}><Star size={25} className={value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}</div><textarea value={review.comment} onChange={(event) => setReview((current) => ({ ...current, comment: event.target.value }))} rows={3} placeholder="Chia sẻ trải nghiệm của bạn" className="mt-3 w-full rounded-xl border border-slate-200 p-3" /><button type="button" onClick={() => void submitReview(detail.id)} className="mt-3 rounded-xl bg-brand-700 px-5 py-2.5 font-bold text-white">Gửi đánh giá</button></div>}
                  {detail.activities?.length ? <details><summary className="cursor-pointer text-sm font-bold text-slate-600">Lịch sử trạng thái ({detail.activities.length})</summary><div className="mt-3 space-y-2">{detail.activities.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><strong>{item.eventType}</strong><span className="ml-2 text-slate-400">{formatDate(item.createdAt, { hour: '2-digit', minute: '2-digit' })}</span>{item.note && <p className="mt-1 text-slate-600">{item.note}</p>}</div>)}</div></details> : null}
                </div> : <p className="text-sm text-slate-400">Đang tải chi tiết...</p>}</div>}
              </article>
            )
          }) : <EmptyState title="Bạn chưa có đơn đặt nào" description="Chọn một hành trình và bắt đầu chuyến đi tiếp theo." action={<Link to="/tours" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-700 px-5 font-bold text-white"><MapPin size={17} /> Khám phá tour</Link>} />}
        </div>
        {!loading && bookings.length > 0 && <button type="button" onClick={load} className="mx-auto mt-7 flex items-center gap-2 text-sm font-bold text-slate-500"><RefreshCcw size={16} /> Làm mới trạng thái</button>}
      </div>
      <VietQrDialog payment={vietQr} dueAt={vietQrDueAt} onClose={() => { setVietQr(null); setNotice('Đã ghi nhận giao dịch. Hệ thống sẽ tự đối soát hoặc nhân viên kiểm tra chứng từ.') }} />
      {ticket && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl"><button type="button" aria-label="Đóng" onClick={() => setTicket(null)} className="ml-auto grid size-9 place-items-center rounded-full border border-slate-200"><X size={18} /></button><p className="section-kicker">Vé điện tử</p><h2 className="mt-2 text-2xl font-black">{ticket.bookingCode}</h2><img src={ticket.qrCodeDataUrl} alt="Mã QR check-in" className="mx-auto mt-5 w-full max-w-[320px]" /><p className="mt-3 break-all font-mono text-xs text-slate-400">{ticket.checkInCode}</p><p className="mt-4 text-sm text-slate-600">Xuất trình mã này cho hướng dẫn viên khi tập trung.</p></div></div>}
    </section>
  )
}
