import React, { useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";

export default function AddService() {
  const [type, setType] = useState("hotel");
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.addService({ type, name, provider, details, price });
      setMessage("✅ Thêm dịch vụ thành công!");
      setName(""); setProvider(""); setDetails(""); setPrice("");
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không thể thêm"));
    }
  };

  return (
    <div>
      <AdminHeader />
      <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
        <h2>Thêm dịch vụ</h2>
        <form onSubmit={handleSubmit}>
          <label>Loại dịch vụ:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="hotel">Khách sạn</option>
            <option value="flight">Chuyến bay</option>
            <option value="transport">Phương tiện</option>
            <option value="restaurant">Nhà hàng</option>
            <option value="ticket">Vé tham quan</option>
            <option value="other">Khác</option>
          </select>
          <label>Tên dịch vụ:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
          <label>Nhà cung cấp:</label>
          <input value={provider} onChange={(e) => setProvider(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Chi tiết:</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Giá:</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <button type="submit" style={{ marginTop: 10, padding: "10px 15px" }}>Thêm</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}
