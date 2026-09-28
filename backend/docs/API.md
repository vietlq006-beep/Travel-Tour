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
