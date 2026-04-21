import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuanLyThuoc({ token }) {
  const [danhSachThuoc, setDanhSachThuoc] = useState([]);
  
  // Form Thêm thuốc mới
  const [tenThuoc, setTenThuoc] = useState('');
  const [giaTien, setGiaTien] = useState('');
  const [soLuong, setSoLuong] = useState('');
  const [donvi, setdonvi] =useState('');

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
    } catch (err) { console.log(err); }
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
      
      alert("✅ Thêm thuốc thành công!");
      setTenThuoc(''); setGiaTien(''); setSoLuong(''); setdonvi('');
      layDanhSachThuoc(); 
    } catch (err) { 
      if (err.response && err.response.status === 403) {
        alert("⛔ Lỗi 403: Bạn bị chặn! Hãy kiểm tra lại [Authorize] ở MedicineController");
      } else {
        alert("Lỗi khi thêm thuốc!"); 
      }
      console.log(err); 
    }
  };

  // 3. PUT: Bật/Tắt trạng thái thuốc
  const toggleTrangThai = async (id, trangThaiHienTai) => {
    try {
      // Đưa tham số MedicineID và Status lên thẳng URL thay vì để trong Body
      await axios.put(`https://localhost:7071/api/Medicine/Update_Medicine_Status?MedicineID=${id}&Status=${!trangThaiHienTai}`, 
      null, // Body để null
      axiosConfig);
      
      layDanhSachThuoc(); 
    } catch (err) { 
      alert("Lỗi cập nhật trạng thái!"); 
      console.log(err);
    }
  };
  return (
    <div>
      <h2>💊 QUẢN LÝ KHO THUỐC</h2>
      <hr />
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        {/* FORM THÊM THUỐC */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', height: 'fit-content' }}>
          <h3>➕ Nhập Thuốc Mới</h3>
          <form onSubmit={xuLyThemThuoc}>
            <input type="text" value={tenThuoc} onChange={(e) => setTenThuoc(e.target.value)} required placeholder="Tên thuốc (VD: Panadol)" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
            <input type="number" value={giaTien} onChange={(e) => setGiaTien(e.target.value)} required placeholder="Giá bán (VNĐ)" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
            <input type="number" value={soLuong} onChange={(e) => setSoLuong(e.target.value)} required placeholder="Số lượng nhập kho" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
            <input type="text" value={donvi} onChange={(e) => setdonvi(e.target.value)} required placeholder="Đơn vị (VD: Viên, Vỉ, Lọ, Tuýp)" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
            <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', width: '95%' }}>Nhập Kho</button>
          </form>
        </div>

       {/* BẢNG DANH SÁCH THUỐC */}
        <div style={{ flex: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#333', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên Thuốc</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Đơn vị</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tồn kho</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Giá bán</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachThuoc.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '10px', color: 'red' }}>Chưa có thuốc nào trong kho.</td></tr>
              ) : (
                danhSachThuoc.map((thuoc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', backgroundColor: thuoc.isActive ? 'white' : '#ffe6e6' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#007bff', border: '1px solid #ddd' }}>{thuoc.name || thuoc.Name}</td>
                    
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{thuoc.unit || thuoc.Unit}</td>
                    
                    <td style={{ padding: '10px', color: (thuoc.stockQuantity || thuoc.StockQuantity) < 10 ? 'red' : 'black', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {thuoc.stockQuantity || thuoc.StockQuantity} {(thuoc.stockQuantity || thuoc.StockQuantity) < 10}
                    </td>
                    
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(thuoc.unitPrice || thuoc.UnitPrice)?.toLocaleString()} đ</td>
                    
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{ color: thuoc.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                            {thuoc.isActive ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                        </td>

                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button 
                            onClick={() => toggleTrangThai(thuoc.id || thuoc.Id, thuoc.isActive)}
                            style={{ padding: '5px 10px', background: thuoc.isActive ? '#dc3545' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                            {thuoc.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}