import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function PatientDashboard({ token }) {
  const [danhSachLich, setDanhSachLich] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  // Từ điển dịch trạng thái từ Enum C# (0-4) sang Tiếng Việt và Màu sắc
  const getStatusInfo = (statusRaw) => {
    const s = String(statusRaw).toLowerCase();
    switch (s) {
      case '0': case 'scheduled':
        return { text: 'Chờ Check-in', color: '#ffc107', bg: '#fffdf5' };
      case '1': case 'checkedin':
        return { text: 'Đã lấy số', color: '#17a2b8', bg: '#f0faff' };
      case '2': case 'inprogress':
        return { text: 'Đang khám', color: '#6f42c1', bg: '#f8f5ff' };
      case '3': case 'completed':
        return { text: 'Đã hoàn thành', color: '#28a745', bg: '#f6fff8' };
      case '4': case 'canceled':
        return { text: 'Đã hủy', color: '#dc3545', bg: '#fff5f5' };
      default:
        return { text: 'N/A', color: '#6c757d', bg: '#f8f9fa' };
    }
  };

  useEffect(() => {
    layDanhSachLichCuaToi();
  }, [token]);

  const layDanhSachLichCuaToi = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Appointment/GetAllApointment', axiosConfig);
      setDanhSachLich(res.data.data || res.data.Data || []);
    } catch (err) {
      setDanhSachLich([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId) => {
    try {
      const res = await axios.post(`https://localhost:7071/api/Appointment/${appointmentId}/check-in`, {}, axiosConfig);
      alert(`✅ Thành công! Số thứ tự của bạn là: ${res.data.QueueNumber || res.data.queueNumber}`);
      layDanhSachLichCuaToi();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi Check-in");
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>👋 Xin chào Bệnh nhân</h2>
          <p style={{ margin: '5px 0 0', color: '#7f8c8d' }}>Chào mừng bạn quay lại hệ thống MediConnect</p>
        </div>
        <Link to="/dat-lich" style={{ 
          padding: '12px 24px', background: '#28a745', color: 'white', 
          textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)' 
        }}>
          ➕ Đặt lịch khám mới
        </Link>
      </div>

      {/* QUICK STATS / NAVIGATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={statCardStyle}>
          <span style={{ fontSize: '24px' }}>📅</span>
          <h4 style={{ margin: '10px 0' }}>Lịch hẹn sắp tới</h4>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            {danhSachLich.filter(l => String(l.Status || l.status) === '0').length}
          </p>
        </div>
        <Link to="/ho-so-ca-nhan" style={{ ...statCardStyle, textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '24px' }}>👤</span>
          <h4 style={{ margin: '10px 0' }}>Hồ sơ cá nhân</h4>
          <p style={{ fontSize: '14px', color: '#007bff' }}>Cập nhật thông tin →</p>
        </Link>
        <Link to="/lich-su-kham" style={{ ...statCardStyle, textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '24px' }}>📜</span>
          <h4 style={{ margin: '10px 0' }}>Lịch sử bệnh án</h4>
          <p style={{ fontSize: '14px', color: '#007bff' }}>Xem chi tiết đơn thuốc →</p>
        </Link>
        <Link to="/xem-lich-bac-si" style={{ ...statCardStyle, textDecoration: 'none', color: 'inherit' }}>
          <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
          <h4 style={{ margin: '10px 0' }}>Tra cứu Bác sĩ</h4>
          <p style={{ fontSize: '14px', color: '#007bff' }}>Xem lịch trực chuyên gia →</p>
        </Link>
      </div>

      {/* APPOINTMENT TABLE */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>📝</span> Quản lý lịch hẹn khám
        </h3>
        
        {loading ? (
          <p>⏳ Đang tải dữ liệu...</p>
        ) : danhSachLich.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#95a5a6' }}>Bạn chưa có lịch hẹn nào. Hãy đặt lịch ngay!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f1f1' }}>
                <th style={thStyle}>Thời gian</th>
                <th style={thStyle}>Thông tin khám</th>
                <th style={thStyle}>Số thứ tự</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachLich.map((lich, i) => {
                const dateObj = new Date(lich.AppointmentDate || lich.appointmentDate);
                const statusInfo = getStatusInfo(lich.Status || lich.status);
                const statusStr = String(lich.Status || lich.status).toLowerCase();
                
                const today = new Date();
                const isToday = dateObj.toDateString() === today.toDateString();
                const canCheckIn = (statusStr === '0' || statusStr === 'scheduled') && isToday;

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', transition: '0.3s' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>{dateObj.toLocaleDateString('vi-VN')}</div>
                      <div style={{ fontSize: '13px', color: '#95a5a6' }}>{dateObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold' }}>{lich.DepartmentName || lich.departmentName}</div>
                      <div style={{ fontSize: '13px' }}>BS. {lich.DoctorName || lich.doctorName}</div>
                    </td>
                    <td style={tdStyle}>
                      {(lich.QueueNumber || lich.queueNumber) ? (
                        <div style={queueBadgeStyle}>{lich.QueueNumber || lich.queueNumber}</div>
                      ) : <span style={{ color: '#bdc3c7' }}>---</span>}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        color: statusInfo.color, backgroundColor: statusInfo.bg
                      }}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {canCheckIn ? (
                        <button onClick={() => handleCheckIn(lich.AppointmentId || lich.appointmentId)} style={btnCheckInStyle}>
                          Check-in
                        </button>
                      ) : (statusStr === '0' || statusStr === 'scheduled') && !isToday ? (
                        <span style={lockLabelStyle}>Chưa đến ngày</span>
                      ) : <span style={{ color: '#bdc3c7' }}>-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// CSS OBJECTS
const statCardStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid #f1f1f1'
};
const thStyle = { padding: '15px', color: '#7f8c8d', fontSize: '14px', fontWeight: '600' };
const tdStyle = { padding: '15px', verticalAlign: 'middle' };
const queueBadgeStyle = {
  width: '32px', height: '32px', borderRadius: '50%', background: '#28a745', 
  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
};
const btnCheckInStyle = {
  padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
};
const lockLabelStyle = {
  fontSize: '11px', color: '#856404', background: '#fff3cd', padding: '4px 8px', borderRadius: '4px'
};