import { CheckCircleOutlined, DownloadOutlined, EyeOutlined, FileDoneOutlined, QrcodeOutlined, ReloadOutlined, SendOutlined, StopOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, DatePicker, Descriptions, Drawer, Image, Input, Row, Select, Space, Table, Tabs, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { api, unwrap } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import { StatusTag } from '../components/common/TheTrangThai'
import { usePagedResource } from '../hooks/useTaiNguyenPhanTrang'
import type { Booking, BookingChangeRequest, BookingStatus, Payment } from '../types/du-lieu'
import { formatDate, formatMoney } from '../utils/dinh-dang'
import { getErrorMessage } from '../utils/loi'

const REQUEST_LABEL = { CANCEL: 'Hủy đơn', RESCHEDULE: 'Đổi lịch', REFUND: 'Hoàn tiền' }

export function BookingsPage() {
  const { message, modal } = AntApp.useApp()
  const resource = usePagedResource<Booking>('/bookings', { page: 1, limit: 10 })
  const requests = usePagedResource<BookingChangeRequest>('/bookings/change-requests', { page: 1, limit: 20, status: 'PENDING' })
  const [detail, setDetail] = useState<Booking | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<BookingStatus | undefined>()
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)
  const [note, setNote] = useState('')
  const [checkInCode, setCheckInCode] = useState('')
  const [busy, setBusy] = useState(false)

  const loadDetail = async (id: Booking['id']) => {
    setDetailLoading(true)
    try { const value = unwrap<Booking>(await api.get(`/bookings/${id}`)); setDetail(value); return value }
    catch (error) { void message.error(getErrorMessage(error)); return null }
    finally { setDetailLoading(false) }
  }

  const applyFilters = () => resource.load({ page: 1, keyword: keyword.trim() || undefined, status, fromDate: dateRange?.[0], toDate: dateRange?.[1] })

  const updateStatus = (booking: Booking, next: BookingStatus) => {
    const action = next === 'CONFIRMED' ? 'xác nhận' : next === 'COMPLETED' ? 'hoàn tất' : 'hủy'
    modal.confirm({
      title: `${action[0].toUpperCase()}${action.slice(1)} đơn ${booking.bookingCode}?`,
      content: next === 'CANCELLED' ? 'Đơn chỉ hủy được khi không còn giao dịch thành công chưa hoàn tiền.' : undefined,
      okText: action, cancelText: 'Đóng', okButtonProps: { danger: next === 'CANCELLED' },
      async onOk() {
        const reason = next === 'CANCELLED' ? 'Quản trị viên hủy từ bàn điều hành.' : undefined
        await api.patch(`/bookings/${booking.id}/status`, { status: next, reason, note: `Admin ${action} đơn.` })
        void message.success(`Đã ${action} đơn`)
        await resource.load(); if (detail?.id === booking.id) await loadDetail(booking.id)
      },
    })
  }

  const refundPayment = (payment: Payment) => {
    modal.confirm({
      title: `Ghi nhận hoàn ${formatMoney(payment.amount)}?`,
      content: 'Chỉ thực hiện sau khi tiền đã thực sự được hoàn cho khách.', okText: 'Đã hoàn tiền', cancelText: 'Đóng',
      async onOk() {
        await api.patch(`/payments/${payment.id}/status`, { status: 'REFUNDED', note: 'Admin xác nhận tiền đã hoàn cho khách.' })
        void message.success('Đã ghi nhận hoàn tiền'); if (detail) await loadDetail(detail.id)
      },
    })
  }

  const addNote = async () => {
    if (!detail || note.trim().length < 2) return
    setBusy(true)
    try { await api.post(`/bookings/${detail.id}/notes`, { note: note.trim() }); setNote(''); await loadDetail(detail.id); void message.success('Đã thêm ghi chú nội bộ') }
    catch (error) { void message.error(getErrorMessage(error)) } finally { setBusy(false) }
  }

  const reviewRequest = (request: BookingChangeRequest, decision: 'APPROVED' | 'REJECTED') => {
    let adminNote = ''
    modal.confirm({
      title: `${decision === 'APPROVED' ? 'Duyệt' : 'Từ chối'} yêu cầu ${REQUEST_LABEL[request.requestType]}?`,
      content: <Input.TextArea rows={3} placeholder="Ghi chú phản hồi khách hàng" onChange={(event) => { adminNote = event.target.value }} />,
      okText: decision === 'APPROVED' ? 'Duyệt yêu cầu' : 'Từ chối', cancelText: 'Đóng', okButtonProps: { danger: decision === 'REJECTED' },
      async onOk() {
        await api.patch(`/bookings/change-requests/${request.id}`, { status: decision, adminNote })
        void message.success('Đã xử lý yêu cầu'); await Promise.all([requests.load(), resource.load()])
      },
    })
  }

  const checkIn = async () => {
    if (checkInCode.trim().length < 10) return
    setBusy(true)
    try { const result = unwrap<Booking>(await api.post('/bookings/check-in', { code: checkInCode.trim() })); setCheckInCode(''); void message.success(`Check-in thành công đơn ${result.bookingCode}`); await resource.load() }
    catch (error) { void message.error(getErrorMessage(error)) } finally { setBusy(false) }
  }

  const downloadManifest = async (departureId?: Booking['id']) => {
    if (!departureId) return
    try {
      const response = await api.get(`/reports/departures/${departureId}/manifest.xlsx`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data as Blob); const anchor = document.createElement('a')
      anchor.href = url; anchor.download = `danh-sach-doan-${departureId}.xlsx`; anchor.click(); URL.revokeObjectURL(url)
    } catch (error) { void message.error(getErrorMessage(error)) }
  }

  const columns: ColumnsType<Booking> = [
    { title: 'Mã đơn', dataIndex: 'bookingCode', width: 185, render: (value) => <Typography.Text strong copyable>{value}</Typography.Text> },
    { title: 'Khách hàng', width: 220, render: (_, item) => <div><Typography.Text strong>{item.user?.fullName || '-'}</Typography.Text><br /><Typography.Text type="secondary">{item.user?.phoneNumber || item.user?.email}</Typography.Text></div> },
    { title: 'Tour / khởi hành', minWidth: 270, render: (_, item) => <div><Typography.Text>{item.departure?.tour?.name || '-'}</Typography.Text><br /><Typography.Text type="secondary">{formatDate(item.departure?.startDate)}</Typography.Text></div> },
    { title: 'Khách', width: 90, render: (_, item) => Number(item.numAdults || 0) + Number(item.numChildren || 0) + Number(item.numInfants || 0) + Number(item.numSeniors || 0) },
    { title: 'Thành tiền', width: 165, render: (_, item) => <div><Typography.Text strong>{formatMoney(item.finalAmount)}</Typography.Text>{Number(item.discountAmount || 0) > 0 && <><br /><Tag color="green">Giảm {formatMoney(item.discountAmount)}</Tag></>}</div> },
    { title: 'Trạng thái', dataIndex: 'status', width: 145, render: (value) => <StatusTag value={value} /> },
    { title: 'Thao tác', fixed: 'right', width: 250, render: (_, item) => <Space wrap><Button icon={<EyeOutlined />} onClick={() => void loadDetail(item.id)}>Chi tiết</Button>{item.status === 'PENDING_PAYMENT' && <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => updateStatus(item, 'CONFIRMED')}>Xác nhận</Button>}{item.status === 'CONFIRMED' && <Button type="primary" icon={<FileDoneOutlined />} onClick={() => updateStatus(item, 'COMPLETED')}>Hoàn tất</Button>}{['PENDING_PAYMENT', 'CONFIRMED'].includes(item.status) && <Button danger icon={<StopOutlined />} onClick={() => updateStatus(item, 'CANCELLED')} />}</Space> },
  ]

  const requestColumns: ColumnsType<BookingChangeRequest> = [
    { title: 'Mã đơn', render: (_, item) => item.booking?.bookingCode || `#${item.bookingId}`, width: 180 },
    { title: 'Khách hàng', render: (_, item) => item.requester?.fullName || '-', width: 180 },
    { title: 'Loại', render: (_, item) => <Tag color="orange">{REQUEST_LABEL[item.requestType]}</Tag>, width: 120 },
    { title: 'Lý do', dataIndex: 'reason', minWidth: 300 },
    { title: 'Ngày gửi', dataIndex: 'createdAt', render: formatDate, width: 130 },
    { title: 'Xử lý', fixed: 'right', width: 190, render: (_, item) => <Space><Button type="primary" onClick={() => reviewRequest(item, 'APPROVED')}>Duyệt</Button><Button danger onClick={() => reviewRequest(item, 'REJECTED')}>Từ chối</Button></Space> },
  ]

  return <>
    <PageTitle title="Điều hành booking" subtitle="Work queue tập trung cho đơn, thanh toán, hành khách và yêu cầu hậu mãi" extra={<Button icon={<ReloadOutlined />} onClick={() => void Promise.all([resource.load(), requests.load()])}>Làm mới</Button>} />
    <Tabs items={[
      { key: 'bookings', label: 'Danh sách booking', children: <><Card className="filter-card"><Row gutter={[12, 12]}><Col xs={24} md={8}><Input.Search allowClear value={keyword} onChange={(event) => setKeyword(event.target.value)} onSearch={() => void applyFilters()} placeholder="Mã đơn" /></Col><Col xs={24} md={5}><Select allowClear value={status} onChange={setStatus} placeholder="Trạng thái" style={{ width: '100%' }} options={['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((value) => ({ value, label: value }))} /></Col><Col xs={24} md={7}><DatePicker.RangePicker style={{ width: '100%' }} onChange={(dates) => setDateRange(dates ? [dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')] : null)} /></Col><Col xs={24} md={4}><Button type="primary" block onClick={() => void applyFilters()}>Lọc dữ liệu</Button></Col></Row></Card><Card style={{ marginTop: 16 }}><Table rowKey="id" loading={resource.loading} dataSource={resource.items} columns={columns} scroll={{ x: 1400 }} pagination={{ current: resource.pagination.page, pageSize: resource.pagination.limit, total: resource.pagination.totalItems, onChange: (page, limit) => void resource.load({ page, limit }) }} /></Card></> },
      { key: 'requests', label: `Yêu cầu chờ xử lý (${requests.pagination.totalItems})`, children: <Card><Table rowKey="id" loading={requests.loading} dataSource={requests.items} columns={requestColumns} scroll={{ x: 1100 }} pagination={{ current: requests.pagination.page, pageSize: requests.pagination.limit, total: requests.pagination.totalItems, onChange: (page, limit) => void requests.load({ page, limit }) }} /></Card> },
      { key: 'checkin', label: 'Check-in', children: <Card><Typography.Title level={4}><QrcodeOutlined /> Quét hoặc nhập mã vé</Typography.Title><Typography.Paragraph type="secondary">Máy quét QR dạng bàn phím có thể nhập trực tiếp mã vào ô dưới.</Typography.Paragraph><Space.Compact style={{ width: '100%', maxWidth: 680 }}><Input size="large" value={checkInCode} onChange={(event) => setCheckInCode(event.target.value)} onPressEnter={() => void checkIn()} placeholder="LVT-CHECKIN-..." /><Button size="large" type="primary" loading={busy} onClick={() => void checkIn()}>Xác nhận check-in</Button></Space.Compact></Card> },
    ]} />

    <Drawer width={760} title={detail ? `Booking ${detail.bookingCode}` : 'Chi tiết booking'} open={Boolean(detail)} loading={detailLoading} onClose={() => setDetail(null)} extra={detail?.departure?.id && <Button icon={<DownloadOutlined />} onClick={() => void downloadManifest(detail.departure?.id)}>Danh sách đoàn</Button>}>
      {detail && <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} items={[
          { key: 'customer', label: 'Khách hàng', children: <>{detail.user?.fullName}<br />{detail.user?.phoneNumber}<br />{detail.user?.email}</> },
          { key: 'status', label: 'Trạng thái', children: <StatusTag value={detail.status} /> },
          { key: 'tour', label: 'Tour', children: detail.departure?.tour?.name },
          { key: 'date', label: 'Khởi hành', children: formatDate(detail.departure?.startDate) },
          { key: 'subtotal', label: 'Tạm tính', children: formatMoney(detail.totalAmount || detail.finalAmount) },
          { key: 'voucher', label: 'Voucher', children: detail.voucher?.code ? <Tag color="green">{detail.voucher.code}</Tag> : 'Không áp dụng' },
          { key: 'discount', label: 'Giảm giá', children: <Typography.Text type={Number(detail.discountAmount || 0) > 0 ? 'success' : undefined}>-{formatMoney(detail.discountAmount || 0)}</Typography.Text> },
          { key: 'amount', label: 'Thành tiền', children: <Typography.Text strong>{formatMoney(detail.finalAmount)}</Typography.Text> },
          { key: 'deposit', label: 'Tiền cọc', children: formatMoney(detail.depositAmount || detail.finalAmount) },
        ]} />
        <Card size="small" title="Hành khách"><Table size="small" rowKey="id" pagination={false} dataSource={detail.participants} columns={[{ title: 'Họ tên', dataIndex: 'fullName' }, { title: 'Loại', dataIndex: 'passengerType' }, { title: 'Ngày sinh', dataIndex: 'dateOfBirth', render: formatDate }, { title: 'Giới tính', dataIndex: 'gender' }]} /></Card>
        <Card size="small" title="Thanh toán"><Table size="small" rowKey="id" pagination={false} dataSource={detail.payments} columns={[{ title: 'Số tiền', dataIndex: 'amount', render: formatMoney }, { title: 'Loại', dataIndex: 'paymentPurpose' }, { title: 'Trạng thái', dataIndex: 'status', render: (value) => <StatusTag value={value} /> }, { title: 'Chứng từ', render: (_, item) => item.proofUrl ? <Image width={56} src={`${api.defaults.baseURL?.replace(/\/api\/?$/, '')}${item.proofUrl}`} /> : '-' }, { title: '', render: (_, item) => item.status === 'SUCCESS' ? <Button danger size="small" onClick={() => refundPayment(item)}>Hoàn tiền</Button> : null }]} /></Card>
        <Card size="small" title="Ghi chú nội bộ"><Space.Compact style={{ width: '100%' }}><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú chỉ nhân viên thấy" /><Button type="primary" icon={<SendOutlined />} loading={busy} onClick={() => void addNote()}>Lưu</Button></Space.Compact></Card>
        <Card size="small" title="Lịch sử trạng thái"><Timeline items={(detail.activities || []).map((item) => ({ color: item.toStatus === 'CANCELLED' ? 'red' : 'green', children: <div><Typography.Text strong>{item.eventType}</Typography.Text> <Typography.Text type="secondary">{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Typography.Text>{item.note && <div>{item.note}</div>}<Typography.Text type="secondary">{item.actor?.fullName}</Typography.Text></div> }))} /></Card>
      </Space>}
    </Drawer>
  </>
}
