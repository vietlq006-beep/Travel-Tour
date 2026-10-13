import { Map, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, apiError, dataOf } from '../dich-vu-api'
import { Alert, EmptyState, LoadingGrid, TourCard } from '../components/DungChung'
import type { ApiEnvelope, Destination, PaginatedResult, Tour } from '../types/du-lieu'

const EMPTY_RESULT: PaginatedResult<Tour> = {
  items: [],
  pagination: { page: 1, limit: 9, totalItems: 0, totalPages: 0 },
}

export default function ToursPage() {
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState<PaginatedResult<Tour>>(EMPTY_RESULT)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [keywordInput, setKeywordInput] = useState(params.get('keyword') || '')
  const queryKey = params.toString()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keywordInput === (params.get('keyword') || '')) return
      const next = new URLSearchParams(params)
      if (keywordInput.trim()) next.set('keyword', keywordInput.trim())
      else next.delete('keyword')
      next.set('page', '1')
      setLoading(true)
      setParams(next)
    }, 450)
    return () => window.clearTimeout(timer)
  }, [keywordInput, params, setParams])

  useEffect(() => {
    api.get<ApiEnvelope<PaginatedResult<Tour>>>('/tours', { params: Object.fromEntries(new URLSearchParams(queryKey)) })
      .then((response) => { setError(''); setResult(dataOf(response)) })
      .catch((requestError: unknown) => setError(apiError(requestError)))
      .finally(() => setLoading(false))
  }, [queryKey])

  useEffect(() => {
    api.get<ApiEnvelope<PaginatedResult<Destination>>>('/destinations', { params: { page: 1, limit: 100 } })
      .then((response) => setDestinations(dataOf(response).items || []))
  }, [])

  const update = (key: string, value: string) => {
    setLoading(true)
    setError('')
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.set('page', '1')
    setParams(next)
  }

  const reset = () => {
    setLoading(true)
    setError('')
    setParams({ page: '1', limit: '9' })
    setKeywordInput('')
  }

  const activeFilterCount = ['keyword', 'destinationId', 'minPrice', 'maxPrice', 'startDate', 'endDate', 'departureCity', 'minDuration', 'maxDuration', 'minRating', 'vehicleType', 'minSeats'].filter((key) => params.get(key)).length
  const fieldClass = 'h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100'

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-widest text-brand-600">Tùy chọn</p><h2 className="mt-1 text-lg font-black">Bộ lọc tour</h2></div><button type="button" onClick={reset} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"><RotateCcw size={14} /> Xóa lọc</button></div>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">Từ khóa</span><span className="relative block"><Search size={17} className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" /><input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tên tour..." className={`${fieldClass} pl-10`} /></span><span className="mt-1 block text-xs text-slate-400">Tìm sau 450ms khi ngừng gõ</span></label>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">Điểm đến</span><select value={params.get('destinationId') || ''} onChange={(event) => update('destinationId', event.target.value)} className={fieldClass}><option value="">Tất cả điểm đến</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div><span className="mb-2 block text-sm font-extrabold">Khoảng giá / người</span><div className="grid grid-cols-2 gap-2"><input type="number" min={0} value={params.get('minPrice') || ''} onChange={(event) => update('minPrice', event.target.value)} placeholder="Từ" className={`${fieldClass} min-w-0`} /><input type="number" min={0} value={params.get('maxPrice') || ''} onChange={(event) => update('maxPrice', event.target.value)} placeholder="Đến" className={`${fieldClass} min-w-0`} /></div></div>
      <div><span className="mb-2 block text-sm font-extrabold">Ngày đi</span><div className="grid grid-cols-2 gap-2"><input type="date" value={params.get('startDate') || ''} onChange={(event) => update('startDate', event.target.value)} className={`${fieldClass} min-w-0`} /><input type="date" value={params.get('endDate') || ''} onChange={(event) => update('endDate', event.target.value)} className={`${fieldClass} min-w-0`} /></div></div>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">Nơi khởi hành</span><input value={params.get('departureCity') || ''} onChange={(event) => update('departureCity', event.target.value)} placeholder="Đà Nẵng, Hà Nội..." className={fieldClass} /></label>
      <div><span className="mb-2 block text-sm font-extrabold">Thời lượng (ngày)</span><div className="grid grid-cols-2 gap-2"><input type="number" min={1} value={params.get('minDuration') || ''} onChange={(event) => update('minDuration', event.target.value)} placeholder="Từ" className={`${fieldClass} min-w-0`} /><input type="number" min={1} value={params.get('maxDuration') || ''} onChange={(event) => update('maxDuration', event.target.value)} placeholder="Đến" className={`${fieldClass} min-w-0`} /></div></div>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">Phương tiện</span><input value={params.get('vehicleType') || ''} onChange={(event) => update('vehicleType', event.target.value)} placeholder="Xe, máy bay..." className={fieldClass} /></label>
      <div className="grid grid-cols-2 gap-2"><label><span className="mb-2 block text-sm font-extrabold">Rating từ</span><select value={params.get('minRating') || ''} onChange={(event) => update('minRating', event.target.value)} className={fieldClass}><option value="">Tất cả</option><option value="3">3 sao</option><option value="4">4 sao</option><option value="4.5">4.5 sao</option></select></label><label><span className="mb-2 block text-sm font-extrabold">Chỗ còn lại</span><input type="number" min={1} value={params.get('minSeats') || ''} onChange={(event) => update('minSeats', event.target.value)} className={fieldClass} /></label></div>
      <label className="block"><span className="mb-2 block text-sm font-extrabold">Sắp xếp</span><select value={params.get('sort') || 'newest'} onChange={(event) => update('sort', event.target.value)} className={fieldClass}><option value="newest">Mới nhất</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option><option value="departure_asc">Ngày đi gần nhất</option><option value="popular">Phổ biến</option><option value="rating">Đánh giá cao</option></select></label>
      <div className="rounded-2xl bg-brand-50 p-4"><p className="text-xs font-extrabold text-brand-800">Cần tư vấn hành trình?</p><p className="mt-1 text-xs leading-5 text-slate-500">Gọi <a href="tel:19001234" className="font-black text-brand-700">1900 1234</a> để được hỗ trợ lựa chọn tour.</p></div>
    </div>
  )

  const { pagination } = result
  return (
    <section className="min-h-[70vh] pb-20">
      <div className="relative overflow-hidden bg-[#0b3b30] py-16 text-white sm:py-20">
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-emerald-400/10 blur-3xl" /><div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-orange-300/5 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-300"><Map size={16} /> Khám phá Việt Nam</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Tìm hành trình dành cho bạn</h1><p className="mt-4 max-w-2xl leading-7 text-emerald-50/70">Từ biển xanh đến núi cao, chọn điểm đến và ngân sách phù hợp cho chuyến đi tiếp theo.</p><div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur"><strong className="text-emerald-300">{pagination.totalItems}</strong> tour đang sẵn sàng</div></div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between lg:hidden"><p className="text-sm font-bold text-slate-500">{pagination.totalItems} kết quả</p><button type="button" onClick={() => setFiltersOpen(true)} className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold shadow-sm"><SlidersHorizontal size={17} /> Bộ lọc {activeFilterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-[10px] text-white">{activeFilterCount}</span>}</button></div>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="surface-card sticky top-32 hidden self-start rounded-3xl p-6 lg:block">{filterPanel}</aside>
          <div>{error && <div className="mb-5"><Alert>{error}</Alert></div>}{loading ? <LoadingGrid count={6} /> : result.items.length ? <><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>{pagination.totalPages > 1 && <div className="mt-10 flex flex-wrap justify-center gap-2">{Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => <button type="button" key={page} onClick={() => update('page', String(page))} className={`grid size-11 place-items-center rounded-full border text-sm font-extrabold transition ${page === pagination.page ? 'border-brand-700 bg-brand-700 text-white shadow-lg shadow-emerald-900/15' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'}`}>{page}</button>)}</div>}</> : <EmptyState title="Không tìm thấy tour" description="Thử thay đổi điểm đến hoặc khoảng giá bạn đang tìm." />}</div>
        </div>
      </div>
      {filtersOpen && <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden" onClick={() => setFiltersOpen(false)}><aside className="animate-fade-in ml-auto h-full w-[90%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><strong className="text-lg">Tìm tour phù hợp</strong><button type="button" aria-label="Đóng bộ lọc" onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full border border-slate-200"><X size={20} /></button></div>{filterPanel}<button type="button" onClick={() => setFiltersOpen(false)} className="mt-7 h-12 w-full rounded-xl bg-brand-700 font-extrabold text-white">Xem {pagination.totalItems} kết quả</button></aside></div>}
    </section>
  )
}
