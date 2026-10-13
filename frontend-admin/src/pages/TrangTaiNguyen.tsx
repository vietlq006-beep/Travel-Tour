import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, DatePicker, Drawer, Form, Input, InputNumber, Select, Space, Switch, Table, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { api, unwrap } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import { usePagedResource } from '../hooks/useTaiNguyenPhanTrang'
import type { ApiEnvelope, EntityId, Itinerary, Tour } from '../types/du-lieu'
import { getErrorMessage } from '../utils/loi'

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'date'
interface FieldSpec { name: string; label: string; type?: FieldType; required?: boolean; options?: Array<{ value: string; label: string }> }
interface ResourceRecord { id: EntityId; [key: string]: unknown }

const SPECS: Array<{ key: string; label: string; endpoint: string; titleField: string; fields: FieldSpec[] }> = [
  { key: 'destinations', label: 'Điểm đến', endpoint: '/destinations', titleField: 'name', fields: [{ name: 'name', label: 'Tên điểm đến', required: true }, { name: 'region', label: 'Vùng miền', type: 'select', required: true, options: [{ value: 'BAC', label: 'Bắc' }, { value: 'TRUNG', label: 'Trung' }, { value: 'NAM', label: 'Nam' }] }, { name: 'description', label: 'Mô tả', type: 'textarea' }, { name: 'imageUrl', label: 'URL hình ảnh' }] },
  { key: 'hotels', label: 'Khách sạn', endpoint: '/hotels', titleField: 'name', fields: [{ name: 'name', label: 'Tên khách sạn', required: true }, { name: 'address', label: 'Địa chỉ', required: true }, { name: 'starRating', label: 'Hạng sao', type: 'number', required: true }, { name: 'contactPhone', label: 'Điện thoại' }] },
  { key: 'vehicles', label: 'Phương tiện', endpoint: '/vehicles', titleField: 'licensePlate', fields: [{ name: 'vehicleType', label: 'Loại phương tiện', required: true }, { name: 'licensePlate', label: 'Biển số', required: true }, { name: 'seatCapacity', label: 'Sức chứa', type: 'number', required: true }] },
  { key: 'guides', label: 'Hướng dẫn viên', endpoint: '/tour-guides', titleField: 'fullName', fields: [{ name: 'fullName', label: 'Họ tên', required: true }, { name: 'phoneNumber', label: 'Điện thoại', required: true }, { name: 'email', label: 'Email' }, { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number' }, { name: 'languages', label: 'Ngôn ngữ' }, { name: 'isActive', label: 'Đang hoạt động', type: 'boolean' }] },
  { key: 'vouchers', label: 'Voucher', endpoint: '/vouchers', titleField: 'code', fields: [{ name: 'code', label: 'Mã voucher', required: true }, { name: 'discountType', label: 'Loại giảm', type: 'select', required: true, options: [{ value: 'PERCENT', label: 'Phần trăm' }, { value: 'FIXED', label: 'Số tiền' }] }, { name: 'discountValue', label: 'Giá trị giảm', type: 'number', required: true }, { name: 'minBookingAmount', label: 'Đơn tối thiểu', type: 'number' }, { name: 'maxUsage', label: 'Lượt dùng tối đa', type: 'number', required: true }, { name: 'startDate', label: 'Bắt đầu', type: 'date', required: true }, { name: 'endDate', label: 'Kết thúc', type: 'date', required: true }, { name: 'isActive', label: 'Đang hoạt động', type: 'boolean' }] },
]

function ResourceManager({ spec }: { spec: typeof SPECS[number] }) {
  const { message, modal } = AntApp.useApp()
  const resource = usePagedResource<ResourceRecord>(spec.endpoint, { page: 1, limit: 10 })
  const [editing, setEditing] = useState<ResourceRecord | null>(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<Record<string, unknown>>()
  const start = (record?: ResourceRecord) => {
    setEditing(record || null)
    const values: Record<string, unknown> = { isActive: true, starRating: 3, maxUsage: 100, ...record }
    spec.fields.filter((field) => field.type === 'date').forEach((field) => { if (values[field.name]) values[field.name] = dayjs(String(values[field.name])) })
    form.setFieldsValue(values); setOpen(true)
  }
  const submit = async (values: Record<string, unknown>) => {
    const payload = { ...values }
    spec.fields.filter((field) => field.type === 'date').forEach((field) => { const value = payload[field.name] as { format?: (pattern: string) => string }; if (value?.format) payload[field.name] = value.format('YYYY-MM-DD') })
    try {
      if (editing) await api.put(`${spec.endpoint}/${editing.id}`, payload)
      else await api.post(spec.endpoint, payload)
      void message.success('Đã lưu dữ liệu'); setOpen(false); setEditing(null); form.resetFields(); await resource.load()
    } catch (error) { void message.error(getErrorMessage(error)) }
  }
  const remove = (record: ResourceRecord) => modal.confirm({ title: `Xóa ${String(record[spec.titleField] || record.id)}?`, okButtonProps: { danger: true }, okText: 'Xóa', cancelText: 'Đóng', async onOk() { await api.delete(`${spec.endpoint}/${record.id}`); void message.success('Đã xóa hoặc ngừng sử dụng'); await resource.load() } })
  const columns: ColumnsType<ResourceRecord> = [
    { title: spec.fields[0].label, dataIndex: spec.fields[0].name },
    ...spec.fields.slice(1, 4).map((field) => ({ title: field.label, dataIndex: field.name, ellipsis: true, render: (value: unknown) => typeof value === 'boolean' ? (value ? 'Có' : 'Không') : String(value ?? '-') })),
    { title: 'Thao tác', width: 110, render: (_, record) => <Space><Button icon={<EditOutlined />} onClick={() => start(record)} /><Button danger icon={<DeleteOutlined />} onClick={() => remove(record)} /></Space> },
  ]
  return <Card title={`Quản trị ${spec.label.toLowerCase()}`} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => start()}>Thêm mới</Button>}><Table rowKey="id" loading={resource.loading} dataSource={resource.items} columns={columns} scroll={{ x: 800 }} pagination={{ current: resource.pagination.page, pageSize: resource.pagination.limit, total: resource.pagination.totalItems, onChange: (page, limit) => void resource.load({ page, limit }) }} /><Drawer title={`${editing ? 'Cập nhật' : 'Thêm'} ${spec.label.toLowerCase()}`} width={500} open={open} onClose={() => setOpen(false)}><Form form={form} layout="vertical" onFinish={(values) => void submit(values)}>{spec.fields.map((field) => <Form.Item key={field.name} name={field.name} label={field.label} valuePropName={field.type === 'boolean' ? 'checked' : 'value'} rules={[{ required: field.required }]}>{field.type === 'number' ? <InputNumber min={0} style={{ width: '100%' }} /> : field.type === 'textarea' ? <Input.TextArea rows={4} /> : field.type === 'select' ? <Select options={field.options} /> : field.type === 'boolean' ? <Switch /> : field.type === 'date' ? <DatePicker style={{ width: '100%' }} /> : <Input />}</Form.Item>)}<Button block type="primary" htmlType="submit">Lưu dữ liệu</Button></Form></Drawer></Card>
}

function ItineraryManager() {
  const { message, modal } = AntApp.useApp()
  const tours = usePagedResource<Tour>('/tours', { page: 1, limit: 100 })
  const [tourId, setTourId] = useState<EntityId>()
  const [items, setItems] = useState<Itinerary[]>([])
  const [editing, setEditing] = useState<Itinerary | null>(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<Itinerary>()
  const load = async (id: EntityId) => { setTourId(id); setItems(unwrap<Itinerary[]>(await api.get<ApiEnvelope<Itinerary[]>>(`/tours/${id}/itineraries`))) }
  const submit = async (values: Itinerary) => {
    if (!tourId) return
    try { if (editing) await api.put(`/tours/${tourId}/itineraries/${editing.id}`, values); else await api.post(`/tours/${tourId}/itineraries`, values); void message.success('Đã lưu lịch trình'); setOpen(false); setEditing(null); form.resetFields(); await load(tourId) } catch (error) { void message.error(getErrorMessage(error)) }
  }
  const remove = (item: Itinerary) => modal.confirm({ title: `Xóa ngày ${item.dayNumber}?`, okButtonProps: { danger: true }, async onOk() { await api.delete(`/tours/${tourId}/itineraries/${item.id}`); await load(tourId!); void message.success('Đã xóa lịch trình') } })
  return <Card title="Lịch trình theo tour" extra={<Button type="primary" disabled={!tourId} icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setOpen(true) }}>Thêm ngày</Button>}><Select showSearch optionFilterProp="label" placeholder="Chọn tour để quản lý lịch trình" style={{ width: '100%', maxWidth: 600, marginBottom: 16 }} options={tours.items.map((tour) => ({ value: tour.id, label: `${tour.code} - ${tour.name}` }))} onChange={(value) => void load(value)} /><Table rowKey="id" dataSource={items} pagination={false} columns={[{ title: 'Ngày', dataIndex: 'dayNumber', width: 80 }, { title: 'Tiêu đề', dataIndex: 'title', width: 240 }, { title: 'Nội dung', dataIndex: 'description', ellipsis: true }, { title: '', width: 110, render: (_, item) => <Space><Button icon={<EditOutlined />} onClick={() => { setEditing(item); form.setFieldsValue(item); setOpen(true) }} /><Button danger icon={<DeleteOutlined />} onClick={() => remove(item)} /></Space> }]} /><Drawer width={520} open={open} title={editing ? 'Cập nhật ngày' : 'Thêm ngày vào lịch trình'} onClose={() => setOpen(false)}><Form form={form} layout="vertical" onFinish={submit}><Form.Item name="dayNumber" label="Ngày thứ" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item><Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item><Form.Item name="description" label="Nội dung" rules={[{ required: true }]}><Input.TextArea rows={8} /></Form.Item><Button block type="primary" htmlType="submit">Lưu lịch trình</Button></Form></Drawer></Card>
}

export function ResourcesPage() {
  return <><PageTitle title="Tài nguyên vận hành" subtitle="Quản trị độc lập điểm đến, lưu trú, vận chuyển, nhân sự, voucher và lịch trình" /><Tabs items={[...SPECS.map((spec) => ({ key: spec.key, label: spec.label, children: <ResourceManager spec={spec} /> })), { key: 'itineraries', label: 'Lịch trình', children: <ItineraryManager /> }]} /></>
}
