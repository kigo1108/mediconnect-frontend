import { useState, useEffect } from 'react';
import axios from 'axios';

// ĐÃ THÊM 'export default' Ở ĐÂY ĐỂ TRÁNH LỖI!
export default function QuanLyKhoa({ token }) {
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [tenKhoa, setTenKhoa] = useState('');

  useEffect(() => { 
    layDanhSachKhoa(); 
  }, []);

  const layDanhSachKhoa = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Department/Get_All_Department');
      setDanhSachKhoa(res.data.data || res.data.Data || []);
    } catch (err) { 
      console.log(err); 
    }
  };

  const xuLyThemKhoa = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://localhost:7071/api/Department/Create_Department', 
        { name: tenKhoa }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert("✅ Thêm Khoa thành công!");
      setTenKhoa('');
      layDanhSachKhoa();
    } catch (err) { 
      // NẾU BACKEND CỦA BẠN (MIDDLEWARE) TRẢ VỀ LỖI
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data; 

        if (status === 401) {
          alert("⛔ LỖI: Bạn chưa đăng nhập hoặc Token đã hết hạn!");
        } 
        else if (status === 403) {
          alert("⛔ LỖI: Bạn không phải là Admin! Khỏi thêm!");
        } 
        // Bắt chính xác cái lỗi từ ExceptionMiddleware của bạn!
        else if (status === 400 || status === 404 || status === 500) {
          // Lấy đúng cái chữ 'message' từ cục JSON
          alert(`⚠️ Lỗi: ${data.message}`); 
        } 
        else {
          alert(`⚠️ Máy chủ báo lỗi mã ${status}`);
        }
      } 
      // Lỗi sập server, sai cổng...
      else if (err.request) {
        alert("🔌 Không kết nối được với Backend. Đã bật chưa sếp?");
      } 
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🏥 QUẢN LÝ DANH MỤC KHOA</h2>
      <hr style={{ borderColor: '#eee' }} />
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* CỘT TRÁI: THÊM KHOA */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#f8f9fa', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>➕ Thêm Khoa Mới</h3>
          <form onSubmit={xuLyThemKhoa}>
            <input 
              type="text" 
              value={tenKhoa} 
              onChange={(e) => setTenKhoa(e.target.value)} 
              required 
              placeholder="Nhập tên Khoa (VD: Khoa Nhi)..." 
              style={{ width: '90%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
            <button 
              type="submit" 
              style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', width: '95%' }}>
              Lưu Khoa
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH */}
        <div style={{ flex: 2 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>STT</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên Khoa</th>
              </tr>
            </thead>
            <tbody>
              {danhSachKhoa.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ padding: '20px', color: 'red' }}>Chưa có Khoa nào trong hệ thống!</td>
                </tr>
              ) : (
                danhSachKhoa.map((k, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', backgroundColor: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{i + 1}</td>
                    <td style={{ padding: '12px', color: '#007bff', fontWeight: 'bold', border: '1px solid #ddd' }}>
                      {k.name || k.tenKhoa}
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