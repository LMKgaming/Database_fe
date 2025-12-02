"use client";

import React, { useState, useMemo } from "react";
import styles from "./customer.module.css";

const MOCK_USERS = [
    { id: 101, name: "Nguyễn Văn A", email: "vana@example.com", bookings: 2, spent: "1,200,000 đ" },
    { id: 102, name: "Trần Thị B", email: "b.tran@gmail.com", bookings: 5, spent: "5,500,000 đ" },
    { id: 103, name: "Lê Văn C", email: "c.le@test.com", bookings: 0, spent: "0 đ" },
    { id: 104, name: "Phạm Thị D", email: "d.pham@test.com", bookings: 12, spent: "15,000,000 đ" },
    { id: 105, name: "Hoàng Văn E", email: "e.hoang@test.com", bookings: 1, spent: "500,000 đ" },
    { id: 106, name: "Vũ Thị F", email: "f.vu@test.com", bookings: 3, spent: "2,100,000 đ" },
    { id: 107, name: "Đặng Văn G", email: "g.dang@test.com", bookings: 8, spent: "8,900,000 đ" },
];

const API_URL = "http://localhost:8080/api/procedure/count-booking";

export default function CustomerFilter() {
    const [keyword, setKeyword] = useState("");
    const [maxBooking, setMaxBooking] = useState("");

    // --- STATE CHO SORTING ---
    // direction: 'asc' (tăng), 'desc' (giảm), hoặc null (không sort)
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // --- LOGIC XỬ LÝ SORT ---
    const handleSort = (key) => {
        let direction = "asc";
        // Nếu đang sort cột này rồi và đang là 'asc' thì chuyển sang 'desc'
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // --- LOGIC TÍNH TOÁN DỮ LIỆU ĐÃ SORT (Dùng useMemo để tối ưu) ---
    const sortedUsers = useMemo(() => {
        let sortableItems = [...MOCK_USERS];

        // 1. Lọc theo Keyword/MaxBooking (Nếu muốn tích hợp lọc client-side luôn)
        // Ở đây mình giữ nguyên logic hiển thị, chỉ sort mảng MOCK_USERS

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                // Lấy giá trị thô
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Xử lý đặc biệt cho cột Tiền tệ (chuyển "1,200,000 đ" -> 1200000)
                if (sortConfig.key === "spent") {
                    // Xóa tất cả ký tự không phải số
                    aValue = parseFloat(aValue.toString().replace(/[^0-9]/g, ""));
                    bValue = parseFloat(bValue.toString().replace(/[^0-9]/g, ""));
                }

                // So sánh
                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [sortConfig]);

    const handleFilter = async () => {
        const url = new URL(API_URL);
        url.searchParams.set("q", keyword);
        url.searchParams.set("max", maxBooking)
        const res = await fetch(url);
        const data = await res.json();
        console.log(data);
    }

    // --- UI HELPER: HIỂN THỊ ICON MŨI TÊN ---
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span className={styles.sortIcon}>↕</span>; // Icon mờ khi chưa sort
        return sortConfig.direction === "asc" ? (
            <span className={`${styles.sortIcon} ${styles.sortIconActive}`}>▲</span>
        ) : (
            <span className={`${styles.sortIcon} ${styles.sortIconActive}`}>▼</span>
        );
    };

    // ... (Giữ nguyên các hàm Modal handleEdit, handleDelete, closeModals) ...
    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };
    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };
    const closeModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedUser(null);
    };

    return (
        <div className={styles.container}>
            {/* --- PHẦN 1: BỘ LỌC (Giữ nguyên) --- */}
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

            {/* --- PHẦN 2: BẢNG DỮ LIỆU --- */}
            <div className={styles.tableWrapper}>
                <div className={styles.scrollContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {/* Cột ID */}
                                <th onClick={() => handleSort("id")} className={styles.sortableHeader}>
                                    ID {getSortIcon("id")}
                                </th>

                                {/* Cột Họ Tên */}
                                <th onClick={() => handleSort("name")} className={styles.sortableHeader}>
                                    Họ Tên {getSortIcon("name")}
                                </th>

                                {/* Cột Email */}
                                <th onClick={() => handleSort("email")} className={styles.sortableHeader}>
                                    Email {getSortIcon("email")}
                                </th>

                                {/* Cột Số đơn */}
                                <th
                                    onClick={() => handleSort("bookings")}
                                    className={styles.sortableHeader}
                                    style={{ textAlign: "center" }}
                                >
                                    Số đơn {getSortIcon("bookings")}
                                </th>

                                {/* Cột Tổng chi */}
                                <th
                                    onClick={() => handleSort("spent")}
                                    className={styles.sortableHeader}
                                    style={{ textAlign: "right" }}
                                >
                                    Tổng chi {getSortIcon("spent")}
                                </th>

                                {/* Cột Thao tác (Không sort) */}
                                <th style={{ textAlign: "center", width: "120px" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Duyệt qua mảng sortedUsers thay vì MOCK_USERS */}
                            {sortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                                    <td style={{ color: "#94a3b8" }}>{user.email}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <span className={styles.badge}>{user.bookings}</span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>{user.spent}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={`${styles.iconBtn} ${styles.editBtn}`}
                                                onClick={() => handleEdit(user)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDelete(user)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- POPUP EDIT & DELETE (Giữ nguyên code cũ) --- */}
            {showEditModal && (
                <div className={styles.modalOverlay} onClick={closeModals}>
                    {/* ... Giữ nguyên nội dung Modal Edit ... */}
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Chỉnh sửa</h3>
                        <div className={styles.modalBody}>Đang sửa: {selectedUser?.name}</div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={closeModals}>
                                Hủy
                            </button>
                            <button className={styles.btnConfirm} onClick={closeModals}>
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className={styles.modalOverlay} onClick={closeModals}>
                    {/* ... Giữ nguyên nội dung Modal Delete ... */}
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle} style={{ color: "#ef4444" }}>
                            Xóa?
                        </h3>
                        <div className={styles.modalBody}>Xóa {selectedUser?.name}?</div>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={closeModals}>
                                Hủy
                            </button>
                            <button className={`${styles.btnConfirm} ${styles.btnDelete}`} onClick={closeModals}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
