import { ArrowLeft, BadgePercent, CalendarDays, CheckCircle2, CreditCard, Minus, Plus, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, apiError, assetUrl, dataOf, FALLBACK_IMAGE, formatDate, formatMoney } from '../dich-vu-api'
import { Alert } from '../components/DungChung'
import { VietQrDialog } from '../components/ThanhToanVietQr'
import type { ApiEnvelope, Booking, Gender, Participant, PassengerType, PaymentCreation, Tour, VietQrDetails, VoucherValidation } from '../types/du-lieu'

const TODAY = new Date().toISOString().slice(0, 10)
const PASSENGER_LABELS: Record<PassengerType, string> = { ADULT: 'Người lớn', CHILD: 'Trẻ em', INFANT: 'Em bé', SENIOR: 'Người cao tuổi' }

function emptyPerson(passengerType: PassengerType): Participant {
  return { fullName: '', gender: 'MALE', dateOfBirth: '', passengerType }
}

interface CounterProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function Counter({ value, min, max, onChange }: CounterProps) {
  return (
    <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50">
      <button type="button" aria-label="Giảm" disabled={value <= min} onClick={() => onChange(value - 1)} className="grid size-10 place-items-center disabled:opacity-30"><Minus size={16} /></button>
      <span className="w-9 text-center font-bold">{value}</span>
      <button type="button" aria-label="Tăng" disabled={value >= max} onClick={() => onChange(value + 1)} className="grid size-10 place-items-center disabled:opacity-30"><Plus size={16} /></button>
    </div>
  )
}

interface PeopleCounts { adults: number; children: number; infants: number; seniors: number }
type EditableParticipantField = 'fullName' | 'gender' | 'dateOfBirth'

