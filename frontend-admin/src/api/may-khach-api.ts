import axios, { type AxiosResponse } from 'axios'
import { ADMIN_AUTH_KEY } from '../constants/xac-thuc'
import type { ApiEnvelope } from '../types/du-lieu'
import { readAdminSession } from '../utils/luu-tru'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 })

api.interceptors.request.use((config) => {
  const session = readAdminSession()
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(ADMIN_AUTH_KEY)
      window.dispatchEvent(new Event('leviet:admin-unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function unwrap<T>(response: AxiosResponse<ApiEnvelope<T> | T>): T {
  const body = response.data
  return typeof body === 'object' && body !== null && 'data' in body
    ? (body as ApiEnvelope<T>).data
    : (body as T)
}
