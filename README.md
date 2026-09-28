# LeViet Travel API

REST API quản lý tour du lịch xây dựng bằng Node.js, Express, Sequelize và MySQL 8. Hệ thống phục vụ cả website khách hàng và trang quản trị.

## Chức năng đã hoàn thiện

- Xác thực JWT, phân quyền `ADMIN`/`CUSTOMER`, cập nhật hồ sơ và đổi mật khẩu.
- CRUD danh mục, điểm đến, khách sạn, phương tiện, hướng dẫn viên.
- Quản lý tour, nhiều điểm đến, nhiều ảnh, lịch trình từng ngày và đợt khởi hành.
- Tìm kiếm, lọc, phân trang tour theo danh mục, điểm đến, giá và trạng thái.
- Voucher theo phần trăm/số tiền, thời hạn, giá trị đơn tối thiểu và giới hạn lượt dùng.
- Đặt chỗ bằng database transaction và khóa bản ghi chống bán vượt số ghế.
- Quản lý hành khách, trạng thái đơn, hủy đơn và hoàn lại ghế/lượt voucher.
- Thanh toán tiền mặt, chuyển khoản và VNPAY HMAC-SHA512; callback có tính idempotent.
- Đánh giá chỉ dành cho khách đã hoàn thành tour.
- Quản trị người dùng, dashboard doanh thu và xuất báo cáo Excel.
- Migration có phiên bản, ràng buộc dữ liệu, chỉ mục truy vấn và kiểm thử tự động.

## Khởi chạy nhanh

Yêu cầu: Node.js 20 trở lên và MySQL 8.

```bash
cd backend
npm install
copy .env.example .env
npm run migrate
npm run seed
npm start
```

API mặc định chạy tại `http://localhost:5000`. Kiểm tra bằng `GET /api/health`.

Tài khoản mẫu do seeder tạo:

- Admin: `admin@leviet.com` / `Admin@123`
- Khách hàng: `khachhang@gmail.com` / `Customer@123`

Không sử dụng các mật khẩu mẫu trên môi trường thật.

## Kiểm thử

```bash
cd backend
npm test
```

Test tích hợp sử dụng database trong `.env`, tự tạo dữ liệu có tiền tố test và dọn dẹp sau khi chạy. Không trỏ test vào database production.

## Tài liệu

- [Hướng dẫn API](backend/docs/API.md)
- [Cơ sở dữ liệu và migration](backend/docs/DATABASE.md)
- [Cài đặt và triển khai](backend/docs/DEPLOYMENT.md)

## Cấu trúc chính

```text
backend/
├── database/schema.sql          # Schema đầy đủ cho cài đặt mới
├── src/config                   # Database và kiểm tra môi trường
├── src/controllers              # Tiếp nhận/trả HTTP
├── src/services                 # Nghiệp vụ và transaction
├── src/models                   # Sequelize models/associations
├── src/routes                   # REST endpoints và middleware quyền
├── src/validators               # Kiểm tra request
├── src/database/migrations      # Thay đổi schema có phiên bản
├── test                         # Unit và integration tests
└── uploads                      # Ảnh upload cục bộ
```

Mọi response JSON (trừ tệp Excel và callback IPN) dùng cấu trúc thống nhất:

```json
{ "success": true, "message": "...", "data": {} }
```

```json
{ "success": false, "message": "...", "errors": [] }
```
