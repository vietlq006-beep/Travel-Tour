import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'
import 'antd/dist/reset.css'
import {
  BankOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DownloadOutlined,
  EditOutlined,
  FileExcelOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  TagOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const { Header, Content, Sider } = Layout
const { RangePicker } = DatePicker
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const AUTH_KEY = 'leviet_admin_auth'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const session = readSession()
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem(AUTH_KEY)
    return Promise.reject(error)
  },
)

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}

function unwrap(response) {
  return response.data?.data ?? response.data
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
}

function formatDate(value) {
  return value ? dayjs(value).format('DD/MM/YYYY') : '-'
}

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function getErrorMessage(error) {
  const data = error.response?.data
  if (data?.errors?.length) return data.errors.map((item) => item.message || item.msg).filter(Boolean).join(', ')
  return data?.message || error.message || 'Có lỗi xảy ra'
}

function StatusTag({ value }) {
  const map = {
    OPEN: ['Đang mở', 'green'],
    CLOSED: ['Đã đóng', 'orange'],
    COMPLETED: ['Hoàn tất', 'blue'],
    CANCELLED: ['Đã hủy', 'red'],
    PENDING_PAYMENT: ['Chờ thanh toán', 'gold'],
    CONFIRMED: ['Đã xác nhận', 'green'],
    PENDING: ['Chờ xử lý', 'gold'],
    SUCCESS: ['Thành công', 'green'],
    FAILED: ['Thất bại', 'red'],
    REFUNDED: ['Đã hoàn tiền', 'blue'],
    BANK_TRANSFER: ['Chuyển khoản', 'cyan'],
    CASH: ['Tiền mặt', 'purple'],
    VNPAY: ['VNPAY', 'geekblue'],
  }
  const [label, color] = map[value] || [value || '-', 'default']
  return <Tag color={color}>{label}</Tag>
}

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (values) => {
    setLoading(true)
    setError('')
    try {
      const data = unwrap(await api.post('/auth/login', values))
      if (data.user?.role !== 'ADMIN') {
        setError('Tài khoản này không có quyền quản trị.')
        return
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(data))
      onLogin(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div>
          <span className="brand-kicker">LeViet Travel</span>
          <Typography.Title level={1}>Admin Console</Typography.Title>
          <Typography.Paragraph>
            Điều hành tour, chuyến khởi hành, thanh toán và báo cáo từ một bảng quản trị.
          </Typography.Paragraph>
        </div>
      </section>
      <Card className="login-card" title="Đăng nhập quản trị">
        {error && <Alert className="mb-16" type="error" showIcon message={error} />}
        <Form layout="vertical" onFinish={submit} initialValues={{ email: 'admin@leviet.com' }}>
          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
            <Input size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>
          <Button block size="large" type="primary" htmlType="submit" loading={loading}>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </main>
  )
}

function ProtectedRoute({ session, children }) {
  const location = useLocation()
  if (!session?.token) return <Navigate to="/login" state={{ from: location }} replace />
  if (session.user?.role !== 'ADMIN') return <Navigate to="/login" replace />
  return children
}

function AdminLayout({ session, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = Grid.useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)

  const items = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/catalog', icon: <TagOutlined />, label: <Link to="/catalog">Danh mục & tour</Link> },
    { key: '/departures', icon: <CalendarOutlined />, label: <Link to="/departures">Khởi hành & điều phối</Link> },
    { key: '/payments', icon: <BankOutlined />, label: <Link to="/payments">Duyệt chuyển khoản</Link> },
    { key: '/reports', icon: <FileExcelOutlined />, label: <Link to="/reports">Báo cáo Excel</Link> },
  ]

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    onLogout()
    navigate('/login')
  }

  return (
    <Layout className="admin-layout">
      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={screens.lg ? 72 : 0}
        className="admin-sider"
      >
        <div className="brand">
          <span className="brand-mark">LV</span>
          {!collapsed && <span>LeViet Admin</span>}
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={items} />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space>
            <Typography.Text strong>{session.user?.fullName || session.user?.email}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content className="admin-content">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="departures" element={<DeparturesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

function PageTitle({ title, subtitle, extra }) {
  return (
    <div className="page-title">
      <div>
        <Typography.Title level={2}>{title}</Typography.Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {extra}
    </div>
  )
}

function DashboardPage() {
  const { message } = AntApp.useApp()
  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState({ monthlyRevenue: [], topTours: [] })
  const [range, setRange] = useState([dayjs().startOf('year'), dayjs().endOf('year')])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [summaryData, analyticsData] = await Promise.all([
        api.get('/dashboard/summary').then(unwrap),
        api
          .get('/dashboard/analytics', {
            params: { fromDate: range?.[0]?.format('YYYY-MM-DD'), toDate: range?.[1]?.format('YYYY-MM-DD') },
          })
          .then(unwrap),
      ])
      setSummary(summaryData)
      setAnalytics(analyticsData)
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const statusData = Object.entries(summary?.bookingsByStatus || {}).map(([status, count]) => ({ status, count }))

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Tổng quan doanh thu, booking và hiệu suất tour"
        extra={
          <Space wrap>
            <RangePicker value={range} onChange={setRange} />
            <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>
              Làm mới
            </Button>
          </Space>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card><Statistic title="Khách hàng" value={summary?.customers || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card><Statistic title="Tour hoạt động" value={summary?.activeTours || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card><Statistic title="Đợt đang mở" value={summary?.openDepartures || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card><Statistic title="Doanh thu" value={summary?.revenue || 0} formatter={formatMoney} /></Card>
        </Col>
      </Row>
      <Row className="mt-16" gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card title="Doanh thu theo tháng" loading={loading}>
            <div className="chart-box">
              <ResponsiveContainer>
                <AreaChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000000)}tr`} />
                  <Tooltip formatter={(v, name) => (name === 'revenue' ? formatMoney(v) : v)} />
                  <Legend />
                  <Area name="Doanh thu" type="monotone" dataKey="revenue" stroke="#0f766e" fill="#99f6e4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="Đơn theo trạng thái" loading={loading}>
            <div className="chart-box">
              <ResponsiveContainer>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" name="Số đơn" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="mt-16" title="Top tour doanh thu cao">
        <Table
          rowKey="id"
          dataSource={analytics.topTours}
          pagination={false}
          columns={[
            { title: 'Mã', dataIndex: 'code', width: 140 },
            { title: 'Tour', dataIndex: 'name' },
            { title: 'Booking', dataIndex: 'bookingCount', width: 120 },
            { title: 'Khách', dataIndex: 'passengers', width: 100 },
            { title: 'Doanh thu', dataIndex: 'revenue', render: formatMoney, width: 180 },
          ]}
        />
      </Card>
    </>
  )
}

function usePagedResource(path, initialParams = {}) {
  const { message } = AntApp.useApp()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0 })
  const [params, setParams] = useState(initialParams)
  const [loading, setLoading] = useState(false)

  const load = async (next = {}) => {
    setLoading(true)
    const merged = { ...params, ...next }
    try {
      const data = unwrap(await api.get(path, { params: compactParams(merged) }))
      setItems(data.items || data)
      setPagination(data.pagination || { page: 1, limit: 100, totalItems: (data || []).length })
      setParams(merged)
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(initialParams)
  }, [path])

  return { items, pagination, params, loading, load }
}

function CategoryManager() {
  const { message } = AntApp.useApp()
  const resource = usePagedResource('/categories', { page: 1, limit: 10 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const submit = async (values) => {
    try {
      if (editing) await api.put(`/categories/${editing.id}`, values)
      else await api.post('/categories', values)
      message.success(editing ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      resource.load()
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  return (
    <Card
      title="Danh mục tour"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setOpen(true)
          }}
        >
          Thêm
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={resource.loading}
        dataSource={resource.items}
        pagination={{
          current: resource.pagination.page,
          pageSize: resource.pagination.limit,
          total: resource.pagination.totalItems,
          onChange: (page, limit) => resource.load({ page, limit }),
        }}
        columns={[
          { title: 'Tên danh mục', dataIndex: 'name' },
          { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
          {
            title: 'Thao tác',
            width: 120,
            render: (_, record) => (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record)
                  form.setFieldsValue(record)
                  setOpen(true)
                }}
              />
            ),
          },
        ]}
      />
      <Drawer title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} width={420} open={open} onClose={() => setOpen(false)}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="imageUrl" label="URL ảnh">
            <Input />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            Lưu danh mục
          </Button>
        </Form>
      </Drawer>
    </Card>
  )
}

function TourManager() {
  const { message } = AntApp.useApp()
  const tours = usePagedResource('/tours', { page: 1, limit: 10 })
  const categories = usePagedResource('/categories', { page: 1, limit: 100 })
  const destinations = usePagedResource('/destinations', { page: 1, limit: 100 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const submit = async (values) => {
    const payload = { ...values, images: values.images ? values.images.split('\n').filter(Boolean) : [] }
    try {
      if (editing) await api.put(`/tours/${editing.id}`, payload)
      else await api.post('/tours', payload)
      message.success(editing ? 'Đã cập nhật tour' : 'Đã tạo tour')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      tours.load()
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const openEdit = async (record) => {
    try {
      const detail = unwrap(await api.get(`/tours/${record.id}`))
      setEditing(detail)
      form.setFieldsValue({
        ...detail,
        destinationIds: detail.destinations?.map((item) => item.id) || [],
        images: (detail.images || []).join('\n'),
      })
      setOpen(true)
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  return (
    <Card
      title="Tour"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null)
            form.resetFields()
            form.setFieldsValue({ isActive: true, durationNights: 0 })
            setOpen(true)
          }}
        >
          Thêm tour
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={tours.loading}
        dataSource={tours.items}
        pagination={{
          current: tours.pagination.page,
          pageSize: tours.pagination.limit,
          total: tours.pagination.totalItems,
          onChange: (page, limit) => tours.load({ page, limit }),
        }}
        columns={[
          { title: 'Mã', dataIndex: 'code', width: 150 },
          { title: 'Tên tour', dataIndex: 'name' },
          { title: 'Danh mục', dataIndex: ['category', 'name'], width: 180 },
          {
            title: 'Thời lượng',
            width: 130,
            render: (_, record) => `${record.durationDays}N${record.durationNights}Đ`,
          },
          { title: 'Hoạt động', dataIndex: 'isActive', width: 110, render: (v) => <Switch checked={v} disabled /> },
          { title: 'Sửa', width: 80, render: (_, record) => <Button icon={<EditOutlined />} onClick={() => openEdit(record)} /> },
        ]}
      />
      <Drawer title={editing ? 'Sửa tour' : 'Thêm tour'} width={620} open={open} onClose={() => setOpen(false)}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="code" label="Mã tour" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                <Select options={categories.items.map((item) => ({ value: item.id, label: item.name }))} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="name" label="Tên tour" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item name="durationDays" label="Số ngày" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="durationNights" label="Số đêm" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="destinationIds" label="Điểm đến">
            <Select
              mode="multiple"
              options={destinations.items.map((item) => ({ value: item.id, label: `${item.name} (${item.region})` }))}
            />
          </Form.Item>
          <Form.Item name="thumbnail" label="Ảnh đại diện" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="images" label="Ảnh chi tiết, mỗi dòng một URL">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="overview" label="Tổng quan">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="isActive" label="Đang bán" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            Lưu tour
          </Button>
        </Form>
      </Drawer>
    </Card>
  )
}

function CatalogPage() {
  return (
    <>
      <PageTitle title="Danh mục & tour" subtitle="Quản lý cấu trúc catalog tour hiển thị trên website" />
      <Tabs
        items={[
          { key: 'categories', label: 'Danh mục', children: <CategoryManager /> },
          { key: 'tours', label: 'Tour', children: <TourManager /> },
        ]}
      />
    </>
  )
}

function DeparturesPage() {
  const { message } = AntApp.useApp()
  const departures = usePagedResource('/departures', { page: 1, limit: 10 })
  const tours = usePagedResource('/tours', { page: 1, limit: 100 })
  const hotels = usePagedResource('/hotels', { page: 1, limit: 100 })
  const vehicles = usePagedResource('/vehicles', { page: 1, limit: 100 })
  const guides = usePagedResource('/tour-guides', { page: 1, limit: 100, isActive: true })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const submit = async (values) => {
    const payload = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
    }
    try {
      if (editing) await api.put(`/departures/${editing.id}`, payload)
      else await api.post('/departures', payload)
      message.success(editing ? 'Đã cập nhật đợt khởi hành' : 'Đã mở chuyến khởi hành')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      departures.load()
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const edit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    })
    setOpen(true)
  }

  return (
    <>
      <PageTitle
        title="Khởi hành & điều phối"
        subtitle="Mở chuyến, phân công xe, khách sạn và hướng dẫn viên"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null)
              form.resetFields()
              form.setFieldsValue({ status: 'OPEN' })
              setOpen(true)
            }}
          >
            Mở chuyến
          </Button>
        }
      />
      <Card>
        <Table
          rowKey="id"
          loading={departures.loading}
          dataSource={departures.items}
          pagination={{
            current: departures.pagination.page,
            pageSize: departures.pagination.limit,
            total: departures.pagination.totalItems,
            onChange: (page, limit) => departures.load({ page, limit }),
          }}
          columns={[
            { title: 'Tour', dataIndex: ['tour', 'name'], minWidth: 220 },
            { title: 'Ngày đi', dataIndex: 'startDate', render: formatDate, width: 120 },
            { title: 'Ngày về', dataIndex: 'endDate', render: formatDate, width: 120 },
            { title: 'Ghế', render: (_, r) => `${r.bookedSeats}/${r.capacity}`, width: 90 },
            { title: 'Xe', render: (_, r) => r.vehicle?.licensePlate || '-', width: 140 },
            { title: 'HDV', render: (_, r) => r.guide?.fullName || '-', width: 170 },
            { title: 'Trạng thái', dataIndex: 'status', render: (v) => <StatusTag value={v} />, width: 140 },
            { title: 'Sửa', width: 80, render: (_, record) => <Button icon={<EditOutlined />} onClick={() => edit(record)} /> },
          ]}
        />
      </Card>
      <Drawer
        title={editing ? 'Cập nhật chuyến' : 'Mở chuyến khởi hành'}
        width={640}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="tourId" label="Tour" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={tours.items.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item name="startDate" label="Ngày đi" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="endDate" label="Ngày về" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={8}>
              <Form.Item name="capacity" label="Sức chứa" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item name="adultPrice" label="Giá người lớn" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={8}>
              <Form.Item name="childPrice" label="Giá trẻ em" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="hotelId" label="Khách sạn">
            <Select allowClear options={hotels.items.map((item) => ({ value: item.id, label: `${item.name} - ${item.address || ''}` }))} />
          </Form.Item>
          <Form.Item name="vehicleId" label="Phương tiện">
            <Select
              allowClear
              options={vehicles.items.map((item) => ({
                value: item.id,
                label: `${item.licensePlate} - ${item.vehicleType} (${item.seatCapacity} chỗ)`,
              }))}
            />
          </Form.Item>
          <Form.Item name="guideId" label="Hướng dẫn viên">
            <Select allowClear options={guides.items.map((item) => ({ value: item.id, label: `${item.fullName} - ${item.phoneNumber}` }))} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={['OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'].map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <Button block type="primary" htmlType="submit" icon={<CarOutlined />}>
            Lưu điều phối
          </Button>
        </Form>
      </Drawer>
    </>
  )
}

function PaymentsPage() {
  const { message, modal } = AntApp.useApp()
  const bookings = usePagedResource('/bookings', { page: 1, limit: 10, status: 'PENDING_PAYMENT' })
  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingPayments, setLoadingPayments] = useState(false)

  const loadPayments = async (booking) => {
    setSelected(booking)
    setLoadingPayments(true)
    try {
      setPayments(unwrap(await api.get(`/payments/booking/${booking.id}`)) || [])
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setLoadingPayments(false)
    }
  }

  const createBankTransfer = async (booking) => {
    try {
      await api.post('/payments', { bookingId: booking.id, paymentMethod: 'BANK_TRANSFER' })
      message.success('Đã tạo giao dịch chuyển khoản')
      loadPayments(booking)
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const approve = async (payment) => {
    const transactionId = `BANK-${dayjs().format('YYYYMMDD-HHmmss')}-${payment.id}`
    try {
      await api.patch(`/payments/${payment.id}/status`, {
        status: 'SUCCESS',
        transactionId,
        responseData: { approvedBy: 'admin-console', approvedAt: new Date().toISOString() },
      })
      message.success('Đã duyệt thanh toán và xác nhận đơn')
      setPayments((prev) => prev.map((item) => (item.id === payment.id ? { ...item, status: 'SUCCESS', transactionId } : item)))
      bookings.load()
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const fail = async (payment) => {
    try {
      await api.patch(`/payments/${payment.id}/status`, {
        status: 'FAILED',
        responseData: { rejectedBy: 'admin-console', rejectedAt: new Date().toISOString() },
      })
      message.success('Đã từ chối giao dịch')
      setPayments((prev) => prev.map((item) => (item.id === payment.id ? { ...item, status: 'FAILED' } : item)))
    } catch (err) {
      message.error(getErrorMessage(err))
    }
  }

  const columns = [
    { title: 'Mã đơn', dataIndex: 'bookingCode', width: 180 },
    { title: 'Khách hàng', render: (_, r) => r.user?.fullName || r.user?.email || '-', width: 220 },
    { title: 'Tour', render: (_, r) => r.departure?.tour?.name || '-', minWidth: 240 },
    { title: 'Ngày đặt', dataIndex: 'bookingDate', render: formatDate, width: 120 },
    { title: 'Tổng tiền', dataIndex: 'finalAmount', render: formatMoney, width: 160 },
    { title: 'Trạng thái', dataIndex: 'status', render: (v) => <StatusTag value={v} />, width: 160 },
    {
      title: 'Thanh toán',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button onClick={() => loadPayments(record)}>Xem</Button>
          <Button icon={<PlusOutlined />} onClick={() => createBankTransfer(record)} />
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageTitle
        title="Duyệt chuyển khoản"
        subtitle="Kiểm tra giao dịch BANK_TRANSFER đang chờ và xác nhận đơn hàng"
        extra={<Button icon={<ReloadOutlined />} onClick={() => bookings.load()}>Làm mới</Button>}
      />
      <Card>
        <Table
          rowKey="id"
          loading={bookings.loading}
          dataSource={bookings.items}
          columns={columns}
          pagination={{
            current: bookings.pagination.page,
            pageSize: bookings.pagination.limit,
            total: bookings.pagination.totalItems,
            onChange: (page, limit) => bookings.load({ page, limit }),
          }}
        />
      </Card>
      <Modal
        title={selected ? `Giao dịch của ${selected.bookingCode}` : 'Giao dịch'}
        open={Boolean(selected)}
        width={780}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <Descriptions className="mb-16" size="small" column={2} bordered>
            <Descriptions.Item label="Khách">{selected.user?.fullName || selected.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">{formatMoney(selected.finalAmount)}</Descriptions.Item>
          </Descriptions>
        )}
        <Table
          rowKey="id"
          loading={loadingPayments}
          dataSource={payments}
          pagination={false}
          columns={[
            { title: 'Phương thức', dataIndex: 'paymentMethod', render: (v) => <StatusTag value={v} /> },
            { title: 'Số tiền', dataIndex: 'amount', render: formatMoney },
            { title: 'Trạng thái', dataIndex: 'status', render: (v) => <StatusTag value={v} /> },
            { title: 'Mã tham chiếu', dataIndex: 'transactionId' },
            {
              title: 'Duyệt',
              width: 190,
              render: (_, record) => (
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={record.status !== 'PENDING' || record.paymentMethod !== 'BANK_TRANSFER'}
                    onClick={() => approve(record)}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    danger
                    disabled={record.status !== 'PENDING'}
                    onClick={() => modal.confirm({ title: 'Từ chối giao dịch?', onOk: () => fail(record) })}
                  >
                    Từ chối
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
    </>
  )
}

function ReportsPage() {
  const { message } = AntApp.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const download = async (values) => {
    setLoading(true)
    try {
      const params = compactParams({
        fromDate: values.range?.[0]?.format('YYYY-MM-DD'),
        toDate: values.range?.[1]?.format('YYYY-MM-DD'),
        status: values.status,
      })
      const response = await api.get('/reports/bookings.xlsx', { params, responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `leviet-bookings-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
      message.success('Đã tải file Excel báo cáo')
    } catch (err) {
      message.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle title="Báo cáo Excel" subtitle="Tải báo cáo booking theo khoảng ngày và trạng thái" />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={download}
          initialValues={{ range: [dayjs().startOf('month'), dayjs().endOf('month')] }}
        >
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item name="range" label="Khoảng ngày">
                <RangePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Trạng thái đơn">
                <Select
                  allowClear
                  options={['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label=" ">
                <Button block type="primary" htmlType="submit" icon={<DownloadOutlined />} loading={loading}>
                  Tải Excel
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  )
}

function App() {
  const [session, setSession] = useState(() => readSession())
  const navigateTarget = useMemo(() => (session?.token ? '/' : '/login'), [session])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f766e',
          borderRadius: 8,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={session?.token ? <Navigate to="/" replace /> : <LoginPage onLogin={setSession} />}
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute session={session}>
                  <AdminLayout session={session} onLogout={() => setSession(null)} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to={navigateTarget} replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
