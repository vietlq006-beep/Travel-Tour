import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, Headphones, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { api, dataOf } from '../api'
import { LoadingGrid, TourCard } from '../components/Shared'

const benefits = [
  { icon: BadgeCheck, title: 'Lịch trình chọn lọc', text: 'Thông tin minh bạch, trải nghiệm được thiết kế vừa đủ.' },
  { icon: ShieldCheck, title: 'Đặt chỗ an tâm', text: 'Giá được xác nhận trực tiếp từ hệ thống, không phí ẩn.' },
  { icon: Headphones, title: 'Hỗ trợ xuyên suốt', text: 'Đồng hành trước, trong và sau mỗi chuyến đi.' },
]

export default function HomePage() {
  const [tours, setTours] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ keyword: '', destinationId: '', maxPrice: '' })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/tours', { params: { page: 1, limit: 6 } }),
      api.get('/destinations', { params: { page: 1, limit: 100 } }),
    ]).then(([tourResponse, destinationResponse]) => {
      setTours(dataOf(tourResponse).items || [])
      setDestinations(dataOf(destinationResponse).items || [])
    }).finally(() => setLoading(false))
  }, [])

  const submitSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams(Object.entries(search).filter(([, value]) => value))
    navigate(`/tours?${params.toString()}`)
  }

  return (
    <>
      <section className="hero-image flex min-h-[590px] items-center text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-up">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-200"><Sparkles size={16} /> Hành trình của riêng bạn</p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Đi xa một chút,<br />nhớ lâu một đời.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/90 sm:text-lg">Khám phá những điểm đến đáng nhớ tại Việt Nam với lịch trình rõ ràng, mức giá minh bạch và đội ngũ tận tâm.</p>
          </div>

          <form onSubmit={submitSearch} className="mt-10 grid max-w-5xl gap-3 rounded-md bg-white p-3 text-ink shadow-2xl sm:grid-cols-[1.2fr_1fr_1fr_auto]">
            <label className="flex min-w-0 items-center gap-3 rounded border border-slate-200 px-3 py-2.5 focus-within:border-brand-600"><Search size={19} className="shrink-0 text-brand-600" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-400">Bạn muốn đi đâu?</span><input value={search.keyword} onChange={(event) => setSearch({ ...search, keyword: event.target.value })} placeholder="Tên tour..." className="w-full outline-none placeholder:text-slate-300" /></span></label>
            <label className="flex min-w-0 items-center gap-3 rounded border border-slate-200 px-3 py-2.5 focus-within:border-brand-600"><MapPin size={19} className="shrink-0 text-brand-600" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-400">Điểm đến</span><select value={search.destinationId} onChange={(event) => setSearch({ ...search, destinationId: event.target.value })} className="w-full bg-white outline-none"><option value="">Tất cả</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></span></label>
            <label className="rounded border border-slate-200 px-3 py-2.5 focus-within:border-brand-600"><span className="block text-xs font-bold text-slate-400">Ngân sách tối đa</span><select value={search.maxPrice} onChange={(event) => setSearch({ ...search, maxPrice: event.target.value })} className="w-full bg-white outline-none"><option value="">Không giới hạn</option><option value="3000000">Dưới 3 triệu</option><option value="5000000">Dưới 5 triệu</option><option value="10000000">Dưới 10 triệu</option></select></label>
            <button className="flex min-h-14 items-center justify-center gap-2 rounded bg-rose-600 px-6 font-extrabold text-white transition hover:bg-rose-700"><Search size={19} /> Tìm tour</button>
          </form>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 md:grid-cols-3 lg:px-8">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700"><Icon size={22} /></span><div><h2 className="font-extrabold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{text}</p></div></div>)}</div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Được yêu thích</p><h2 className="mt-2 text-3xl font-black text-ink">Tour đang chờ bạn</h2></div><Link to="/tours" className="hidden items-center gap-2 font-bold text-brand-700 sm:flex">Xem tất cả <ArrowRight size={18} /></Link></div>
          {loading ? <LoadingGrid /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>}
          <Link to="/tours" className="mt-7 flex items-center justify-center gap-2 font-bold text-brand-700 sm:hidden">Xem tất cả <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="paper-grid border-y border-slate-200 bg-[#eef5f1] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="text-sm font-bold uppercase tracking-widest text-brand-700">Bắt đầu hôm nay</p><h2 className="mt-3 text-3xl font-black">Một chuyến đi hay bắt đầu từ một lựa chọn nhỏ.</h2><p className="mx-auto mt-3 max-w-2xl text-slate-600">Chọn điểm đến, xem lịch trình từng ngày và giữ chỗ cho cả đoàn chỉ trong vài phút.</p><Link to="/tours" className="mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-brand-700 px-6 font-bold text-white hover:bg-brand-800">Khám phá tour <ArrowRight size={18} /></Link></div>
      </section>
    </>
  )
}
