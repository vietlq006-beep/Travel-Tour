import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, GitCompareArrows, Heart, MapPin, ShieldCheck, Star } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, apiError, assetUrl, dataOf, FALLBACK_IMAGE, formatMoney, youtubeEmbedUrl } from '../dich-vu-api'
import { Alert, DepartureCard, TourCard } from '../components/DungChung'
import { useAuth } from '../ngu-canh-xac-thuc'
import type { ApiEnvelope, Booking, Departure, PaginatedResult, Review, Tour } from '../types/du-lieu'
import { hasTour, rememberTour, toggleTour } from '../tien-ich-tour'

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tour, setTour] = useState<Tour | null>(null)
  const [selected, setSelected] = useState<Departure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recommendations, setRecommendations] = useState<Tour[]>([])
  const [wishlisted, setWishlisted] = useState(false)
  const [compared, setCompared] = useState(false)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: '' })
  const [reviewBusy, setReviewBusy] = useState(false)
  const [reviewNotice, setReviewNotice] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    api.get<ApiEnvelope<Tour>>(`/tours/${id}`)
      .then((response) => {
        const nextTour = dataOf(response)
        setTour(nextTour)
        setSelected(nextTour.departures?.[0] || null)
        rememberTour(nextTour)
        setWishlisted(hasTour('wishlist', nextTour.id))
        setCompared(hasTour('compare', nextTour.id))
        api.get<ApiEnvelope<Tour[]>>(`/tours/${nextTour.id}/recommendations`).then((value) => setRecommendations(dataOf(value))).catch(() => undefined)
        if (user) {
          api.get<ApiEnvelope<PaginatedResult<Booking>>>('/bookings', { params: { tourId: nextTour.id, page: 1, limit: 100 } })
            .then((bookingResponse) => {
              const items = (dataOf(bookingResponse).items || []).filter((item) => (
                item.status === 'COMPLETED'
                || (item.status === 'CONFIRMED' && item.payments?.some((payment) => payment.status === 'SUCCESS'))
              ))
              const eligible = items.find((item) => !item.review) || items[0] || null
              setReviewBooking(eligible)
              setReviewDraft({ rating: eligible?.review?.rating || 5, comment: eligible?.review?.comment || '' })
            })
            .catch(() => setReviewBooking(null))
        } else setReviewBooking(null)
      })
      .catch((requestError: unknown) => setError(apiError(requestError, 'Không thể tải thông tin tour.')))
      .finally(() => setLoading(false))
  }, [id, user])

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!tour || !reviewBooking) return
    setReviewBusy(true)
    setReviewError('')
    setReviewNotice('')
    try {
      const payload = { rating: reviewDraft.rating, comment: reviewDraft.comment.trim() || undefined }
      const response = reviewBooking.review
        ? await api.put<ApiEnvelope<Review>>(`/reviews/${reviewBooking.review.id}`, payload)
        : await api.post<ApiEnvelope<Review>>('/reviews', { bookingId: reviewBooking.id, ...payload })
      const saved = dataOf(response)
      setReviewBooking((current) => current ? { ...current, review: saved } : current)
      setReviewNotice(reviewBooking.review ? 'Đã cập nhật đánh giá của bạn.' : 'Cảm ơn bạn đã đánh giá chuyến đi.')
      const refreshed = dataOf<Tour>(await api.get<ApiEnvelope<Tour>>(`/tours/${tour.id}`))
      setTour(refreshed)
    } catch (requestError) {
      setReviewError(apiError(requestError, 'Không thể gửi đánh giá.'))
    } finally {
      setReviewBusy(false)
    }
  }

  if (loading) return <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12"><div className="skeleton-shimmer h-8 w-2/3 rounded-lg bg-slate-200" /><div className="skeleton-shimmer mt-8 aspect-[16/6] rounded-3xl bg-slate-200" /></div>
  if (error || !tour) return <div className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16"><Alert>{error || 'Không tìm thấy tour.'}</Alert><Link to="/tours" className="mt-5 inline-flex items-center gap-2 font-bold text-brand-700"><ArrowLeft size={18} /> Quay lại danh sách</Link></div>

  const gallery = [tour.thumbnail, ...(Array.isArray(tour.images) ? tour.images : [])].filter(Boolean).slice(0, 3)
  const videoEmbedUrl = youtubeEmbedUrl(tour.videoUrl)
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400"><Link className="transition hover:text-brand-700" to="/">Trang chủ</Link><ChevronRight size={13} /><Link className="transition hover:text-brand-700" to="/tours">Tour</Link><ChevronRight size={13} /><span className="line-clamp-1 text-slate-600">{tour.name}</span></div>
          <div className="mt-7 grid gap-2.5 overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_30px_70px_-40px_rgba(15,64,51,.45)] sm:grid-cols-[2fr_1fr]">
            <img src={assetUrl(gallery[0]) || FALLBACK_IMAGE} alt={tour.name} className="h-full min-h-72 w-full object-cover sm:row-span-2 sm:min-h-[480px]" />
            <img src={assetUrl(gallery[1] || gallery[0]) || FALLBACK_IMAGE} alt="" className="hidden h-full min-h-56 w-full object-cover sm:block" />
            <img src={assetUrl(gallery[2] || gallery[0]) || FALLBACK_IMAGE} alt="" className="hidden h-full min-h-56 w-full object-cover sm:block" />
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-extrabold text-brand-800">{tour.category?.name || 'Tour trong nước'}</span>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{tour.name}</h1>
            <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setWishlisted(toggleTour('wishlist', tour))} className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold ${wishlisted ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600'}`}><Heart size={17} className={wishlisted ? 'fill-current' : ''} /> {wishlisted ? 'Đã yêu thích' : 'Yêu thích'}</button><button type="button" onClick={() => setCompared(toggleTour('compare', tour))} className={`flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold ${compared ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}><GitCompareArrows size={17} /> {compared ? 'Đã thêm so sánh' : 'So sánh tour'}</button></div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><MapPin size={17} className="text-brand-600" /> {tour.destinations?.map((item) => item.name).join(' · ') || 'Việt Nam'}</span>
              <span className="flex items-center gap-2"><Clock3 size={17} className="text-brand-600" /> {tour.durationDays} ngày {tour.durationNights} đêm</span>
              <span className="flex items-center gap-2 text-amber-600"><Star size={17} fill="currentColor" /> {Number(tour.rating?.average || 0).toFixed(1)} ({tour.rating?.count || 0})</span>
            </div>
            <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Tổng quan hành trình</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{tour.overview || 'Một hành trình được chuẩn bị kỹ lưỡng để bạn tận hưởng trọn vẹn từng điểm đến.'}</p></div>
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Dịch vụ & điều kiện tour</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{[
              ['Bao gồm', tour.includedServices], ['Không bao gồm', tour.excludedServices], ['Chính sách hủy', tour.cancellationPolicy], ['Chính sách đổi', tour.changePolicy], ['Trẻ em', tour.childPolicy], ['Em bé', tour.infantPolicy], ['Người cao tuổi', tour.seniorPolicy], ['Điểm đón', tour.pickupPoints?.join(', ')], ['Giờ tập trung', tour.meetingInstructions], ['Hành lý', tour.luggagePolicy], ['Bảo hiểm', tour.insuranceDetails], ['Visa', tour.visaRequirements], ['Giấy tờ cần thiết', tour.requiredDocuments], ['Điều khoản', selected?.termsOverride || tour.termsAndConditions],
            ].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><h3 className="font-extrabold text-slate-800">{label}</h3><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{value}</p></div>)}</div>{tour.depositPercent ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Đặt cọc {tour.depositPercent}% để xác nhận chỗ; phần còn lại thanh toán theo hướng dẫn trong đơn.</p> : null}</div>
            {videoEmbedUrl && <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Video điểm đến</h2><div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-xl"><iframe className="h-full w-full" src={videoEmbedUrl} title={`Video giới thiệu ${tour.name}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div><p className="mt-3 text-xs leading-5 text-slate-400">Video giới thiệu từ kênh du lịch chính thức; nội dung lịch trình và dịch vụ áp dụng theo thông tin tour bên dưới.</p></div>}
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">Lịch trình theo ngày</h2><div className="mt-7 space-y-0">{tour.itineraries?.length ? tour.itineraries.map((item, index) => <div key={item.id || item.dayNumber} className="relative grid grid-cols-[52px_1fr] gap-4 pb-9"><div className="relative z-10 grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-black text-white shadow-lg shadow-emerald-900/15">N{item.dayNumber}</div>{index < (tour.itineraries?.length || 0) - 1 && <span className="absolute left-[26px] top-13 h-full w-px bg-emerald-200" />}<div className="pt-1"><h3 className="text-lg font-extrabold">{item.title}</h3><p className="mt-2 leading-7 text-slate-600">{item.description}</p></div></div>) : <p className="text-slate-500">Lịch trình chi tiết đang được cập nhật.</p>}</div></div>
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-black">An tâm trên mỗi hành trình</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{['Giá công khai, không phí ẩn', 'Xác nhận chỗ theo thời gian thực', 'Thông tin đoàn được bảo mật', 'Hỗ trợ trong suốt chuyến đi'].map((text) => <p key={text} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm font-bold"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><Check size={16} strokeWidth={3} /></span>{text}</p>)}</div></div>
            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black">Đánh giá từ khách hàng</h2>
                <span className="shrink-0 font-black text-amber-600">{Number(tour.rating?.average || 0).toFixed(1)} / 5</span>
              </div>

              <div className="mt-6">
                {reviewNotice && <Alert tone="success">{reviewNotice}</Alert>}
                {reviewError && <div className={reviewNotice ? 'mt-3' : ''}><Alert>{reviewError}</Alert></div>}

                {!user ? (
                  <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                    <h3 className="font-extrabold text-brand-900">Bạn đã trải nghiệm tour này?</h3>
                    <p className="mt-1 text-sm leading-6 text-brand-800">Đăng nhập để đánh giá tour sau khi đơn đã thanh toán thành công hoặc chuyến đi đã hoàn thành.</p>
                    <Link to="/login" className="mt-4 inline-flex rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-800">Đăng nhập để đánh giá</Link>
                  </div>
                ) : reviewBooking ? (
                  <form onSubmit={submitReview} className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-5 ${reviewNotice || reviewError ? 'mt-4' : ''}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900">{reviewBooking.review ? 'Cập nhật đánh giá của bạn' : 'Chia sẻ trải nghiệm của bạn'}</h3>
                        <p className="mt-1 text-sm text-slate-600">Áp dụng cho đơn <strong>{reviewBooking.bookingCode}</strong> đã thanh toán thành công.</p>
                      </div>
                      {reviewBooking.review && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">Đã đánh giá</span>}
                    </div>
                    <fieldset className="mt-5">
                      <legend className="text-sm font-bold text-slate-700">Mức độ hài lòng</legend>
                      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Số sao đánh giá">
                        {Array.from({ length: 5 }, (_, index) => {
                          const value = index + 1
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={reviewDraft.rating === value}
                              aria-label={`${value} sao`}
                              onClick={() => setReviewDraft((current) => ({ ...current, rating: value }))}
                              className="rounded-lg p-1.5 text-amber-500 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              <Star size={28} className={value <= reviewDraft.rating ? 'fill-current' : 'text-slate-300'} />
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                    <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="tour-review-comment">Nhận xét</label>
                    <textarea
                      id="tour-review-comment"
                      value={reviewDraft.comment}
                      onChange={(event) => setReviewDraft((current) => ({ ...current, comment: event.target.value }))}
                      maxLength={2000}
                      rows={4}
                      placeholder="Điều gì khiến chuyến đi đáng nhớ?"
                      className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">{reviewDraft.comment.length}/2000 ký tự</span>
                      <button disabled={reviewBusy} className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60">
                        {reviewBusy ? 'Đang lưu...' : reviewBooking.review ? 'Lưu đánh giá' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-5 ${reviewNotice || reviewError ? 'mt-4' : ''}`}>
                    <h3 className="font-extrabold text-slate-800">Đánh giá dành cho khách đã thanh toán</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Khi thanh toán được xác nhận, bạn có thể quay lại đây hoặc vào trang đơn hàng để gửi đánh giá.</p>
                    <Link to="/my-bookings" className="mt-3 inline-flex text-sm font-extrabold text-brand-700 hover:text-brand-800">Xem đơn hàng của tôi</Link>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {tour.reviews?.length ? tour.reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{review.user?.fullName || 'Khách hàng'}</strong>
                      <span className="flex text-amber-500" aria-label={`${review.rating} trên 5 sao`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} className={index < review.rating ? 'fill-current' : 'text-slate-300'} />)}</span>
                    </div>
                    {review.comment && <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>}
                  </article>
                )) : <p className="text-sm text-slate-500">Chưa có đánh giá nào cho tour này.</p>}
              </div>
            </div>
            {recommendations.length > 0 && <div className="mt-10"><h2 className="text-2xl font-black">Có thể bạn cũng thích</h2><div className="mt-6 grid gap-6 sm:grid-cols-2">{recommendations.slice(0, 4).map((item) => <TourCard key={item.id} tour={item} />)}</div></div>}
          </div>
          <aside className="self-start lg:sticky lg:top-36"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-32px_rgba(15,64,51,.45)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chọn ngày khởi hành</p><p className="mt-1 text-xl font-black">Lịch đang mở</p></div><span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><CalendarDays size={20} /></span></div><div className="mt-5 max-h-[340px] space-y-3 overflow-y-auto pr-1">{tour.departures?.length ? tour.departures.map((departure) => <DepartureCard key={departure.id} departure={departure} selected={selected?.id === departure.id} onSelect={setSelected} />) : <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Chưa có lịch khởi hành đang mở.</div>}</div>{selected && <div className="mt-5 border-t border-slate-100 pt-5"><div className="flex items-end justify-between"><span className="text-sm text-slate-500">Giá người lớn</span><strong className="text-2xl text-rose-600">{formatMoney(selected.adultPrice)}</strong></div><p className="mt-1 text-right text-xs text-slate-400">Trẻ em: {formatMoney(selected.childPrice)}</p><button type="button" onClick={() => navigate(`/booking/${tour.id}?departure=${selected.id}`)} className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 font-extrabold text-white shadow-lg shadow-rose-900/15 transition hover:-translate-y-0.5 hover:shadow-xl">Đặt tour này <ChevronRight size={18} /></button></div>}<p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={15} /> Chưa thu tiền ở bước tiếp theo</p></div></aside>
        </div>
      </section>
    </>
  )
}
