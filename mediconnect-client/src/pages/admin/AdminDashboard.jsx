import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import 4 mảnh ghép (Bắt buộc 4 file này phải có chữ 'export default' ở trong nhé)
import QuanLyKhoa from "./QuanLyKhoa";
import QuanLyThuoc from "./QuanLyThuoc";
import QuanLyNhanSu from "./QuanLyNhanSu";
import QuanLyLichTruc from "./QuanLyLichTruc";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('khoa');
  const token = localStorage.getItem('token');

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!token) {
      alert("Bạn chưa đăng nhập! Vui lòng xuất trình thẻ.");
      navigate('/');
    }
  }, [token, navigate]);

  // Bộ điều hướng nội dung
  const renderContent = () => {
    switch (activeTab) {
      case 'khoa': return <QuanLyKhoa token={token} />;
      case 'thuoc': return <QuanLyThuoc token={token} />;
      case 'nhansu': return <QuanLyNhanSu token={token} />;
      case 'lichtruc': return <QuanLyLichTruc token={token} />;
      default: return <QuanLyKhoa token={token} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      
      {/* CỘT TRÁI: SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#f39c12', marginBottom: '30px' }}>👑 ADMIN PANEL</h3>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {['khoa', 'thuoc', 'nhansu', 'lichtruc'].map((tab) => (
            <li key={tab} style={{ marginBottom: '15px' }}>
              <button 
                onClick={() => setActiveTab(tab)} 
                style={{ 
                  width: '100%', padding: '15px', textAlign: 'left', 
                  background: activeTab === tab ? '#34495e' : 'transparent', 
                  color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                }}>
                {tab === 'khoa' ? '🏥 Quản lý Khoa' : tab === 'thuoc' ? '💊 Quản lý Thuốc' : tab === 'nhansu' ? '👨‍⚕️ Quản lý Nhân sự' : '📅 Phân ca trực'}
              </button>
            </li>
          ))}
        </ul>

        <button 
          onClick={() => { localStorage.removeItem('token'); navigate('/'); }} 
          style={{ width: '100%', padding: '10px', marginTop: '50px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Đăng Xuất
        </button>
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f4f6f9' }}>
        {renderContent()}
      </div>

    </div>
  );
}