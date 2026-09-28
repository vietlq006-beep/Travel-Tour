# Tài liệu REST API LeViet Travel

Base URL mặc định: `http://localhost:5000/api`

Các API cần đăng nhập nhận header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Quy ước phân trang: `?page=1&limit=10`. `limit` tối đa 100. Kết quả có dạng:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 10, "totalItems": 0, "totalPages": 0 }
}
```

Mã lỗi thường gặp: `400` request sai cú pháp, `401` chưa đăng nhập, `403` thiếu quyền, `404` không tìm thấy, `409` xung đột nghiệp vụ, `422` dữ liệu không hợp lệ, `429` quá giới hạn request và `500` lỗi máy chủ.

## Health và xác thực

### `GET /health`

Kiểm tra API đang hoạt động. Không yêu cầu token.

### `POST /auth/register`

Đăng ký khách hàng. Mật khẩu dài 8-72 ký tự, có chữ hoa, chữ thường và chữ số.

```json
{
  "fullName": "Nguyễn Văn An",
  "email": "an@example.com",
  "password": "Password1",
  "phoneNumber": "0901234567"
}
```

Trả về `201` cùng `user` và JWT `token`. Email luôn được chuẩn hóa chữ thường.

### `POST /auth/login`

```json
{ "email": "admin@leviet.com", "password": "Admin@123" }
```

### `GET /auth/me`

Trả thông tin tài khoản hiện tại. Yêu cầu token.

### `PUT /auth/profile`

Các trường đều tùy chọn, nhưng request phải có ít nhất một thay đổi.

```json
{
  "fullName": "Nguyễn Văn An Mới",
  "phoneNumber": "",
  "oldPassword": "Password1",
  "newPassword": "NewPassword2"
}
```

Chuỗi rỗng ở `phoneNumber` dùng để xóa số điện thoại. Muốn đổi mật khẩu phải gửi đúng mật khẩu cũ.

## Danh mục và điểm đến

### Danh mục `/categories`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/categories?keyword=biển&page=1&limit=10` | Public | Danh sách/tìm kiếm |
| GET | `/categories/:id` | Public | Chi tiết kèm tour |
| POST | `/categories` | ADMIN | Tạo |
| PUT | `/categories/:id` | ADMIN | Cập nhật |
| DELETE | `/categories/:id` | ADMIN | Xóa mềm nếu chưa có tour |

POST/PUT nhận JSON `{ "name": "Tour biển", "description": "...", "imageUrl": "https://..." }`, hoặc `multipart/form-data` với file `image` (JPEG/PNG/WEBP, tối đa 5 MB).

### Điểm đến `/destinations`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/destinations?region=TRUNG&keyword=Đà` | Public | Danh sách theo vùng |
| GET | `/destinations/:id` | Public | Chi tiết kèm tour |
| POST | `/destinations` | ADMIN | Tạo |
| PUT | `/destinations/:id` | ADMIN | Cập nhật |
| DELETE | `/destinations/:id` | ADMIN | Xóa mềm nếu chưa được dùng |

`region` chỉ nhận `BAC`, `TRUNG`, `NAM`. Ảnh hỗ trợ giống API danh mục.

## Dữ liệu vận hành (ADMIN)

Tất cả endpoint dưới đây yêu cầu token `ADMIN`, hỗ trợ `page`, `limit`, `keyword` ở API danh sách.

### Khách sạn `/hotels`

- `GET /hotels`, `GET /hotels/:id`
- `POST /hotels`, `PUT /hotels/:id`, `DELETE /hotels/:id`

```json
{
  "name": "Khách sạn Biển Xanh",
  "starRating": 4,
  "address": "Đà Nẵng",
  "contactPhone": "02361234567"
}
```

### Phương tiện `/vehicles`

- `GET /vehicles`, `GET /vehicles/:id`
- `POST /vehicles`, `PUT /vehicles/:id`, `DELETE /vehicles/:id`

```json
{ "vehicleType": "Xe 29 chỗ", "licensePlate": "43B-123.45", "seatCapacity": 29 }
```

### Hướng dẫn viên `/tour-guides`

- `GET /tour-guides?isActive=true`, `GET /tour-guides/:id`
- `POST /tour-guides`, `PUT /tour-guides/:id`, `DELETE /tour-guides/:id`

```json
{
  "fullName": "Lê Minh Anh",
  "phoneNumber": "0901234567",
  "email": "minhanh@example.com",
  "experienceYears": 4,
  "languages": "Tiếng Việt, Tiếng Anh",
  "isActive": true
}
```

Không thể xóa khách sạn, phương tiện hoặc hướng dẫn viên đang được gán cho đợt khởi hành.

## Tour

### `GET /tours`

Public. Bộ lọc: `keyword`, `categoryId`, `destinationId`, `minPrice`, `maxPrice`, `page`, `limit`. Admin gửi token có thể thêm `isActive=true|false` và xem tour ngừng hoạt động.

### `GET /tours/:id`

