# Cơ sở dữ liệu LeViet Travel

## Tổng quan

- Hệ quản trị: MySQL 8.0 trở lên.
- Charset/collation: `utf8mb4` / `utf8mb4_unicode_ci`.
- ORM: Sequelize 6, tên cột `snake_case`, model dùng `camelCase`.
- Schema cài mới: `database/schema.sql`.
- Nâng cấp database đang chạy: `npm run migrate`.

Không dùng `sequelize.sync({ alter: true })` trên production. Server chỉ chạy `sync({ alter: false })`; mọi thay đổi cấu trúc phải đi qua migration.

## Các bảng và quan hệ

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `users` | Admin/khách hàng | 1-N booking, review |
| `categories` | Danh mục tour | 1-N tour |
| `destinations` | Điểm đến | N-M tour qua `tour_destinations` |
| `hotels` | Khách sạn đối tác | 1-N đợt khởi hành |
| `vehicles` | Phương tiện | 1-N đợt khởi hành |
| `tour_guides` | Hướng dẫn viên | 1-N đợt khởi hành |
| `tours` | Sản phẩm tour mẫu | lịch trình, đợt, đánh giá |
| `tour_destinations` | Bảng nối | khóa kép `(tour_id, destination_id)` |
| `tour_itineraries` | Lịch trình từng ngày | duy nhất `(tour_id, day_number)` |
| `tour_departures` | Lịch chạy và giá bán | thuộc tour, có tài nguyên và booking |
| `vouchers` | Mã giảm giá | 1-N booking |
| `bookings` | Đơn đặt chỗ | thuộc user/departure/voucher |
| `booking_participants` | Hành khách thực tế | N-1 booking, xóa cascade |
| `payments` | Lịch sử giao dịch | N-1 booking |
| `reviews` | Đánh giá tour | duy nhất theo booking |
| `schema_migrations` | Phiên bản schema | do trình migration quản lý |

## Ràng buộc quan trọng

- Ngày lịch trình là số dương và không trùng trong cùng tour.
- Ngày kết thúc đợt khởi hành không trước ngày bắt đầu.
- `0 <= booked_seats <= capacity`; giá người lớn dương, giá trẻ em không âm.
- Voucher phần trăm không quá 100; lượt đã dùng không vượt lượt tối đa; ngày kết thúc sau ngày bắt đầu.
- Booking có ít nhất một người lớn; `final_amount = total_amount - discount_amount`.
- `transaction_id` thanh toán là duy nhất khi khác `NULL`.
- Điểm đánh giá từ 1 đến 5; mỗi booking chỉ được đánh giá một lần.

Ràng buộc nghiệp vụ phức tạp (chống vượt chỗ, hoàn lượt voucher, chuyển trạng thái) được xử lý trong transaction ở service, không chỉ dựa vào constraint.

## Khởi tạo database mới

```powershell
mysql -u root -p < database/schema.sql
Copy-Item .env.example .env
npm run migrate
npm run seed
```

`schema.sql` có lệnh `DROP TABLE`; chỉ dùng cho database mới hoặc khi chắc chắn được phép reset. `npm run migrate` không xóa bảng/dữ liệu.

Seeder có tính lặp an toàn ở mức dữ liệu mẫu: chỉ thêm nhóm dữ liệu khi bảng tương ứng đang rỗng và không tạo lại tài khoản nếu email đã tồn tại.

## Migration

Chạy:

```bash
npm run migrate
```

Trình chạy tạo bảng `schema_migrations`, chạy file chưa được ghi nhận theo thứ tự và bỏ qua migration đã thành công. DDL MySQL có thể tự commit; phải backup trước một migration lớn.

Các migration hiện có:

1. `001-harden-constraints`: unique/check constraints.
2. `002-add-query-indexes`: chỉ mục cho lọc, phân trang, dashboard.
3. `003-add-refunded-payment-status`: thêm trạng thái thanh toán `REFUNDED`.

Khi thêm migration:

1. Tạo file trong `src/database/migrations` với `{ id, up }`.
2. Thêm file vào mảng trong `src/database/migrate.js` theo đúng thứ tự.
3. Cập nhật `database/schema.sql` để cài mới có cấu trúc cuối cùng.
4. Chạy trên bản sao database, sau đó mới chạy production.

## Backup và khôi phục

Backup:

```powershell
mysqldump -u root -p --single-transaction --routines --triggers leviet_travel_db > leviet_travel_backup.sql
```

Khôi phục vào database trống:

```powershell
mysql -u root -p -e "CREATE DATABASE leviet_travel_restore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p leviet_travel_restore < leviet_travel_backup.sql
```

Sau khôi phục, sửa tạm `DB_NAME`, chạy `npm run migrate` và test health/login trước khi chuyển traffic.

## Kiểm tra vận hành

```sql
SELECT * FROM schema_migrations ORDER BY executed_at;
SELECT status, COUNT(*) FROM bookings GROUP BY status;
SELECT status, COUNT(*), SUM(amount) FROM payments GROUP BY status;
SELECT id, capacity, booked_seats FROM tour_departures WHERE booked_seats > capacity;
SELECT id, max_usage, used_count FROM vouchers WHERE used_count > max_usage;
```

Hai truy vấn cuối phải luôn trả tập rỗng.
