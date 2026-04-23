import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  // 1. Khai báo state lưu dữ liệu người dùng nhập
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        Password: password
      };

      const response = await axios.post('https://localhost:7071/api/Auth/register', payload);
      
      // Thành công
      alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login'); // Chuyển hướng sang trang đăng nhập

    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      alert("❌ Đăng ký thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 3. Giao diện Form
  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Tạo Tài Khoản Mới</h2>
      <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>Tham gia hệ thống MediConnect ngay hôm nay</p>
      
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Họ và tên (Ví dụ: Nguyễn Văn A)" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            minLength="6"
          />
        </div>
        <div style={{ marginBottom: '25px' }}>
          <input 
            type="password" 
            placeholder="Xác nhận lại mật khẩu" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            required
            minLength="6"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
          {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
        </button>
      </form>

      <div style={{ marginTop: '25px', fontSize: '14px', color: '#6b7280' }}>
        Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập ngay</Link>
      </div>
    </div>
  );
}

// Style dùng chung cho các ô input
const inputStyle = { width: '90%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box' };