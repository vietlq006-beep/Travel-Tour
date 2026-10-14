import { ArrowRight, BadgeCheck, CalendarClock, CheckCircle2, FileText, Headphones, Info, MapPin, ReceiptText, Scale, ShieldCheck, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const sections = [
  { id: 've-le-viet-travel', label: 'Về Lê Việt Travel', description: 'Câu chuyện, cam kết và cách chúng tôi đồng hành.', icon: Info },
  { id: 'chinh-sach-dat-tour', label: 'Chính sách đặt tour', description: 'Giữ chỗ, thanh toán, đổi và hủy hành trình.', icon: ReceiptText },
  { id: 'dieu-khoan-su-dung', label: 'Điều khoản sử dụng', description: 'Quyền, trách nhiệm và nguyên tắc sử dụng.', icon: Scale },
]

function Bullet({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-3 text-sm leading-7 text-slate-600"><CheckCircle2 className="mt-1.5 size-4 shrink-0 text-brand-600" /> <span>{children}</span></li>
}

export default function InformationPage() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [hash])

  return (
    <main className="bg-slate-50 pb-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#073e33] via-brand-800 to-[#126d58] py-16 text-white sm:py-20">
        <div className="absolute -right-20 -top-28 size-80 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute -bottom-36 left-1/4 size-72 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-extrabold uppercase tracking-[.22em] text-emerald-200">Thông tin cần biết</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Hiểu rõ hành trình trước khi khởi hành</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/80">Tìm hiểu về Lê Việt Travel, quy trình đặt tour và các điều khoản áp dụng để bạn chủ động trong mọi quyết định.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Nội dung trang thông tin" className="relative -mt-8 grid gap-4 md:grid-cols-3">
          {sections.map(({ id, label, description, icon: Icon }) => (
            <a key={id} href={`#${id}`} className="group surface-card flex items-start gap-4 rounded-2xl p-5 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white"><Icon size={21} /></span>
              <span><strong className="block text-base text-ink">{label}</strong><span className="mt-1 block text-sm leading-6 text-slate-500">{description}</span></span>
            </a>
          ))}
        </nav>

        <section id="ve-le-viet-travel" className="scroll-mt-28 py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="section-kicker">Về chúng tôi</p>
              <h2 className="mt-3 text-3xl font-black text-ink">Lê Việt Travel — đi để nhớ</h2>
              <p className="mt-5 leading-8 text-slate-600">Lê Việt Travel xây dựng nền tảng đặt tour với mục tiêu giúp mỗi hành trình trở nên rõ ràng, thuận tiện và an tâm hơn. Thông tin lịch trình, mức giá, ngày khởi hành, số chỗ còn lại và chính sách được trình bày ngay trên từng tour để khách hàng dễ dàng lựa chọn.</p>
              <p className="mt-4 leading-8 text-slate-600">Chúng tôi đồng hành từ lúc tìm tour, đặt chỗ, thanh toán đến khi hoàn tất chuyến đi; đồng thời lưu lại chính sách và mức giá tại thời điểm đặt để bảo vệ quyền lợi của khách hàng.</p>
              <Link to="/tours" className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-brand-700 px-6 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-brand-800">Khám phá tour <ArrowRight size={18} /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [BadgeCheck, 'Thông tin minh bạch', 'Giá, lịch trình và điều kiện tour được công bố rõ ràng.'],
                [CalendarClock, 'Giữ chỗ có thời hạn', 'Đơn chờ thanh toán có đồng hồ đếm ngược cụ thể.'],
                [UsersRound, 'Đồng hành tận tâm', 'Hỗ trợ khách hàng trước, trong và sau hành trình.'],
                [MapPin, 'Trải nghiệm phù hợp', 'Nhiều điểm đến và ngày khởi hành để lựa chọn.'],
              ].map(([Icon, title, description]) => {
                const CardIcon = Icon as typeof Info
                return <article key={String(title)} className="surface-card rounded-2xl p-5"><CardIcon className="text-brand-600" size={24} /><h3 className="mt-4 font-extrabold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{String(description)}</p></article>
              })}
            </div>
          </div>
        </section>

        <section id="chinh-sach-dat-tour" className="scroll-mt-28 border-t border-slate-200 py-16">
          <div className="max-w-3xl">
            <p className="section-kicker">Đặt tour an tâm</p>
            <h2 className="mt-3 text-3xl font-black text-ink">Chính sách đặt tour</h2>
            <p className="mt-4 leading-8 text-slate-600">Các điều kiện cụ thể có thể khác nhau theo tour và ngày khởi hành. Nội dung hiển thị trong chi tiết tour và bản chụp chính sách trong đơn đặt chỗ là căn cứ áp dụng cho hành trình của bạn.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="surface-card rounded-3xl p-6"><h3 className="flex items-center gap-3 text-lg font-black"><CalendarClock className="text-brand-600" /> Giữ chỗ và thanh toán</h3><ul className="mt-4 space-y-2"><Bullet>Ghế được giữ trong thời hạn hiển thị trên trang thanh toán và đơn hàng, mặc định 30 phút.</Bullet><Bullet>Đơn tự hủy khi hết hạn mà chưa đủ khoản thanh toán yêu cầu; ghế và lượt voucher được hoàn lại.</Bullet><Bullet>Khách hàng cần chuyển đúng số tiền và nội dung thanh toán để hệ thống đối soát chính xác.</Bullet><Bullet>Bằng chứng thanh toán có thể được tải lên từ chi tiết đơn hàng để hỗ trợ xác minh.</Bullet></ul></article>
            <article className="surface-card rounded-3xl p-6"><h3 className="flex items-center gap-3 text-lg font-black"><ReceiptText className="text-brand-600" /> Giá và đối tượng khách</h3><ul className="mt-4 space-y-2"><Bullet>Giá người lớn, trẻ em, em bé, người cao tuổi và phụ thu phòng đơn được tính theo cấu hình của từng ngày khởi hành.</Bullet><Bullet>Voucher chỉ được áp dụng khi đáp ứng đầy đủ điều kiện và còn lượt sử dụng.</Bullet><Bullet>Giá và chính sách được lưu tại thời điểm đặt, tránh thay đổi ngoài dự kiến sau khi tạo đơn.</Bullet><Bullet>Các khoản chưa bao gồm hoặc phát sinh được nêu trong thông tin chi tiết của tour.</Bullet></ul></article>
            <article className="surface-card rounded-3xl p-6"><h3 className="flex items-center gap-3 text-lg font-black"><FileText className="text-brand-600" /> Giấy tờ và khởi hành</h3><ul className="mt-4 space-y-2"><Bullet>Khách hàng cung cấp thông tin hành khách chính xác, đúng với giấy tờ tùy thân.</Bullet><Bullet>Yêu cầu visa, hộ chiếu, giấy khai sinh hoặc giấy tờ khác được quy định riêng trên từng tour.</Bullet><Bullet>Vui lòng có mặt đúng giờ và đúng điểm đón; tuân thủ quy định về hành lý, bảo hiểm và hướng dẫn của đoàn.</Bullet><Bullet>Vé điện tử hoặc mã QR được dùng để hỗ trợ kiểm tra thông tin và check-in.</Bullet></ul></article>
            <article className="surface-card rounded-3xl p-6"><h3 className="flex items-center gap-3 text-lg font-black"><ShieldCheck className="text-brand-600" /> Đổi, hủy và hoàn tiền</h3><ul className="mt-4 space-y-2"><Bullet>Yêu cầu đổi lịch, hủy tour hoặc hoàn tiền được gửi từ chi tiết đơn và cần được duyệt.</Bullet><Bullet>Phí áp dụng phụ thuộc vào thời điểm gửi yêu cầu và chính sách đã lưu trong đơn.</Bullet><Bullet>Khoản hoàn tiền được xử lý theo phương thức, thời gian và trạng thái xác nhận thực tế.</Bullet><Bullet>Lê Việt Travel có thể đề xuất phương án thay thế khi lịch trình thay đổi vì lý do bất khả kháng.</Bullet></ul></article>
          </div>
        </section>

        <section id="dieu-khoan-su-dung" className="scroll-mt-28 border-t border-slate-200 py-16">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="section-kicker">Nguyên tắc chung</p>
              <h2 className="mt-3 text-3xl font-black text-ink">Điều khoản sử dụng</h2>
              <p className="mt-4 leading-8 text-slate-600">Khi đăng ký tài khoản, đặt tour hoặc sử dụng dịch vụ, bạn xác nhận đã đọc và đồng ý với các điều khoản liên quan đến giao dịch của mình.</p>
            </div>
            <div className="surface-card rounded-3xl p-6 sm:p-8">
              <ol className="space-y-6">
                {[
                  ['Tài khoản và thông tin', 'Bạn chịu trách nhiệm cung cấp thông tin chính xác, bảo mật mật khẩu và cập nhật email, số điện thoại khi có thay đổi. Không sử dụng tài khoản của người khác hoặc giả mạo danh tính.'],
                  ['Đặt chỗ và giao dịch', 'Đơn chỉ được xác nhận khi đáp ứng điều kiện thanh toán. Không tạo giao dịch giả, lợi dụng voucher, tải chứng từ sai lệch hoặc can thiệp trái phép vào hệ thống.'],
                  ['Nội dung và dữ liệu', 'Thông tin cá nhân được sử dụng để vận hành đặt tour, liên hệ, thanh toán và chăm sóc khách hàng. Bạn không sao chép hoặc khai thác nội dung của nền tảng trái quy định.'],
                  ['Trách nhiệm hành trình', 'Khách hàng tự bảo đảm điều kiện sức khỏe, giấy tờ, visa và việc có mặt đúng giờ. Hãy kiểm tra kỹ yêu cầu riêng của từng tour trước khi thanh toán.'],
                  ['Thay đổi điều khoản', 'Điều khoản chung có thể được cập nhật để phù hợp hoạt động thực tế. Riêng mức giá và chính sách đã chụp tại thời điểm đặt tiếp tục là căn cứ của đơn hàng đó.'],
                ].map(([title, description], index) => (
                  <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-black text-brand-700">{index + 1}</span>
                    <div><h3 className="font-extrabold text-ink">{title}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{description}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-brand-900 px-6 py-9 text-white sm:flex sm:items-center sm:justify-between sm:px-10">
          <div><h2 className="text-2xl font-black">Bạn cần làm rõ thêm thông tin?</h2><p className="mt-2 text-sm leading-6 text-emerald-100/75">Đội ngũ Lê Việt Travel sẵn sàng hỗ trợ trước khi bạn đặt tour.</p></div>
          <a href="tel:19001234" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-extrabold text-brand-800 transition hover:-translate-y-0.5 sm:mt-0"><Headphones size={18} /> 1900 1234</a>
        </section>
      </div>
    </main>
  )
}
