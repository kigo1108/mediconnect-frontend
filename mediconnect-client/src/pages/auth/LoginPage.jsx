import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";


export default function LoginPage() {
  // 1. Khai báo kho chứa dữ liệu gõ vào
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  
  // Biến dùng để chuyển trang
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // 2. Hàm kích hoạt khi bấm nút Đăng nhập
 const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            UserName: taiKhoan, 
            Password: matKhau
        };

        const response = await axios.post(`${API_BASE_URL}/api/Auth/Login`, payload);
        
        // 1. IN DỮ LIỆU GỐC RA ĐỂ XEM C# TRẢ VỀ CÁI GÌ
        console.log("Dữ liệu gốc từ C# trả về:", response.data);

        // 2. TÌM TOKEN BẰNG MỌI CÁCH (Bao xài chữ hoa, chữ thường)
        const token = response.data.token || response.data.Token || response.data.data || response.data; 

        // Nếu vẫn không tìm thấy token thì dừng lại ngay để tránh lỗi màn hình đỏ
        if (!token || typeof token !== 'string') {
             console.error("Không tìm thấy Token. Hãy nhìn dòng console log phía trên xem cấu trúc dữ liệu là gì!");
             alert("Đăng nhập thành công nhưng không lấy được Token từ Server!");
             return;
        }

        // 3. LƯU TOKEN VÀO LOCAL STORAGE
        localStorage.setItem('token', token);

        // 4. GIẢI MÃ TOKEN ĐỂ LẤY ROLE
        const decodedToken = jwtDecode(token);
        console.log("Dữ liệu ẩn trong Token:", decodedToken); 
        
        // 5. MOI ROLE TỪ CLAIM CỦA .NET C# VÀ LƯU LẠI
        const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role || 'Patient';
        localStorage.setItem('role', userRole);

        // 6. Chuyển hướng về trang chủ
        navigate('/'); // Điều hướng về trang chủ
        window.location.reload(); 

    } catch (err) {
        console.error("Lỗi đăng nhập:", err); 
        alert(err.response?.data?.message||"Sai tài khoản hoặc mật khẩu!");
    }
};

  // 4. Vẽ giao diện Form đăng nhập
  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', border: '1px solid #ccc', borderRadius: '10px', marginTop: '50px' }}>
      <h2 style={{ color: '#007bff' }}>MediConnect</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Vui lòng đăng nhập để tiếp tục</p>
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={taiKhoan}
            onChange={(e) => setTaiKhoan(e.target.value)}
            style={{ width: '90%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            style={{ width: '90%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
        </div>
        <button 
          type="submit" 
          style={{ width: '95%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ĐĂNG NHẬP
        </button>
      </form>
      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        Chưa có tài khoản? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }}>Đăng ký ngay</Link>
      </div>
    </div>
  );
}