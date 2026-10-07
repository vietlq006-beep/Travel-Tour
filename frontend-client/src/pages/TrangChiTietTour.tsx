import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, MapPin, ShieldCheck, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiError, assetUrl, dataOf, FALLBACK_IMAGE, formatMoney } from '../dich-vu-api'
import { Alert, DepartureCard } from '../components/DungChung'
import type { ApiEnvelope, Departure, Tour } from '../types/du-lieu'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [selected, setSelected] = useState<Departure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<ApiEnvelope<Tour>>(`/tours/${id}`)
      .then((response) => {
        const nextTour = dataOf(response)
        setTour(nextTour)
        setSelected(nextTour.departures?.[0] || null)
      })
      .catch((requestError: unknown) => setError(apiError(requestError, 'Không thể tải thông tin tour.')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="mx-auto min-h-[70vh] max-w-7xl animate-pulse px-4 py-12"><div className="h-8 w-2/3 bg-slate-200" /><div className="mt-8 aspect-[16/6] rounded-md bg-slate-200" /></div>
  if (error || !tour) return <div className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16"><Alert>{error || 'Không tìm thấy tour.'}</Alert><Link to="/tours" className="mt-5 inline-flex items-center gap-2 font-bold text-brand-700"><ArrowLeft size={18} /> Quay lại danh sách</Link></div>

  const gallery = [tour.thumbnail, ...(Array.isArray(tour.images) ? tour.images : [])].filter(Boolean).slice(0, 3)
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400"><Link to="/">Trang chủ</Link><ChevronRight size={14} /><Link to="/tours">Tour</Link><ChevronRight size={14} /><span className="text-slate-600">{tour.name}</span></div>
          <div className="mt-7 grid gap-3 overflow-hidden rounded-md sm:grid-cols-[2fr_1fr]">
            <img src={assetUrl(gallery[0]) || FALLBACK_IMAGE} alt={tour.name} className="h-full min-h-72 w-full object-cover sm:row-span-2 sm:min-h-[480px]" />
            <img src={assetUrl(gallery[1] || gallery[0]) || FALLBACK_IMAGE} alt="" className="hidden h-full min-h-56 w-full object-cover sm:block" />
            <img src={assetUrl(gallery[2] || gallery[0]) || FALLBACK_IMAGE} alt="" className="hidden h-full min-h-56 w-full object-cover sm:block" />
          </div>
        </div>
      </section>
      <section className="py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="min-w-0">
            <span className="rounded bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">{tour.category?.name || 'Tour trong nước'}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{tour.name}</h1>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2"><MapPin size={17} className="text-brand-600" /> {tour.destinations?.map((item) => item.name).join(' · ') || 'Việt Nam'}</span>
              <span className="flex items-center gap-2"><Clock3 size={17} className="text-brand-600" /> {tour.durationDays} ngày {tour.durationNights} đêm</span>
              <span className="flex items-center gap-2 text-amber-600"><Star size={17} fill="currentColor" /> {Number(tour.rating?.average || 0).toFixed(1)} ({tour.rating?.count || 0})</span>
            </div>
            <div className="mt-9 border-t border-slate-200 pt-8"><h2 className="text-2xl font-black">Tổng quan hành trình</h2><p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{tour.overview || 'Một hành trình được chuẩn bị kỹ lưỡng để bạn tận hưởng trọn vẹn từng điểm đến.'}</p></div>
            <div className="mt-10 border-t border-slate-200 pt-8"><h2 className="text-2xl font-black">Lịch trình theo ngày</h2><div className="mt-6 space-y-0">{tour.itineraries?.length ? tour.itineraries.map((item, index) => <div key={item.id || item.dayNumber} className="relative grid grid-cols-[48px_1fr] gap-4 pb-8"><div className="relative z-10 grid size-12 place-items-center rounded-md bg-brand-700 text-sm font-black text-white">N{item.dayNumber}</div>{index < (tour.itineraries?.length || 0) - 1 && <span className="absolute left-6 top-12 h-full w-px bg-emerald-200" />}<div className="pt-1"><h3 className="text-lg font-extrabold">{item.title}</h3><p className="mt-2 leading-7 text-slate-600">{item.description}</p></div></div>) : <p className="text-slate-500">Lịch trình chi tiết đang được cập nhật.</p>}</div></div>
            <div className="mt-10 border-t border-slate-200 pt-8"><h2 className="text-2xl font-black">An tâm trên mỗi hành trình</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{['Giá công khai, không phí ẩn', 'Xác nhận chỗ theo thời gian thực', 'Thông tin đoàn được bảo mật', 'Hỗ trợ trong suốt chuyến đi'].map((text) => <p key={text} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm font-semibold"><Check size={18} className="text-brand-600" /> {text}</p>)}</div></div>
          </div>
          <aside className="self-start lg:sticky lg:top-24"><div className="rounded-md border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Chọn ngày khởi hành</p><p className="mt-1 text-lg font-black">Lịch đang mở</p></div><CalendarDays className="text-brand-600" /></div><div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto pr-1">{tour.departures?.length ? tour.departures.map((departure) => <DepartureCard key={departure.id} departure={departure} selected={selected?.id === departure.id} onSelect={setSelected} />) : <div className="rounded-md bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Chưa có lịch khởi hành đang mở.</div>}</div>{selected && <div className="mt-5 border-t border-slate-100 pt-5"><div className="flex items-end justify-between"><span className="text-sm text-slate-500">Giá người lớn</span><strong className="text-xl text-rose-600">{formatMoney(selected.adultPrice)}</strong></div><p className="mt-1 text-right text-xs text-slate-400">Trẻ em: {formatMoney(selected.childPrice)}</p><button type="button" onClick={() => navigate(`/booking/${tour.id}?departure=${selected.id}`)} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-rose-600 font-extrabold text-white hover:bg-rose-700">Đặt tour này <ChevronRight size={18} /></button></div>}<p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} /> Chưa thu tiền ở bước tiếp theo</p></div></aside>
        </div>
      </section>
    </>
  )
}