export default function CheckoutPage() {
  const { tourId } = useParams<{ tourId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [departureId, setDepartureId] = useState(searchParams.get('departure') || '')
  const [counts, setCounts] = useState<PeopleCounts>({ adults: 1, children: 0, infants: 0, seniors: 0 })
  const [singleRoomCount, setSingleRoomCount] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([emptyPerson('ADULT')])
  const [voucherCode, setVoucherCode] = useState('')
  const [voucher, setVoucher] = useState<VoucherValidation | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  const [vietQr, setVietQr] = useState<VietQrDetails | null>(null)
  const [createdBookingCode, setCreatedBookingCode] = useState('')
  const [paymentDueAt, setPaymentDueAt] = useState<string | null>(null)

  useEffect(() => {
    api.get<ApiEnvelope<Tour>>(`/tours/${tourId}`)
      .then((response) => {
        const value = dataOf(response)
        setTour(value)
        setDepartureId((current) => current || String(value.departures?.[0]?.id || ''))
      })
      .catch((requestError: unknown) => setError(apiError(requestError)))
      .finally(() => setLoading(false))
  }, [tourId])

  const selected = tour?.departures?.find((item) => String(item.id) === String(departureId))
  const subtotal = selected
    ? Number(selected.adultPrice) * counts.adults
      + Number(selected.childPrice) * counts.children
      + Number(selected.infantPrice || 0) * counts.infants
      + Number(selected.seniorPrice ?? selected.adultPrice) * counts.seniors
      + Number(selected.singleRoomSurcharge || 0) * singleRoomCount
    : 0
  const finalAmount = Math.max(0, subtotal - Number(voucher?.discountAmount || 0))
  const totalPeople = counts.adults + counts.children + counts.infants + counts.seniors

  const syncPeople = (nextCounts: PeopleCounts) => {
    const adults = participants.filter((person) => person.passengerType === 'ADULT')
    const children = participants.filter((person) => person.passengerType === 'CHILD')
    const infants = participants.filter((person) => person.passengerType === 'INFANT')
    const seniors = participants.filter((person) => person.passengerType === 'SENIOR')
    const nextAdults = Array.from({ length: nextCounts.adults }, (_, index) => adults[index] || emptyPerson('ADULT'))
    const nextChildren = Array.from({ length: nextCounts.children }, (_, index) => children[index] || emptyPerson('CHILD'))
    setCounts(nextCounts)
    const nextInfants = Array.from({ length: nextCounts.infants }, (_, index) => infants[index] || emptyPerson('INFANT'))
    const nextSeniors = Array.from({ length: nextCounts.seniors }, (_, index) => seniors[index] || emptyPerson('SENIOR'))
    setParticipants([...nextAdults, ...nextChildren, ...nextInfants, ...nextSeniors])
    setVoucher(null)
  }

  const updatePerson = (index: number, field: EditableParticipantField, value: string) => {
    setParticipants((current) => current.map((person, personIndex) => personIndex === index ? { ...person, [field]: value } : person))
  }

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã giảm giá.')
      return
    }
    setValidating(true)
    setError('')
    setVoucher(null)
    try {
      const result = dataOf<VoucherValidation>(await api.post<ApiEnvelope<VoucherValidation>>('/vouchers/validate', {
        code: voucherCode.trim(),
        totalAmount: subtotal,
      }))
      setVoucher(result)
      setVoucherCode(result.voucher.code)
    } catch (requestError) {
      setError(apiError(requestError, 'Mã giảm giá không hợp lệ.'))
    } finally {
      setValidating(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) {
      setError('Vui lòng chọn ngày khởi hành.')
      return
    }
    if (totalPeople > selected.remainingSeats) {
      setError(`Chuyến này chỉ còn ${selected.remainingSeats} chỗ.`)
      return
    }

    setSubmitting(true)
    setError('')
    let booking: Booking | undefined
    try {
      booking = dataOf<Booking>(await api.post<ApiEnvelope<Booking>>('/bookings', {
        departureId: selected.id,
        voucherCode: voucherCode.trim() || undefined,
        numAdults: counts.adults,
        numChildren: counts.children,
        numInfants: counts.infants,
        numSeniors: counts.seniors,
        singleRoomCount,
        participants,
        notes: notes.trim() || undefined,
      }))
      const payment = dataOf<PaymentCreation>(await api.post<ApiEnvelope<PaymentCreation>>('/payments', {
        bookingId: booking.id,
        paymentMethod: 'VIETQR',
      }))
      if (!payment.vietQr) throw new Error('VIETQR_DATA_MISSING')
      setCreatedBookingCode(booking.bookingCode)
      setPaymentDueAt(booking.paymentDueAt || null)
      setVietQr(payment.vietQr)
    } catch (requestError) {
      if (booking) navigate(`/my-bookings?created=${encodeURIComponent(booking.bookingCode)}`, { replace: true })
      else setError(apiError(requestError, 'Không thể hoàn tất đặt chỗ.'))
    } finally {
      setSubmitting(false)
    }
  }

  const maxPeople = Math.min(Number(selected?.remainingSeats || 10), 20)
  const participantRows = useMemo(() => participants.map((person, index) => ({
    ...person,
    index,
    label: `${PASSENGER_LABELS[person.passengerType]} ${participants.slice(0, index + 1).filter((item) => item.passengerType === person.passengerType).length}`,
  })), [participants])

  if (loading) return <div className="min-h-[70vh] animate-pulse bg-slate-100" />
  if (!tour) return <div className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16"><Alert>{error || 'Không tìm thấy tour.'}</Alert></div>

  return (
    <section className="py-12 sm:py-16">
      <form onSubmit={submit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to={`/tours/${tour.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-sm transition hover:-translate-x-1"><ArrowLeft size={17} /> Quay lại tour</Link>
        <div className="mt-7"><p className="section-kicker">Đặt chỗ an toàn</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Thông tin đoàn khách</h1><p className="mt-2 text-slate-500">Điền chính xác thông tin của từng thành viên trong đoàn.</p></div>
        {error && <div className="mt-6"><Alert>{error}</Alert></div>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            <section className="surface-card rounded-3xl p-5 sm:p-7">
              <h2 className="flex items-center gap-3 text-lg font-black"><CalendarDays className="text-brand-600" /> Ngày khởi hành</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {tour.departures?.map((item) => (
                  <label key={item.id} className={`cursor-pointer rounded-2xl border p-4 transition-all ${String(item.id) === String(departureId) ? 'border-brand-600 bg-brand-50 shadow-sm ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-300'}`}>
                    <input type="radio" name="departure" className="sr-only" value={item.id} checked={String(item.id) === String(departureId)} onChange={(event) => { setDepartureId(event.target.value); setVoucher(null) }} />
                    <span className="font-bold">{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                    <span className="mt-2 block text-sm text-slate-500">Còn {item.remainingSeats} chỗ · {formatMoney(item.adultPrice)}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="surface-card rounded-3xl p-5 sm:p-7">
              <h2 className="flex items-center gap-3 text-lg font-black"><UserRound className="text-brand-600" /> Số lượng khách</h2>
              <div className="mt-5 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-4"><div><p className="font-bold">Người lớn</p><p className="text-sm text-slate-400">Từ 12 đến 59 tuổi</p></div><Counter value={counts.adults} min={1} max={Math.max(1, maxPeople - totalPeople + counts.adults)} onChange={(value) => syncPeople({ ...counts, adults: value })} /></div>
                <div className="flex items-center justify-between py-4"><div><p className="font-bold">Trẻ em</p><p className="text-sm text-slate-400">Theo chính sách của tour</p></div><Counter value={counts.children} min={0} max={Math.max(0, maxPeople - totalPeople + counts.children)} onChange={(value) => syncPeople({ ...counts, children: value })} /></div>
                <div className="flex items-center justify-between py-4"><div><p className="font-bold">Em bé</p><p className="text-sm text-slate-400">Theo chính sách của tour</p></div><Counter value={counts.infants} min={0} max={Math.max(0, maxPeople - totalPeople + counts.infants)} onChange={(value) => syncPeople({ ...counts, infants: value })} /></div>
                <div className="flex items-center justify-between py-4"><div><p className="font-bold">Người cao tuổi</p><p className="text-sm text-slate-400">Giá và điều kiện riêng</p></div><Counter value={counts.seniors} min={0} max={Math.max(0, maxPeople - totalPeople + counts.seniors)} onChange={(value) => syncPeople({ ...counts, seniors: value })} /></div>
                <div className="flex items-center justify-between py-4"><div><p className="font-bold">Phụ thu phòng đơn</p><p className="text-sm text-slate-400">{formatMoney(selected?.singleRoomSurcharge || 0)} / phòng</p></div><Counter value={singleRoomCount} min={0} max={counts.adults + counts.seniors} onChange={(value) => { setSingleRoomCount(value); setVoucher(null) }} /></div>
              </div>
            </section>

            <section className="surface-card rounded-3xl p-5 sm:p-7">
              <h2 className="flex items-center gap-3 text-lg font-black"><UserRound className="text-brand-600" /> Danh sách hành khách</h2>
              <div className="mt-6 space-y-6">
                {participantRows.map((person) => (
                  <div key={`${person.passengerType}-${person.index}`} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                    <p className="mb-4 font-extrabold text-brand-800">{person.label}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-bold">Họ và tên</span><input required value={person.fullName} onChange={(event) => updatePerson(person.index, 'fullName', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder="Như trên giấy tờ tùy thân" /></label>
                      <label><span className="mb-1.5 block text-sm font-bold">Giới tính</span><select value={person.gender} onChange={(event) => updatePerson(person.index, 'gender', event.target.value as Gender)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></label>
                      <label><span className="mb-1.5 block text-sm font-bold">Ngày sinh</span><input required type="date" max={TODAY} value={person.dateOfBirth} onChange={(event) => updatePerson(person.index, 'dateOfBirth', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" /></label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card rounded-3xl p-5 sm:p-7"><h2 className="text-lg font-black">Ghi chú cho chuyến đi</h2><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" placeholder="Ăn chay, dị ứng thực phẩm hoặc yêu cầu khác..." /></section>
          </div>

          <aside className="self-start lg:sticky lg:top-36">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,64,51,.45)] sm:p-6">
              <div className="flex gap-4"><img src={assetUrl(tour.thumbnail) || FALLBACK_IMAGE} alt="" className="size-20 rounded object-cover" /><div><p className="text-xs font-bold uppercase text-brand-700">{tour.code}</p><h2 className="mt-1 line-clamp-2 font-extrabold">{tour.name}</h2></div></div>
              {selected && <p className="mt-5 flex items-center gap-2 rounded bg-slate-50 p-3 text-sm font-semibold"><CalendarDays size={17} className="text-brand-600" /> {formatDate(selected.startDate)}</p>}
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between"><span>{counts.adults} người lớn</span><span>{formatMoney(Number(selected?.adultPrice || 0) * counts.adults)}</span></div>
                {counts.children > 0 && <div className="flex justify-between"><span>{counts.children} trẻ em</span><span>{formatMoney(Number(selected?.childPrice || 0) * counts.children)}</span></div>}
                {counts.infants > 0 && <div className="flex justify-between"><span>{counts.infants} em bé</span><span>{formatMoney(Number(selected?.infantPrice || 0) * counts.infants)}</span></div>}
                {counts.seniors > 0 && <div className="flex justify-between"><span>{counts.seniors} người cao tuổi</span><span>{formatMoney(Number(selected?.seniorPrice ?? selected?.adultPrice ?? 0) * counts.seniors)}</span></div>}
                {singleRoomCount > 0 && <div className="flex justify-between"><span>{singleRoomCount} phòng đơn</span><span>{formatMoney(Number(selected?.singleRoomSurcharge || 0) * singleRoomCount)}</span></div>}
                <div className="flex justify-between border-t border-slate-100 pt-3 font-bold"><span>Tạm tính</span><span>{formatMoney(subtotal)}</span></div>
              </div>
              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold"><BadgePercent size={17} className="text-brand-600" /> Mã giảm giá</label>
                <div className="flex gap-2"><input value={voucherCode} onChange={(event) => { setVoucherCode(event.target.value.toUpperCase()); setVoucher(null) }} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 uppercase outline-none focus:border-brand-500" placeholder="NHẬP MÃ" /><button type="button" onClick={() => void applyVoucher()} disabled={validating} className="rounded-xl bg-slate-800 px-4 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60">{validating ? '...' : 'Áp dụng'}</button></div>
                {voucher && <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-700"><CheckCircle2 size={16} /> Voucher {voucher.voucher.code} đã được áp dụng</p>}
              </div>
              {voucher && <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-bold text-emerald-800"><span>Giảm giá ({voucher.voucher.code})</span><span>-{formatMoney(voucher.discountAmount)}</span></div>}
              <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5"><span className="font-bold">Tổng thanh toán</span><strong className="text-2xl text-rose-600">{formatMoney(finalAmount)}</strong></div>
              <button disabled={submitting || !selected} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 font-extrabold text-white shadow-lg shadow-rose-900/15 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"><CreditCard size={19} /> {submitting ? 'Đang tạo đơn...' : 'Đặt chỗ & thanh toán VietQR'}</button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} /> Chuyển khoản nhanh qua VietQR · Napas 247</p>
            </div>
          </aside>
        </div>
      </form>
      <VietQrDialog payment={vietQr} dueAt={paymentDueAt} onClose={() => navigate(`/my-bookings?created=${encodeURIComponent(createdBookingCode)}`, { replace: true })} />
    </section>
  )
}
