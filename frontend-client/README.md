# Lê Việt Travel - Frontend Client

Ứng dụng khách hàng React + Vite + Tailwind CSS cho hệ thống Lê Việt Travel.

## Chức năng

- Trang chủ và danh sách tour có lọc theo điểm đến, từ khóa, mức giá.
- Trang chi tiết có thư viện ảnh, lịch trình từng ngày và lịch khởi hành.
- Đăng ký, đăng nhập và lưu phiên JWT.
- Đặt chỗ cho đoàn, nhập từng hành khách và áp mã giảm giá.
- Thanh toán VietQR theo đúng số tiền và nội dung của từng đơn.
- Lịch sử đơn, chi tiết hành khách/giao dịch, thanh toán lại và hủy đơn đang chờ.

## Chạy local

```bash
npm install
npm run dev
```

Website khách hàng chạy cố định tại `http://localhost:5174` để không trùng với trang quản trị tại `http://localhost:5173`.

API mặc định: `http://localhost:5000/api`. Có thể đổi bằng biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

VietQR sử dụng tài khoản Techcombank cấu hình ở backend. Giao dịch giữ trạng thái chờ cho tới khi quản trị viên đối soát và xác nhận.
