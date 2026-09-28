# Cài đặt và triển khai Backend

## 1. Yêu cầu

- Node.js 20 LTS trở lên.
- MySQL 8.0 trở lên.
- Một user MySQL riêng cho ứng dụng, không dùng `root` trên production.
- HTTPS và reverse proxy (Nginx/IIS/Apache) trên production.
- Thư mục lưu upload có volume bền vững hoặc thay bằng object storage.

## 2. Chuẩn bị MySQL

```sql
CREATE DATABASE leviet_travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'leviet_app'@'%' IDENTIFIED BY 'mat_khau_rat_manh';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
ON leviet_travel_db.* TO 'leviet_app'@'%';
FLUSH PRIVILEGES;
```

Giới hạn host thay cho `%` nếu application server có địa chỉ cố định.

Với cài mới, có thể import `database/schema.sql` bằng tài khoản quản trị MySQL, sau đó chỉ cấp quyền cần thiết cho user ứng dụng.

## 3. Cấu hình

```powershell
Copy-Item .env.example .env
```

Điền `.env` và kiểm tra:

- `NODE_ENV=production`.
- `JWT_SECRET` là chuỗi ngẫu nhiên ít nhất 32 ký tự.
- `CLIENT_ADMIN_URL`/`CLIENT_CUSTOMER_URL` là origin HTTPS chính xác, không có path.
- `TRUST_PROXY=1` chỉ khi có đúng một reverse proxy tin cậy trước Node.js.
- Thông tin VNPAY lấy từ merchant portal; không dùng secret sandbox trên production.
- Không commit `.env`, dump database, log chứa token hoặc secret.

Có thể sinh secret bằng PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

## 4. Cài và nâng cấp

```bash
npm ci --omit=dev
npm run migrate
npm start
```

Trước mỗi lần deploy:

1. Backup database.
2. Chạy test trên môi trường staging với schema tương đương.
3. Chạy migration trước khi chuyển traffic sang phiên bản mới.
4. Kiểm tra `/api/health`, login admin và một API public.
5. Theo dõi error rate và thời gian phản hồi sau deploy.

Seeder chỉ dành cho local/staging hoặc lần khởi tạo có chủ đích. Không chạy `npm run seed` tự động trong mỗi lần production deploy.

## 5. Reverse proxy Nginx mẫu

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    client_max_body_size 6m;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Node đã giới hạn file ảnh 5 MB; reverse proxy đặt nhỉnh hơn để request hợp lệ tới được middleware.

## 6. Upload

Hiện ảnh được ghi vào `backend/uploads` và public tại `/uploads/...`.

- Gắn persistent volume cho thư mục này.
- Không cho phép thực thi script trong thư mục upload.
- Chỉ JPEG/PNG/WEBP được chấp nhận, tối đa 5 MB.
- Nếu chạy nhiều instance, chuyển sang S3/Cloudinary/MinIO; ổ đĩa cục bộ giữa các instance không đồng bộ.
- Thiết lập job dọn file mồ côi nếu người dùng upload rồi request nghiệp vụ thất bại.

## 7. VNPAY

- `VNP_RETURN_URL` phải là URL HTTPS public `/api/payments/vnpay/return`.
- Cấu hình IPN phía VNPAY tới `/api/payments/vnpay/ipn`.
- Hai endpoint callback không dùng JWT; độ tin cậy đến từ HMAC-SHA512 và kiểm tra lại số tiền/mã giao dịch/trạng thái.
- Chỉ trả hàng/cấp dịch vụ sau khi database có payment `SUCCESS`, không dựa vào giao diện return của trình duyệt.
- `REFUNDED` trong API là ghi nhận nghiệp vụ sau khi hoàn tiền thực tế đã thành công; code hiện không tự gọi API refund VNPAY.

## 8. Giám sát và bảo mật

- Thu thập access log/error log, luôn giữ `X-Request-Id` để truy vết.
- Cảnh báo khi 5xx tăng, connection pool cạn, callback thanh toán lỗi hoặc ghế/voucher vi phạm đối soát.
- Chạy `npm audit` định kỳ và đánh giá tác động trước khi dùng `--force`.
- Xoay `JWT_SECRET` theo quy trình; đổi secret sẽ vô hiệu toàn bộ token cũ.
- Đổi mật khẩu tài khoản mẫu ngay sau khởi tạo production.
- Backup định kỳ và diễn tập restore; backup chưa thử restore chưa được xem là an toàn.

## 9. Checklist nghiệm thu

- [ ] `npm run migrate` chạy lại và báo bỏ qua migration đã áp dụng.
- [ ] `npm test` chạy xanh trên database test riêng.
- [ ] `/api/health` trả 200 và `X-Request-Id`.
- [ ] CORS chỉ cho phép domain đã khai báo.
- [ ] Admin và customer đăng nhập đúng; token sai/hết hạn trả 401.
- [ ] Đặt đồng thời không vượt `capacity`.
- [ ] Hủy đơn chưa trả tiền hoàn ghế/voucher.
- [ ] Đơn đã trả tiền bị chặn hủy cho tới khi payment là `REFUNDED`.
- [ ] Callback VNPAY sai chữ ký hoặc sai số tiền không cập nhật đơn.
- [ ] Upload tồn tại sau khi restart/deploy.
- [ ] File Excel tải được và không chứa dữ liệu ngoài bộ lọc.
