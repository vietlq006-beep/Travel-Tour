import {
  BankOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileExcelOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Button, Grid, Layout, Menu, Space, Typography, type MenuProps } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { AdminSession } from '../../types'

const { Header, Content, Sider } = Layout

const NAV_ITEMS: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/catalog', icon: <TagOutlined />, label: 'Danh mục & tour' },
  { key: '/departures', icon: <CalendarOutlined />, label: 'Khởi hành & điều phối' },
  { key: '/payments', icon: <BankOutlined />, label: 'Duyệt chuyển khoản' },
  { key: '/reports', icon: <FileExcelOutlined />, label: 'Báo cáo Excel' },
]

interface AdminLayoutProps {
  session: AdminSession
  onLogout: () => void
}

export function AdminLayout({ session, onLogout }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const screens = Grid.useBreakpoint()
  const [collapsed, setCollapsed] = useState(false)

  const logout = () => {
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
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            aria-label={collapsed ? 'Mở menu' : 'Thu gọn menu'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
          <Space>
            <Typography.Text strong>{session.user.fullName || session.user.email}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
