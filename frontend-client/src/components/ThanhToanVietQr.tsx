import { CheckCircle2, Copy, ExternalLink, QrCode, X } from 'lucide-react'
import { useState } from 'react'
import { formatMoney } from '../dich-vu-api'
import type { VietQrDetails } from '../types/du-lieu'

interface VietQrDialogProps {
  payment: VietQrDetails | null
  onClose: () => void
}

interface CopyButtonProps {
  label: string
  value: string
  copied: string
  onCopy: (label: string, value: string) => Promise<void>
}

function CopyButton({ label, value, copied, onCopy }: CopyButtonProps) {
  return (
    <button type="button" aria-label={`Sao chép ${label}`} onClick={() => void onCopy(label, value)} className="grid size-9 shrink-0 place-items-center rounded border border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-700">
      {copied === label ? <CheckCircle2 size={17} className="text-brand-600" /> : <Copy size={16} />}
    </button>
  )
}

export function VietQrDialog({ payment, onClose }: VietQrDialogProps) {
  const [copied, setCopied] = useState('')
  if (!payment) return null

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      window.setTimeout(() => setCopied(''), 1600)
    } catch {
      setCopied('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="vietqr-title">
      <div className="my-6 w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-700"><QrCode size={18} /> Thanh toán VietQR</p>
            <h2 id="vietqr-title" className="mt-1 text-xl font-black">Quét mã để chuyển khoản</h2>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="grid size-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X size={21} /></button>
        </div>

        <div className="grid gap-7 p-5 sm:p-7 md:grid-cols-[minmax(280px,380px)_1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <img src={payment.qrImageUrl} alt={`Mã VietQR nhận tiền vào tài khoản ${payment.accountNo}`} className="mx-auto w-full max-w-[360px] rounded bg-white object-contain" />
            <a href={payment.qrImageUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-brand-700">Mở ảnh QR kích thước đầy đủ <ExternalLink size={15} /></a>
          </div>

          <div>
            <div className="rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              Mở ứng dụng ngân hàng, chọn quét QR và kiểm tra đúng người nhận <strong>Lê Quốc Việt</strong>. Đơn sẽ được xác nhận sau khi quản trị viên đối soát giao dịch.
            </div>
            <dl className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 px-4">
              <div className="py-3"><dt className="text-xs font-bold uppercase text-slate-400">Ngân hàng</dt><dd className="mt-1 font-bold">{payment.bankName}</dd></div>
              <div className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><dt className="text-xs font-bold uppercase text-slate-400">Số tài khoản</dt><dd className="mt-1 text-lg font-black tracking-wide">{payment.accountNo}</dd></div><CopyButton label="số tài khoản" value={payment.accountNo} copied={copied} onCopy={copyValue} /></div>
              <div className="py-3"><dt className="text-xs font-bold uppercase text-slate-400">Chủ tài khoản</dt><dd className="mt-1 font-bold uppercase">{payment.accountName}</dd></div>
              <div className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><dt className="text-xs font-bold uppercase text-slate-400">Số tiền</dt><dd className="mt-1 text-xl font-black text-rose-600">{formatMoney(payment.amount)}</dd></div><CopyButton label="số tiền" value={String(payment.amount)} copied={copied} onCopy={copyValue} /></div>
              <div className="flex items-center gap-3 py-3"><div className="min-w-0 flex-1"><dt className="text-xs font-bold uppercase text-slate-400">Nội dung chuyển khoản</dt><dd className="mt-1 break-all font-black text-brand-800">{payment.transferContent}</dd></div><CopyButton label="nội dung" value={payment.transferContent} copied={copied} onCopy={copyValue} /></div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-slate-500">Không chỉnh sửa số tiền hoặc nội dung chuyển khoản để việc đối soát đơn diễn ra chính xác.</p>
            <button type="button" onClick={onClose} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-5 font-extrabold text-white hover:bg-brand-800"><CheckCircle2 size={19} /> Tôi đã chuyển khoản</button>
          </div>
        </div>
      </div>
    </div>
  )
}
