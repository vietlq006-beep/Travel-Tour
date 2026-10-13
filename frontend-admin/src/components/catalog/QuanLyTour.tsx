import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, Drawer, Form, Input, InputNumber, Row, Select, Switch, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { api, unwrap } from '../../api/may-khach-api'
import { usePagedResource } from '../../hooks/useTaiNguyenPhanTrang'
import type { ApiEnvelope, Category, Destination, EntityId, Tour } from '../../types/du-lieu'
import { getErrorMessage } from '../../utils/loi'

interface TourFormValues {
  code: string
  categoryId: EntityId
  name: string
  durationDays: number
  durationNights: number
  destinationIds?: EntityId[]
  thumbnail: string
  images?: string
  videoUrl?: string
  overview?: string
  includedServices?: string
  excludedServices?: string
  cancellationPolicy?: string
  changePolicy?: string
  depositPercent?: number
  childPolicy?: string
  infantPolicy?: string
  seniorPolicy?: string
  pickupPoints?: string
  meetingInstructions?: string
  luggagePolicy?: string
  insuranceDetails?: string
  visaRequirements?: string
  requiredDocuments?: string
  termsAndConditions?: string
  isActive: boolean
}

export function TourManager() {
  const { message } = AntApp.useApp()
  const tours = usePagedResource<Tour>('/tours', { page: 1, limit: 10 })
  const categories = usePagedResource<Category>('/categories', { page: 1, limit: 100 })
  const destinations = usePagedResource<Destination>('/destinations', { page: 1, limit: 100 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tour | null>(null)
  const [form] = Form.useForm<TourFormValues>()

  const submit = async (values: TourFormValues) => {
    const payload = {
      ...values,
      images: values.images?.split('\n').map((item) => item.trim()).filter(Boolean) || [],
    }
    try {
      if (editing) await api.put(`/tours/${editing.id}`, payload)
      else await api.post('/tours', payload)
      void message.success(editing ? 'Đã cập nhật tour' : 'Đã tạo tour')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      await tours.load()
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const startCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true, durationNights: 0 })
    setOpen(true)
  }

  const startEdit = async (record: Tour) => {
    try {
      const detail = unwrap<Tour>(await api.get<ApiEnvelope<Tour>>(`/tours/${record.id}`))
      setEditing(detail)
      form.setFieldsValue({
        ...detail,
        destinationIds: detail.destinations?.map((item) => item.id) || [],
        images: detail.images?.join('\n') || '',
        pickupPoints: detail.pickupPoints?.join('\n') || '',
      })
      setOpen(true)
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const columns: ColumnsType<Tour> = [
    { title: 'Mã', dataIndex: 'code', width: 150 },
    { title: 'Tên tour', dataIndex: 'name' },
    { title: 'Danh mục', dataIndex: ['category', 'name'], width: 180 },
    { title: 'Thời lượng', width: 130, render: (_, record) => `${record.durationDays}N${record.durationNights}Đ` },
    { title: 'Hoạt động', dataIndex: 'isActive', width: 110, render: (value: boolean) => <Switch checked={value} disabled /> },
    { title: 'Sửa', width: 80, render: (_, record) => <Button aria-label={`Sửa ${record.name}`} icon={<EditOutlined />} onClick={() => void startEdit(record)} /> },
  ]

  return (
    <Card title="Tour" extra={<Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>Thêm tour</Button>}>
      <Table
        rowKey="id"
        loading={tours.loading}
        dataSource={tours.items}
        columns={columns}
        pagination={{
          current: tours.pagination.page,
          pageSize: tours.pagination.limit,
          total: tours.pagination.totalItems,
          onChange: (page, limit) => void tours.load({ page, limit }),
        }}
      />
      <Drawer title={editing ? 'Sửa tour' : 'Thêm tour'} width={620} open={open} onClose={() => setOpen(false)}>
        <Form<TourFormValues> form={form} layout="vertical" onFinish={submit}>
          <Row gutter={12}>
            <Col xs={24} sm={12}><Form.Item name="code" label="Mã tour" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}><Select options={categories.items.map((item) => ({ value: item.id, label: item.name }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="name" label="Tên tour" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={12}>
            <Col xs={12}><Form.Item name="durationDays" label="Số ngày" rules={[{ required: true }]}><InputNumber min={1} className="w-full" /></Form.Item></Col>
            <Col xs={12}><Form.Item name="durationNights" label="Số đêm" rules={[{ required: true }]}><InputNumber min={0} className="w-full" /></Form.Item></Col>
          </Row>
          <Form.Item name="destinationIds" label="Điểm đến">
            <Select mode="multiple" options={destinations.items.map((item) => ({ value: item.id, label: `${item.name} (${item.region || 'Chưa phân vùng'})` }))} />
          </Form.Item>
          <Form.Item name="thumbnail" label="Ảnh đại diện" rules={[{ required: true }]}><Input placeholder="https://..." /></Form.Item>
          <Form.Item name="images" label="Ảnh chi tiết, mỗi dòng một URL"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="videoUrl" label="Video giới thiệu YouTube" rules={[{ type: 'url', warningOnly: true }]}><Input placeholder="https://www.youtube.com/watch?v=..." /></Form.Item>
          <Form.Item name="overview" label="Tổng quan"><Input.TextArea rows={4} /></Form.Item>
          <Row gutter={12}><Col xs={24} sm={12}><Form.Item name="includedServices" label="Dịch vụ bao gồm"><Input.TextArea rows={4} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="excludedServices" label="Dịch vụ không bao gồm"><Input.TextArea rows={4} /></Form.Item></Col></Row>
          <Form.Item name="depositPercent" label="Tỷ lệ đặt cọc (%)"><InputNumber min={0} max={100} className="w-full" /></Form.Item>
          <Row gutter={12}><Col xs={24} sm={12}><Form.Item name="cancellationPolicy" label="Chính sách hủy"><Input.TextArea rows={4} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="changePolicy" label="Chính sách đổi"><Input.TextArea rows={4} /></Form.Item></Col></Row>
          <Row gutter={12}><Col xs={24} sm={8}><Form.Item name="childPolicy" label="Chính sách trẻ em"><Input.TextArea rows={3} /></Form.Item></Col><Col xs={24} sm={8}><Form.Item name="infantPolicy" label="Chính sách em bé"><Input.TextArea rows={3} /></Form.Item></Col><Col xs={24} sm={8}><Form.Item name="seniorPolicy" label="Người cao tuổi"><Input.TextArea rows={3} /></Form.Item></Col></Row>
          <Form.Item name="pickupPoints" label="Điểm đón (mỗi dòng một điểm)"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="meetingInstructions" label="Hướng dẫn tập trung"><Input.TextArea rows={3} /></Form.Item>
          <Row gutter={12}><Col xs={24} sm={12}><Form.Item name="luggagePolicy" label="Hành lý"><Input.TextArea rows={3} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="insuranceDetails" label="Bảo hiểm"><Input.TextArea rows={3} /></Form.Item></Col></Row>
          <Row gutter={12}><Col xs={24} sm={12}><Form.Item name="visaRequirements" label="Yêu cầu visa"><Input.TextArea rows={3} /></Form.Item></Col><Col xs={24} sm={12}><Form.Item name="requiredDocuments" label="Giấy tờ cần thiết"><Input.TextArea rows={3} /></Form.Item></Col></Row>
          <Form.Item name="termsAndConditions" label="Điều khoản riêng của tour"><Input.TextArea rows={5} /></Form.Item>
          <Form.Item name="isActive" label="Đang bán" valuePropName="checked"><Switch /></Form.Item>
          <Button block type="primary" htmlType="submit">Lưu tour</Button>
        </Form>
      </Drawer>
    </Card>
  )
}
