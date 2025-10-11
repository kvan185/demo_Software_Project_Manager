import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./AdminHeader.css";

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { path: "/admin/tours", label: "Tour" },
    { path: "/admin/services", label: "Dịch vụ" },
    { path: "/admin/locations", label: "Địa điểm" },
    { path: "/admin/users", label: "Người dùng" },
  ];

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-logo" onClick={() => navigate("/admin")}>
          🧭 <span>Travel Admin</span>
        </h1>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-header-right">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </div>
    </header>
  );
}
