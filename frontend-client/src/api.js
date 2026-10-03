import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const SERVER_URL = API_URL.replace(/\/api\/?$/, '')

export const api = axios.create({ baseURL: API_URL, timeout: 15000 })

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('leviet_client_auth')
  if (raw) {
    try {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      localStorage.removeItem('leviet_client_auth')
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('leviet_client_auth')
      window.dispatchEvent(new Event('leviet:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const dataOf = (response) => response.data.data

export const apiError = (error, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  const body = error.response?.data
  return body?.errors?.[0]?.message || body?.message || fallback
}

export const assetUrl = (value) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${SERVER_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

export const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`

export const formatDate = (value, options = {}) => {
  if (!value) return '--'
  const suffix = /^\d{4}-\d{2}-\d{2}$/.test(value) ? 'T00:00:00' : ''
  const date = new Date(`${value}${suffix}`)
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...options }).format(date)
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82'
