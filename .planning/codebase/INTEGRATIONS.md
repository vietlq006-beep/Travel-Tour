---
mapped_at: 2026-10-13
project: LeViet Travel
focus: integrations
---

# External Integrations

## Cơ sở dữ liệu

- MySQL 8 là nguồn dữ liệu chính.
- Kết nối Sequelize được tạo trong `backend/src/config/database.js`.
- Pool được điều khiển bởi các biến `DB_POOL_*`.
- `backend/src/database/migrate.js` chạy migration có phiên bản.
- `backend/src/database/seeders/seed.js` nạp catalog và tài khoản mẫu.

## VietQR

- `backend/src/services/vietQrService.js` tạo URL ảnh QR qua `img.vietqr.io`.
- QR chứa ngân hàng, số tài khoản, số tiền và nội dung chuyển khoản rút gọn theo booking.
- Đây chỉ là QR tĩnh/dynamic image; không có API ngân hàng, webhook hoặc xác minh giao dịch tự động.
- `backend/src/services/paymentService.js` tạo payment `PENDING` và admin chuyển trạng thái thủ công.
- `frontend-admin/src/pages/TrangThanhToan.tsx` sinh mã giao dịch nội bộ khi admin bấm xác nhận; đó không phải reference từ ngân hàng.
- Hoàn tiền cũng chỉ được ghi nhận trạng thái; hệ thống không gọi API hoàn tiền thực tế.

## Media

- Ảnh upload qua Multer trong `backend/src/middlewares/uploadMiddleware.js`.
- File được lưu vào `backend/uploads/` và public qua `/uploads` trong `backend/src/app.js`.
- Chấp nhận JPEG, PNG, WEBP tối đa 5 MB.
- Seed data và giao diện còn dùng ảnh bên ngoài, bao gồm Unsplash.
- Video tour chỉ chấp nhận HTTPS YouTube và được nhúng bằng iframe ở `frontend-client/src/pages/TrangChiTietTour.tsx`.
- Chưa tích hợp object storage/CDN hoặc xử lý ảnh responsive.

## Email, SMS và thông báo

- Không có nhà cung cấp email transactional.
- Không có OTP, xác thực email, quên mật khẩu, SMS/Zalo hoặc push notification.
- Không có email/voucher xác nhận booking hoặc nhắc thanh toán/khởi hành tự động.

## Thanh toán khác

- Enum hỗ trợ `CASH`, `BANK_TRANSFER`, `VIETQR` trong backend.
- Luồng khách hàng hiện chỉ tạo VietQR tại `frontend-client/src/pages/TrangThanhToan.tsx`.
- Không có cổng thẻ, ví điện tử, BNPL, payment link hoặc webhook ký số.

## Analytics và marketing

- Không thấy GA4, Google Tag Manager, Meta Pixel, CRM, CDP hoặc marketing automation.
- Không có schema.org, product feed, sitemap động hoặc tracking funnel.
- Dashboard nội bộ đọc trực tiếp dữ liệu booking/payment qua `backend/src/services/dashboardService.js`.

## Maps và hỗ trợ khách hàng

- Không có Google Maps/Mapbox cho điểm đón hoặc lịch trình.
- Không có live chat/helpdesk integration.
- Website chỉ hiển thị hotline tĩnh trong `frontend-client/src/pages/TrangDanhSachTour.tsx`.

## Quan sát vận hành

- Có `X-Request-Id` và access log cơ bản.
- Không có Sentry/APM, central log, metrics, tracing, alerting hoặc audit-log service.
- Health endpoint ở `GET /api/health` chỉ kiểm tra process, không kiểm tra sâu database/integration.

## Triển khai

- Hướng dẫn reverse proxy và production checklist nằm trong `backend/docs/DEPLOYMENT.md`.
- Không có container, infrastructure as code, CI/CD hoặc environment manifests trong repo.
- Upload cục bộ yêu cầu persistent volume và không phù hợp nhiều instance nếu chưa chuyển sang object storage.
