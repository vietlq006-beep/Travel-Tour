import dayjs from 'dayjs'

export function formatMoney(value: number | string | null | undefined): string {
  return Number(value || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
}

export function formatDate(value: string | Date | null | undefined): string {
  return value ? dayjs(value).format('DD/MM/YYYY') : '-'
}
