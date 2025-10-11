import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";

export default function LocationList() {
  const [locations, setLocations] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [message, setMessage] = useState("");

  const fetchData = () => {
    adminApi.getLocations().then((res) => setLocations(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (id) => {
    try {
      await adminApi.updateLocation(id, editItem);
      setMessage("✅ Cập nhật thành công!");
      setEditItem(null);
      fetchData();
    } catch {
      setMessage("❌ Lỗi khi cập nhật!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa địa điểm này?")) {
      await adminApi.deleteLocation(id);
      fetchData();
    }
  };

  const linkStyle = {
    textDecoration: "none",
    background: "#007bff",
    color: "white",
    padding: "8px 12px",
    borderRadius: "5px",
  };
  return (
    <div>
      {/* ✅ Thêm header ở trên */}
      <AdminHeader />

      {/* Nội dung chính */}
      <div style={{ padding: "30px", fontFamily: "Arial" }}>
        <div>
          <Link to="/admin/add-location" style={linkStyle}>➕ Thêm địa điểm</Link>
        </div>
        <h2>📍 Danh sách địa điểm</h2>
        {message && <p>{message}</p>}
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th>ID</th>
              <th>Tên</th>
              <th>Vùng</th>
              <th>Quốc gia</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) =>
              editItem?.id === loc.id ? (
                <tr key={loc.id}>
                  <td>{loc.id}</td>
                  <td>
                    <input
                      value={editItem.name}
                      onChange={(e) =>
                        setEditItem({ ...editItem, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editItem.region || ""}
                      onChange={(e) =>
                        setEditItem({ ...editItem, region: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editItem.country || ""}
                      onChange={(e) =>
                        setEditItem({ ...editItem, country: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editItem.description || ""}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          description: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSave(loc.id)}>💾 Lưu</button>
                    <button onClick={() => setEditItem(null)}>❌ Hủy</button>
                  </td>
                </tr>
              ) : (
                <tr key={loc.id}>
                  <td>{loc.id}</td>
                  <td>{loc.name}</td>
                  <td>{loc.region}</td>
                  <td>{loc.country}</td>
                  <td>{loc.description}</td>
                  <td>
                    <button onClick={() => setEditItem(loc)}>✏️ Sửa</button>
                    <button onClick={() => handleDelete(loc.id)}>🗑️ Xóa</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
