import { CarOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, DatePicker, Drawer, Form, InputNumber, Row, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { api } from '../api/client'
import { PageTitle } from '../components/common/PageTitle'
import { StatusTag } from '../components/common/StatusTag'
import { usePagedResource } from '../hooks/usePagedResource'
import type { Departure, DepartureStatus, EntityId, Hotel, Tour, TourGuide, Vehicle } from '../types'
import { getErrorMessage } from '../utils/errors'
import { formatDate } from '../utils/formatters'

interface DepartureFormValues {
  tourId: EntityId
  startDate: Dayjs
  endDate: Dayjs
  capacity: number
  adultPrice: number
  childPrice: number
  hotelId?: EntityId
  vehicleId?: EntityId
  guideId?: EntityId
  status: DepartureStatus
}

export function DeparturesPage() {
  const { message } = AntApp.useApp()
  const departures = usePagedResource<Departure>('/departures', { page: 1, limit: 10 })
  const tours = usePagedResource<Tour>('/tours', { page: 1, limit: 100 })
  const hotels = usePagedResource<Hotel>('/hotels', { page: 1, limit: 100 })
  const vehicles = usePagedResource<Vehicle>('/vehicles', { page: 1, limit: 100 })
  const guides = usePagedResource<TourGuide>('/tour-guides', { page: 1, limit: 100, isActive: true })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Departure | null>(null)
  const [form] = Form.useForm<DepartureFormValues>()

  const submit = async (values: DepartureFormValues) => {
    const payload = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
    }
    try {
      if (editing) await api.put(`/departures/${editing.id}`, payload)
      else await api.post('/departures', payload)
      void message.success(editing ? 'Đã cập nhật đợt khởi hành' : 'Đã mở chuyến khởi hành')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      await departures.load()
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const startCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ status: 'OPEN' })
    setOpen(true)
  }

  const startEdit = (record: Departure) => {
    setEditing(record)
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
    })
    setOpen(true)
  }

  const columns: ColumnsType<Departure> = [
    { title: 'Tour', dataIndex: ['tour', 'name'], minWidth: 220 },
    { title: 'Ngày đi', dataIndex: 'startDate', render: (value: string) => formatDate(value), width: 120 },
    { title: 'Ngày về', dataIndex: 'endDate', render: (value: string) => formatDate(value), width: 120 },
    { title: 'Ghế', render: (_, record) => `${record.bookedSeats}/${record.capacity}`, width: 90 },
    { title: 'Xe', render: (_, record) => record.vehicle?.licensePlate || '-', width: 140 },
    { title: 'HDV', render: (_, record) => record.guide?.fullName || '-', width: 170 },
    { title: 'Trạng thái', dataIndex: 'status', render: (value: DepartureStatus) => <StatusTag value={value} />, width: 140 },
    { title: 'Sửa', width: 80, render: (_, record) => <Button aria-label="Sửa chuyến" icon={<EditOutlined />} onClick={() => startEdit(record)} /> },
  ]

  return (
    <>
      <PageTitle
        title="Khởi hành & điều phối"
        subtitle="Mở chuyến, phân công xe, khách sạn và hướng dẫn viên"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>Mở chuyến</Button>}
      />
      <Card>
        <Table
          rowKey="id"
          loading={departures.loading}
          dataSource={departures.items}
          columns={columns}
          pagination={{
            current: departures.pagination.page,
            pageSize: departures.pagination.limit,
            total: departures.pagination.totalItems,
            onChange: (page, limit) => void departures.load({ page, limit }),
          }}
        />
      </Card>
      <Drawer title={editing ? 'Cập nhật chuyến' : 'Mở chuyến khởi hành'} width={640} open={open} onClose={() => setOpen(false)}>
        <Form<DepartureFormValues> form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="tourId" label="Tour" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={tours.items.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))} />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={12}><Form.Item name="startDate" label="Ngày đi" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item></Col>
            <Col xs={12}><Form.Item name="endDate" label="Ngày về" rules={[{ required: true }]}><DatePicker className="w-full" /></Form.Item></Col>
          </Row>
          <Row gutter={12}>
            <Col xs={8}><Form.Item name="capacity" label="Sức chứa" rules={[{ required: true }]}><InputNumber min={1} className="w-full" /></Form.Item></Col>
            <Col xs={8}><Form.Item name="adultPrice" label="Giá người lớn" rules={[{ required: true }]}><InputNumber min={1} className="w-full" /></Form.Item></Col>
            <Col xs={8}><Form.Item name="childPrice" label="Giá trẻ em" rules={[{ required: true }]}><InputNumber min={0} className="w-full" /></Form.Item></Col>
          </Row>
          <Form.Item name="hotelId" label="Khách sạn"><Select allowClear options={hotels.items.map((item) => ({ value: item.id, label: `${item.name} - ${item.address || ''}` }))} /></Form.Item>
          <Form.Item name="vehicleId" label="Phương tiện">
            <Select allowClear options={vehicles.items.map((item) => ({ value: item.id, label: `${item.licensePlate} - ${item.vehicleType} (${item.seatCapacity} chỗ)` }))} />
          </Form.Item>
          <Form.Item name="guideId" label="Hướng dẫn viên"><Select allowClear options={guides.items.map((item) => ({ value: item.id, label: `${item.fullName} - ${item.phoneNumber || ''}` }))} /></Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={(['OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'] as DepartureStatus[]).map((value) => ({ value, label: value }))} />
          </Form.Item>
          <Button block type="primary" htmlType="submit" icon={<CarOutlined />}>Lưu điều phối</Button>
        </Form>
      </Drawer>
    </>
  )
}
