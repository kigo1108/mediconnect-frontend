import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_URL;
export default function RegisterPage() {
  // 1. Khai báo state lưu dữ liệu người dùng nhập
  const [step, setStep] = useState(1); // Quản lý màn hình: 1 = Đăng ký, 2 = Nhập OTP
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Thêm trường Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState(''); // Thêm trường OTP
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  

  // 2. Hàm xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Payload gửi lên C# (phải khớp với RegisterRequest.cs)
      const payload = {
        FullName: fullName,
        Username: username,
        Email: email, // Bắn thêm Email lên Backend
        Password: password
      };

      const response = await axios.post(`${API_BASE_URL}/api/Auth/register`, payload);
      
      // Thành công thì chuyển sang bước 2 (Nhập OTP)
      alert("✅ Đã gửi mã OTP về Email của bạn. Vui lòng kiểm tra!");
      setStep(2); 

    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      alert("❌ Đăng ký thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm xử lý Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/Auth/verify-otp`, {
        email: email, 
        otpCode: otpCode
      });
      
      if (response.data.success) {
        alert('✅ Xác thực thành công! Giờ bạn có thể đăng nhập.');
        navigate('/login'); // Xác thực xong mới đá sang trang Login
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || 'Mã OTP sai hoặc đã hết hạn'));
    } finally {
      setLoading(false);
    }
  };

  // 4. Giao diện Form
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      {step === 1 ? (
        <>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Tạo Tài Khoản Mới</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>Tham gia hệ thống MediConnect ngay hôm nay</p>
          
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder="Họ và tên (Ví dụ: Nguyễn Văn A)" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              {/* Ô nhập Email mới */}
              <input type="email" placeholder="Địa chỉ Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength="6" />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <input type="password" placeholder="Xác nhận lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required minLength="6" />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
            </button>
          </form>

          <div style={{ marginTop: '25px', fontSize: '14px', color: '#6b7280' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập ngay</Link>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Xác Thực Email</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>Chúng tôi đã gửi mã 6 số tới email <b>{email}</b></p>
          
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '25px' }}>
              <input type="text" placeholder="Nhập mã OTP (6 số)" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} maxLength="6" style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '3px' }} required />
            </div>
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
              {loading ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN OTP'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// Style dùng chung cho các ô input
const inputStyle = { width: '90%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' };