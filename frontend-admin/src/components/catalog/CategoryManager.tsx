import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Drawer, Form, Input, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { api } from '../../api/client'
import { usePagedResource } from '../../hooks/usePagedResource'
import type { Category } from '../../types'
import { getErrorMessage } from '../../utils/errors'

interface CategoryFormValues {
  name: string
  description?: string
  imageUrl?: string
}

export function CategoryManager() {
  const { message } = AntApp.useApp()
  const resource = usePagedResource<Category>('/categories', { page: 1, limit: 10 })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form] = Form.useForm<CategoryFormValues>()

  const submit = async (values: CategoryFormValues) => {
    try {
      if (editing) await api.put(`/categories/${editing.id}`, values)
      else await api.post('/categories', values)
      void message.success(editing ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      await resource.load()
    } catch (error) {
      void message.error(getErrorMessage(error))
    }
  }

  const startCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const startEdit = (record: Category) => {
    setEditing(record)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const columns: ColumnsType<Category> = [
    { title: 'Tên danh mục', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => <Button aria-label={`Sửa ${record.name}`} icon={<EditOutlined />} onClick={() => startEdit(record)} />,
    },
  ]

  return (
    <Card title="Danh mục tour" extra={<Button type="primary" icon={<PlusOutlined />} onClick={startCreate}>Thêm</Button>}>
      <Table
        rowKey="id"
        loading={resource.loading}
        dataSource={resource.items}
        columns={columns}
        pagination={{
          current: resource.pagination.page,
          pageSize: resource.pagination.limit,
          total: resource.pagination.totalItems,
          onChange: (page, limit) => void resource.load({ page, limit }),
        }}
      />
      <Drawer title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} width={420} open={open} onClose={() => setOpen(false)}>
        <Form<CategoryFormValues> form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="imageUrl" label="URL ảnh"><Input /></Form.Item>
          <Button block type="primary" htmlType="submit">Lưu danh mục</Button>
        </Form>
      </Drawer>
    </Card>
  )
}
