---
mapped_at: 2026-10-13
project: LeViet Travel
focus: concerns
---

# Codebase Concerns

## Ưu tiên cao

### Thanh toán chưa có nguồn xác thực

- `backend/src/services/vietQrService.js` chỉ tạo ảnh QR.
- `frontend-admin/src/pages/TrangThanhToan.tsx` cho admin xác nhận thủ công mà không nhận statement/webhook/proof từ ngân hàng.
- Transaction ID được frontend tự sinh, không phải mã giao dịch ngân hàng.
- Rủi ro: duyệt nhầm, gian lận, khó đối soát và không tự động hết hạn booking.

### Thiếu vòng đời giữ chỗ

- Booking tăng `bookedSeats` ngay khi tạo và giữ vô thời hạn nếu khách không thanh toán.
- Không có `expiresAt`, scheduler hoặc job tự hủy đơn `PENDING_PAYMENT`.
- Rủi ro: ghế bị khóa ảo và tour trông như hết chỗ.

### Thông tin bán hàng chưa đủ để cam kết

- `backend/src/models/Tour.js` chưa có giá bao gồm/không bao gồm, điểm đón, chính sách trẻ em/em bé, cọc, hủy/đổi, bảo hiểm, visa và lưu ý.
- Trang chi tiết lại hiển thị tuyên bố “không phí ẩn” trong `frontend-client/src/pages/TrangChiTietTour.tsx`.
- Rủi ro: thiếu minh bạch thương mại và tăng khiếu nại.

### Dữ liệu nhạy cảm và cấu hình

- Cấu hình nhận VietQR có default cứng trong source và giá trị cụ thể trong file mẫu/tài liệu.
- Cần xác minh đây chỉ là tài khoản demo; production phải dùng secret/config store và quy trình đổi tài khoản.
- JWT được giữ trong localStorage, làm tăng tác động nếu frontend có XSS.

## Khoảng trống sản phẩm

- Review API tồn tại nhưng client chưa hiển thị danh sách hoặc cho khách viết review.
- Profile/password API tồn tại nhưng client chưa có trang hồ sơ.
- Không có quên mật khẩu, xác thực email/phone, social login hoặc guest checkout.
- Không có wishlist, compare, recommendation, recently viewed hoặc saved travelers.
- Bộ lọc thiếu ngày đi, nơi khởi hành, thời lượng, loại tour, phương tiện, rating và số chỗ.
- Không có infant/senior pricing, room supplement, single room hoặc package option.
- Không có voucher/e-ticket PDF, email confirmation hoặc QR check-in.
- Không có self-service reschedule/refund/complaint flow.

## Khoảng trống quản trị

- Backend có hotel, vehicle, guide, destination, voucher, itinerary và review CRUD nhưng nav admin chưa có màn hình quản lý độc lập cho phần lớn resource.
- Admin không có danh sách booking tổng thể hoặc booking detail/work queue.
- Chưa có manifest đoàn, điểm danh, phòng, ghế xe, pickup và tài liệu visa.
- Dashboard chỉ có doanh thu/top tour; thiếu conversion, cancellation, payment aging, capacity/load factor và margin.
- Không có audit log cho thao tác admin.

## Kỹ thuật và vận hành

- Không có CI/CD, container, infrastructure as code hoặc staging config.
- Không có frontend test/E2E; backend có 24 test nhưng coverage chưa được đo.
- Upload cục bộ không phù hợp scale ngang và chưa có job dọn file mồ côi.
- Rate limit chỉ áp dụng auth và dùng memory store; API thương mại khác chưa được bảo vệ theo risk.
- Không có background job, queue, cache hoặc distributed lock.
- Không có observability ngoài logs/request ID.
- Admin build có chunk lớn hơn 500 KB.
- Search dùng SQL `LIKE`; chưa có full-text, accent-insensitive strategy hoặc search analytics.

## SEO, accessibility và growth

- SPA client chỉ có meta description tĩnh trong `frontend-client/index.html`.
- Không có SSR/SSG, canonical, Open Graph theo tour, schema.org, sitemap hoặc robots strategy.
- Chưa thấy consent/cookie UI, analytics funnel hoặc A/B testing.
- Accessibility mới ở mức label/alt cơ bản; chưa có automated WCAG audit.

## Pháp lý và niềm tin

- Client chưa có trang điều khoản, chính sách bảo mật, thanh toán, hủy/đổi, khiếu nại và thông tin pháp nhân.
- Chưa thấy consent/versioning cho việc xử lý dữ liệu hành khách.
- Thông tin giấy phép lữ hành và trạng thái thông báo website thương mại điện tử chưa xuất hiện trong client.
- Cần rà soát tuân thủ thực tế với chuyên gia pháp lý trước production.

## Điểm mạnh cần giữ

- Transaction + row lock chống bán vượt ghế.
- Server-side pricing và voucher validation.
- RBAC, request validation, CORS production, Helmet và auth rate limit.
- State transition payment/booking rõ ràng.
- Migration, constraint, query index và tài liệu deployment tương đối tốt.
- 24/24 backend test pass và cả hai frontend build/lint pass.
