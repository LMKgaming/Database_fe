"use client";

import React, { useState, useMemo, useEffect } from "react";
import styles from "./customer.module.css";

const API_USER_URL = "/api/users";
const API_URL = "/api/procedure/count-booking";

export default function CustomerFilter() {
    const [keyword, setKeyword] = useState("");
    const [maxBooking, setMaxBooking] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho thêm user
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
    const [addMessage, setAddMessage] = useState("");
    const [addError, setAddError] = useState("");

    // State cho sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // State cho Modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // --- STATE CHO DELETE MODAL ---
    const [deleteError, setDeleteError] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");


    // Xử lý thay đổi input form thêm user
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý submit thêm user
    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddMessage("");
        setAddError("");
        try {
            const res = await fetch(API_USER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Có lỗi xảy ra");
            setAddMessage(result.message || "Thêm người dùng thành công!");
            setFormData(initialFormState);
            fetchUsers(); // Tải lại danh sách user sau khi thêm
        } catch (err) {
            setAddError(err.message);
        }
    };

    // Logic xử lý sort
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Lấy danh sách users từ API và sort
    const sortedUsers = useMemo(() => {
        let sortableItems = [...users];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                if (sortConfig.key === "spent") {
                    aValue = parseFloat(aValue?.toString().replace(/[^0-9]/g, "") || 0);
                    bValue = parseFloat(bValue?.toString().replace(/[^0-9]/g, "") || 0);
                }
                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [users, sortConfig]);

    // Hàm fetch danh sách users từ API
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        try {
            const url = new URL(API_URL, window.location.origin);
            if (params.q) url.searchParams.set("q", params.q);
            if (params.max !== undefined && params.max !== null && params.max !== "") {
                url.searchParams.set("max", params.max);
            }
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok && Array.isArray(data.data)) {
                setUsers(data.data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            setUsers([]);
        }
        setLoading(false);
    };

    // Lấy danh sách khi load trang
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFilter = async () => {
        fetchUsers({ q: keyword, max: maxBooking === "" ? null : maxBooking });
    };

    // Hiển thị icon sort
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span className={styles.sortIcon}>↕</span>;
        return sortConfig.direction === "asc" ? (
            <span className={`${styles.sortIcon} ${styles.sortIconActive}`}>▲</span>
        ) : (
            <span className={`${styles.sortIcon} ${styles.sortIconActive}`}>▼</span>
        );
    };

    // --- MỞ/ĐÓNG MODALS ---
    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setDeleteError("");    // Reset lỗi khi mở modal
        setDeleteMessage(""); // Reset thông báo khi mở modal
        setShowDeleteModal(true);
    };

    const closeModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    // --- XỬ LÝ XÓA USER ---
    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setDeleteError("");
        setDeleteMessage("");

        try {
            const res = await fetch(`${API_USER_URL}/${selectedUser.UserID}`, {
                method: 'DELETE',
            })

            const result = await res.json();

            if (!res.ok) {
                // Nếu backend trả về lỗi (vd: 400), ném ra lỗi với message từ API
                throw new Error(result.message || "Có lỗi xảy ra khi xóa.");
            }

            // Xóa thành công
            setDeleteMessage("Xóa người dùng thành công!");
            await fetchUsers(); // Tải lại danh sách
            
            // Đóng modal sau 1.5 giây để người dùng đọc thông báo
            setTimeout(() => {
                closeModals();
            }, 1500);

        } catch (err) {
            // Hiển thị lỗi bắt được
            setDeleteError(err.message);
        }
    };


    return (
        <div className={styles.container}>
            {/* --- FORM THÊM USER --- */}
            <div className={styles.filterSection}>
                <h2 className={styles.title}>Thêm Người Dùng Mới</h2>
                <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {/* ... (input fields) ... */}
                     <div className={styles.inputGroup} style={{ width: 120 }}>
                        <label>UserID</label>
                        <input name="UserID" value={formData.UserID} onChange={handleFormChange} required placeholder="VD: US001" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 140 }}>
                        <label>Họ</label>
                        <input name="LastName" value={formData.LastName} onChange={handleFormChange} required placeholder="Họ" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 120 }}>
                        <label>Tên</label>
                        <input name="FirstName" value={formData.FirstName} onChange={handleFormChange} required placeholder="Tên" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 180 }}>
                        <label>Email</label>
                        <input type="email" name="Email" value={formData.Email} onChange={handleFormChange} required placeholder="Email" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 120 }}>
                        <label>SĐT</label>
                        <input name="Phone" value={formData.Phone} onChange={handleFormChange} required placeholder="Số điện thoại" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 120 }}>
                        <label>Mật khẩu</label>
                        <input name="Password" value={formData.Password} onChange={handleFormChange} required placeholder="Mật khẩu" />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 140 }}>
                        <label>Ngày sinh</label>
                        <input type="date" name="Birthday" value={formData.Birthday} onChange={handleFormChange} required />
                    </div>
                    <div className={styles.inputGroup} style={{ width: 120 }}>
                        <label>Giới tính</label>
                        <select name="Gender" value={formData.Gender} onChange={handleFormChange}>
                            <option value="Male">Nam</option>
                            <option value="Female">Nữ</option>
                        </select>
                    </div>
                    <button type="submit" className={styles.searchBtn} style={{ height: 44 }}>Thêm mới</button>
                </form>
                {addMessage && <div style={{ color: '#22c55e', marginTop: 8 }}>{addMessage}</div>}
                {addError && <div style={{ color: '#ef4444', marginTop: 8 }}>{addError}</div>}
            </div>

            {/* --- BỘ LỌC --- */}
            <div className={styles.filterSection}>
                <h2 className={styles.title}>Lọc khách hàng theo đơn hàng</h2>
                <div className={styles.controls}>
                     <div className={`${styles.inputGroup} ${styles.flex1}`}>
                        <label>Từ khóa (Tên/Email)</label>
                        <input
                            type="text"
                            placeholder="Nhập tên khách hàng..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ width: "180px" }}>
                        <label>Max Booking</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="VD: 5"
                            value={maxBooking}
                            onChange={(e) => setMaxBooking(e.target.value)}
                        />
                    </div>
                    <button className={styles.searchBtn} onClick={handleFilter}>Tìm kiếm</button>
                </div>
            </div>

            {/* --- BẢNG DỮ LIỆU --- */}
            <div className={styles.tableWrapper}>
                <div className={styles.scrollContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("UserID")} className={styles.sortableHeader}>ID {getSortIcon("UserID")}</th>
                                <th onClick={() => handleSort("FullName")} className={styles.sortableHeader}>Họ Tên {getSortIcon("FullName")}</th>
                                <th onClick={() => handleSort("Email")} className={styles.sortableHeader}>Email {getSortIcon("Email")}</th>
                                <th onClick={() => handleSort("TotalBookings")} className={styles.sortableHeader} style={{ textAlign: "center" }}>Số đơn {getSortIcon("TotalBookings")}</th>
                                <th onClick={() => handleSort("TotalSpent")} className={styles.sortableHeader} style={{ textAlign: "right" }}>Tổng chi {getSortIcon("TotalSpent")}</th>
                                <th style={{ textAlign: "center", width: "120px" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{textAlign:'center'}}>Đang tải dữ liệu...</td></tr>
                            ) : sortedUsers.length === 0 ? (
                                <tr><td colSpan="6" style={{textAlign:'center'}}>Không có dữ liệu</td></tr>
                            ) : sortedUsers.map((user) => (
                                <tr key={user.UserID}>
                                    <td>{user.UserID}</td>
                                    <td style={{ fontWeight: 500 }}>{user.FullName}</td>
                                    <td style={{ color: "#94a3b8" }}>{user.Email}</td>
                                    <td style={{ textAlign: "center" }}><span className={styles.badge}>{user.TotalBookings}</span></td>
                                    <td style={{ textAlign: "right" }}>{user.TotalSpent?.toLocaleString('vi-VN') ?? 0}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => handleEdit(user)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(user)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- POPUP EDIT --- */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={closeModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Chỉnh sửa</h3>
                        <div className={styles.modalBody}>Đang sửa: {selectedUser?.FullName}</div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={closeModals}>Hủy</button>
                            <button className={styles.btnConfirm} onClick={closeModals}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- POPUP DELETE --- */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle} style={{ color: "#ef4444" }}>
                            Xác nhận xóa
                        </h3>
                        <div className={styles.modalBody}>
                           {/* Hiển thị thông báo/lỗi hoặc câu hỏi xác nhận */}
                           {deleteError ? (
                               <p style={{ color: '#ef4444', margin: 0 }}>{deleteError}</p>
                           ) : deleteMessage ? (
                               <p style={{ color: '#22c55e', margin: 0 }}>{deleteMessage}</p>
                           ) : (
                               <p>Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.FullName}</strong>?</p>
                           )}
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={closeModals} disabled={!!deleteMessage}>
                                Hủy
                            </button>
                            <button 
                                className={`${styles.btnConfirm} ${styles.btnDelete}`} 
                                onClick={handleConfirmDelete}
                                // Vô hiệu hóa nút khi đang hiển thị thông báo thành công
                                disabled={!!deleteMessage}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}