import React, { useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";

export default function AddUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.addUser({
        email,
        password,
        role: role || null,
      });
      setMessage("✅ Thêm user thành công!");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không thể thêm user"));
    }
  };

  return (
    <div>
      <AdminHeader />
      <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
        <h2>Thêm User</h2>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />

          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />

          <label>Quyền (role):</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">-- Chọn quyền --</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
            <option value="3">Nhân viên</option>
          </select>

          <button
            type="submit"
            style={{ marginTop: 10, padding: "10px 15px" }}
          >
            Thêm
          </button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}
