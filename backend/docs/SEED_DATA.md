# Dữ liệu danh mục và nguồn nội dung

Seeder tạo một danh mục có thể dùng trực tiếp để hiển thị gồm 6 danh mục, 24 điểm đến, 4 khách sạn, 30 tour, 94 ngày lịch trình, ảnh, video và ít nhất 3 đợt khởi hành tương lai cho mỗi tour. Chạy lại seeder sẽ cập nhật các bản ghi cùng tên/mã thay vì nhân bản tour.

## Nguyên tắc dữ liệu

- Tên địa danh, mô tả trải nghiệm và tuyến tham quan được biên soạn từ cổng thông tin chính thức của Cục Du lịch Quốc gia Việt Nam.
- Thông tin khách sạn lấy từ website chính thức của từng đơn vị hoặc cổng thông tin du lịch địa phương.
- Ảnh sử dụng URL ảnh được phép nhúng từ Unsplash và gắn đúng nhóm địa danh trong truy vấn nguồn.
- Video lấy từ kênh YouTube chính thức `Vietnam Tourism` hoặc `Vietnam Tourism Board`; ứng dụng nhúng bằng miền tăng cường riêng tư `youtube-nocookie.com`.
- Giá tour trong CSDL là giá bán khởi tạo của LeViet Travel, không phải báo giá của các nguồn tham khảo. Quản trị viên cần rà soát chi phí vận chuyển, phòng, vé tham quan và chính sách trẻ em trước mỗi kỳ bán.
- Seeder không tạo hướng dẫn viên hoặc biển số xe hư cấu. Các đợt khởi hành để trống hai tài nguyên này để bộ phận vận hành phân công từ dữ liệu doanh nghiệp.

## Nguồn nội dung điểm đến

