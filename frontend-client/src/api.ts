import axios, { type AxiosResponse } from 'axios'
import type { ApiEnvelope } from './types'

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const SERVER_URL = API_URL.replace(/\/api\/?$/, '')
const CLIENT_AUTH_KEY = 'leviet_client_auth'

export const api = axios.create({ baseURL: API_URL, timeout: 15_000 })

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(CLIENT_AUTH_KEY)
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string }
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      localStorage.removeItem(CLIENT_AUTH_KEY)
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(CLIENT_AUTH_KEY)
      window.dispatchEvent(new Event('leviet:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function dataOf<T>(response: AxiosResponse<ApiEnvelope<T>>): T {
  return response.data.data
}

interface ApiErrorBody {
  message?: string
  errors?: Array<{ message?: string; msg?: string }>
}

export function apiError(error: unknown, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return error instanceof Error ? error.message : fallback
  const body = error.response?.data
  return body?.errors?.[0]?.message || body?.errors?.[0]?.msg || body?.message || fallback
}

export function assetUrl(value?: string | null): string {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${SERVER_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

export function formatMoney(value: number | string | null | undefined): string {
  return `${Number(value || 0).toLocaleString('vi-VN')} đ`
}

export function formatDate(value?: string | Date | null, options: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '--'
  const normalized = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const date = new Date(normalized)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...options }).format(date)
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82'
