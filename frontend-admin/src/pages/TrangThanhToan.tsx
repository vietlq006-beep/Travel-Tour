import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Alert, App as AntApp, Badge, Button, Card, Input, Modal, Space, Table, Tabs, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState, type ChangeEvent } from 'react'
import { api } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import { StatusTag } from '../components/common/TheTrangThai'
import { usePagedResource } from '../hooks/useTaiNguyenPhanTrang'
import type { Payment } from '../types/du-lieu'
import { formatDate, formatMoney } from '../utils/dinh-dang'
import { getErrorMessage } from '../utils/loi'

function rejectionReason(payment: Payment) {
  if (payment.responseData?.rejectionReason) return payment.responseData.rejectionReason
  if (payment.responseData?.reason === 'BOOKING_CANCELLED') return 'Đơn đặt tour đã bị hủy.'
  return 'Không có lý do (dữ liệu cũ).'
}

export function PaymentsPage() {
  const { message, modal } = AntApp.useApp()
  const pending = usePagedResource<Payment>('/payments', { page: 1, limit: 10, status: 'PENDING', paymentMethod: 'VIETQR' })
  const rejected = usePagedResource<Payment>('/payments', { page: 1, limit: 10, status: 'FAILED', paymentMethod: 'VIETQR' })
  const [rejecting, setRejecting] = useState<Payment | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)

  const reload = () => Promise.all([pending.load(), rejected.load()])

  const importStatement = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    const form = new FormData()
    form.append('statement', file)
    try {
      const response = await api.post('/payments/reconciliation/import', form)
      const result = (response.data as { data?: { matched?: number; duplicate?: number; unmatched?: number; failed?: number } }).data || {}
      void message.success(`Đối soát xong: khớp ${result.matched || 0}, trùng ${result.duplicate || 0}, chưa khớp ${result.unmatched || 0}, lỗi ${result.failed || 0}`)
      await reload()
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const approve = (payment: Payment) => {
    const bookingCode = payment.booking?.bookingCode || `#${payment.id}`
    modal.confirm({
      title: `Xác nhận thanh toán ${bookingCode}?`,
      content: 'Đơn hàng sẽ được chuyển sang trạng thái đã xác nhận sau khi duyệt.',
      okText: 'Xác nhận đã nhận tiền',
      cancelText: 'Hủy',
      async onOk() {
        const transactionId = `VIETQR-${dayjs().format('YYYYMMDD-HHmmss')}-${payment.id}`
        try {
          await api.patch(`/payments/${payment.id}/status`, {
            status: 'SUCCESS',
            transactionId,
            responseData: { approvedBy: 'admin-console', approvedAt: new Date().toISOString() },
          })
          void message.success('Đã duyệt thanh toán và xác nhận đơn')
          await reload()
        } catch (error) {
          void message.error(getErrorMessage(error))
          throw error
        }
      },
    })
  }

  const openReject = (payment: Payment) => {
    setRejecting(payment)
    setReason('')
  }

  const submitRejection = async () => {
    if (!rejecting) return
    const rejectionReason = reason.trim()
    if (rejectionReason.length < 5) {
      void message.warning('Vui lòng nhập lý do từ chối ít nhất 5 ký tự')
      return
    }
    setSubmitting(true)
    try {
      await api.patch(`/payments/${rejecting.id}/status`, { status: 'FAILED', rejectionReason })
      void message.success('Đã chuyển giao dịch sang danh sách đơn từ chối')
      setRejecting(null)
      setReason('')
      await reload()
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const commonColumns: ColumnsType<Payment> = [
    { title: 'Mã đơn', render: (_, record) => <Typography.Text strong>{record.booking?.bookingCode || '-'}</Typography.Text>, width: 180 },
    { title: 'Khách hàng', render: (_, record) => <div><Typography.Text strong>{record.booking?.user?.fullName || '-'}</Typography.Text><Typography.Text type="secondary" className="payment-customer-email">{record.booking?.user?.email || ''}</Typography.Text></div>, width: 220 },
    { title: 'Tour', render: (_, record) => record.booking?.departure?.tour?.name || '-', minWidth: 240 },
    { title: 'Ngày đặt', render: (_, record) => formatDate(record.booking?.bookingDate), width: 120 },
    { title: 'Voucher / giảm giá', render: (_, record) => Number(record.booking?.discountAmount || 0) > 0 ? <div><Tag color="green">{record.booking?.voucher?.code}</Tag><br /><Typography.Text type="success">-{formatMoney(record.booking?.discountAmount || 0)}</Typography.Text></div> : '-', width: 165 },
    { title: 'Số tiền', dataIndex: 'amount', render: (value: number) => <Typography.Text strong>{formatMoney(value)}</Typography.Text>, width: 155 },
    { title: 'Chứng từ', render: (_, record) => record.proofUrl ? <a href={`${api.defaults.baseURL?.replace(/\/api\/?$/, '')}${record.proofUrl}`} target="_blank" rel="noreferrer">Xem ảnh</a> : '-', width: 100 },
  ]

  const pendingColumns: ColumnsType<Payment> = [
    ...commonColumns,
    { title: 'Trạng thái', render: () => <StatusTag value="PENDING" />, width: 120 },
    {
      title: 'Duyệt giao dịch',
      fixed: 'right',
      width: 220,
      render: (_, record) => <Space><Button type="primary" icon={<CheckCircleOutlined />} onClick={() => approve(record)}>Xác nhận</Button><Button danger icon={<CloseCircleOutlined />} onClick={() => openReject(record)}>Từ chối</Button></Space>,
    },
  ]

  const rejectedColumns: ColumnsType<Payment> = [
    ...commonColumns,
    { title: 'Lý do từ chối', render: (_, record) => <Typography.Text type="danger">{rejectionReason(record)}</Typography.Text>, minWidth: 260 },
    { title: 'Người từ chối', render: (_, record) => record.responseData?.rejectedBy?.fullName || record.responseData?.rejectedBy?.email || 'Quản trị viên', width: 160 },
    { title: 'Thời gian', render: (_, record) => record.responseData?.rejectedAt ? dayjs(record.responseData.rejectedAt).format('DD/MM/YYYY HH:mm') : formatDate(record.updatedAt), width: 155 },
    { title: 'Trạng thái', render: () => <Tag color="error" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>, width: 125 },
  ]

  return (
    <>
      <PageTitle title="Duyệt thanh toán VietQR" subtitle="Đối soát giao dịch đang chờ và lưu riêng các giao dịch bị từ chối" extra={<Space><label className="ant-btn ant-btn-default"><UploadOutlined /> {importing ? 'Đang đối soát...' : 'Import sao kê'}<input type="file" accept=".csv,.xlsx" hidden disabled={importing} onChange={(event) => void importStatement(event)} /></label><Button icon={<ReloadOutlined />} onClick={() => void reload()}>Làm mới</Button></Space>} />
      <Card>
        <Tabs
          items={[
            {
              key: 'pending',
              label: <Space>Chờ duyệt <Badge count={pending.pagination.totalItems} showZero color="#d97706" /></Space>,
              children: <Table rowKey="id" loading={pending.loading} dataSource={pending.items} columns={pendingColumns} scroll={{ x: 1200 }} pagination={{ current: pending.pagination.page, pageSize: pending.pagination.limit, total: pending.pagination.totalItems, showTotal: (total) => `Tổng ${total} giao dịch chờ duyệt`, onChange: (page, limit) => void pending.load({ page, limit }) }} />,
            },
            {
              key: 'rejected',
              label: <Space>Đơn từ chối <Badge count={rejected.pagination.totalItems} showZero color="#dc2626" /></Space>,
              children: <Table rowKey="id" loading={rejected.loading} dataSource={rejected.items} columns={rejectedColumns} scroll={{ x: 1450 }} pagination={{ current: rejected.pagination.page, pageSize: rejected.pagination.limit, total: rejected.pagination.totalItems, showTotal: (total) => `Tổng ${total} giao dịch đã từ chối`, onChange: (page, limit) => void rejected.load({ page, limit }) }} />,
            },
          ]}
        />
      </Card>

      <Modal
        title="Từ chối giao dịch VietQR"
        open={Boolean(rejecting)}
        onCancel={() => { if (!submitting) { setRejecting(null); setReason('') } }}
        footer={<Space><Button disabled={submitting} onClick={() => { setRejecting(null); setReason('') }}>Hủy</Button><Button danger type="primary" loading={submitting} disabled={reason.trim().length < 5} onClick={() => void submitRejection()}>Xác nhận từ chối</Button></Space>}
      >
        <Alert type="warning" showIcon message={`Giao dịch ${rejecting?.booking?.bookingCode || ''} sẽ được chuyển sang mục Đơn từ chối.`} description="Khách hàng vẫn có thể tạo lại một giao dịch VietQR mới cho đơn này." />
        <div className="payment-rejection-field"><Typography.Text strong>Lý do từ chối <Typography.Text type="danger">*</Typography.Text></Typography.Text><Input.TextArea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} showCount rows={4} placeholder="Ví dụ: Không tìm thấy giao dịch trên sao kê, số tiền chuyển khoản không chính xác..." /></div>
      </Modal>
    </>
  )
}
