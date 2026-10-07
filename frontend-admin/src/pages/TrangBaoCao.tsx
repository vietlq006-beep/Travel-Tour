import { DownloadOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, DatePicker, Form, Row, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { api } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import type { BookingStatus } from '../types/du-lieu'
import { getErrorMessage } from '../utils/loi'
import { compactParams } from '../utils/truy-van'

const { RangePicker } = DatePicker

interface ReportFormValues {
  range?: [Dayjs, Dayjs]
  status?: BookingStatus
}

const BOOKING_STATUSES: BookingStatus[] = ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']

export function ReportsPage() {
  const { message } = AntApp.useApp()
  const [form] = Form.useForm<ReportFormValues>()
  const [loading, setLoading] = useState(false)

  const download = async (values: ReportFormValues) => {
    setLoading(true)
    try {
      const params = compactParams({
        fromDate: values.range?.[0].format('YYYY-MM-DD'),
        toDate: values.range?.[1].format('YYYY-MM-DD'),
        status: values.status,
      })
      const response = await api.get<Blob>('/reports/bookings.xlsx', { params, responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `leviet-bookings-${dayjs().format('YYYYMMDD-HHmm')}.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
      void message.success('Đã tải file Excel báo cáo')
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle title="Báo cáo Excel" subtitle="Tải báo cáo booking theo khoảng ngày và trạng thái" />
      <Card>
        <Form<ReportFormValues> form={form} layout="vertical" onFinish={download} initialValues={{ range: [dayjs().startOf('month'), dayjs().endOf('month')] }}>
          <Row gutter={16}>
            <Col xs={24} md={10}><Form.Item name="range" label="Khoảng ngày"><RangePicker className="w-full" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item name="status" label="Trạng thái đơn"><Select allowClear options={BOOKING_STATUSES.map((value) => ({ value, label: value }))} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label=" "><Button block type="primary" htmlType="submit" icon={<DownloadOutlined />} loading={loading}>Tải Excel</Button></Form.Item></Col>
          </Row>
        </Form>
      </Card>
    </>
  )
}
