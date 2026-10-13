---
mapped_at: 2026-10-13
project: LeViet Travel
focus: conventions
---

# Coding Conventions

## Backend

- CommonJS và dấu chấm phẩy được dùng nhất quán.
- Route file giữ ngắn bằng alias `c`, `wrap`, `validate` ở các module mới.
- Controller chuyển input sang service và dùng `ApiResponse` để trả envelope.
- Lỗi nghiệp vụ dùng `AppError(message, statusCode, errors)`.
- Async error được bọc bằng `backend/src/utils/asyncHandler.js` hoặc try/catch controller.
- Service là nơi chứa transaction, authorization theo ownership và state transition.
- Response không được trả hash mật khẩu nhờ model scopes/serialization trong `backend/src/models/User.js`.
- Pagination tập trung tại `backend/src/utils/pagination.js`, limit tối đa 100.

## Validation

- Validator trả mảng `{ field, message }`, middleware trả HTTP 422.
- ID và pagination validation được tái sử dụng từ `backend/src/validators/commonValidator.js`.
- Server không tin giá do client gửi; booking tính lại từ departure/voucher.
- Enum được tập trung trong `backend/src/constants/` nhưng một số service vẫn dùng string literal.

## Database

- Model property camelCase map sang cột snake_case.
- Các entity catalog dùng soft delete khi phù hợp.
- Quan hệ được khai báo tập trung trong `backend/src/models/index.js`.
- Nghiệp vụ cạnh tranh tài nguyên dùng transaction và row lock.
- Mọi schema change phải có migration và cập nhật schema cài mới.

## Frontend

- React function components + hooks.
- TypeScript strict theo `tsconfig.json`; DTO tập trung trong `types/du-lieu.ts`.
- Các page được lazy import.
- API error được chuyển thành message người dùng qua helper dùng chung.
- Text giao diện bằng tiếng Việt; symbol/file frontend dùng tiếng Việt không dấu.
- Client dùng Tailwind utility; admin dùng Ant Design và một stylesheet bổ sung.
- Tương tác icon quan trọng có `aria-label`; ảnh nội dung có `alt` cơ bản.

## Session

- Cả hai SPA lưu JWT và user trong localStorage.
- Axios interceptor gắn Bearer token và xóa session khi gặp 401.
- Không có refresh token; JWT mặc định sống 7 ngày.
- Không có cơ chế revoke token riêng khi đổi mật khẩu hoặc khóa thiết bị.

## Error handling và logs

- Backend trả envelope `{ success, message, data/errors }` thống nhất.
- Mỗi request có `X-Request-Id`.
- Production error response che lỗi nội bộ; server log giữ request ID.
- Frontend hiển thị error nhưng chưa có error boundary hoặc telemetry client.

## Documentation

- `backend/docs/API.md` mô tả phần lớn endpoint và state transition.
- `backend/docs/DATABASE.md` mô tả bảng, constraint và migration.
- `backend/docs/DEPLOYMENT.md` có production checklist.
- Root `README.md` thiên về backend, chưa hướng dẫn đầy đủ cách chạy cả ba app.

## Điểm chưa đồng nhất

- Backend lẫn controller class có bind/try-catch với controller object + async wrapper.
- Một số enum được import từ constants, một số dùng literal trực tiếp.
- Không có formatter/linter backend, pre-commit hook hoặc root command chạy toàn repo.
- Không có shared contract/schema generator giữa API và hai bộ TypeScript types.
