import { ReloadOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, DatePicker, Row, Space, Statistic, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
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
import { api, unwrap } from '../api/client'
import { PageTitle } from '../components/common/PageTitle'
import type {
  ApiEnvelope,
  DashboardAnalytics,
  DashboardSummary,
  TopTour,
} from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatMoney } from '../utils/formatters'

const { RangePicker } = DatePicker
type DateRange = [Dayjs, Dayjs] | null

const TOP_TOUR_COLUMNS: ColumnsType<TopTour> = [
  { title: 'Mã', dataIndex: 'code', width: 140 },
  { title: 'Tour', dataIndex: 'name' },
  { title: 'Booking', dataIndex: 'bookingCount', width: 120 },
  { title: 'Khách', dataIndex: 'passengers', width: 100 },
  { title: 'Doanh thu', dataIndex: 'revenue', render: (value: number) => formatMoney(value), width: 180 },
]

export function DashboardPage() {
  const { message } = AntApp.useApp()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({ monthlyRevenue: [], topTours: [] })
  const [range, setRange] = useState<DateRange>([dayjs().startOf('year'), dayjs().endOf('year')])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryData, analyticsData] = await Promise.all([
        api.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary').then((response) => unwrap<DashboardSummary>(response)),
        api.get<ApiEnvelope<DashboardAnalytics>>('/dashboard/analytics', {
          params: { fromDate: range?.[0].format('YYYY-MM-DD'), toDate: range?.[1].format('YYYY-MM-DD') },
        }).then((response) => unwrap<DashboardAnalytics>(response)),
      ])
      setSummary(summaryData)
      setAnalytics(analyticsData)
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [message, range])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const statusData = Object.entries(summary?.bookingsByStatus || {}).map(([status, count]) => ({ status, count }))

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="Tổng quan doanh thu, booking và hiệu suất tour"
        extra={
          <Space wrap>
            <RangePicker value={range} onChange={(value) => setRange(value as DateRange)} />
            <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void load()}>
              Làm mới
            </Button>
          </Space>
        }
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Khách hàng" value={summary?.customers || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Tour hoạt động" value={summary?.activeTours || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Đợt đang mở" value={summary?.openDepartures || 0} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title="Doanh thu" value={summary?.revenue || 0} formatter={(value) => formatMoney(value)} /></Card></Col>
      </Row>
      <Row className="mt-16" gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card title="Doanh thu theo tháng" loading={loading}>
            <div className="chart-box">
              <ResponsiveContainer>
                <AreaChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value: number) => `${Math.round(value / 1_000_000)}tr`} />
                  <Tooltip formatter={(value, name) => (name === 'revenue' ? formatMoney(Number(value)) : value)} />
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
        <Table rowKey="id" dataSource={analytics.topTours} pagination={false} columns={TOP_TOUR_COLUMNS} />
      </Card>
    </>
  )
}
