---
mapped_at: 2026-10-13
project: LeViet Travel
focus: testing
---

# Testing

## Framework và lệnh

- Backend dùng Node.js built-in test runner và Supertest.
- Chạy toàn bộ bằng `npm test` trong `backend/`.
- Test được ép tuần tự bằng `--test-concurrency=1` để giảm xung đột database.
- Unit test ở `backend/test/unit/`.
- Integration test ở `backend/test/integration/`.
- Helper chung và setup env nằm ở `backend/test/helpers.js`.

## Phạm vi hiện có

- Health endpoint, request ID và 404 envelope.
- Validation đăng ký, mật khẩu mạnh, pagination, participant count và YouTube URL.
- Login admin và kiểm tra không lộ password.
- RBAC cho catalog và user administration.
- CRUD nền cho category, destination, hotel, vehicle, guide, tour, itinerary và departure.
- Booking server-side pricing, voucher và capacity flow.
- Payment success/rejection/refund và booking cancellation sequencing.
- Dashboard analytics và Excel export.
- Seed catalog có 30 tour và code không trùng.
- VietQR tạo đúng payload cấu hình.

## Kết quả gần nhất

- 24 tests, 24 pass, 0 fail.
- Hai frontend `npm run build` pass TypeScript check.
- Hai frontend `npm run lint` pass Oxlint.

## Khoảng trống test

- Không có unit/component test cho React.
- Không có browser E2E cho browse → book → pay → approve → complete → review.
- Không có visual regression hoặc accessibility automation.
- Không có load/concurrency test thực sự cho overselling và voucher contention.
- Không có security test cho auth abuse, upload polyglot, JWT expiry/revocation hoặc broken access control toàn API.
- Không có contract test để giữ DTO backend/frontend đồng bộ.
- Không có test backup/restore, migration từ version cũ hoặc rollback deploy.
- Không có test webhook/payment vì chưa có tích hợp thanh toán tự động.

## Dữ liệu và isolation

- Integration test dùng database trong `.env`.
- Test tạo dữ liệu có tiền tố và dọn dẹp sau khi chạy.
- Cần database test riêng; không được trỏ vào production.
- Test hiện phụ thuộc MySQL thật, nên CI tương lai cần service container MySQL 8.

## Khuyến nghị gần hạn

1. Thêm CI chạy lint, typecheck, backend test và build cho mọi pull request.
2. Thêm Playwright cho hai critical journeys: khách đặt tour và admin duyệt thanh toán.
3. Thêm test song song 20–100 request tranh ghế/voucher.
4. Thêm component tests cho checkout, auth/session và payment review.
5. Bật coverage report và đặt threshold theo service quan trọng thay vì chỉ đếm test.
