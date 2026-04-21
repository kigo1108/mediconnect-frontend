import { Link, useNavigate } from 'react-router-dom';

export default function HomePage({ token, role }) {
  const navigate = useNavigate();

  // Hàm xử lý khi người dùng click vào một cổng
  // Nếu đã đăng nhập đúng quyền -> Cho vào luôn
  // Nếu chưa đăng nhập hoặc sai quyền -> Bắt ra trang Đăng nhập
  const handlePortalClick = (requiredRole, path) => {
    if (token && role?.toLowerCase() === requiredRole.toLowerCase()) {
      navigate(path);
    } else {
      // Có thể truyền state để trang login biết người dùng muốn đăng nhập quyền gì (tùy chọn)
      navigate('/login'); 
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f4f7f6', minHeight: '90vh', margin: '-20px' }}>
      
      {/* HEADER / HERO SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #0056b3 0%, #007bff 100%)', padding: '80px 20px', textAlign: 'center', color: 'white', borderBottomLeftRadius: '50px', borderBottomRightRadius: '50px', boxShadow: '0 10px 30px rgba(0, 123, 255, 0.2)' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', fontWeight: '800', letterSpacing: '1px' }}>
          🏥 MediConnect
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6', opacity: '0.9' }}>
          Hệ thống Quản lý Bệnh viện Thông minh. Giải pháp toàn diện giúp kết nối Bệnh nhân, Bác sĩ và Nhà quản lý một cách nhanh chóng, bảo mật và hiệu quả.
        </p>
      </div>

      {/* PORTALS SECTION (Khu vực chọn Role) */}
      <div style={{ maxWidth: '1100px', margin: '-40px auto 50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '0 20px' }}>
        
        {/* CARD BỆNH NHÂN */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle('#e9f5ff', '#007bff')}>🧑‍⚕️</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Dành cho Bệnh nhân</h2>
          <p style={{ color: '#6c757d', marginBottom: '25px', lineHeight: '1.5' }}>
            Đặt lịch khám trực tuyến, tra cứu lịch sử bệnh án, xem đơn thuốc và theo dõi sức khỏe cá nhân dễ dàng.
          </p>
          <button onClick={() => handlePortalClick('Patient', '/patient')} style={{...btnStyle, backgroundColor: '#007bff', color: 'white'}}>
            Truy cập Cổng Bệnh Nhân
          </button>
        </div>

        {/* CARD BÁC SĨ */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle('#eef9f0', '#28a745')}>🩺</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Dành cho Bác sĩ</h2>
          <p style={{ color: '#6c757d', marginBottom: '25px', lineHeight: '1.5' }}>
            Quản lý danh sách bệnh nhân, cập nhật bệnh án điện tử, kê đơn thuốc và theo dõi lịch trực của cá nhân.
          </p>
          <button onClick={() => handlePortalClick('Doctor', '/doctor')} style={{...btnStyle, backgroundColor: '#28a745', color: 'white'}}>
            Truy cập Cổng Bác Sĩ
          </button>
        </div>

        {/* CARD ADMIN */}
        <div style={cardStyle}>
          <div style={iconWrapperStyle('#fff5f5', '#dc3545')}>⚙️</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>Dành cho Quản trị</h2>
          <p style={{ color: '#6c757d', marginBottom: '25px', lineHeight: '1.5' }}>
            Quản trị hệ thống, phân quyền nhân sự, điều phối lịch trực, quản lý danh mục khoa và kho thuốc bệnh viện.
          </p>
          <button onClick={() => handlePortalClick('Admin', '/admin')} style={{...btnStyle, backgroundColor: '#dc3545', color: 'white'}}>
            Truy cập Cổng Quản Trị
          </button>
        </div>

      </div>

      {/* QUICK FEATURES */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 50px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
        <div style={featureStyle}>🕒 Phục vụ 24/7</div>
        <div style={featureStyle}>🔒 Bảo mật dữ liệu y tế</div>
        <div style={featureStyle}>⚡ Tối ưu quy trình</div>
        <div style={featureStyle}>📊 Báo cáo thời gian thực</div>
      </div>
    </div>
  );
}

// CSS OBJECTS
const cardStyle = {
  backgroundColor: 'white', padding: '40px 30px', borderRadius: '15px', 
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', textAlign: 'center', transition: 'transform 0.3s ease',
  display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const iconWrapperStyle = (bg, color) => ({
  width: '80px', height: '80px', backgroundColor: bg, color: color, 
  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
  fontSize: '35px', marginBottom: '20px', boxShadow: `0 4px 15px ${bg}`
});

const btnStyle = {
  width: '100%', padding: '15px', border: 'none', borderRadius: '8px', 
  fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', marginTop: 'auto'
};

const featureStyle = {
  backgroundColor: 'white', padding: '10px 20px', borderRadius: '50px',
  color: '#495057', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '14px'
};