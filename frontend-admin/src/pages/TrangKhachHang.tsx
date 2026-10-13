import {
  CheckCircleOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { App as AntApp, Avatar, Button, Card, Col, Descriptions, Drawer, Input, Row, Select, Space, Statistic, Switch, Table, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { api, unwrap } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import { StatusTag } from '../components/common/TheTrangThai'
import { usePagedResource } from '../hooks/useTaiNguyenPhanTrang'
import type { ApiEnvelope, Booking, Customer, EntityId } from '../types/du-lieu'
import { formatDate, formatMoney } from '../utils/dinh-dang'
import { getErrorMessage } from '../utils/loi'

function initials(name?: string) {
  const parts = (name || 'Khách hàng').trim().split(/\s+/)
  return parts.slice(-2).map((part) => part[0]).join('').toUpperCase()
}

export function CustomersPage() {
  const { message, modal } = AntApp.useApp()
  const customers = usePagedResource<Customer>('/users', { page: 1, limit: 10, role: 'CUSTOMER' })
  const allCustomerStats = usePagedResource<Customer>('/users', { page: 1, limit: 1, role: 'CUSTOMER' })
  const activeCustomerStats = usePagedResource<Customer>('/users', { page: 1, limit: 1, role: 'CUSTOMER', isActive: true })
  const lockedCustomerStats = usePagedResource<Customer>('/users', { page: 1, limit: 1, role: 'CUSTOMER', isActive: false })
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<EntityId | null>(null)
  const metrics = {
    total: allCustomerStats.pagination.totalItems,
    active: activeCustomerStats.pagination.totalItems,
    locked: lockedCustomerStats.pagination.totalItems,
  }
  const metricsLoading = allCustomerStats.loading || activeCustomerStats.loading || lockedCustomerStats.loading
  const loadMetrics = () => Promise.all([allCustomerStats.load(), activeCustomerStats.load(), lockedCustomerStats.load()])

  const search = () => customers.load({ page: 1, keyword: keyword.trim() || undefined, isActive: statusFilter || undefined })

  const reset = () => {
    setKeyword('')
    setStatusFilter('')
    void customers.load({ page: 1, keyword: undefined, isActive: undefined })
  }

  const openDetail = async (customer: Customer) => {
    setSelected(customer)
    setDetailLoading(true)
    try {
      const detail = unwrap<Customer>(await api.get<ApiEnvelope<Customer>>(`/users/${customer.id}`))
      setSelected(detail)
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setDetailLoading(false)
    }
  }

  const toggleStatus = (customer: Customer) => {
    const nextActive = !customer.isActive
    modal.confirm({
      title: nextActive ? 'Mở khóa tài khoản khách hàng?' : 'Khóa tài khoản khách hàng?',
      content: nextActive
        ? `${customer.fullName || customer.email} sẽ có thể đăng nhập và đặt tour trở lại.`
        : `${customer.fullName || customer.email} sẽ không thể đăng nhập cho đến khi được mở khóa.`,
      okText: nextActive ? 'Mở khóa' : 'Khóa tài khoản',
      cancelText: 'Hủy',
      okButtonProps: { danger: !nextActive },
      async onOk() {
        setUpdatingId(customer.id)
        try {
          await api.patch(`/users/${customer.id}`, { isActive: nextActive })
          void message.success(nextActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản')
          setSelected((current) => current?.id === customer.id ? { ...current, isActive: nextActive } : current)
          await Promise.all([customers.load(), loadMetrics()])
        } catch (error) {
          void message.error(getErrorMessage(error))
          throw error
        } finally {
          setUpdatingId(null)
        }
      },
    })
  }

  const bookings = selected?.bookings || []
  const customerValue = bookings
    .filter((booking) => ['CONFIRMED', 'COMPLETED'].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.finalAmount || 0), 0)

  const bookingColumns: ColumnsType<Booking> = [
    { title: 'Mã đơn', dataIndex: 'bookingCode', width: 160 },
    { title: 'Tour', render: (_, record) => record.departure?.tour?.name || '-', minWidth: 220 },
    { title: 'Ngày đặt', dataIndex: 'bookingDate', render: (value: string) => formatDate(value), width: 120 },
    { title: 'Giá trị', dataIndex: 'finalAmount', render: (value: number) => formatMoney(value), width: 150 },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: string) => <StatusTag value={value} />, width: 150 },
  ]

  const columns: ColumnsType<Customer> = [
    {
      title: 'Khách hàng',
      minWidth: 280,
      render: (_, record) => (
        <Space size={12}>
          <Avatar size={42} src={record.avatar} style={{ background: record.isActive ? '#d7f3ec' : '#f1f5f9', color: record.isActive ? '#0f766e' : '#64748b', fontWeight: 800 }}>{initials(record.fullName)}</Avatar>
          <div><Typography.Text strong>{record.fullName || 'Chưa cập nhật tên'}</Typography.Text><Typography.Text type="secondary" className="customer-email">{record.email}</Typography.Text></div>
        </Space>
      ),
    },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', render: (value?: string) => value || '-', width: 150 },
    { title: 'Ngày tham gia', dataIndex: 'createdAt', render: (value: string) => formatDate(value), width: 135 },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (value: boolean) => <Tag icon={value ? <CheckCircleOutlined /> : <StopOutlined />} color={value ? 'success' : 'error'}>{value ? 'Đang hoạt động' : 'Đã khóa'}</Tag>, width: 145 },
    {
      title: 'Thao tác',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem hồ sơ"><Button aria-label="Xem hồ sơ khách hàng" icon={<EyeOutlined />} onClick={() => void openDetail(record)} /></Tooltip>
          <Tooltip title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}><Switch size="small" checked={record.isActive} loading={updatingId === record.id} onChange={() => toggleStatus(record)} /></Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageTitle title="Quản lý khách hàng" subtitle="Tra cứu hồ sơ, lịch sử đặt tour và trạng thái tài khoản khách hàng" extra={<Button icon={<ReloadOutlined />} onClick={() => void Promise.all([customers.load(), loadMetrics()])}>Làm mới</Button>} />

      <Row gutter={[16, 16]} className="customer-stat-grid">
        <Col xs={24} md={8}><Card loading={metricsLoading}><Statistic title="Tổng khách hàng" value={metrics.total} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card loading={metricsLoading}><Statistic title="Đang hoạt động" value={metrics.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#0f766e' }} /></Card></Col>
        <Col xs={24} md={8}><Card loading={metricsLoading}><Statistic title="Tài khoản đã khóa" value={metrics.locked} prefix={<LockOutlined />} valueStyle={{ color: '#dc2626' }} /></Card></Col>
      </Row>

      <Card className="customer-filter-card">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={12} lg={14}><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void search()} prefix={<SearchOutlined />} allowClear placeholder="Tìm theo tên, email hoặc số điện thoại" /></Col>
          <Col xs={24} sm={12} md={6} lg={5}><Select value={statusFilter} onChange={(value) => { setStatusFilter(value); void customers.load({ page: 1, keyword: keyword.trim() || undefined, isActive: value || undefined }) }} className="w-full" options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đang hoạt động' }, { value: 'false', label: 'Đã khóa' }]} /></Col>
          <Col xs={12} sm={6} md={3} lg={2}><Button block type="primary" icon={<SearchOutlined />} onClick={() => void search()}>Tìm</Button></Col>
          <Col xs={12} sm={6} md={3} lg={3}><Button block onClick={reset}>Xóa lọc</Button></Col>
        </Row>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={customers.loading}
          dataSource={customers.items}
          columns={columns}
          scroll={{ x: 900 }}
          pagination={{
            current: customers.pagination.page,
            pageSize: customers.pagination.limit,
            total: customers.pagination.totalItems,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
            onChange: (page, limit) => void customers.load({ page, limit }),
          }}
        />
      </Card>

      <Drawer title="Hồ sơ khách hàng" width={760} open={Boolean(selected)} loading={detailLoading} onClose={() => setSelected(null)}>
        {selected && <>
          <div className="customer-profile-head">
            <Avatar size={64} src={selected.avatar} icon={!selected.fullName ? <UserOutlined /> : undefined} style={{ background: '#d7f3ec', color: '#0f766e', fontWeight: 800, fontSize: 20 }}>{initials(selected.fullName)}</Avatar>
            <div><Typography.Title level={4}>{selected.fullName || 'Chưa cập nhật tên'}</Typography.Title><Typography.Text type="secondary">{selected.email}</Typography.Text><div className="customer-profile-tags"><Tag color="geekblue">Khách hàng</Tag><Tag color={selected.isActive ? 'success' : 'error'}>{selected.isActive ? 'Đang hoạt động' : 'Đã khóa'}</Tag></div></div>
          </div>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Số điện thoại">{selected.phoneNumber || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia">{formatDate(selected.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Tổng đơn">{bookings.length}</Descriptions.Item>
            <Descriptions.Item label="Giá trị đã xác nhận">{formatMoney(customerValue)}</Descriptions.Item>
          </Descriptions>
          <div className="customer-history-title"><div><Typography.Title level={5}>Lịch sử đặt tour</Typography.Title><Typography.Text type="secondary">Tối đa 50 đơn gần nhất</Typography.Text></div><Button danger={selected.isActive} icon={selected.isActive ? <LockOutlined /> : <CheckCircleOutlined />} onClick={() => toggleStatus(selected)}>{selected.isActive ? 'Khóa tài khoản' : 'Mở khóa'}</Button></div>
          <Table rowKey="id" size="small" dataSource={bookings} columns={bookingColumns} pagination={{ pageSize: 5, hideOnSinglePage: true }} scroll={{ x: 760 }} />
        </>}
      </Drawer>
    </>
  )
}
