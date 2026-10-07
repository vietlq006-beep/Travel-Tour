import { Typography } from 'antd'
import type { ReactNode } from 'react'

interface PageTitleProps {
  title: string
  subtitle?: string
  extra?: ReactNode
}

export function PageTitle({ title, subtitle, extra }: PageTitleProps) {
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
