import { ArrowRight, BadgeCheck, CalendarCheck, Check, Headphones, MapPin, Search, ShieldCheck, Sparkles, Star, UsersRound, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, dataOf } from '../dich-vu-api'
import { LoadingGrid, TourCard } from '../components/DungChung'
import type { ApiEnvelope, Destination, PaginatedResult, Tour } from '../types/du-lieu'

interface Benefit { icon: LucideIcon; title: string; text: string }

const benefits: Benefit[] = [
  { icon: BadgeCheck, title: 'Lịch trình chọn lọc', text: 'Mỗi hành trình được cân bằng giữa khám phá, nghỉ ngơi và trải nghiệm địa phương.' },
  { icon: ShieldCheck, title: 'Đặt chỗ an tâm', text: 'Chi phí minh bạch, giữ chỗ theo thời gian thực và thanh toán VietQR thuận tiện.' },
  { icon: Headphones, title: 'Hỗ trợ xuyên suốt', text: 'Đội ngũ đồng hành trước, trong và sau chuyến đi, luôn sẵn sàng khi bạn cần.' },
]

const numbers = [
  { value: '30+', label: 'Hành trình chọn lọc' },
  { value: '24/7', label: 'Hỗ trợ khách hàng' },
  { value: '4.9/5', label: 'Mức độ hài lòng' },
]

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ keyword: '', destinationId: '', maxPrice: '' })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get<ApiEnvelope<PaginatedResult<Tour>>>('/tours', { params: { page: 1, limit: 6 } }),
      api.get<ApiEnvelope<PaginatedResult<Destination>>>('/destinations', { params: { page: 1, limit: 100 } }),
    ]).then(([tourResponse, destinationResponse]) => {
      setTours(dataOf(tourResponse).items || [])
      setDestinations(dataOf(destinationResponse).items || [])
    }).finally(() => setLoading(false))
  }, [])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams(Object.entries(search).filter(([, value]) => value))
    navigate(`/tours?${params.toString()}`)
  }

  return (
    <>
      <section className="hero-image flex min-h-[690px] items-center text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.35fr_.65fr]">
            <div className="max-w-3xl animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-100 backdrop-blur"><Sparkles size={15} /> Hành trình của riêng bạn</p>
              <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-.035em] sm:text-6xl lg:text-7xl">Đi xa một chút,<br /><span className="text-emerald-300">nhớ lâu một đời.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-emerald-50/85 sm:text-lg">Khám phá Việt Nam qua những hành trình được chăm chút, lịch trình rõ ràng và trải nghiệm vừa đủ để mỗi khoảnh khắc đều đáng nhớ.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/tours" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-extrabold text-brand-900 shadow-xl transition hover:-translate-y-1 hover:bg-emerald-50">Khám phá tour <ArrowRight size={18} /></Link>
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-50/80"><span className="flex -space-x-2">{[1, 2, 3].map((item) => <span key={item} className="grid size-8 place-items-center rounded-full border-2 border-brand-900 bg-emerald-100 text-[10px] font-black text-brand-800">LV</span>)}</span> Được hàng trăm du khách tin chọn</span>
              </div>
            </div>

            <div className="animate-gentle-float hidden justify-self-end lg:block">
              <div className="w-72 rounded-3xl border border-white/20 bg-white/12 p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-widest text-emerald-100/75">Trải nghiệm</span><span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold"><Star size={13} fill="currentColor" className="text-amber-300" /> 4.9</span></div>
                <p className="mt-7 text-2xl font-black leading-tight">Việt Nam đẹp nhất khi được cảm nhận thật gần.</p>
                <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-3"><UsersRound size={18} className="text-emerald-300" /><strong className="mt-3 block text-lg">500+</strong><span className="text-[11px] text-emerald-50/65">Lượt đồng hành</span></div><div className="rounded-2xl bg-white/10 p-3"><CalendarCheck size={18} className="text-emerald-300" /><strong className="mt-3 block text-lg">30+</strong><span className="text-[11px] text-emerald-50/65">Tour chọn lọc</span></div></div>
              </div>
            </div>
          </div>

          <form onSubmit={submitSearch} className="glass-panel mt-12 grid gap-2.5 rounded-3xl p-2.5 text-ink sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto]">
            <label className="flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition focus-within:bg-brand-50"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Search size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bạn muốn đi đâu?</span><input value={search.keyword} onChange={(event) => setSearch({ ...search, keyword: event.target.value })} placeholder="Tên tour hoặc điểm đến..." className="mt-1 w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-slate-300" /></span></label>
            <label className="flex min-w-0 items-center gap-3 rounded-2xl border-t border-slate-100 px-4 py-3 transition focus-within:bg-brand-50 sm:border-l sm:border-t-0"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><MapPin size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Điểm đến</span><select value={search.destinationId} onChange={(event) => setSearch({ ...search, destinationId: event.target.value })} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"><option value="">Tất cả điểm đến</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></span></label>
            <label className="flex min-w-0 items-center rounded-2xl border-t border-slate-100 px-4 py-3 transition focus-within:bg-brand-50 sm:border-l lg:border-t-0"><span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ngân sách tối đa</span><select value={search.maxPrice} onChange={(event) => setSearch({ ...search, maxPrice: event.target.value })} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none"><option value="">Không giới hạn</option><option value="3000000">Dưới 3 triệu</option><option value="5000000">Dưới 5 triệu</option><option value="10000000">Dưới 10 triệu</option></select></span></label>
            <button className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-7 font-extrabold text-white shadow-lg shadow-rose-900/15 transition hover:-translate-y-0.5 hover:shadow-xl"><Search size={18} /> Tìm tour</button>
          </form>
        </div>
      </section>

      <section className="relative z-10 bg-white py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">{benefits.map(({ icon: Icon, title, text }, index) => <div key={title} className="group rounded-3xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-100 hover:bg-brand-50/40 hover:shadow-xl hover:shadow-emerald-900/5"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white"><Icon size={22} /></span><span className="pt-1 text-xs font-black text-slate-300">0{index + 1}</span></div><h2 className="mt-5 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}</div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-5"><div><p className="section-kicker">Được yêu thích</p><h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">Tour đang chờ bạn</h2><p className="mt-3 max-w-xl text-slate-500">Những hành trình nổi bật, được lựa chọn nhiều nhất cho kỳ nghỉ sắp tới.</p></div><Link to="/tours" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-brand-700 shadow-sm transition hover:border-brand-300 hover:shadow-md sm:flex">Xem tất cả <ArrowRight size={17} /></Link></div>
          {loading ? <LoadingGrid /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>}
          <Link to="/tours" className="mt-8 flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white py-3 font-bold text-brand-700 sm:hidden">Xem tất cả <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-35px_rgba(5,70,52,.5)]"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=88" alt="Du khách tận hưởng hành trình khám phá thiên nhiên" className="aspect-[5/4] w-full object-cover" /></div>
            <div className="absolute -bottom-6 right-4 rounded-2xl border border-white bg-white/95 p-4 shadow-xl backdrop-blur sm:right-8"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-brand-700"><Star size={21} fill="currentColor" /></span><div><strong className="block text-xl font-black">4.9/5</strong><span className="text-xs text-slate-500">Trải nghiệm được yêu thích</span></div></div></div>
          </div>
          <div className="lg:pl-5"><p className="section-kicker">Vì sao chọn chúng tôi</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">Chuyến đi trọn vẹn bắt đầu từ những chi tiết rõ ràng.</h2><p className="mt-5 leading-7 text-slate-500">Từ lựa chọn lịch trình, kiểm tra chỗ trống đến thanh toán và theo dõi đơn, mọi bước đều được thiết kế đơn giản để bạn dành nhiều thời gian hơn cho trải nghiệm.</p><div className="mt-7 space-y-4">{['Lịch trình chi tiết theo từng ngày', 'Giá tour và chỗ trống cập nhật minh bạch', 'Thanh toán VietQR nhanh chóng, thuận tiện', 'Đội ngũ hỗ trợ xuyên suốt hành trình'].map((item) => <p key={item} className="flex items-center gap-3 font-semibold text-slate-700"><span className="grid size-7 place-items-center rounded-full bg-brand-100 text-brand-700"><Check size={15} strokeWidth={3} /></span>{item}</p>)}</div><div className="mt-9 grid grid-cols-3 gap-3 border-t border-slate-100 pt-7">{numbers.map((item) => <div key={item.label}><strong className="block text-2xl font-black text-brand-700">{item.value}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{item.label}</span></div>)}</div></div>
        </div>
      </section>

      <section className="paper-grid border-y border-slate-200/70 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="section-kicker">Bắt đầu hôm nay</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Một chuyến đi hay bắt đầu từ một lựa chọn nhỏ.</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">Chọn điểm đến, xem lịch trình từng ngày và giữ chỗ cho cả đoàn chỉ trong vài phút.</p>
          <Link to="/tours" className="mt-8 inline-flex h-13 items-center gap-2 rounded-full bg-brand-700 px-7 font-extrabold text-white shadow-xl shadow-emerald-900/15 transition hover:-translate-y-1 hover:bg-brand-800">Khám phá tour <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  )
}
