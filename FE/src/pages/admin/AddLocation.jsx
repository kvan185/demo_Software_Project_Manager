import React, { useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";

export default function AddLocation() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Việt Nam");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name, country, region, description);
    try {
      await adminApi.addLocation({ name, country, region, description });
      setMessage("✅ Thêm địa điểm thành công!");
      setName(""); setRegion(""); setDescription("");
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không thể thêm"));
    }
  };

  return (
    <div>
      <AdminHeader />
      <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
        <h2>Thêm địa điểm</h2>
        <form onSubmit={handleSubmit}>
          <label>Tên địa điểm:</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
          <label>Quốc gia:</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Vùng:</label>
          <input value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Mô tả:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <button type="submit" style={{ marginTop: 10, padding: "10px 15px" }}>Thêm</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}
