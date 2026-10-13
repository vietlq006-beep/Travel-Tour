-- =======================================================
-- HỆ THỐNG QUẢN LÝ DU LỊCH & TOUR (LEVIET TRAVEL)
-- DATABASE SCHEMA DEFINITION v1.0
-- RDBMS: MySQL 8.0+ | Charset: utf8mb4
-- =======================================================

CREATE DATABASE IF NOT EXISTS `leviet_travel_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `leviet_travel_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để khởi tạo/reset an toàn
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payment_reconciliation_events`;
DROP TABLE IF EXISTS `booking_change_requests`;
DROP TABLE IF EXISTS `booking_activities`;
DROP TABLE IF EXISTS `user_verification_tokens`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_participants`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `vouchers`;
DROP TABLE IF EXISTS `tour_departures`;
DROP TABLE IF EXISTS `tour_itineraries`;
DROP TABLE IF EXISTS `tour_destinations`;
DROP TABLE IF EXISTS `tours`;
DROP TABLE IF EXISTS `tour_guides`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `hotels`;
DROP TABLE IF EXISTS `destinations`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. BẢNG USERS (Tài khoản Người dùng & Quản trị)
-- -------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `email_verified_at` DATETIME NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `phone_verified_at` DATETIME NULL,
  `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  `avatar` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_role_active` (`role`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 2. BẢNG CATEGORIES (Danh mục Tour)
-- -------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 3. BẢNG DESTINATIONS (Điểm đến du lịch)
-- -------------------------------------------------------
CREATE TABLE `destinations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `region` ENUM('BAC', 'TRUNG', 'NAM') NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  INDEX `idx_destinations_region` (`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 4. BẢNG HOTELS (Khách sạn đối tác)
-- -------------------------------------------------------
CREATE TABLE `hotels` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `star_rating` TINYINT NOT NULL DEFAULT 3,
  `address` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(20) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 5. BẢNG VEHICLES (Phương tiện vận chuyển)
-- -------------------------------------------------------
CREATE TABLE `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicle_type` VARCHAR(50) NOT NULL,
  `license_plate` VARCHAR(30) NOT NULL UNIQUE,
  `seat_capacity` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 6. BẢNG TOUR_GUIDES (Hướng dẫn viên du lịch)
-- -------------------------------------------------------
CREATE TABLE `tour_guides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `experience_years` TINYINT DEFAULT 1,
  `languages` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 7. BẢNG TOURS (Sản phẩm mẫu / Tuyến du lịch)
-- -------------------------------------------------------
CREATE TABLE `tours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `duration_days` INT NOT NULL,
  `duration_nights` INT NOT NULL,
  `overview` TEXT NULL,
  `included_services` TEXT NULL,
  `excluded_services` TEXT NULL,
  `cancellation_policy` TEXT NULL,
  `change_policy` TEXT NULL,
  `deposit_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0,
  `child_policy` TEXT NULL,
  `infant_policy` TEXT NULL,
  `senior_policy` TEXT NULL,
  `pickup_points` JSON NULL,
  `meeting_instructions` TEXT NULL,
  `luggage_policy` TEXT NULL,
  `insurance_details` TEXT NULL,
  `visa_requirements` TEXT NULL,
  `required_documents` TEXT NULL,
  `terms_and_conditions` TEXT NULL,
  `thumbnail` VARCHAR(255) NOT NULL,
  `images` JSON NULL,
  `video_url` VARCHAR(500) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  CONSTRAINT `fk_tours_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_tours_code` (`code`),
  INDEX `idx_tours_category` (`category_id`),
  INDEX `idx_tours_active_created` (`is_active`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 8. BẢNG TOUR_DESTINATIONS (Quan hệ N-M Tour & Điểm đến)
-- -------------------------------------------------------
CREATE TABLE `tour_destinations` (
  `tour_id` INT NOT NULL,
  `destination_id` INT NOT NULL,
  PRIMARY KEY (`tour_id`, `destination_id`),
  CONSTRAINT `fk_td_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_td_destination` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 9. BẢNG TOUR_ITINERARIES (Lịch trình theo ngày của Tour)
-- -------------------------------------------------------
CREATE TABLE `tour_itineraries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tour_id` INT NOT NULL,
  `day_number` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_itinerary_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_itinerary_tour_day` (`tour_id`, `day_number`),
  CONSTRAINT `chk_itinerary_day_positive` CHECK (`day_number` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 10. BẢNG TOUR_DEPARTURES (Chuyến khởi hành cụ thể)
-- -------------------------------------------------------
CREATE TABLE `tour_departures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tour_id` INT NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `departure_city` VARCHAR(100) NULL,
  `meeting_point` VARCHAR(255) NULL,
  `meeting_time` DATETIME NULL,
  `capacity` INT NOT NULL,
  `booked_seats` INT NOT NULL DEFAULT 0,
  `adult_price` DECIMAL(12, 2) NOT NULL,
  `child_price` DECIMAL(12, 2) NOT NULL,
  `infant_price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `senior_price` DECIMAL(12, 2) NULL,
  `single_room_surcharge` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `terms_override` TEXT NULL,
  `hotel_id` INT NULL,
  `vehicle_id` INT NULL,
  `guide_id` INT NULL,
  `status` ENUM('OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  CONSTRAINT `fk_departures_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_departures_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_departures_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_departures_guide` FOREIGN KEY (`guide_id`) REFERENCES `tour_guides` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_departure_dates` CHECK (`end_date` >= `start_date`),
  CONSTRAINT `chk_departure_capacity` CHECK (`capacity` > 0 AND `booked_seats` >= 0 AND `booked_seats` <= `capacity`),
  CONSTRAINT `chk_departure_prices` CHECK (`adult_price` > 0 AND `child_price` >= 0),
  INDEX `idx_departures_tour` (`tour_id`),
  INDEX `idx_departures_start_date` (`start_date`),
  INDEX `idx_departures_status` (`status`),
  INDEX `idx_departures_status_date` (`status`, `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 11. BẢNG VOUCHERS (Mã giảm giá khuyến mãi)
-- -------------------------------------------------------
CREATE TABLE `vouchers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `discount_type` ENUM('PERCENT', 'FIXED') NOT NULL,
  `discount_value` DECIMAL(12, 2) NOT NULL,
  `min_booking_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `max_usage` INT NOT NULL DEFAULT 100,
  `used_count` INT NOT NULL DEFAULT 0,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chk_voucher_value` CHECK (`discount_value` > 0 AND (`discount_type` <> 'PERCENT' OR `discount_value` <= 100)),
  CONSTRAINT `chk_voucher_usage` CHECK (`max_usage` > 0 AND `used_count` >= 0 AND `used_count` <= `max_usage`),
  CONSTRAINT `chk_voucher_dates` CHECK (`end_date` > `start_date`),
  INDEX `idx_vouchers_code` (`code`),
  INDEX `idx_vouchers_active_dates` (`is_active`, `start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 12. BẢNG BOOKINGS (Đơn đặt chỗ)
-- -------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_code` VARCHAR(30) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `departure_id` INT NOT NULL,
  `voucher_id` INT NULL,
  `num_adults` INT NOT NULL DEFAULT 1,
  `num_children` INT NOT NULL DEFAULT 0,
  `num_infants` INT NOT NULL DEFAULT 0,
  `num_seniors` INT NOT NULL DEFAULT 0,
  `single_room_count` INT NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `final_amount` DECIMAL(12, 2) NOT NULL,
  `deposit_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `booking_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_due_at` DATETIME NULL,
  `expired_at` DATETIME NULL,
  `status` ENUM('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `cancellation_reason` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `pricing_snapshot` JSON NULL,
  `policy_snapshot` JSON NULL,
  `check_in_code` VARCHAR(64) NULL,
  `checked_in_at` DATETIME NULL,
  `checked_in_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_departure` FOREIGN KEY (`departure_id`) REFERENCES `tour_departures` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_checked_in_by` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_booking_passengers` CHECK (`num_adults` > 0 AND `num_children` >= 0 AND `num_infants` >= 0 AND `num_seniors` >= 0 AND `single_room_count` >= 0),
  CONSTRAINT `chk_booking_amounts` CHECK (`total_amount` >= 0 AND `discount_amount` >= 0 AND `final_amount` >= 0 AND `final_amount` = `total_amount` - `discount_amount`),
  INDEX `idx_bookings_code` (`booking_code`),
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_departure` (`departure_id`),
  INDEX `idx_bookings_status` (`status`),
  INDEX `idx_bookings_user_date` (`user_id`, `booking_date`),
  INDEX `idx_bookings_status_date` (`status`, `booking_date`)
  ,INDEX `idx_bookings_payment_expiry` (`status`, `payment_due_at`)
  ,UNIQUE KEY `uq_bookings_check_in_code` (`check_in_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 13. BẢNG BOOKING_PARTICIPANTS (Danh sách khách thực tế)
-- -------------------------------------------------------
CREATE TABLE `booking_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `passenger_type` ENUM('ADULT', 'CHILD', 'INFANT', 'SENIOR') NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bp_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  INDEX `idx_bp_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 14. BẢNG PAYMENTS (Lịch sử giao dịch thanh toán)
-- -------------------------------------------------------
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'VIETQR') NOT NULL,
  `payment_purpose` ENUM('DEPOSIT', 'BALANCE', 'FULL') NOT NULL DEFAULT 'FULL',
  `amount` DECIMAL(12, 2) NOT NULL,
  `transaction_id` VARCHAR(100) NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `payment_time` DATETIME NULL,
  `proof_url` VARCHAR(500) NULL,
  `proof_uploaded_at` DATETIME NULL,
  `provider` VARCHAR(50) NULL,
  `response_data` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT,
  INDEX `idx_payments_booking` (`booking_id`),
  UNIQUE KEY `uq_payments_trans_id` (`transaction_id`),
  INDEX `idx_payments_booking_status` (`booking_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 15. BẢNG REVIEWS (Đánh giá và phản hồi của khách hàng)
-- -------------------------------------------------------
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `tour_id` INT NOT NULL,
  `booking_id` INT NOT NULL UNIQUE,
  `rating` TINYINT NOT NULL,
  `comment` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reviews_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
  INDEX `idx_reviews_tour` (`tour_id`),
  INDEX `idx_reviews_user` (`user_id`),
  INDEX `idx_reviews_tour_created` (`tour_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 16. NHẬT KÝ VẬN HÀNH BOOKING
-- -------------------------------------------------------
CREATE TABLE `booking_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `actor_id` INT NULL,
  `event_type` VARCHAR(40) NOT NULL,
  `from_status` VARCHAR(30) NULL,
  `to_status` VARCHAR(30) NULL,
  `note` VARCHAR(1000) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_booking_activities_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_activities_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_booking_activities_booking_created` (`booking_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `booking_change_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `request_type` ENUM('CANCEL', 'RESCHEDULE', 'REFUND') NOT NULL,
  `requested_departure_id` INT NULL,
  `reason` VARCHAR(1000) NOT NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `admin_note` VARCHAR(1000) NULL,
  `reviewed_by` INT NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_change_requests_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_change_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_change_requests_departure` FOREIGN KEY (`requested_departure_id`) REFERENCES `tour_departures` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_change_requests_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_change_requests_booking` (`booking_id`),
  INDEX `idx_change_requests_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 17. ĐỐI SOÁT, CHỐNG REPLAY VÀ TOKEN XÁC THỰC
-- -------------------------------------------------------
CREATE TABLE `payment_reconciliation_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source` VARCHAR(40) NOT NULL,
  `external_transaction_id` VARCHAR(150) NOT NULL,
  `event_hash` CHAR(64) NOT NULL,
  `payment_id` INT NULL,
  `transfer_content` VARCHAR(255) NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `transaction_time` DATETIME NULL,
  `status` ENUM('MATCHED', 'UNMATCHED', 'DUPLICATE', 'REJECTED') NOT NULL,
  `raw_data` JSON NULL,
  `processed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reconciliation_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `uq_reconciliation_source_external` (`source`, `external_transaction_id`),
  INDEX `idx_reconciliation_status_time` (`status`, `processed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_verification_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `target` VARCHAR(190) NOT NULL,
  `token_type` ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION') NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `consumed_at` DATETIME NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_verification_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_verification_token_hash` (`token_hash`),
  INDEX `idx_verification_target_type` (`target`, `token_type`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
