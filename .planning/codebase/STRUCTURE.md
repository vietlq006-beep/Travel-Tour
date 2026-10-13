---
mapped_at: 2026-10-13
project: LeViet Travel
focus: structure
---

# Repository Structure

## Root

- `README.md`: giới thiệu API, chức năng, tài khoản mẫu và lệnh khởi chạy.
- `.gitignore`: bỏ qua env, dependencies, build output, log và upload runtime.
- `backend/`: API, schema, tests và tài liệu vận hành.
- `frontend-client/`: SPA khách hàng.
- `frontend-admin/`: SPA quản trị.

## Backend

- `backend/server.js`: lifecycle server và graceful shutdown.
- `backend/src/app.js`: Express app, middleware và route mounting.
- `backend/src/config/`: database và validation môi trường.
- `backend/src/constants/`: enum role, booking, departure và payment.
- `backend/src/routes/`: khai báo endpoint và quyền.
- `backend/src/controllers/`: adapter HTTP mỏng.
- `backend/src/services/`: nghiệp vụ chính theo resource.
- `backend/src/models/`: Sequelize models và association.
- `backend/src/validators/`: validation request thuần JavaScript.
- `backend/src/middlewares/`: auth, upload, rate limit, request validation và error handling.
- `backend/src/utils/`: AppError, API response, async wrapper và pagination.
- `backend/src/database/migrations/`: migration tuần tự.
- `backend/src/database/seeders/`: catalog và dữ liệu demo.
- `backend/database/schema.sql`: full schema cho cài mới.
- `backend/test/unit/`: test validator/helper/catalog.
- `backend/test/integration/`: test REST với MySQL.
- `backend/docs/`: API, database, seed và deployment.

## Frontend khách hàng

- `frontend-client/src/khoi-tao.tsx`: React bootstrap.
- `frontend-client/src/UngDung.tsx`: router và lazy pages.
- `frontend-client/src/NhaCungCapXacThuc.tsx`: auth provider.
- `frontend-client/src/ngu-canh-xac-thuc.ts`: auth context contract.
- `frontend-client/src/dich-vu-api.ts`: Axios, error/data helpers và formatters.
- `frontend-client/src/pages/`: home, tour list/detail, auth, checkout và bookings.
- `frontend-client/src/components/`: layout, shared cards/states và VietQR dialog.
- `frontend-client/src/types/du-lieu.ts`: DTO TypeScript dùng toàn app.
- `frontend-client/src/toan-cuc.css`: Tailwind theme và styles toàn cục.

## Frontend quản trị

- `frontend-admin/src/khoi-tao.tsx`: React bootstrap.
- `frontend-admin/src/UngDung.tsx`: router, theme và session boundary.
- `frontend-admin/src/pages/`: dashboard, catalog, departures, customers, payments, reports, login.
- `frontend-admin/src/components/catalog/`: category/tour management.
- `frontend-admin/src/components/layout/`: navigation shell.
- `frontend-admin/src/components/common/`: page title và status tag.
- `frontend-admin/src/hooks/`: session và paginated resource hooks.
- `frontend-admin/src/api/`: Axios client.
- `frontend-admin/src/utils/`: storage, error, query và formatting helpers.
- `frontend-admin/src/types/du-lieu.ts`: admin DTOs.

## Naming

- Frontend file và symbol names chủ yếu dùng tiếng Việt không dấu: `TrangThanhToan`, `may-khach-api`, `du-lieu`.
- Backend dùng tiếng Anh theo resource: `bookingService`, `tourRoutes`, `Review`.
- Database dùng snake_case; JavaScript model dùng camelCase.
- REST resources dùng kebab-case khi có nhiều từ, ví dụ `/tour-guides`.

## Vị trí thêm chức năng

- Thêm API resource: model → association → validator → service → controller → route → app mount → docs/tests.
- Thêm trang khách: `frontend-client/src/pages/`, lazy import và route trong `UngDung.tsx`.
- Thêm module admin: `frontend-admin/src/pages/`, route trong `UngDung.tsx`, nav trong `components/layout/BoCucQuanTri.tsx`.
- Thay đổi schema: migration mới + cập nhật `backend/database/schema.sql` và `backend/docs/DATABASE.md`.
