import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";

export default function AddTour() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(1);
  const [mainLocationId, setMainLocationId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminApi.getLocations().then((res) => setLocations(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.addTour({
        code,
        title,
        short_description: shortDesc,
        price,
        duration_days: duration,
        main_location_id: mainLocationId || null,
      });
      setMessage("✅ Thêm tour thành công!");
      setTitle(""); setCode(""); setPrice(""); setShortDesc("");
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không thể thêm tour"));
    }
  };

  return (
    <div>
      <AdminHeader />
      <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
        <h2>Thêm tour</h2>
        <form onSubmit={handleSubmit}>
          <label>Mã tour:</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Tên tour:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
          <label>Giá (VND):</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
          <label>Thời gian (ngày):</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <label>Địa điểm chính:</label>
          <select value={mainLocationId} onChange={(e) => setMainLocationId(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="">-- Chọn địa điểm --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <label>Mô tả ngắn:</label>
          <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} style={{ width: "100%", padding: "8px" }} />
          <button type="submit" style={{ marginTop: 10, padding: "10px 15px" }}>Thêm</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}
