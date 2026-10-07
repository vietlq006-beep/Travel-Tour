import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { api, unwrap } from '../api/may-khach-api'
import type { AdminSession, ApiEnvelope } from '../types/du-lieu'
import { getErrorMessage } from '../utils/loi'

interface LoginValues {
  email: string
  password: string
}

interface LoginPageProps {
  onLogin: (session: AdminSession) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (values: LoginValues) => {
    setLoading(true)
    setError('')
    try {
      const data = unwrap<AdminSession>(await api.post<ApiEnvelope<AdminSession>>('/auth/login', values))
      if (data.user.role !== 'ADMIN') {
        setError('Tài khoản này không có quyền quản trị.')
        return
      }
      onLogin(data)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
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
        <Form<LoginValues> layout="vertical" onFinish={submit} initialValues={{ email: 'admin@leviet.com' }}>
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
