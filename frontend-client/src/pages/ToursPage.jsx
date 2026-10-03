import { useEffect, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api, apiError, dataOf } from '../api'
import { Alert, EmptyState, LoadingGrid, TourCard } from '../components/Shared'

export default function ToursPage() {
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState({ items: [], pagination: {} })
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const queryKey = params.toString()

  useEffect(() => {
    api.get('/tours', { params: Object.fromEntries(new URLSearchParams(queryKey)) })
      .then((response) => { setError(''); setResult(dataOf(response)) })
      .catch((requestError) => setError(apiError(requestError)))
      .finally(() => setLoading(false))
  }, [queryKey])

  useEffect(() => {
    api.get('/destinations', { params: { page: 1, limit: 100 } }).then((response) => setDestinations(dataOf(response).items || []))
  }, [])

  const update = (key, value) => {
    setLoading(true); setError('')
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.set('page', '1')
    setParams(next)
  }

  const reset = () => { setLoading(true); setError(''); setParams({ page: '1', limit: '9' }) }

  const filterPanel = <div className="space-y-6">
    <div className="flex items-center justify-between"><h2 className="font-extrabold">Bộ lọc</h2><button type="button" onClick={reset} className="text-sm font-bold text-brand-700">Xóa lọc</button></div>
    <label className="block"><span className="mb-2 block text-sm font-bold">Từ khóa</span><input value={params.get('keyword') || ''} onChange={(event) => update('keyword', event.target.value)} placeholder="Tên tour..." className="h-11 w-full rounded border border-slate-300 bg-white px-3 outline-none focus:border-brand-600" /></label>
    <label className="block"><span className="mb-2 block text-sm font-bold">Điểm đến</span><select value={params.get('destinationId') || ''} onChange={(event) => update('destinationId', event.target.value)} className="h-11 w-full rounded border border-slate-300 bg-white px-3 outline-none focus:border-brand-600"><option value="">Tất cả điểm đến</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <div><span className="mb-2 block text-sm font-bold">Khoảng giá / người</span><div className="grid grid-cols-2 gap-2"><input type="number" min="0" value={params.get('minPrice') || ''} onChange={(event) => update('minPrice', event.target.value)} placeholder="Từ" className="h-11 min-w-0 rounded border border-slate-300 px-3 outline-none focus:border-brand-600" /><input type="number" min="0" value={params.get('maxPrice') || ''} onChange={(event) => update('maxPrice', event.target.value)} placeholder="Đến" className="h-11 min-w-0 rounded border border-slate-300 px-3 outline-none focus:border-brand-600" /></div></div>
  </div>

  const pagination = result.pagination || {}
  return (
    <section className="min-h-[70vh] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Khám phá Việt Nam</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Tìm hành trình phù hợp</h1><p className="mt-2 text-slate-500">{pagination.totalItems || 0} tour sẵn sàng để khám phá</p></div>
        <button type="button" onClick={() => setFiltersOpen(true)} className="mb-5 flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 font-bold lg:hidden"><SlidersHorizontal size={18} /> Bộ lọc</button>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden self-start rounded-md border border-slate-200 bg-white p-5 lg:block">{filterPanel}</aside>
          <div>{error && <div className="mb-5"><Alert>{error}</Alert></div>}{loading ? <LoadingGrid count={6} /> : result.items?.length ? <><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{result.items.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>{pagination.totalPages > 1 && <div className="mt-8 flex justify-center gap-2">{Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => <button type="button" key={page} onClick={() => update('page', String(page))} className={`grid size-10 place-items-center rounded border text-sm font-bold ${page === pagination.page ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white'}`}>{page}</button>)}</div>}</> : <EmptyState title="Không tìm thấy tour" description="Thử thay đổi điểm đến hoặc khoảng giá bạn đang tìm." />}</div>
        </div>
      </div>
      {filtersOpen && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setFiltersOpen(false)}><aside className="ml-auto h-full w-[88%] max-w-sm overflow-y-auto bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex justify-end"><button type="button" aria-label="Đóng bộ lọc" onClick={() => setFiltersOpen(false)} className="grid size-10 place-items-center rounded border border-slate-200"><X size={20} /></button></div>{filterPanel}</aside></div>}
    </section>
  )
}
