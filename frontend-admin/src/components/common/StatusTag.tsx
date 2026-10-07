import { Tag } from 'antd'

const STATUS_META: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Đang mở', color: 'green' },
  CLOSED: { label: 'Đã đóng', color: 'orange' },
  COMPLETED: { label: 'Hoàn tất', color: 'blue' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'gold' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'green' },
  PENDING: { label: 'Chờ xử lý', color: 'gold' },
  SUCCESS: { label: 'Thành công', color: 'green' },
  FAILED: { label: 'Thất bại', color: 'red' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'blue' },
  BANK_TRANSFER: { label: 'Chuyển khoản', color: 'cyan' },
  CASH: { label: 'Tiền mặt', color: 'purple' },
  VNPAY: { label: 'VNPAY', color: 'geekblue' },
}

interface StatusTagProps {
  value?: string | null
}

export function StatusTag({ value }: StatusTagProps) {
  const meta = value ? STATUS_META[value] : undefined
  return <Tag color={meta?.color || 'default'}>{meta?.label || value || '-'}</Tag>
}