Trả danh mục, điểm đến, lịch trình, đợt đang mở, đánh giá và điểm trung bình.

### `POST /tours` và `PUT /tours/:id` (ADMIN)

JSON mẫu:

```json
{
  "categoryId": 1,
  "code": "DN-HOI-AN-3N2D",
  "name": "Đà Nẵng - Hội An 3 ngày 2 đêm",
  "durationDays": 3,
  "durationNights": 2,
  "overview": "Khám phá miền Trung",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "images": ["https://example.com/1.jpg"],
  "destinationIds": [1, 2],
  "isActive": true
}
```

Nếu upload file, dùng `multipart/form-data`: `thumbnail` tối đa 1 file, `images` tối đa 8 file; `destinationIds` gửi JSON (`[1,2]`) hoặc chuỗi `1,2`.

### `DELETE /tours/:id` (ADMIN)

Tour chưa có đợt khởi hành được xóa mềm. Tour đã có lịch sử chỉ được tự động chuyển sang `isActive=false`.

## Lịch trình theo ngày

Base: `/tours/:tourId/itineraries`

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/tours/:tourId/itineraries` | Public | Danh sách theo thứ tự ngày |
| POST | `/tours/:tourId/itineraries` | ADMIN | Thêm một ngày |
| PUT | `/tours/:tourId/itineraries/:id` | ADMIN | Sửa một ngày |
| DELETE | `/tours/:tourId/itineraries/:id` | ADMIN | Xóa một ngày |
| PUT | `/tours/:tourId/itineraries/replace-all` | ADMIN | Thay toàn bộ trong transaction |

Một ngày có dạng `{ "dayNumber": 1, "title": "Đón khách", "description": "..." }`. `dayNumber` không được trùng và không vượt `durationDays` của tour.

## Đợt khởi hành

### `GET /departures`

Public chỉ thấy trạng thái `OPEN`. Bộ lọc: `tourId`, `fromDate`, `toDate`, phân trang. Admin có thể thêm `status`.

### `GET /departures/:id`

Trả tour, khách sạn, phương tiện, hướng dẫn viên và `remainingSeats`.

### `POST /departures` và `PUT /departures/:id` (ADMIN)

```json
{
  "tourId": 1,
  "startDate": "2026-12-01",
  "endDate": "2026-12-03",
  "capacity": 30,
  "adultPrice": 4500000,
  "childPrice": 2500000,
  "hotelId": 1,
  "vehicleId": 1,
  "guideId": 1,
  "status": "OPEN"
}
```

Trạng thái: `OPEN`, `CLOSED`, `COMPLETED`, `CANCELLED`. API chặn trùng lịch xe/hướng dẫn viên, không cho giảm sức chứa dưới số đã đặt và không cho hủy đợt khi còn đơn hoạt động.

### `DELETE /departures/:id` (ADMIN)

Chỉ xóa khi chưa có đơn đặt chỗ.

## Voucher

Base `/vouchers`, mọi endpoint yêu cầu đăng nhập. CRUD yêu cầu `ADMIN`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/vouchers/validate` | Đã đăng nhập | Tính mức giảm dự kiến |
| GET | `/vouchers` | ADMIN | Danh sách |
| GET | `/vouchers/:id` | ADMIN | Chi tiết |
| POST | `/vouchers` | ADMIN | Tạo |
| PUT | `/vouchers/:id` | ADMIN | Cập nhật |
| DELETE | `/vouchers/:id` | ADMIN | Xóa hoặc ngừng hoạt động nếu đã dùng |

```json
{
  "code": "SUMMER10",
  "discountType": "PERCENT",
  "discountValue": 10,
  "minBookingAmount": 1000000,
  "maxUsage": 100,
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2026-09-01T00:00:00.000Z",
  "isActive": true
}
```

`discountType` nhận `PERCENT` hoặc `FIXED`. `PERCENT` không vượt 100. API validate nhận `{ "code": "SUMMER10", "totalAmount": 5000000 }`.

## Đặt chỗ

Base `/bookings`, tất cả endpoint yêu cầu đăng nhập.

### `POST /bookings` (CUSTOMER hoặc ADMIN)

```json
{
  "departureId": 10,
  "voucherCode": "SUMMER10",
  "numAdults": 1,
  "numChildren": 1,
  "notes": "Ăn chay",
  "participants": [
    {
      "fullName": "Nguyễn Văn An",
      "gender": "MALE",
      "dateOfBirth": "1990-01-01",
      "passengerType": "ADULT"
    },
    {
      "fullName": "Nguyễn Minh Anh",
      "gender": "FEMALE",
      "dateOfBirth": "2018-01-01",
      "passengerType": "CHILD"
    }
  ]
}
```

Không gửi giá từ client. Server khóa bản ghi đợt khởi hành, kiểm tra ghế, lấy giá hiện tại, tính voucher, tạo hành khách và tăng số ghế trong cùng một transaction.

### `GET /bookings`

