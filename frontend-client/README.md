# Lê Việt Travel - Frontend Client

Ứng dụng khách hàng React + Vite + Tailwind CSS cho hệ thống Lê Việt Travel.

## Chức năng

- Trang chủ và danh sách tour có lọc theo điểm đến, từ khóa, mức giá.
- Trang chi tiết có thư viện ảnh, lịch trình từng ngày và lịch khởi hành.
- Đăng ký, đăng nhập và lưu phiên JWT.
- Đặt chỗ cho đoàn, nhập từng hành khách và áp mã giảm giá.
- Khởi tạo thanh toán rồi chuyển hướng đến VNPay.
- Lịch sử đơn, chi tiết hành khách/giao dịch, thanh toán lại và hủy đơn đang chờ.

## Chạy local

```bash
npm install
npm run dev
```

API mặc định: `http://localhost:5000/api`. Có thể đổi bằng biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Callback VNPay (`VNP_RETURN_URL` và IPN) phải tiếp tục trỏ về endpoint backend để chữ ký và trạng thái giao dịch được xác thực phía máy chủ.
