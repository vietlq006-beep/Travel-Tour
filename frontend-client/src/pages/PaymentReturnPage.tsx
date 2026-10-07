import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export default function PaymentReturnPage() {
  const [params] = useSearchParams()
  const success = params.get('vnp_ResponseCode') === '00'
  const known = params.has('vnp_ResponseCode')
  const Icon = !known ? Clock3 : success ? CheckCircle2 : XCircle
  const colors = !known ? 'text-amber-500' : success ? 'text-emerald-600' : 'text-rose-600'

  return <section className="grid min-h-[70vh] place-items-center px-4 py-16"><div className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-8 text-center shadow-lg"><Icon size={54} className={`mx-auto ${colors}`} /><h1 className="mt-5 text-2xl font-black">{!known ? 'Đang kiểm tra thanh toán' : success ? 'Thanh toán đã được ghi nhận' : 'Thanh toán chưa thành công'}</h1><p className="mt-3 leading-6 text-slate-500">Trạng thái chính xác của giao dịch luôn được cập nhật trong lịch sử đơn đặt của bạn.</p><Link to="/my-bookings" className="mt-7 inline-flex h-12 items-center rounded-md bg-brand-700 px-6 font-bold text-white">Xem đơn của tôi</Link></div></section>
}
