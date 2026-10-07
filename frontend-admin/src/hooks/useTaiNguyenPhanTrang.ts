import { App as AntApp } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, unwrap } from '../api/may-khach-api'
import type { PaginatedResult, Pagination, QueryParams } from '../types/du-lieu'
import { getErrorMessage } from '../utils/loi'
import { compactParams } from '../utils/truy-van'

const EMPTY_PAGINATION: Pagination = { page: 1, limit: 10, totalItems: 0 }

export function usePagedResource<T>(path: string, initialParams: QueryParams = {}) {
  const { message } = AntApp.useApp()
  const initialParamsRef = useRef(initialParams)
  const paramsRef = useRef<QueryParams>(initialParams)
  const [items, setItems] = useState<T[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [params, setParams] = useState<QueryParams>(initialParams)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (next: QueryParams = {}) => {
    setLoading(true)
    const merged = { ...paramsRef.current, ...next }
    try {
      const data = unwrap<PaginatedResult<T> | T[]>(
        await api.get<ApiEnvelopeCompat<PaginatedResult<T> | T[]>>(path, { params: compactParams(merged) }),
      )
      const nextItems = Array.isArray(data) ? data : data.items
      setItems(nextItems)
      setPagination(
        Array.isArray(data)
          ? { page: 1, limit: Math.max(nextItems.length, 1), totalItems: nextItems.length }
          : data.pagination,
      )
      paramsRef.current = merged
      setParams(merged)
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [message, path])

  useEffect(() => {
    void load(initialParamsRef.current)
  }, [load])

  return { items, pagination, params, loading, load }
}

type ApiEnvelopeCompat<T> = { success: boolean; message: string; data: T } | T
