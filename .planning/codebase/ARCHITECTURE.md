---
mapped_at: 2026-10-13
project: LeViet Travel
focus: architecture
---

# Architecture

## Kiểu kiến trúc

Hệ thống là modular monolith gồm một REST API và hai SPA độc lập. Backend theo luồng routes → controllers → services → Sequelize models → MySQL.

## Backend request flow

1. `backend/server.js` nạp môi trường, kiểm tra database, sync an toàn và mở HTTP server.
2. `backend/src/app.js` cấu hình middleware dùng chung và mount các route `/api/*`.
3. File trong `backend/src/routes/` áp auth, role và validator.
4. File trong `backend/src/controllers/` chuyển request/response, không chứa nhiều nghiệp vụ.
5. File trong `backend/src/services/` chứa nghiệp vụ, transaction và truy vấn.
6. File trong `backend/src/models/` định nghĩa schema ORM; quan hệ tập trung ở `backend/src/models/index.js`.
7. `backend/src/utils/apiResponse.js` chuẩn hóa envelope thành công/lỗi.

## Miền nghiệp vụ

- Identity: user, JWT, profile và role ADMIN/CUSTOMER.
- Catalog: category, destination, tour, gallery, video và itinerary.
- Operations: departure, hotel, vehicle và tour guide.
- Commerce: voucher, booking, participant, payment và review.
- Analytics: dashboard và Excel report.

## Luồng đặt tour

1. Client tải tour và các departure `OPEN` qua `backend/src/services/tourService.js`.
2. Khách chọn departure, số người và nhập danh sách hành khách.
3. `backend/src/services/bookingService.js` khóa row departure trong transaction.
4. Server tự tính giá, kiểm tra ghế, khóa voucher, tạo booking/participants và tăng ghế.
5. Client gọi payment; `backend/src/services/paymentService.js` tạo VietQR `PENDING`.
6. Admin đối soát thủ công và cập nhật payment `SUCCESS`, booking tự chuyển `CONFIRMED`.
7. Đơn hoàn tất mới được tạo review.

## State machines

- Booking: `PENDING_PAYMENT` → `CONFIRMED` → `COMPLETED`; có nhánh `CANCELLED`.
- Payment: `PENDING` → `SUCCESS` hoặc `FAILED`; `SUCCESS` → `REFUNDED`.
- Departure: `OPEN`, `CLOSED`, `COMPLETED`, `CANCELLED`.
- Chuyển trạng thái được kiểm tra trong service thay vì cho client ghi tự do.

## Frontend khách hàng

- `frontend-client/src/UngDung.tsx` định nghĩa routes và guard đăng nhập.
- `frontend-client/src/NhaCungCapXacThuc.tsx` giữ session trong context/localStorage.
- Các trang gọi API trực tiếp thông qua `frontend-client/src/dich-vu-api.ts`.
- Không có state/query library; mỗi page tự quản lý loading/error/cache.
- UX hiện là browse → detail → login → checkout → VietQR → my bookings.

## Frontend quản trị

- `frontend-admin/src/UngDung.tsx` tách route admin và guard role.
- `frontend-admin/src/hooks/useTaiNguyenPhanTrang.ts` là abstraction chính cho resource list.
- Các page gọi endpoint REST trực tiếp; Ant Design xử lý form/table/dialog.
- Phạm vi UI nhỏ hơn backend: nhiều resource có API nhưng chưa có màn hình CRUD đầy đủ.

## Data consistency

- Booking, voucher usage và seat inventory dùng database transaction + row lock.
- Thanh toán và booking được khóa khi đổi trạng thái.
- Schema có unique/check/index qua `backend/database/schema.sql` và migrations.
- Chưa có idempotency key cho POST booking/payment ngoài kiểm tra payment đang tồn tại.
- Không có outbox/event bus; side effect tương lai như email phải thiết kế để không lệch transaction.

## Ranh giới mở rộng

- API hiện phù hợp một operator bán tour của chính mình, không phải marketplace nhiều nhà cung cấp.
- Nếu mở rộng marketplace cần thêm supplier, contract, commission, settlement và permission theo tenant.
- Nếu scale ngang cần thay local upload, limiter in-memory và job in-process bằng dịch vụ dùng chung.
