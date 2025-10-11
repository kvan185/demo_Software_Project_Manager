import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [editItem, setEditItem] = useState(null);

  const fetchData = () => adminApi.getServices().then((res) => setServices(res.data));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (id) => {
    await adminApi.updateService(id, editItem);
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa dịch vụ này?")) {
      await adminApi.deleteService(id);
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
          <Link to="/admin/add-service" style={linkStyle}>➕ Thêm dịch vụ</Link>
        </div>
        <h2>🛎️ Danh sách dịch vụ</h2>
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th>ID</th><th>Tên</th><th>Loại</th><th>Giá</th><th>Nhà cung cấp</th><th>Chi tiết</th><th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) =>
              editItem?.id === s.id ? (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><input value={editItem.name} onChange={(e)=>setEditItem({...editItem,name:e.target.value})}/></td>
                  <td><input value={editItem.type} onChange={(e)=>setEditItem({...editItem,type:e.target.value})}/></td>
                  <td><input type="number" value={editItem.price} onChange={(e)=>setEditItem({...editItem,price:e.target.value})}/></td>
                  <td><input value={editItem.provider||""} onChange={(e)=>setEditItem({...editItem,provider:e.target.value})}/></td>
                  <td><input value={editItem.details||""} onChange={(e)=>setEditItem({...editItem,details:e.target.value})}/></td>
                  <td>
                    <button onClick={()=>handleSave(s.id)}>💾</button>
                    <button onClick={()=>setEditItem(null)}>❌</button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.name}</td><td>{s.type}</td><td>{s.price}</td><td>{s.provider}</td><td>{s.details}</td>
                  <td>
                    <button onClick={()=>setEditItem(s)}>✏️</button>
                    <button onClick={()=>handleDelete(s.id)}>🗑️</button>
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
