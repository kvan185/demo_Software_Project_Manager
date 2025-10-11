import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";
import AdminHeader from "../../components/AdminHeader";
import { Link } from "react-router-dom";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [editItem, setEditItem] = useState(null);

  // 🔹 Load danh sách user từ API
  const fetchData = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi khi load user:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Lưu cập nhật
  const handleSave = async (id) => {
    try {
      await adminApi.updateUser(id, editItem);
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Lỗi cập nhật user:", err);
    }
  };

  // 🔹 Xóa user
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa User này?")) {
      try {
        await adminApi.deleteUser(id);
        fetchData();
      } catch (err) {
        console.error("Lỗi xóa user:", err);
      }
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
          <Link to="/admin/add-user" style={linkStyle}>➕ Thêm Người dùng</Link>
        </div>
        <h2>👤 Danh sách User</h2>
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th>ID</th>
              <th>Quyền</th>
              <th>Email</th>
              <th>Mật khẩu</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              editItem?.id === u.id ? (
                // 🔸 Hàng đang được chỉnh sửa
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <input
                      value={editItem.role}
                      onChange={(e) =>
                        setEditItem({ ...editItem, role: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editItem.email}
                      onChange={(e) =>
                        setEditItem({ ...editItem, email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={editItem.password_hash}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          password_hash: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>{u.created_at}</td>
                  <td>{u.updated_at}</td>
                  <td>
                    <button onClick={() => handleSave(u.id)}>💾</button>
                    <button onClick={() => setEditItem(null)}>❌</button>
                  </td>
                </tr>
              ) : (
                // 🔸 Hàng hiển thị bình thường
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.role}</td>
                  <td>{u.email}</td>
                  <td>{u.password_hash}</td>
                  <td>{u.created_at}</td>
                  <td>{u.updated_at}</td>
                  <td>
                    <button onClick={() => setEditItem(u)}>✏️</button>
                    <button onClick={() => handleDelete(u.id)}>🗑️</button>
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
