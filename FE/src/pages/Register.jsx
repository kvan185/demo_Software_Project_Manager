import React, { useState } from "react";
import authApi from "../api/authApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await authApi.register({ email, password, role: 2 });
      setMessage("Đăng ký thành công! Chuyển đến đăng nhập...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err) {
      setMessage("Lỗi: " + (err.response?.data?.message || "Không thể đăng ký"));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", fontFamily: "Arial" }}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: 10 }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
          }}
        >
          Đăng ký
        </button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>
    </div>
  );
}
