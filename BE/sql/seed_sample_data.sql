USE travel_app;

-- === PERMISSIONS ===
INSERT INTO permissions (name, description) VALUES
('manage_users', 'Quản lý người dùng'),
('manage_tours', 'Quản lý tour du lịch'),
('manage_bookings', 'Quản lý đặt tour'),
('view_reports', 'Xem báo cáo thống kê');

-- === ROLES ===
INSERT INTO roles (name, description) VALUES
('admin', 'Quản trị viên hệ thống'),
('customer', 'Khách hàng'),
('guide', 'Hướng dẫn viên'),
('operator', 'Điều hành tour'),
('manager', 'Quản lý chi nhánh');

-- === ROLE PERMISSIONS ===
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1,1),(1,2),(1,3),(1,4), -- admin full quyền
(5,2),(5,3),(5,4),       -- manager
(4,2),(4,3),             -- operator
(3,2),                   -- guide
(2,3);                   -- customer chỉ xem và đặt tour

-- === USERS ===
INSERT INTO users (role_id, email, password_hash) VALUES
(1, 'admin@travelapp.com', 'hash_admin'),
(2, 'customer01@gmail.com', 'hash_customer'),
(3, 'guide01@gmail.com', 'hash_guide'),
(4, 'operator01@gmail.com', 'hash_operator'),
(5, 'manager01@gmail.com', 'hash_manager');

-- === CUSTOMERS ===
INSERT INTO customers (user_id, full_name, phone, birthday, gender, address, note)
VALUES
(2, 'Nguyễn Văn A', '0905123456', '1995-04-12', 'male', 'Hà Nội', 'Khách VIP');

-- === EMPLOYEES ===
INSERT INTO employees (user_id, full_name, type, role_title, phone, status)
VALUES
(3, 'Trần Thị B', 'guide', 'Hướng dẫn viên chính', '0909888777', 'active'),
(4, 'Lê Văn C', 'operator', 'Điều hành viên', '0911222333', 'active'),
(5, 'Phạm Minh D', 'manager', 'Quản lý khu vực Bắc', '0988666555', 'active');

-- === LOCATIONS ===
INSERT INTO locations (name, country, region, description)
VALUES
('Hà Nội', 'Việt Nam', 'Miền Bắc', 'Thủ đô ngàn năm văn hiến'),
('Đà Nẵng', 'Việt Nam', 'Miền Trung', 'Thành phố đáng sống'),
('TP. Hồ Chí Minh', 'Việt Nam', 'Miền Nam', 'Trung tâm kinh tế lớn nhất nước');

-- === TOURS ===
INSERT INTO tours (code, title, short_description, price, duration_days, min_participants, max_participants, main_location_id, status)
VALUES
('HN01', 'Khám phá Hà Nội 3N2Đ', 'Tour tham quan văn hóa và ẩm thực Hà Nội', 3500000, 3, 5, 30, 1, 'published'),
('DN01', 'Du lịch Đà Nẵng - Hội An 4N3Đ', 'Trải nghiệm biển xanh và phố cổ', 4500000, 4, 5, 25, 2, 'published');

-- === TOUR SCHEDULES ===
INSERT INTO tour_schedules (tour_id, start_date, end_date, seats_total, seats_booked, price_per_person, status)
VALUES
(1, '2025-11-10', '2025-11-12', 30, 5, 3600000, 'open'),
(2, '2025-12-05', '2025-12-08', 25, 10, 4600000, 'open');

-- === SERVICES ===
INSERT INTO services (type, name, provider, details, price)
VALUES
('hotel', 'Khách sạn Mường Thanh', 'Mường Thanh Group', 'Phòng đôi 3 sao', 800000),
('transport', 'Xe du lịch 29 chỗ', 'Mai Linh Travel', 'Xe đưa đón sân bay và city tour', 500000),
('restaurant', 'Nhà hàng Sen Hồ Tây', 'Sen Group', 'Buffet đặc sản Hà Nội', 300000);

-- === TOUR SERVICES ===
INSERT INTO tour_services (tour_id, service_id, qty, note)
VALUES
(1, 1, 3, '3 đêm khách sạn Mường Thanh'),
(1, 2, 1, 'Xe di chuyển suốt tuyến'),
(1, 3, 2, '2 bữa buffet');

-- === TOUR GUIDES ===
INSERT INTO tour_guides (schedule_id, employee_id, role)
VALUES
(1, 1, 'lead guide');

-- === BOOKINGS ===
INSERT INTO bookings (booking_code, customer_id, schedule_id, qty_adults, qty_children, total_amount, status, payment_status, note)
VALUES
('BK001', 1, 1, 2, 1, 10800000, 'confirmed', 'paid', 'Gia đình có trẻ nhỏ'),
('BK002', 1, 2, 1, 0, 4600000, 'pending', 'unpaid', NULL);

-- === BOOKING PASSENGERS ===
INSERT INTO booking_passengers (booking_id, full_name, gender, birth_date, passport_number, seat_type, price)
VALUES
(1, 'Nguyễn Văn A', 'male', '1995-04-12', 'C1234567', 'Người lớn', 3600000),
(1, 'Trần Thị E', 'female', '1997-09-21', 'D7654321', 'Người lớn', 3600000),
(1, 'Nguyễn Văn F', 'male', '2015-01-15', NULL, 'Trẻ em', 1800000);

-- === PAYMENTS ===
INSERT INTO payments (booking_id, paid_by_user_id, amount, method, transaction_ref, status)
VALUES
(1, 2, 10800000, 'bank_transfer', 'TRANS123456', 'success');

-- === INVOICES ===
INSERT INTO invoices (booking_id, invoice_no, amount, tax, status)
VALUES
(1, 'INV001', 10800000, 0, 'issued');

-- === REVIEWS ===
INSERT INTO reviews (booking_id, customer_id, tour_id, guide_id, rating, comment)
VALUES
(1, 1, 1, 1, 5, 'Tour tuyệt vời, hướng dẫn viên nhiệt tình và chu đáo!');