Khách hàng chỉ thấy đơn của mình; admin thấy tất cả. Hỗ trợ `status`, `keyword` (mã đơn), `page`, `limit`.

### `GET /bookings/:id`

Trả chi tiết đợt/tour, hành khách, voucher, giao dịch và đánh giá. Khách không thể đọc đơn của người khác.

### `POST /bookings/:id/cancel`

Khách chỉ tự hủy đơn `PENDING_PAYMENT`. Khi hủy, API trả lại ghế và lượt voucher, đồng thời đánh dấu giao dịch đang chờ là thất bại.

### `PATCH /bookings/:id/status` (ADMIN)

```json
{ "status": "CONFIRMED" }
```

Trạng thái: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `COMPLETED`. Không được hủy đơn có giao dịch `SUCCESS`; cần chuyển giao dịch sang `REFUNDED` trước.

## Thanh toán

### `POST /payments`

Yêu cầu đăng nhập. Số tiền luôn lấy từ `booking.finalAmount`.

```json
{ "bookingId": 25, "paymentMethod": "BANK_TRANSFER" }
```

Phương thức: `CASH`, `BANK_TRANSFER`, `VNPAY`. Khách không được tự tạo giao dịch tiền mặt. Với VNPAY, response có thêm `paymentUrl` dùng để chuyển trình duyệt tới cổng thanh toán.

### `GET /payments/booking/:bookingId`

Lịch sử giao dịch của đơn. Khách chỉ xem đơn của mình.

### `PATCH /payments/:id/status` (ADMIN)

```json
{
  "status": "SUCCESS",
  "transactionId": "BANK-REF-001",
  "responseData": { "note": "Đã đối soát" }
}
```

Trạng thái và luồng hợp lệ:

- `PENDING` → `SUCCESS` hoặc `FAILED`.
- `SUCCESS` → `REFUNDED` sau khi quản trị viên/cổng thanh toán đã thực hiện hoàn tiền.
- `FAILED` và `REFUNDED` là trạng thái cuối.
- Khi giao dịch thành công, đơn `PENDING_PAYMENT` tự chuyển `CONFIRMED`.

### Callback VNPAY

- `GET /payments/vnpay/ipn`: VNPAY gọi máy chủ, trả `{ "RspCode": "00", "Message": "..." }`.
- `GET /payments/vnpay/return`: URL trình duyệt khách quay về, trả response chuẩn của API.

Server kiểm tra HMAC-SHA512, mã tham chiếu, số tiền, mã phản hồi và trạng thái cũ để chống giả mạo/lặp callback. Không đặt hai endpoint này sau middleware JWT.

## Đánh giá

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/reviews/tour/:tourId?page=1&limit=10` | Public | Đánh giá của tour |
| POST | `/reviews` | Đã đăng nhập | Tạo từ đơn đã hoàn tất |
| PUT | `/reviews/:id` | Chủ sở hữu/ADMIN | Cập nhật |
| DELETE | `/reviews/:id` | Chủ sở hữu/ADMIN | Xóa |

Tạo đánh giá: `{ "bookingId": 25, "rating": 5, "comment": "Chuyến đi rất tốt" }`. Mỗi booking chỉ có một đánh giá và `rating` từ 1 đến 5.

## Quản trị người dùng

Base `/users`, chỉ `ADMIN`.

- `GET /users?keyword=an&role=CUSTOMER&isActive=true&page=1&limit=10`
- `GET /users/:id` trả hồ sơ cùng lịch sử đơn (không bao giờ trả hash mật khẩu).
- `PATCH /users/:id` nhận `{ "role": "ADMIN", "isActive": true }`.

Admin không thể tự khóa tài khoản đang dùng.

## Dashboard và báo cáo

Chỉ `ADMIN`.

- `GET /dashboard/summary`: số khách, tour đang hoạt động, đợt đang mở, doanh thu, số đơn theo trạng thái.
- `GET /dashboard/analytics?fromDate=2026-01-01&toDate=2026-12-31`: doanh thu theo tháng và 10 tour doanh thu cao.
- `GET /reports/bookings.xlsx?fromDate=2026-01-01&toDate=2026-12-31&status=CONFIRMED`: tải báo cáo Excel.

File Excel đã vô hiệu các chuỗi bắt đầu bằng `=`, `+`, `-`, `@` để phòng formula injection.

## Ghi chú tích hợp frontend

- Lưu token ở cơ chế phù hợp với kiến trúc frontend; không ghi token vào log.
- Đọc `X-Request-Id` trong response để đối chiếu log khi báo lỗi.
- Với lỗi `422`, hiển thị mảng `errors` theo từng `field`.
- Với `401`, xóa phiên đăng nhập và chuyển tới trang login.
- Với `409`, hiển thị đúng `message`; đây thường là xung đột trạng thái chứ không phải lỗi nhập liệu.
- Giá tiền trả từ Sequelize có thể là chuỗi thập phân; frontend nên chuyển sang số trước khi định dạng.
