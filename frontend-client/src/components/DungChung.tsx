import { ArrowUpRight, CalendarDays, Clock3, MapPin, SearchX, Star, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { assetUrl, FALLBACK_IMAGE, formatDate, formatMoney } from '../dich-vu-api'
import type { Departure, Tour } from '../types/du-lieu'

export function TourCard({ tour }: { tour: Tour }) {
  const prices = (tour.departures || []).map((item) => Number(item.adultPrice)).filter(Number.isFinite)
  const fromPrice = prices.length ? Math.min(...prices) : null
  const destinations = tour.destinations?.map((item) => item.name).join(' · ') || 'Việt Nam'
  const openDepartures = tour.departures?.length || 0

  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:border-brand-200 hover:shadow-[0_28px_60px_-32px_rgba(5,95,70,.45)]">
      <Link to={`/tours/${tour.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={assetUrl(tour.thumbnail) || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE }} alt={tour.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
        <span className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/5 opacity-80 transition group-hover:opacity-60" />
        <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold text-brand-800 shadow-sm backdrop-blur">{tour.category?.name || 'Tour nổi bật'}</span>
        {openDepartures > 0 && <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-slate-950/45 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md"><CalendarDays size={13} /> {openDepartures} lịch khởi hành</span>}
        <span className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-extrabold text-amber-600 shadow-sm"><Star size={13} fill="currentColor" /> {Number(tour.rating?.average || 0).toFixed(1)}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link to={`/tours/${tour.id}`}><h3 className="line-clamp-2 min-h-14 text-lg font-black leading-7 text-ink transition-colors group-hover:text-brand-700">{tour.name}</h3></Link>
        <div className="mt-4 space-y-2.5 text-sm text-slate-500">
          <p className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><MapPin size={14} /></span><span className="truncate">{destinations}</span></p>
          <p className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Clock3 size={14} /></span>{tour.durationDays} ngày {tour.durationNights} đêm</p>
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Giá từ / khách</p><p className="mt-1 text-xl font-black text-rose-600">{fromPrice ? formatMoney(fromPrice) : 'Liên hệ'}</p></div>
          <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700 transition-all duration-300 group-hover:rotate-45 group-hover:bg-brand-700 group-hover:text-white"><ArrowUpRight size={19} /></span>
        </div>
      </div>
    </article>
  )
}

interface DepartureCardProps {
  departure: Departure
  selected: boolean
  onSelect: (departure: Departure) => void
}

export function DepartureCard({ departure, selected, onSelect }: DepartureCardProps) {
  return (
    <button type="button" onClick={() => onSelect(departure)} className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${selected ? 'border-brand-600 bg-brand-50 shadow-[0_10px_30px_-20px_rgba(5,95,70,.6)] ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="flex items-center gap-2 font-extrabold text-ink"><CalendarDays size={18} className="text-brand-600" /> {formatDate(departure.startDate)} - {formatDate(departure.endDate)}</p><p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500"><Users size={15} /> Còn {departure.remainingSeats} chỗ</p></div>
        <div className="text-right"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Người lớn</p><p className="mt-1 font-black text-rose-600">{formatMoney(departure.adultPrice)}</p></div>
      </div>
    </button>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title = 'Chưa có dữ liệu', description, action }: EmptyStateProps) {
  return <div className="surface-card grid min-h-80 place-items-center rounded-3xl border-dashed px-6 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SearchX size={30} /></span><h3 className="mt-5 text-xl font-black">{title}</h3>{description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}{action && <div className="mt-6">{action}</div>}</div></div>
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <div key={index} className="surface-card overflow-hidden rounded-3xl"><div className="skeleton-shimmer aspect-[4/3] bg-slate-200" /><div className="space-y-4 p-6"><div className="skeleton-shimmer h-3 w-1/3 rounded-full bg-slate-100" /><div className="skeleton-shimmer h-6 rounded-lg bg-slate-200" /><div className="skeleton-shimmer h-4 w-2/3 rounded-full bg-slate-100" /><div className="skeleton-shimmer mt-6 h-10 rounded-xl bg-slate-100" /></div></div>)}</div>
}

export function Alert({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' }) {
  const colors = tone === 'success' ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800' : 'border-rose-200 bg-rose-50/90 text-rose-700'
  return <div role="alert" className={`animate-fade-in rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-sm ${colors}`}>{children}</div>
}
