import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuanLyThuoc({ token }) {
  const [danhSachThuoc, setDanhSachThuoc] = useState([]);

  // Form Thêm thuốc mới
  const [tenThuoc, setTenThuoc] = useState('');
  const [giaTien, setGiaTien] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [donvi, setdonvi] = useState('');

  // Chạy ngay khi Component được load
  useEffect(() => {
    layDanhSachThuoc();
  }, []);

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  // 1. GET: Lấy danh sách thuốc
  const layDanhSachThuoc = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Medicine/Get_All_Medicine_In_Stock', axiosConfig);
      setDanhSachThuoc(res.data.data || res.data.Data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // 2. POST: Thêm thuốc mới
  const xuLyThemThuoc = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7071/api/Medicine/Add_Medicine_To_Stock', {
        name: tenThuoc,
        unitPrice: parseFloat(giaTien),
        stockQuantity: parseInt(soLuong),
        unit: donvi
      }, axiosConfig);

      alert('✅ Thêm thuốc thành công!');
      setTenThuoc('');
      setGiaTien('');
      setSoLuong('');
      setdonvi('');
      layDanhSachThuoc();
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert('⛔ Lỗi 403: Bạn bị chặn! Hãy kiểm tra lại [Authorize] ở MedicineController');
      } else {
        alert('Lỗi khi thêm thuốc!');
      }
      console.log(err);
    }
  };

  // 3. PUT: Bật/Tắt trạng thái thuốc
  const toggleTrangThai = async (id, trangThaiHienTai) => {
    try {
      // Đưa tham số MedicineID và Status lên thẳng URL thay vì để trong Body
      await axios.put(
        `https://localhost:7071/api/Medicine/Update_Medicine_Status?MedicineID=${id}&Status=${!trangThaiHienTai}`,
        null,
        axiosConfig
      );

      layDanhSachThuoc();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái!');
      console.log(err);
    }
  };

  // 4. PUT: Cập nhật giá thuốc
  const capNhatGiaThuoc = async (id, currentPrice) => {
    const newPriceInput = prompt('Nhập giá mới (VNĐ):', currentPrice || 0);
    if (newPriceInput === null) return;

    const newPrice = parseFloat(newPriceInput);
    if (Number.isNaN(newPrice) || newPrice <= 0) {
      alert('Giá thuốc không hợp lệ!');
      return;
    }

    try {
      await axios.put('https://localhost:7071/api/Medicine/Update_Medicine_Price', {
        medicineID: id,
        newPrice
      }, axiosConfig);
      alert('✅ Cập nhật giá thuốc thành công!');
      layDanhSachThuoc();
    } catch (err) {
      alert('Lỗi cập nhật giá thuốc!');
      console.log(err);
    }
  };

  // 5. PUT: Cập nhật tồn kho thuốc
  const capNhatTonKho = async (id) => {
    const soLuongThemInput = prompt('Nhập số lượng cần thêm vào kho:', '0');
    if (soLuongThemInput === null) return;

    const addedQuantity = parseInt(soLuongThemInput);
    if (Number.isNaN(addedQuantity) || addedQuantity <= 0) {
      alert('Số lượng thêm vào kho không hợp lệ!');
      return;
    }

    try {
      await axios.put('https://localhost:7071/api/Medicine/Update_Medicine_Stock', {
        medicineID: id,
        addedQuantity
      }, axiosConfig);
      alert('✅ Cập nhật tồn kho thành công!');
      layDanhSachThuoc();
    } catch (err) {
      alert('Lỗi cập nhật tồn kho!');
      console.log(err);
    }
  };

  const layGiaTri = (thuoc, keyCamel, keyPascal, fallback = '') => thuoc[keyCamel] ?? thuoc[keyPascal] ?? fallback;

  const styles = {
    page: {
      padding: '20px',
      background: '#f4f7fb',
      minHeight: '100vh'
    },
    title: {
      margin: 0,
      color: '#1f2a37',
      fontSize: '28px'
    },
    subtitle: {
      marginTop: '6px',
      marginBottom: '24px',
      color: '#6b7280'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      gap: '20px',
      alignItems: 'start'
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)'
    },
    cardHeader: {
      padding: '16px 18px',
      borderBottom: '1px solid #eef2f7',
      fontWeight: '700',
      color: '#111827'
    },
    cardBody: {
      padding: '16px 18px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      marginBottom: '12px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    submitButton: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '8px',
      border: 'none',
      background: '#16a34a',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer'
    },
    tableWrap: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      background: '#111827',
      color: 'white',
      padding: '12px',
      fontSize: '14px',
      textAlign: 'left',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #eef2f7',
      verticalAlign: 'middle',
      color: '#1f2937'
    },
    statusBadge: (isActive) => ({
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '700',
      color: isActive ? '#166534' : '#b91c1c',
      background: isActive ? '#dcfce7' : '#fee2e2'
    }),
    actionGroup: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    actionBtn: (bg) => ({
      padding: '6px 10px',
      borderRadius: '6px',
      border: 'none',
      background: bg,
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer'
    }),
    lowStock: {
      color: '#dc2626',
      fontWeight: '700'
    },
    normalStock: {
      color: '#111827',
      fontWeight: '600'
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>💊 Quản Lý Kho Thuốc</h2>
      <p style={styles.subtitle}>Thêm thuốc mới, chỉnh giá, cập nhật tồn kho và khóa/mở bán nhanh.</p>

      <div style={styles.layout}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>➕ Nhập Thuốc Mới</div>
          <div style={styles.cardBody}>
            <form onSubmit={xuLyThemThuoc}>
              <input
                type="text"
                value={tenThuoc}
                onChange={(e) => setTenThuoc(e.target.value)}
                required
                placeholder="Tên thuốc (VD: Panadol)"
                style={styles.input}
              />
              <input
                type="number"
                value={giaTien}
                onChange={(e) => setGiaTien(e.target.value)}
                required
                placeholder="Giá bán (VNĐ)"
                style={styles.input}
              />
              <input
                type="number"
                value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                required
                placeholder="Số lượng nhập kho"
                style={styles.input}
              />
              <input
                type="text"
                value={donvi}
                onChange={(e) => setdonvi(e.target.value)}
                required
                placeholder="Đơn vị (VD: Viên, Vỉ, Lọ, Tuýp)"
                style={styles.input}
              />
              <button type="submit" style={styles.submitButton}>Nhập Kho</button>
            </form>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>📦 Danh Sách Thuốc Trong Kho</div>
          <div style={styles.cardBody}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tên Thuốc</th>
                    <th style={styles.th}>Đơn vị</th>
                    <th style={styles.th}>Tồn kho</th>
                    <th style={styles.th}>Giá bán</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachThuoc.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#dc2626', fontWeight: '600' }}>
                        Chưa có thuốc nào trong kho.
                      </td>
                    </tr>
                  ) : (
                    danhSachThuoc.map((thuoc, i) => {
                      const id = layGiaTri(thuoc, 'id', 'Id');
                      const ten = layGiaTri(thuoc, 'name', 'Name');
                      const donVi = layGiaTri(thuoc, 'unit', 'Unit');
                      const tonKho = layGiaTri(thuoc, 'stockQuantity', 'StockQuantity', 0);
                      const gia = layGiaTri(thuoc, 'unitPrice', 'UnitPrice', 0);
                      const isActive = layGiaTri(thuoc, 'isActive', 'IsActive', false);

                      return (
                        <tr key={id || i} style={{ background: isActive ? '#fff' : '#fff5f5' }}>
                          <td style={{ ...styles.td, fontWeight: '700', color: '#2563eb' }}>{ten}</td>
                          <td style={styles.td}>{donVi}</td>
                          <td style={{ ...styles.td, ...(tonKho < 10 ? styles.lowStock : styles.normalStock) }}>
                            {tonKho}{' '}
                            {tonKho < 10 && <span style={{ fontSize: '12px' }}>(Sắp hết)</span>}
                          </td>
                          <td style={styles.td}>{Number(gia).toLocaleString()} đ</td>
                          <td style={styles.td}>
                            <span style={styles.statusBadge(isActive)}>
                              {isActive ? 'Đang bán' : 'Ngừng bán'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.actionGroup}>
                              <button
                                onClick={() => capNhatGiaThuoc(id, gia)}
                                style={styles.actionBtn('#2563eb')}
                              >
                                Cập nhật giá
                              </button>
                              <button
                                onClick={() => capNhatTonKho(id)}
                                style={styles.actionBtn('#ea580c')}
                              >
                                Cập nhật tồn kho
                              </button>
                              <button
                                onClick={() => toggleTrangThai(id, isActive)}
                                style={styles.actionBtn(isActive ? '#dc2626' : '#16a34a')}
                              >
                                {isActive ? 'Khóa' : 'Mở khóa'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}