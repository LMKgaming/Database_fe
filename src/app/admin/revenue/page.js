"use client";

import { useEffect, useState } from "react";
import styles from "./revenue.module.css";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState(null);

  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedMovieTitle, setSelectedMovieTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Lấy danh sách phim + doanh thu tổng từng phim
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoadingMovies(true);
        setMoviesError(null);

        // TODO: THAY URL NÀY BẰNG API THẬT CỦA BẠN
        // Backend nên trả dạng:
        // [{ id: "MV001", title: "Mai", totalRevenue: 1068000 }, ...]
        const res = await fetch("http://localhost:8080/api/movies");
        if (!res.ok) {
          throw new Error("Không thể tải danh sách phim");
        }

        const temp = await res.json();
        const data = temp.data
        setMovies(data || []);
      } catch (err) {
        setMoviesError(err.message || "Có lỗi xảy ra");
      } finally {
        setIsLoadingMovies(false);
      }
    };

    fetchMovies();
  }, []);

  // Tổng doanh thu tất cả phim (tính từ movies)
  const totalAllMovies = movies.reduce(
    (sum, m) => sum + (m.totalRevenue || 0),
    0
  );

  const formatCurrency = (number) => {
    if (number == null) return "";
    return number.toLocaleString("vi-VN") + " VND";
  };

  // Khi click vào tên phim -> gọi hàm SQL fn_GetMovieRevenue qua API
  const handleMovieClick = async (movie) => {
    if (!movie) return;

    setSelectedMovieId(movie.id);
    setSelectedMovieTitle(movie.title);
    setDetail("");
    setDetailError(null);
    setIsLoadingDetail(true);

    try {
      const res = await fetch(`http://localhost:8080/api/movies/${movie.id}/revenue-detail`);
      if (!res.ok) {
        throw new Error("Không thể tải chi tiết doanh thu");
      }

      const data = await res.json();
      setDetail(data.detail || "");
    } catch (err) {
      setDetailError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Thống kê doanh thu phim</h1>

      {/* Doanh thu tổng tất cả phim */}
      <div className={styles.totalAllWrapper}>
        <span className={styles.totalAllLabel}>Tổng doanh thu tất cả phim:</span>
        <span className={styles.totalAllValue}>{formatCurrency(totalAllMovies)}</span>
      </div>

      {/* Khu vực bảng phim */}
      <div className={styles.tableSection}>
        <h2 className={styles.sectionTitle}>Danh sách phim</h2>

        {isLoadingMovies && <p>Đang tải danh sách phim...</p>}
        {moviesError && <p className={styles.errorText}>{moviesError}</p>}

        {!isLoadingMovies && !moviesError && (
          <div className={styles.tableWrapper}>
            <table className={styles.movieTable}>
              <thead>
                <tr>
                  <th style={{ width: "120px" }}>Mã phim</th>
                  <th>Tên phim</th>
                  <th style={{ width: "220px" }}>Tổng doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>{movie.id}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.movieTitleButton}
                        onClick={() => handleMovieClick(movie)}
                      >
                        {movie.title}
                      </button>
                    </td>
                    <td className={styles.revenueCell}>
                      {formatCurrency(movie.totalRevenue)}
                    </td>
                  </tr>
                ))}
                {movies.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      Không có dữ liệu phim.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel chi tiết doanh thu 1 phim */}
      <div className={styles.detailSection}>
        <h2 className={styles.sectionTitle}>Chi tiết doanh thu theo suất chiếu</h2>

        {!selectedMovieId && (
          <p>Hãy bấm vào tên một bộ phim trong bảng để xem chi tiết.</p>
        )}

        {selectedMovieId && (
          <>
            <p className={styles.selectedMovieInfo}>
              Phim được chọn: <strong>{selectedMovieTitle}</strong> ({selectedMovieId})
            </p>

            {isLoadingDetail && <p>Đang tải chi tiết doanh thu...</p>}
            {detailError && <p className={styles.errorText}>{detailError}</p>}

            {!isLoadingDetail && !detailError && detail && (
              <pre className={styles.detailBox}>{detail}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}
