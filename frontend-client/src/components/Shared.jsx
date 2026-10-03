import { CalendarDays, Clock3, MapPin, SearchX, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { assetUrl, FALLBACK_IMAGE, formatDate, formatMoney } from '../api'

export function TourCard({ tour }) {
  const prices = (tour.departures || []).map((item) => Number(item.adultPrice)).filter(Number.isFinite)
  const fromPrice = prices.length ? Math.min(...prices) : null
  const destinations = tour.destinations?.map((item) => item.name).join(' · ') || 'Việt Nam'
  return (
    <article className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/tours/${tour.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={assetUrl(tour.thumbnail) || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE }} alt={tour.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded bg-white/95 px-2.5 py-1 text-xs font-bold text-brand-800 shadow-sm">{tour.category?.name || 'Tour nổi bật'}</span>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={14} fill="currentColor" /> {Number(tour.rating?.average || 0).toFixed(1)} <span className="font-normal text-slate-400">({tour.rating?.count || 0} đánh giá)</span></div>
        <Link to={`/tours/${tour.id}`}><h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-extrabold leading-6 text-ink transition group-hover:text-brand-700">{tour.name}</h3></Link>
        <div className="mt-3 space-y-2 text-sm text-slate-500">
          <p className="flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> <span className="truncate">{destinations}</span></p>
          <p className="flex items-center gap-2"><Clock3 size={16} className="text-brand-600" /> {tour.durationDays} ngày {tour.durationNights} đêm</p>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div><p className="text-xs text-slate-400">Giá từ</p><p className="text-lg font-extrabold text-rose-600">{fromPrice ? formatMoney(fromPrice) : 'Liên hệ'}</p></div>
          <span className="rounded-md bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">Xem tour</span>
        </div>
      </div>
    </article>
  )
}

export function DepartureCard({ departure, selected, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(departure)} className={`w-full rounded-md border p-4 text-left transition ${selected ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-brand-500'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="flex items-center gap-2 font-bold text-ink"><CalendarDays size={18} className="text-brand-600" /> {formatDate(departure.startDate)} - {formatDate(departure.endDate)}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Users size={15} /> Còn {departure.remainingSeats} chỗ</p></div>
        <div className="text-right"><p className="text-xs text-slate-400">Người lớn</p><p className="font-extrabold text-rose-600">{formatMoney(departure.adultPrice)}</p></div>
      </div>
    </button>
  )
}

export function EmptyState({ title = 'Chưa có dữ liệu', description, action }) {
  return <div className="grid min-h-72 place-items-center rounded-md border border-dashed border-slate-300 bg-white px-6 text-center"><div><SearchX size={38} className="mx-auto text-slate-300" /><h3 className="mt-4 text-lg font-bold">{title}</h3>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}{action && <div className="mt-5">{action}</div>}</div></div>
}

export function LoadingGrid({ count = 6 }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <div key={index} className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="aspect-[4/3] animate-pulse bg-slate-200" /><div className="space-y-3 p-5"><div className="h-4 w-1/3 animate-pulse bg-slate-100" /><div className="h-6 animate-pulse bg-slate-200" /><div className="h-4 w-2/3 animate-pulse bg-slate-100" /></div></div>)}</div>
}

export function Alert({ children, tone = 'error' }) {
  const colors = tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'
  return <div role="alert" className={`rounded-md border px-4 py-3 text-sm ${colors}`}>{children}</div>
}