- [Cổng thông tin điểm đến Việt Nam](https://vietnam.travel/node/6)
- [Các hành trình được đề xuất](https://vietnam.travel/plan-your-trip/itineraries)
- [Hành trình di sản Việt Nam](https://vietnam.travel/plan-your-trip/recommended-trip/heritage-sites-vietnam)
- [Hà Giang](https://vietnam.travel/vi/places-to-go/northern-vietnam/ha-giang)
- [Đà Nẵng](https://vietnam.travel/vi/things-to-do/must-visit-places-da-nang)
- [Phú Quốc](https://vietnam.travel/places-to-go/mekong-delta/phu-quoc)
- [Cần Thơ](https://vietnam.travel/places-to-go/mekong-delta/can-tho)
- [Châu Đốc](https://vietnam.travel/vi/places-to-go/southern-vietnam/chau-doc)
- [Côn Đảo](https://www.vietnam.travel/places-to-go/southern-vietnam/con-dao)
- [Hành trình nổi bật Việt Nam](https://vietnam.travel/plan-your-trip/recommended-trip/vietnam-highlights)

## Nguồn thông tin lưu trú

- [Mường Thanh Luxury Đà Nẵng](https://support.muongthanh.vn/hotel-muong-thanh-luxury-da-nang)
- [Vinpearl Resort & Spa Hạ Long](https://vinpearl.com/vi/hotels/vinpearl-resort-spa-ha-long)
- [Silk Path Grand Sapa Resort & Spa](https://silkpathhotel.com/sapa/)
- [Salinda Resort Phu Quoc Island](https://salindaresort.com/en/articles/details)

## Video

- [Come with us to Hội An](https://www.youtube.com/watch?v=twb6d3t1SO0) — Vietnam Tourism Board.
- [Live Fully in Vietnam: Explore, Relax, Play](https://www.youtube.com/watch?v=Lgvc0l1UyaU) — Vietnam Tourism Board.
- [Việt Nam: Đi Để Yêu! - Wonders of Vietnam](https://www.youtube.com/watch?v=YHBqLih80uw) — Vietnam Tourism.
- [VietnamNOW / MyVietnam](https://www.youtube.com/watch?v=04Kf_0kppPM) — Vietnam Tourism Board.

## Ảnh và tác giả

Ảnh được phân phối theo [Unsplash License](https://unsplash.com/license). Danh sách tác giả/ảnh đang dùng trong seeder:

- Andreea Popa — [Đà Nẵng](https://unsplash.com/photos/PknaOrb1lVo)
- jet dela cruz — [Đà Nẵng](https://unsplash.com/photos/5QbZIJV8k4E)
- Thanh Soledas — [Hội An](https://unsplash.com/photos/XGuZ4HlC5qU)
- Toomas Tartes — [Hội An](https://unsplash.com/photos/27HacQwqvA0)
- Degaharu — [Huế](https://unsplash.com/photos/-nosLdNjHY0)
- Marina Lobato — [Hạ Long](https://unsplash.com/photos/kG7pOXbBfNs)
- JB — [Ninh Bình](https://unsplash.com/photos/3VK6Urf2vE8)
- Ruslan Bardash — [Ninh Bình](https://unsplash.com/photos/8MhejqEghLk)
- Duc Nguyen — [Hạ Long](https://unsplash.com/photos/z944TIu1kZ0)
- Minh Luu — [Hà Nội](https://unsplash.com/photos/XZHK8gR1xh4)
- Ryan Le — [Hà Nội](https://unsplash.com/photos/EKFPwbPkDec)
- Krisztian Tabori — [Sa Pa](https://unsplash.com/photos/9r2yeRccyls)
- Vivu Vietnam — [Sa Pa](https://unsplash.com/photos/W6ynUCrM_24)
- Denis Sobnakov — [Sa Pa](https://unsplash.com/photos/DY5cv04E42I)
- Chris Slupski — [Phú Quốc](https://unsplash.com/photos/tCM6cQjIQ7Q)
- Ondrej Bocek — [Phú Quốc](https://unsplash.com/photos/SJSbL1evhIc)
- Vivu Vietnam — [Phú Quốc](https://unsplash.com/photos/TlYBF6NW7Fg)
- Tomáš Malík — [Mekong](https://unsplash.com/photos/N4nqa6bc7n0)
- Roméo A. — [Mekong](https://unsplash.com/photos/7cmasIRS6XQ)
- diGital Sennin — [Mekong](https://unsplash.com/photos/QttaHHgHz_w)
- Hanh Quynh — [Hà Giang](https://unsplash.com/photos/u4TgwlU95GA)
- Mayur Arvind — [thác Bản Giốc, Cao Bằng](https://unsplash.com/photos/4k9Zu1jPqDU)
- Elist Nguyen — [Mộc Châu](https://unsplash.com/photos/ZN1nr5SDHi0)
- Ronin — [Cát Bà, vịnh Lan Hạ](https://unsplash.com/photos/XCaN3qL-bQ4)
- Nathan Cima — [Cát Bà](https://unsplash.com/photos/i73LX2Wh_Ic)
- Florian Delée — [Phong Nha, Quảng Bình](https://unsplash.com/photos/4oCgdWAM25c)
- Huy — [Nha Trang](https://unsplash.com/photos/dLkyhhC-e6Y)
- THUY PHAM — [Đà Lạt](https://unsplash.com/photos/9mSFninqIcw)
- Zuyet Awarmatik — [Quy Nhơn](https://unsplash.com/photos/VrzcF3_2bEc)
- INHYEOK PARK — [Mũi Né](https://unsplash.com/photos/esyQU9XKlHw)
- Tron Le — [TP. Hồ Chí Minh](https://unsplash.com/photos/wUk2U5Wirxg)
- bovin wook — [Vũng Tàu](https://unsplash.com/photos/RcfbjE8i7fk)
- Vivu Vietnam — [núi Bà Đen, Tây Ninh](https://unsplash.com/photos/5Z-Yk99qcWM)
- Nguyen Minh Kien — [Bến Tre](https://unsplash.com/photos/5yK56BM0dLc)
- Degaharu — [Côn Đảo](https://unsplash.com/photos/wvY66sO9sP0)

## Vận hành

```bash
npm run migrate
npm run seed
```

Sau khi seed, kiểm tra nhanh:

```sql
SELECT code, name, video_url, JSON_LENGTH(images) AS image_count FROM tours ORDER BY id;
SELECT tour_id, COUNT(*) AS departures FROM tour_departures WHERE status = 'OPEN' GROUP BY tour_id;
```
