import { DeleteOutlined, EditOutlined, MessageOutlined, ReloadOutlined, SearchOutlined, StarFilled } from '@ant-design/icons'
import { App as AntApp, Button, Card, Col, DatePicker, Input, Modal, Rate, Row, Select, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { api } from '../api/may-khach-api'
import { PageTitle } from '../components/common/TieuDeTrang'
import { usePagedResource } from '../hooks/useTaiNguyenPhanTrang'
import type { Review } from '../types/du-lieu'
import { getErrorMessage } from '../utils/loi'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'rating_desc', label: 'Điểm cao nhất' },
  { value: 'rating_asc', label: 'Điểm thấp nhất' },
]

export function ReviewsPage() {
  const { message, modal } = AntApp.useApp()
  const resource = usePagedResource<Review>('/reviews', { page: 1, limit: 10, sort: 'newest' })
  const [keyword, setKeyword] = useState('')
  const [rating, setRating] = useState<number | undefined>()
  const [sort, setSort] = useState('newest')
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)
  const [editing, setEditing] = useState<Review | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)

  const applyFilters = () => resource.load({
    page: 1,
    keyword: keyword.trim() || undefined,
    rating,
    sort,
    fromDate: dateRange?.[0],
    toDate: dateRange?.[1],
  })

  const resetFilters = () => {
    setKeyword('')
    setRating(undefined)
    setSort('newest')
    setDateRange(null)
    void resource.load({ page: 1, keyword: undefined, rating: undefined, sort: 'newest', fromDate: undefined, toDate: undefined })
  }

  const openEdit = (review: Review) => {
    setEditing(review)
    setEditRating(review.rating)
    setEditComment(review.comment || '')
  }

  const saveReview = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api.put(`/reviews/${editing.id}`, { rating: editRating, comment: editComment.trim() || null })
      setEditing(null)
      void message.success('Đã cập nhật đánh giá')
      await resource.load()
    } catch (error) {
      void message.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const removeReview = (review: Review) => {
    modal.confirm({
      title: 'Xóa đánh giá này?',
      content: `Đánh giá ${review.rating} sao của ${review.user?.fullName || review.user?.email || 'khách hàng'} sẽ bị xóa vĩnh viễn. Điểm trung bình của tour sẽ được tính lại.`,
      okText: 'Xóa đánh giá',
      cancelText: 'Đóng',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await api.delete(`/reviews/${review.id}`)
          void message.success('Đã xóa đánh giá')
          await resource.load()
        } catch (error) {
          void message.error(getErrorMessage(error))
        }
      },
    })
  }

  const columns: ColumnsType<Review> = [
    {
      title: 'Khách hàng',
      width: 220,
      render: (_, item) => <div><Typography.Text strong>{item.user?.fullName || 'Khách hàng'}</Typography.Text><br /><Typography.Text type="secondary">{item.user?.email || '-'}</Typography.Text></div>,
    },
    {
      title: 'Tour / đơn hàng',
      width: 280,
      render: (_, item) => <div><Typography.Text strong>{item.tour?.name || `Tour #${item.tourId}`}</Typography.Text><br /><Space size={6}><Tag color="cyan">{item.tour?.code || `#${item.tourId}`}</Tag><Typography.Text type="secondary" copyable={Boolean(item.booking?.bookingCode)}>{item.booking?.bookingCode || `Đơn #${item.bookingId}`}</Typography.Text></Space></div>,
    },
    {
      title: 'Điểm',
      dataIndex: 'rating',
      width: 170,
      sorter: false,
      render: (value: number) => <Space size={6}><Rate disabled value={value} style={{ fontSize: 15 }} /><Typography.Text strong>{value}/5</Typography.Text></Space>,
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      minWidth: 300,
      render: (value?: string | null) => value
        ? <Typography.Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}>{value}</Typography.Paragraph>
        : <Typography.Text type="secondary" italic>Không có bình luận</Typography.Text>,
    },
    { title: 'Ngày gửi', dataIndex: 'createdAt', width: 145, render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Thao tác',
      fixed: 'right',
      width: 150,
      render: (_, item) => <Space><Button aria-label="Sửa đánh giá" icon={<EditOutlined />} onClick={() => openEdit(item)} /><Button danger aria-label="Xóa đánh giá" icon={<DeleteOutlined />} onClick={() => removeReview(item)} /></Space>,
    },
  ]

  return <>
    <PageTitle
      title="Đánh giá & bình luận"
      subtitle="Theo dõi phản hồi của khách hàng và xử lý nội dung không phù hợp"
      extra={<Button icon={<ReloadOutlined />} onClick={() => void resource.load()}>Làm mới</Button>}
    />

    <Card className="filter-card">
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} lg={7}><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => void applyFilters()} allowClear prefix={<SearchOutlined />} placeholder="Tên khách, email, tour, mã đơn hoặc bình luận" /></Col>
        <Col xs={12} sm={8} lg={4}><Select allowClear value={rating} onChange={setRating} style={{ width: '100%' }} placeholder="Số sao" options={[5, 4, 3, 2, 1].map((value) => ({ value, label: `${value} sao` }))} /></Col>
        <Col xs={12} sm={8} lg={4}><Select value={sort} onChange={setSort} style={{ width: '100%' }} options={SORT_OPTIONS} /></Col>
        <Col xs={24} sm={8} lg={5}><DatePicker.RangePicker value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null} style={{ width: '100%' }} onChange={(dates) => setDateRange(dates ? [dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')] : null)} /></Col>
        <Col xs={12} sm={6} lg={2}><Button block type="primary" icon={<SearchOutlined />} onClick={() => void applyFilters()}>Lọc</Button></Col>
        <Col xs={12} sm={6} lg={2}><Button block onClick={resetFilters}>Xóa lọc</Button></Col>
      </Row>
    </Card>

    <Card style={{ marginTop: 16 }} title={<Space><MessageOutlined /><span>Phản hồi khách hàng</span><Tag color="blue">{resource.pagination.totalItems}</Tag></Space>}>
      <Table
        rowKey="id"
        loading={resource.loading}
        dataSource={resource.items}
        columns={columns}
        scroll={{ x: 1300 }}
        locale={{ emptyText: 'Chưa có đánh giá phù hợp với bộ lọc' }}
        pagination={{
          current: resource.pagination.page,
          pageSize: resource.pagination.limit,
          total: resource.pagination.totalItems,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} đánh giá`,
          onChange: (page, limit) => void resource.load({ page, limit }),
        }}
      />
    </Card>

    <Modal title="Chỉnh sửa đánh giá" open={Boolean(editing)} onCancel={() => setEditing(null)} onOk={() => void saveReview()} okText="Lưu thay đổi" cancelText="Đóng" confirmLoading={saving} destroyOnHidden>
      {editing && <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card size="small">
          <Typography.Text strong>{editing.user?.fullName || editing.user?.email || 'Khách hàng'}</Typography.Text>
          <br />
          <Typography.Text type="secondary">{editing.tour?.name} · {editing.booking?.bookingCode}</Typography.Text>
        </Card>
        <div>
          <Typography.Text strong>Mức đánh giá</Typography.Text>
          <div><Rate value={editRating} onChange={setEditRating} character={<StarFilled />} /></div>
        </div>
        <div>
          <Typography.Text strong>Bình luận</Typography.Text>
          <Input.TextArea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={6} maxLength={2000} showCount placeholder="Nội dung bình luận của khách hàng" />
        </div>
      </Space>}
    </Modal>
  </>
}
