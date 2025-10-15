-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th10 15, 2025 lúc 06:01 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `travel_app`
--
CREATE DATABASE IF NOT EXISTS `travel_app` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `travel_app`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(50) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `schedule_id` bigint(20) DEFAULT NULL,
  `custom_tour_id` bigint(20) DEFAULT NULL,
  `booking_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `qty_adults` int(11) NOT NULL DEFAULT 1,
  `qty_children` int(11) NOT NULL DEFAULT 0,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `payment_status` enum('unpaid','partial','paid','refunded') DEFAULT 'unpaid',
  `refund_note` varchar(255) DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `fk_booking_customer` (`customer_id`),
  KEY `fk_booking_schedule` (`schedule_id`),
  KEY `fk_booking_custom_tour` (`custom_tour_id`)
) ;

--
-- Đang đổ dữ liệu cho bảng `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `customer_id`, `schedule_id`, `custom_tour_id`, `booking_date`, `qty_adults`, `qty_children`, `total_amount`, `status`, `payment_status`, `refund_note`, `refunded_at`, `note`) VALUES
(1, 'BK001', 1, 1, NULL, '2025-10-15 00:48:02', 2, 1, 10800000.00, 'confirmed', 'paid', NULL, NULL, 'Gia đình có trẻ nhỏ'),
(2, 'BK002', 1, 2, NULL, '2025-10-15 00:48:02', 1, 0, 4600000.00, 'pending', 'unpaid', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_passengers`
--

CREATE TABLE IF NOT EXISTS `booking_passengers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `birth_date` date DEFAULT NULL,
  `passport_number` varchar(100) DEFAULT NULL,
  `seat_type` varchar(50) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `fk_passenger_booking` (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_passengers`
--

INSERT INTO `booking_passengers` (`id`, `booking_id`, `full_name`, `gender`, `birth_date`, `passport_number`, `seat_type`, `price`) VALUES
(1, 1, 'Nguyễn Văn A', 'male', '1995-04-12', 'C1234567', 'Người lớn', 3600000.00),
(2, 1, 'Trần Thị E', 'female', '1997-09-21', 'D7654321', 'Người lớn', 3600000.00),
(3, 1, 'Nguyễn Văn F', 'male', '2015-01-15', NULL, 'Trẻ em', 1800000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `full_name` varchar(200) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `address` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_customers_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `user_id`, `full_name`, `phone`, `birthday`, `gender`, `address`, `note`, `created_at`, `updated_at`) VALUES
(1, 2, 'Nguyễn Văn A', '0905123456', '1995-04-12', 'male', 'Hà Nội', 'Khách VIP', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `custom_tours`
--

CREATE TABLE IF NOT EXISTS `custom_tours` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `customer_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `preferred_start_date` date DEFAULT NULL,
  `preferred_end_date` date DEFAULT NULL,
  `number_of_people` int(11) DEFAULT 1,
  `budget` decimal(12,2) DEFAULT 0.00,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_custom_tour_customer` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `custom_tour_destinations`
--

CREATE TABLE IF NOT EXISTS `custom_tour_destinations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `custom_tour_id` bigint(20) NOT NULL,
  `location_id` int(11) NOT NULL,
  `day_order` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ctd_custom_tour` (`custom_tour_id`),
  KEY `fk_ctd_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `custom_tour_guides`
--

CREATE TABLE IF NOT EXISTS `custom_tour_guides` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `custom_tour_id` bigint(20) NOT NULL,
  `employee_id` bigint(20) NOT NULL,
  `role` varchar(100) DEFAULT 'guide',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ctg_custom_tour` (`custom_tour_id`),
  KEY `fk_ctg_employee` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `custom_tour_services`
--

CREATE TABLE IF NOT EXISTS `custom_tour_services` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `custom_tour_id` bigint(20) NOT NULL,
  `service_id` bigint(20) NOT NULL,
  `qty` int(11) DEFAULT 1,
  `note` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cts_custom_tour` (`custom_tour_id`),
  KEY `fk_cts_service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employees`
--

CREATE TABLE IF NOT EXISTS `employees` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `full_name` varchar(200) NOT NULL,
  `type` enum('guide','operator','manager','other') DEFAULT 'other',
  `role_title` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_employees_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `full_name`, `type`, `role_title`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'Trần Thị B', 'guide', 'Hướng dẫn viên chính', '0909888777', 'active', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(2, 4, 'Lê Văn C', 'operator', 'Điều hành viên', '0911222333', 'active', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(3, 5, 'Phạm Minh D', 'manager', 'Quản lý khu vực Bắc', '0988666555', 'active', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employee_schedules`
--

CREATE TABLE IF NOT EXISTS `employee_schedules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `schedule_date` date NOT NULL,
  `start_time` time DEFAULT '08:00:00',
  `end_time` time DEFAULT '18:00:00',
  `shift` enum('morning','afternoon','full-day') DEFAULT 'full-day',
  `status` enum('scheduled','working','completed','cancelled') DEFAULT 'scheduled',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_emp_sched` (`employee_id`,`tour_id`,`schedule_date`),
  KEY `fk_emp_sched_tour` (`tour_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoices`
--

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `invoice_no` varchar(100) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(12,2) NOT NULL,
  `tax` decimal(12,2) DEFAULT 0.00,
  `status` enum('issued','cancelled','paid') DEFAULT 'issued',
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_no` (`invoice_no`),
  KEY `fk_invoice_booking` (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `invoices`
--

INSERT INTO `invoices` (`id`, `booking_id`, `invoice_no`, `issued_at`, `amount`, `tax`, `status`) VALUES
(1, 1, 'INV001', '2025-10-15 00:48:02', 10800000.00, 0.00, 'issued');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `locations`
--

CREATE TABLE IF NOT EXISTS `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `locations`
--

INSERT INTO `locations` (`id`, `name`, `country`, `region`, `description`) VALUES
(1, 'Hà Nội', 'Việt Nam', 'Miền Bắc', 'Thủ đô ngàn năm văn hiến'),
(2, 'Đà Nẵng', 'Việt Nam', 'Miền Trung', 'Thành phố đáng sống'),
(3, 'TP. Hồ Chí Minh', 'Việt Nam', 'Miền Nam', 'Trung tâm kinh tế lớn nhất nước');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `paid_by_user_id` bigint(20) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `method` enum('cash','bank_transfer','momo','vnpay','card','paypal','other') DEFAULT 'other',
  `paid_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `transaction_ref` varchar(255) DEFAULT NULL,
  `status` enum('success','failed','pending') DEFAULT 'success',
  PRIMARY KEY (`id`),
  KEY `fk_payment_booking` (`booking_id`),
  KEY `fk_payment_user` (`paid_by_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `paid_by_user_id`, `amount`, `method`, `paid_at`, `transaction_ref`, `status`) VALUES
(1, 1, 2, 10800000.00, 'bank_transfer', '2025-10-15 00:48:02', 'TRANS123456', 'success');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `permissions`
--

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'manage_users', 'Quản lý người dùng'),
(2, 'manage_tours', 'Quản lý tour du lịch'),
(3, 'manage_bookings', 'Quản lý đặt tour'),
(4, 'view_reports', 'Xem báo cáo thống kê');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `tour_id` bigint(20) NOT NULL,
  `guide_id` bigint(20) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_review` (`booking_id`,`customer_id`,`tour_id`,`guide_id`),
  KEY `fk_rv_customer` (`customer_id`),
  KEY `fk_rv_tour` (`tour_id`),
  KEY `fk_rv_guide` (`guide_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `booking_id`, `customer_id`, `tour_id`, `guide_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 5, 'Tour tuyệt vời, hướng dẫn viên nhiệt tình và chu đáo!', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'customer', 'Khách hàng'),
(3, 'guide', 'Hướng dẫn viên'),
(4, 'operator', 'Điều hành tour'),
(5, 'manager', 'Quản lý chi nhánh');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_permissions`
--

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` bigint(20) NOT NULL,
  `permission_id` bigint(20) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `fk_rp_permission` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 3),
(3, 2),
(4, 2),
(4, 3),
(5, 2),
(5, 3),
(5, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `services`
--

CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` enum('hotel','flight','transport','restaurant','ticket','other') DEFAULT 'other',
  `name` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `price` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `services`
--

INSERT INTO `services` (`id`, `type`, `name`, `provider`, `details`, `price`) VALUES
(1, 'hotel', 'Khách sạn Mường Thanh', 'Mường Thanh Group', 'Phòng đôi 3 sao', 800000.00),
(2, 'transport', 'Xe du lịch 29 chỗ', 'Mai Linh Travel', 'Xe đưa đón sân bay và city tour', 500000.00),
(3, 'restaurant', 'Nhà hàng Sen Hồ Tây', 'Sen Group', 'Buffet đặc sản Hà Nội', 300000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tours`
--

CREATE TABLE IF NOT EXISTS `tours` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `duration_days` int(11) NOT NULL DEFAULT 1,
  `min_participants` int(11) DEFAULT 1,
  `max_participants` int(11) DEFAULT 30,
  `main_location_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_tours_location` (`main_location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tours`
--

INSERT INTO `tours` (`id`, `code`, `title`, `short_description`, `price`, `duration_days`, `min_participants`, `max_participants`, `main_location_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'HN01', 'Khám phá Hà Nội 3N2Đ', 'Tour tham quan văn hóa và ẩm thực Hà Nội', 3500000.00, 3, 5, 30, 1, 'published', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(2, 'DN01', 'Du lịch Đà Nẵng - Hội An 4N3Đ', 'Trải nghiệm biển xanh và phố cổ', 4500000.00, 4, 5, 25, 2, 'published', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_guides`
--

CREATE TABLE IF NOT EXISTS `tour_guides` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint(20) NOT NULL,
  `employee_id` bigint(20) NOT NULL,
  `role` varchar(100) DEFAULT 'guide',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_schedule_employee` (`schedule_id`,`employee_id`),
  KEY `fk_tg_employee` (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tour_guides`
--

INSERT INTO `tour_guides` (`id`, `schedule_id`, `employee_id`, `role`, `assigned_at`) VALUES
(1, 1, 1, 'lead guide', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_schedules`
--

CREATE TABLE IF NOT EXISTS `tour_schedules` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tour_id` bigint(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `seats_total` int(11) NOT NULL,
  `seats_booked` int(11) NOT NULL DEFAULT 0,
  `price_per_person` decimal(12,2) DEFAULT NULL,
  `status` enum('open','full','cancelled','completed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_schedule_tour` (`tour_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tour_schedules`
--

INSERT INTO `tour_schedules` (`id`, `tour_id`, `start_date`, `end_date`, `seats_total`, `seats_booked`, `price_per_person`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-10', '2025-11-12', 30, 5, 3600000.00, 'open', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(2, 2, '2025-12-05', '2025-12-08', 25, 10, 4600000.00, 'open', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tour_services`
--

CREATE TABLE IF NOT EXISTS `tour_services` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tour_id` bigint(20) NOT NULL,
  `service_id` bigint(20) NOT NULL,
  `qty` int(11) DEFAULT 1,
  `note` text DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tour_service` (`tour_id`,`service_id`),
  KEY `fk_ts_service` (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tour_services`
--

INSERT INTO `tour_services` (`id`, `tour_id`, `service_id`, `qty`, `note`, `time`) VALUES
(1, 1, 1, 3, '3 đêm khách sạn Mường Thanh', NULL),
(2, 1, 2, 1, 'Xe di chuyển suốt tuyến', NULL),
(3, 1, 3, 2, '2 bữa buffet', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role_id` bigint(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `role_id`, `email`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin@travelapp.com', 'hash_admin', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(2, 2, 'customer01@gmail.com', 'hash_customer', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(3, 3, 'guide01@gmail.com', 'hash_guide', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(4, 4, 'operator01@gmail.com', 'hash_operator', '2025-10-15 00:48:02', '2025-10-15 00:48:02'),
(5, 5, 'manager01@gmail.com', 'hash_manager', '2025-10-15 00:48:02', '2025-10-15 00:48:02');

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_booking_custom_tour` FOREIGN KEY (`custom_tour_id`) REFERENCES `custom_tours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `tour_schedules` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_passengers`
--
ALTER TABLE `booking_passengers`
  ADD CONSTRAINT `fk_passenger_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `custom_tours`
--
ALTER TABLE `custom_tours`
  ADD CONSTRAINT `fk_custom_tour_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `custom_tour_destinations`
--
ALTER TABLE `custom_tour_destinations`
  ADD CONSTRAINT `fk_ctd_custom_tour` FOREIGN KEY (`custom_tour_id`) REFERENCES `custom_tours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctd_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `custom_tour_guides`
--
ALTER TABLE `custom_tour_guides`
  ADD CONSTRAINT `fk_ctg_custom_tour` FOREIGN KEY (`custom_tour_id`) REFERENCES `custom_tours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ctg_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `custom_tour_services`
--
ALTER TABLE `custom_tour_services`
  ADD CONSTRAINT `fk_cts_custom_tour` FOREIGN KEY (`custom_tour_id`) REFERENCES `custom_tours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cts_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `employee_schedules`
--
ALTER TABLE `employee_schedules`
  ADD CONSTRAINT `fk_emp_sched_emp` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_emp_sched_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoice_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`paid_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_rv_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rv_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rv_guide` FOREIGN KEY (`guide_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_rv_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tours`
--
ALTER TABLE `tours`
  ADD CONSTRAINT `fk_tours_location` FOREIGN KEY (`main_location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tour_guides`
--
ALTER TABLE `tour_guides`
  ADD CONSTRAINT `fk_tg_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tg_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `tour_schedules` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tour_schedules`
--
ALTER TABLE `tour_schedules`
  ADD CONSTRAINT `fk_schedule_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `tour_services`
--
ALTER TABLE `tour_services`
  ADD CONSTRAINT `fk_ts_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ts_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
