import { CheckCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Descriptions, Modal, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { api, unwrap } from '../api/client'
import { PageTitle } from '../components/common/PageTitle'
import { StatusTag } from '../components/common/StatusTag'
import { usePagedResource } from '../hooks/usePagedResource'
import type { ApiEnvelope, Booking, Payment, PaymentMethod, PaymentStatus } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDate, formatMoney } from '../utils/formatters'

export function PaymentsPage() {
  const { message, modal } = AntApp.useApp()
  const bookings = usePagedResource<Booking>('/bookings', { page: 1, limit: 10, status: 'PENDING_PAYMENT' })
  const [payments, setPayments] = useState<Payment[]>([])
  const [selected, setSelected] = useState<Booking | null>(null)
  const [loadingPayments, setLoadingPayments] = useState(false)

  const loadPayments = async (booking: Booking) => {
    setSelected(booking)
    setLoadingPayments(true)
    try {
      const data = unwrap<Payment[]>(await api.get<ApiEnvelope<Payment[]>>(`/payments/booking/${booking.id}`))
      setPayments(data || [])
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setLoadingPayments(false)
    }
  }

  const createBankTransfer = async (booking: Booking) => {
    try {
      await api.post('/payments', { bookingId: booking.id, paymentMethod: 'BANK_TRANSFER' })
      void message.success('Đã tạo giao dịch chuyển khoản')
      await loadPayments(booking)
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const approve = async (payment: Payment) => {
    const transactionId = `BANK-${dayjs().format('YYYYMMDD-HHmmss')}-${payment.id}`
    try {
      await api.patch(`/payments/${payment.id}/status`, {
        status: 'SUCCESS',
        transactionId,
        responseData: { approvedBy: 'admin-console', approvedAt: new Date().toISOString() },
      })
      void message.success('Đã duyệt thanh toán và xác nhận đơn')
      setPayments((current) => current.map((item) => item.id === payment.id ? { ...item, status: 'SUCCESS', transactionId } : item))
      await bookings.load()
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const fail = async (payment: Payment) => {
    try {
      await api.patch(`/payments/${payment.id}/status`, {
        status: 'FAILED',
        responseData: { rejectedBy: 'admin-console', rejectedAt: new Date().toISOString() },
      })
      void message.success('Đã từ chối giao dịch')
      setPayments((current) => current.map((item) => item.id === payment.id ? { ...item, status: 'FAILED' } : item))
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const bookingColumns: ColumnsType<Booking> = [
    { title: 'Mã đơn', dataIndex: 'bookingCode', width: 180 },
    { title: 'Khách hàng', render: (_, record) => record.user?.fullName || record.user?.email || '-', width: 220 },
    { title: 'Tour', render: (_, record) => record.departure?.tour?.name || '-', minWidth: 240 },
    { title: 'Ngày đặt', dataIndex: 'bookingDate', render: (value: string) => formatDate(value), width: 120 },
    { title: 'Tổng tiền', dataIndex: 'finalAmount', render: (value: number) => formatMoney(value), width: 160 },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <StatusTag value={value} />, width: 160 },
    {
      title: 'Thanh toán',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button onClick={() => void loadPayments(record)}>Xem</Button>
          <Button aria-label="Tạo giao dịch chuyển khoản" icon={<PlusOutlined />} onClick={() => void createBankTransfer(record)} />
        </Space>
      ),
    },
  ]

  const paymentColumns: ColumnsType<Payment> = [
    { title: 'Phương thức', dataIndex: 'paymentMethod', render: (value: PaymentMethod) => <StatusTag value={value} /> },
    { title: 'Số tiền', dataIndex: 'amount', render: (value: number) => formatMoney(value) },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: PaymentStatus) => <StatusTag value={value} /> },
    { title: 'Mã tham chiếu', dataIndex: 'transactionId' },
    {
      title: 'Duyệt',
      width: 190,
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<CheckCircleOutlined />} disabled={record.status !== 'PENDING' || record.paymentMethod !== 'BANK_TRANSFER'} onClick={() => void approve(record)}>Xác nhận</Button>
          <Button danger disabled={record.status !== 'PENDING'} onClick={() => modal.confirm({ title: 'Từ chối giao dịch?', onOk: () => fail(record) })}>Từ chối</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageTitle title="Duyệt chuyển khoản" subtitle="Kiểm tra giao dịch BANK_TRANSFER đang chờ và xác nhận đơn hàng" extra={<Button icon={<ReloadOutlined />} onClick={() => void bookings.load()}>Làm mới</Button>} />
      <Card>
        <Table
          rowKey="id"
          loading={bookings.loading}
          dataSource={bookings.items}
          columns={bookingColumns}
          pagination={{
            current: bookings.pagination.page,
            pageSize: bookings.pagination.limit,
            total: bookings.pagination.totalItems,
            onChange: (page, limit) => void bookings.load({ page, limit }),
          }}
        />
      </Card>
      <Modal title={selected ? `Giao dịch của ${selected.bookingCode}` : 'Giao dịch'} open={Boolean(selected)} width={780} onCancel={() => setSelected(null)} footer={null}>
        {selected && (
          <Descriptions className="mb-16" size="small" column={2} bordered>
            <Descriptions.Item label="Khách">{selected.user?.fullName || selected.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">{formatMoney(selected.finalAmount)}</Descriptions.Item>
          </Descriptions>
        )}
        <Table rowKey="id" loading={loadingPayments} dataSource={payments} pagination={false} columns={paymentColumns} />
      </Modal>
    </>
  )
}
