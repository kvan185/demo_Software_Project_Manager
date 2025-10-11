import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";

export default function TourList() {
  const [tours, setTours] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const fetchData = () => adminApi.getTours().then((res) => setTours(res.data));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (id) => {
    await adminApi.updateTour(id, editItem);
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa tour này?")) {
      await adminApi.deleteTour(id);
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
      <AdminHeader />
      <div style={{ padding: "30px", fontFamily: "Arial" }}>
        <div>
          <Link to="/admin/add-tour" style={linkStyle}>➕ Thêm tour</Link>
        </div>
        <h2>🧳 Danh sách tour</h2>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th>ID</th><th>Mã</th><th>Tên</th><th>Giá</th><th>Ngày</th><th>Địa điểm</th><th>Trạng thái</th><th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) =>
              editItem?.id === t.id ? (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td><input value={editItem.code} onChange={(e)=>setEditItem({...editItem,code:e.target.value})}/></td>
                  <td><input value={editItem.title} onChange={(e)=>setEditItem({...editItem,title:e.target.value})}/></td>
                  <td><input type="number" value={editItem.price} onChange={(e)=>setEditItem({...editItem,price:e.target.value})}/></td>
                  <td><input type="number" value={editItem.duration_days} onChange={(e)=>setEditItem({...editItem,duration_days:e.target.value})}/></td>
                  <td>{t.main_location}</td>
                  <td>{t.status}</td>
                  <td>
                    <button onClick={()=>handleSave(t.id)}>💾</button>
                    <button onClick={()=>setEditItem(null)}>❌</button>
                  </td>
                </tr>
              ) : (
                <tr key={t.id}>
                  <td>{t.id}</td><td>{t.code}</td><td>{t.title}</td><td>{t.price}</td>
                  <td>{t.duration_days}</td><td>{t.main_location}</td><td>{t.status}</td>
                  <td>
                    <button onClick={()=>setEditItem(t)}>✏️</button>
                    <button onClick={()=>handleDelete(t.id)}>🗑️</button>
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
