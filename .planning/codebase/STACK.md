---
mapped_at: 2026-10-13
project: LeViet Travel
focus: technology
---

# Technology Stack

## Tổng quan

LeViet Travel là một monorepo ba ứng dụng: REST API tại `backend/`, website khách hàng tại `frontend-client/`, và cổng quản trị tại `frontend-admin/`.

## Backend

- Runtime: Node.js 20+; entry point `backend/server.js`.
- Framework HTTP: Express 4 trong `backend/src/app.js`.
- ORM: Sequelize 6, cấu hình tại `backend/src/config/database.js`.
- Database: MySQL 8, schema chuẩn tại `backend/database/schema.sql`.
- Authentication: JWT (`jsonwebtoken`) và bcrypt (`bcryptjs`).
- Security middleware: `helmet`, `cors`, `express-rate-limit`, request size limit và request ID.
- Upload: `multer`, lưu file cục bộ trong `backend/uploads/`.
- Báo cáo: `exceljs` tạo workbook Excel.
- Logging: `morgan` cho access log và `console` cho lỗi/khởi động.
- Module format: CommonJS (`require`, `module.exports`).

## Frontend khách hàng

- React 19 + TypeScript 5.9 tại `frontend-client/src/`.
- Build tool: Vite 8, cấu hình `frontend-client/vite.config.ts`.
- Router: React Router 7, định tuyến tại `frontend-client/src/UngDung.tsx`.
- HTTP: Axios, wrapper tại `frontend-client/src/dich-vu-api.ts`.
- Styling: Tailwind CSS 4 và stylesheet dùng chung `frontend-client/src/toan-cuc.css`.
- Icons: `lucide-react`.
- Các trang được lazy-load để chia nhỏ bundle.

## Frontend quản trị

- React 19 + TypeScript 5.9 tại `frontend-admin/src/`.
- UI kit: Ant Design 6 và `@ant-design/icons`.
- Biểu đồ: Recharts 3 trong `frontend-admin/src/pages/TrangTongQuan.tsx`.
- Ngày giờ: Day.js.
- HTTP: Axios với interceptor tại `frontend-admin/src/api/may-khach-api.ts`.
- Router và page-level lazy loading tại `frontend-admin/src/UngDung.tsx`.

## Tooling và scripts

- Backend scripts nằm trong `backend/package.json`: start, dev, migrate, seed, test.
- Frontend scripts nằm trong từng `package.json`: dev, build, typecheck, lint, preview.
- Linter frontend: Oxlint.
- Backend test runner: Node.js built-in test runner + Supertest.
- Không có workspace manager chung ở root; mỗi ứng dụng cài dependency riêng.
- Không có Dockerfile, Compose hoặc CI workflow được version control.

## Cấu hình môi trường

- Mẫu cấu hình backend: `backend/.env.example`.
- Backend kiểm tra biến bắt buộc trong `backend/src/config/environment.js`.
- Frontend dùng `VITE_API_BASE_URL`, mặc định trỏ tới API local.
- CORS production cho phép các origin từ `CLIENT_ADMIN_URL` và `CLIENT_CUSTOMER_URL`.
- Thông tin tài khoản nhận VietQR có thể cấu hình qua biến môi trường; không nên để giá trị production trong source hoặc file mẫu.

## Kết quả kiểm chứng

- `npm test` tại `backend/`: 24/24 test pass.
- `npm run lint` tại cả hai frontend: pass.
- `npm run build` tại cả hai frontend: pass.
- Build admin cảnh báo một chunk lớn hơn 500 KB; cần tối ưu code splitting nếu tải trang thực tế chậm.
