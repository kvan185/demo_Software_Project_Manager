SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE travel_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_app;

-- permissions: quyền hệ thống
CREATE TABLE permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- roles: vai trò người dùng
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB;

-- users: tài khoản chung
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- role_permissions: phân quyền cho vai trò
CREATE TABLE role_permissions (
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- customers: chi tiết khách hàng
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(30),
  birthday DATE,
  gender ENUM('male','female','other') DEFAULT 'other',
  address TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- employees: hướng dẫn viên / nhân viên
CREATE TABLE employees (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL,
  full_name VARCHAR(200) NOT NULL,
  type ENUM('guide','operator','manager','other') DEFAULT 'other',
  role_title VARCHAR(100),
  phone VARCHAR(30),
  status ENUM('active','inactive','on_leave') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- locations: điểm đến / thành phố
CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  description TEXT
) ENGINE=InnoDB;

-- tours: thông tin tour
CREATE TABLE tours (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  duration_days INT NOT NULL DEFAULT 1,
  min_participants INT DEFAULT 1,
  max_participants INT DEFAULT 30,
  main_location_id INT,
  status ENUM('draft','published','archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tours_location FOREIGN KEY (main_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- tour_schedules: lịch chạy cụ thể
CREATE TABLE tour_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tour_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  seats_total INT NOT NULL,
  seats_booked INT NOT NULL DEFAULT 0,
  price_per_person DECIMAL(12,2) NULL,
  status ENUM('open','full','cancelled','completed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- services
CREATE TABLE services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('hotel','flight','transport','restaurant','ticket','other') DEFAULT 'other',
  name VARCHAR(255),
  provider VARCHAR(255),
  details TEXT,
  price DECIMAL(12,2) DEFAULT 0.00
) ENGINE=InnoDB;

-- tour_services
CREATE TABLE tour_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tour_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  qty INT DEFAULT 1,
  note TEXT,
  CONSTRAINT fk_ts_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE KEY uk_tour_service (tour_id, service_id)
) ENGINE=InnoDB;

-- tour_guides
CREATE TABLE tour_guides (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  role VARCHAR(100) DEFAULT 'guide',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tg_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_tg_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uk_schedule_employee (schedule_id, employee_id)
) ENGINE=InnoDB;

-- custom_tours
CREATE TABLE custom_tours (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  preferred_start_date DATE,
  preferred_end_date DATE,
  number_of_people INT DEFAULT 1,
  budget DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_custom_tour_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE custom_tour_destinations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  custom_tour_id BIGINT NOT NULL,
  location_id INT NOT NULL,
  day_order INT,
  note TEXT,
  CONSTRAINT fk_ctd_custom_tour FOREIGN KEY (custom_tour_id) REFERENCES custom_tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctd_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE custom_tour_services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  custom_tour_id BIGINT NOT NULL,
  service_id BIGINT NOT NULL,
  qty INT DEFAULT 1,
  note TEXT,
  CONSTRAINT fk_cts_custom_tour FOREIGN KEY (custom_tour_id) REFERENCES custom_tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_cts_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE custom_tour_guides (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  custom_tour_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  role VARCHAR(100) DEFAULT 'guide',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ctg_custom_tour FOREIGN KEY (custom_tour_id) REFERENCES custom_tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_ctg_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- employee_schedules
CREATE TABLE employee_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id BIGINT NOT NULL,
  tour_id BIGINT NOT NULL,
  schedule_date DATE NOT NULL,
  start_time TIME DEFAULT '08:00:00',
  end_time TIME DEFAULT '18:00:00',
  shift ENUM('morning', 'afternoon', 'full-day') DEFAULT 'full-day',
  status ENUM('scheduled', 'working', 'completed', 'cancelled') DEFAULT 'scheduled',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_sched_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_emp_sched_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  UNIQUE KEY uk_emp_sched (employee_id, tour_id, schedule_date)
) ENGINE=InnoDB;

-- bookings
CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT NOT NULL,
  schedule_id BIGINT NULL,
  custom_tour_id BIGINT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  qty_adults INT NOT NULL DEFAULT 1,
  qty_children INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  payment_status ENUM('unpaid','partial','paid','refunded') DEFAULT 'unpaid',
  refund_note VARCHAR(255) NULL,
  refunded_at TIMESTAMP NULL,
  note TEXT,
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_schedule FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_custom_tour FOREIGN KEY (custom_tour_id) REFERENCES custom_tours(id) ON DELETE CASCADE,
  CONSTRAINT chk_only_one_tour CHECK (
    (schedule_id IS NOT NULL AND custom_tour_id IS NULL) OR
    (schedule_id IS NULL AND custom_tour_id IS NOT NULL)
  )
) ENGINE=InnoDB;

-- booking_passengers
CREATE TABLE booking_passengers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  gender ENUM('male','female','other') DEFAULT 'other',
  birth_date DATE,
  passport_number VARCHAR(100),
  seat_type VARCHAR(50),
  price DECIMAL(12,2) DEFAULT 0.00,
  CONSTRAINT fk_passenger_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- payments
CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  paid_by_user_id BIGINT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('cash','bank_transfer','momo','vnpay','card','paypal','other') DEFAULT 'other',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_ref VARCHAR(255),
  status ENUM('success','failed','pending') DEFAULT 'success',
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_user FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- invoices
CREATE TABLE invoices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  invoice_no VARCHAR(100) NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0.00,
  status ENUM('issued','cancelled','paid') DEFAULT 'issued',
  CONSTRAINT fk_invoice_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- reviews
CREATE TABLE reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  tour_id BIGINT NOT NULL,
  guide_id BIGINT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_rv_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_rv_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_rv_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
  CONSTRAINT fk_rv_guide FOREIGN KEY (guide_id) REFERENCES employees(id) ON DELETE SET NULL,
  UNIQUE KEY uk_review (booking_id, customer_id, tour_id, guide_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
