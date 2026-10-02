# LeViet Travel Admin

Frontend quản trị dùng React, Vite và Ant Design.

## Chạy local

```bash
npm install
npm run dev
```

Mặc định ứng dụng gọi backend tại `http://localhost:5000/api`. Tạo file `.env.local` nếu cần đổi API:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Màn hình chính

- Dashboard biểu đồ doanh thu, booking và top tour.
- Quản lý danh mục và tour.
- Mở chuyến khởi hành, phân công khách sạn, xe và hướng dẫn viên.
- Duyệt đơn chuyển khoản, xác nhận hoặc từ chối giao dịch.
- Tải báo cáo booking Excel theo ngày và trạng thái.
