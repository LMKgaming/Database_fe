"use client";
import { useState, useEffect } from "react";
import styles from "./users.module.css";
import Image from 'next/image';
export default function UserManagement() {
  const API_URL = "http://localhost:8080/api/users"; // Địa chỉ Backend
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  // State quản lý chế độ Sửa hay Thêm
  const [isEditing, setIsEditing] = useState(false);

  // Form data
  const initialFormState = {
    UserID: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Password: "",
    Birthday: "",
    Gender: "Male",
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Lấy danh sách User (Read)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      setMessage({ type: "error", text: `Lỗi kết nối: ${err.message || err}` });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Xử lý Submit (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      let res;
      if (isEditing) {
        // --- GỌI API SỬA (sp_UpdateUser) ---
        // Backend đang mong đợi: NewEmail, NewPhone, NewPassword
        const updatePayload = {
          NewEmail: formData.Email,
          NewPhone: formData.Phone,
          NewPassword: formData.Password
        };
        
        res = await fetch(`${API_URL}/${formData.UserID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
      } else {
        // --- GỌI API THÊM (sp_InsertUser) ---
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Có lỗi xảy ra");
      }

      setMessage({ type: "success", text: result.message });
      fetchUsers(); // Refresh danh sách
      resetForm();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // 3. Xử lý Xóa (sp_DeleteUser)
  const handleDelete = async (userId) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa User ${userId} không?`)) return;

    try {
      const res = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setMessage({ type: "success", text: result.message });
      fetchUsers();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Chuyển sang chế độ sửa
  const handleEditClick = (user) => {
    setIsEditing(true);
    // Điền dữ liệu cũ vào form
    setFormData({
      ...user,
      Password: "", // Reset password để người dùng nhập mật khẩu mới
      // Format ngày tháng cho input date (YYYY-MM-DD)
      Birthday: user.Birthday ? user.Birthday.split('T')[0] : "" 
    });
    // Scroll lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tìm kiếm người dùng
  const searchUsers = async (query) => {
    try {
      const res = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setUsers(data);      
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      setMessage({ type: "error", text: `Lỗi tìm kiếm: ${err.message || err}` });
    }
  }

  const closeModal = () => {
    setMessage({ type: "", text: "" });
  }

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className={styles.background}>
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Người Dùng </h1>

      {/* Thông báo thành công (inline). Lỗi hiển thị dưới dạng popup modal */}
      {message.text && message.type === 'success' && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Error modal popup */}
      {message.type === 'error' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Lỗi</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>{message.text}</div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM NHẬP LIỆU --- */}
      <div className={styles.formCard}>
        <h3 >{isEditing ? `Cập nhật thông tin: ${formData.UserID}` : "Thêm Người Dùng Mới"}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            
            {/* UserID: Chỉ nhập khi Thêm mới, Read-only khi Sửa */}
            <div className={styles.formGroup}>
              <label className={styles.label}>UserID</label>
              <input
                className={styles.input}
                name="UserID"
                value={formData.UserID}
                onChange={handleChange}
                placeholder="VD: US001"
                disabled={isEditing}
                required
              />
            </div>

            {/* Các trường chỉ hiển thị khi THÊM MỚI (vì sp_UpdateUser không cho sửa tên/ngày sinh) */}
            {!isEditing && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ (Last Name)</label>
                  <input className={styles.input} name="LastName" value={formData.LastName} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tên (First Name)</label>
                  <input className={styles.input} name="FirstName" value={formData.FirstName} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngày sinh</label>
                  <input type="date" className={styles.input} name="Birthday" value={formData.Birthday} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Giới tính</label>
                  <select className={styles.select} name="Gender" value={formData.Gender} onChange={handleChange}>
                    <option value="Male">Nam (Male)</option>
                    <option value="Female">Nữ (Female)</option>
                  </select>
                </div>
              </>
            )}

            {/* Các trường luôn hiển thị (Cho phép sửa) */}
            <div className={styles.formGroup}>
              <label className={styles.label}>{isEditing ? "Email Mới" : "Email"}</label>
              <input type="email" className={styles.input} name="Email" value={formData.Email} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{isEditing ? "SĐT Mới" : "Số điện thoại"}</label>
              <input className={styles.input} name="Phone" value={formData.Phone} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                {isEditing ? "Mật khẩu Mới (Bắt buộc nhập lại)" : "Mật khẩu"}
              </label>
              <input 
                type="text" 
                className={styles.input} 
                name="Password" 
                value={formData.Password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {isEditing ? "Lưu Thay Đổi" : "Thêm Mới"}
            </button>
            {isEditing && (
              <button type="button" className={styles.btnClose} onClick={resetForm}>
                Hủy Bỏ
              </button>
            )}
          </div>
        </form>
      </div>

        <div className={styles.tableSearch}>
          <input type="text" placeholder="Tìm kiếm người dùng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className={styles.searchIcon} onClick={() => searchUsers(searchQuery)}>
            <Image src="/search.png" alt="Search" width={20} height={20} />
          </button>
        </div>
      {/* --- DANH SÁCH NGƯỜI DÙNG --- */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày sinh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Đang tải dữ liệu...</td></tr>
            ) : users.map((user) => (
              <tr key={user.UserID}>
                <td>{user.UserID}</td>
                <td>{user.LastName} {user.FirstName}</td>
                <td>{user.Email}</td>
                <td>{user.Phone}</td>
                <td>{new Date(user.Birthday).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.btnEdit}
                      onClick={() => handleEditClick(user)}
                    >
                      <Image className={styles.btnEditImg} src="/modify.png" alt="Edit" width={20} height={20} />
                    </button>
                    <button 
                      className={styles.btnDelete}
                      onClick={() => handleDelete(user.UserID)}
                    >
                      <Image className={styles.btnDeleteImg} src="/delete.png" alt="Delete" width={20} height={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}