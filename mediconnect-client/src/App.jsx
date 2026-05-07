import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';

// === 1. CORE & AUTH ===
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// === 2. PATIENT PORTAL ===
import PatientDashboard from './pages/patient/PatientDashboard';
import DatLichKham from './pages/patient/DatLichKham';
import HoSoCaNhan from './pages/patient/HoSoCaNhan';
import LichSuKham from './pages/patient/Lichsukham';
import XemLichBacSi from './pages/patient/XemLichBacSi';

// === 3. DOCTOR PORTAL ===
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ExaminationPage from './pages/doctor/ExaminationPage';
import PrintPrescription from './pages/doctor/PrintPrescription';

// === 4. ADMIN PORTAL ===
import AdminDashboard from './pages/admin/AdminDashboard';
import QuanLyKhoa from './pages/admin/QuanLyKhoa';
import QuanLyThuoc from './pages/admin/QuanLyThuoc';
import QuanLyNhanSu from './pages/admin/QuanLyNhanSu';
import QuanLyLichTruc from './pages/admin/QuanLyLichTruc';
import InvoicePage from './pages/InvoicePage';

// === 5. Notification ===
import NotificationBell from './components/NotificationBell';


// === 6. Payment ===
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setRole('');
    window.location.href = '/';
  };

  const isRole = (checkRole) => role?.toLowerCase() === checkRole.toLowerCase();

  return (
    <BrowserRouter>
      
      {/* NAVBAR TRANG TRÍ */}
      <nav style={navStyle}>
        <Link to="/" style={{ fontWeight: '800', fontSize: '22px', color: 'white', textDecoration: 'none' }}>
          🏥 MediConnect
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {!token ? (
            <Link to="/login" style={linkStyle}>🔑 Đăng Nhập Hệ Thống</Link>
          ) : (
            <>
              {/* Menu theo quyền hạn */}
              {isRole('Patient') && (
                <>
                  <Link to="/patient" style={linkStyle}>Lịch hẹn</Link>
                  <Link to="/ho-so-ca-nhan" style={linkStyle}>Hồ sơ cá nhân</Link>
                  <Link to="/xem-lich-bac-si" style={linkStyle}>Tra cứu bác sĩ</Link>
                  <Link to="/lich-su-kham" style={linkStyle}>Sổ khám</Link>
                  <Link to="/invoices" style={linkStyle}>Thanh toán</Link>
                  <Link to="/dat-lich" style={btnOrderStyle}>➕ Đặt lịch ngay</Link>
                </>
              )}

              {isRole('Doctor') && (
                <Link to="/doctor" style={linkStyle}>👨‍⚕️ Trang khám bệnh</Link>
              )}

              {isRole('Admin') && (
                <>
                  <Link to="/admin" style={linkStyle}>📊 Trang quản trị</Link>
                  {/* <Link to="/invoices" style={linkStyle}>💳 Thu ngân</Link> */}
                </>
              )}
              {token && <NotificationBell />}

              <button onClick={handleLogout} style={btnLogoutStyle}>Đăng xuất</button>
            </>
          )}
        </div>
      </nav>

      {/* ĐỊNH TUYẾN HỆ THỐNG */}
      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Trang chủ & Đăng nhập */}
          <Route path="/" element={<HomePage token={token} role={role} />} />
          <Route path="/login" element={<LoginPage setToken={setToken} setRole={setRole} />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Routes Bệnh Nhân */}
          <Route path="/patient" element={<PatientDashboard token={token} />} />
          <Route path="/dat-lich" element={<DatLichKham token={token} />} />
          <Route path="/ho-so-ca-nhan" element={<HoSoCaNhan token={token} />} />
          <Route path="/lich-su-kham" element={<LichSuKham token={token} />} />
          <Route path="/xem-lich-bac-si" element={<XemLichBacSi token={token} />} />
          <Route path="/invoices" element={<InvoicePage token={token} role={role} />} />

          {/* Routes Bác Sĩ */}
          <Route path="/doctor" element={<DoctorDashboard token={token} />} />
          <Route path="/exam/:appointmentId" element={<ExaminationPage token={token} />} />
          <Route path="/print/:recordId" element={<PrintPrescription token={token} />} />

          {/* Routes Admin */}
          <Route path="/admin" element={<AdminDashboard token={token} />} />
          <Route path="/admin/khoa" element={<QuanLyKhoa token={token} />} />
          <Route path="/admin/thuoc" element={<QuanLyThuoc token={token} />} />
          <Route path="/admin/nhan-su" element={<QuanLyNhanSu token={token} />} />
          <Route path="/admin/lich-truc" element={<QuanLyLichTruc token={token} />} />

          {/* Routes Payment */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* Mặc định quay về Home (Bỏ comment nếu muốn dùng) */}
          {/* <Route path="*" element={<Navigate to="/" />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// CSS phục vụ Navbar
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#1e293b', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const linkStyle = { color: 'white', textDecoration: 'none', fontSize: '15px', fontWeight: '500' };
const btnOrderStyle = { backgroundColor: '#10b981', padding: '8px 18px', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: 'bold' };
const btnLogoutStyle = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default App;