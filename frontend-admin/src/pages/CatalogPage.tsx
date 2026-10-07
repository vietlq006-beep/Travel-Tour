import { Tabs } from 'antd'
import { CategoryManager } from '../components/catalog/CategoryManager'
import { TourManager } from '../components/catalog/TourManager'
import { PageTitle } from '../components/common/PageTitle'

export function CatalogPage() {
  return (
    <>
      <PageTitle title="Danh mục & tour" subtitle="Quản lý cấu trúc catalog tour hiển thị trên website" />
      <Tabs items={[
        { key: 'categories', label: 'Danh mục', children: <CategoryManager /> },
        { key: 'tours', label: 'Tour', children: <TourManager /> },
      ]} />
    </>
  )
}
