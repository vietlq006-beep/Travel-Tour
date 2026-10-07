import axios from 'axios'

interface ApiErrorBody {
  message?: string
  errors?: Array<{ message?: string; msg?: string }>
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data
    if (data?.errors?.length) {
      const details = data.errors.map((item) => item.message || item.msg).filter(Boolean).join(', ')
      if (details) return details
    }
    return data?.message || error.message || 'Có lỗi xảy ra'
  }

  return error instanceof Error ? error.message : 'Có lỗi xảy ra'
}
