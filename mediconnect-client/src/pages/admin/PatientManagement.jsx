import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PatientManagement({ token }) {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL;


  // Cấu hình Header chứa Token để gửi kèm API Admin
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 1. HÀM TẢI DANH SÁCH BỆNH NHÂN
  const fetchPatients = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/Admin/Get_All_Patients?search=${searchQuery}`,
        axiosConfig
      );
      // Hỗ trợ cả 2 chuẩn viết hoa/thường từ Backend trả về
      setPatients(res.data.data || res.data.Data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách bệnh nhân:', err);
      alert('Không thể tải dữ liệu bệnh nhân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Chạy lần đầu khi mở trang
  useEffect(() => {
    fetchPatients();
  }, []);

  // Xử lý khi ấn nút Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  // 2. HÀM XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleLock = async (patientId, isCurrentlyLocked, patientName) => {
    const actionText = isCurrentlyLocked ? 'MỞ KHÓA' : 'KHÓA';
    
    if (!window.confirm(`⚠️ Bạn có chắc chắn muốn ${actionText} tài khoản của bệnh nhân [${patientName}] không?`)) {
      return;
    }

    setProcessingId(patientId); // Hiển thị trạng thái đang xử lý cho riêng nút này
    try {
      await axios.put(
        `${API_BASE_URL}/api/Admin/Toggle_Lock_Patient/${patientId}`,
        {},
        axiosConfig
      );
      
      // Thành công -> Cập nhật lại UI ngay lập tức mà không cần gọi lại toàn bộ API
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.patientId === patientId || p.PatientId === patientId
            ? { ...p, isLocked: !isCurrentlyLocked, IsLocked: !isCurrentlyLocked }
            : p
        )
      );
    } catch (err) {
      console.error(`Lỗi khi ${actionText.toLowerCase()} tài khoản:`, err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản!');
    } finally {
      setProcessingId(null);
    }
  };

  // Helper format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ padding: '20px', background: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        {/* TIÊU ĐỀ VÀ THANH TÌM KIẾM */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>👤 Quản lý Bệnh nhân</h2>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Nhập tên hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={btnSearchStyle}>
              🔍 Tìm kiếm
            </button>
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => { setSearchTerm(''); fetchPatients(''); }} 
                style={btnClearStyle}
              >
                Xóa lọc
              </button>
            )}
          </form>
        </div>

        {/* BẢNG DỮ LIỆU */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>STT</th>
                  <th style={thStyle}>Họ và Tên</th>
                  <th style={thStyle}>Số điện thoại</th>
                  <th style={thStyle}>Ngày tham gia</th>
                  <th style={thStyle}>Số lần khám</th>
                  <th style={thStyle}>Trạng thái</th>
                  <th style={thStyle}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((p, index) => {
                    const id = p.patientId || p.PatientId;
                    const name = p.patientName || p.PatientName;
                    const phone = p.phoneNumber || p.PhoneNumber || 'Chưa cập nhật';
                    const isLocked = p.isLocked !== undefined ? p.isLocked : p.IsLocked;
                    const totalAppointments = p.totalAppointments || p.TotalAppointments || 0;
                    const createdAt = p.createdAt || p.CreatedAt;

                    return (
                      <tr key={id} style={trStyle}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#2c3e50' }}>{name}</td>
                        <td style={tdStyle}>{phone}</td>
                        <td style={tdStyle}>{formatDate(createdAt)}</td>
                        <td style={tdStyle}>
                          <span style={badgeStyle}>{totalAppointments} lượt</span>
                        </td>
                        <td style={tdStyle}>
                          {isLocked ? (
                            <span style={{ ...statusBadgeStyle, background: '#f8d7da', color: '#721c24' }}>
                              🔴 Đã khóa
                            </span>
                          ) : (
                            <span style={{ ...statusBadgeStyle, background: '#d4edda', color: '#155724' }}>
                              🟢 Hoạt động
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleToggleLock(id, isLocked, name)}
                            disabled={processingId === id}
                            style={{
                              ...btnActionStyle,
                              background: isLocked ? '#28a745' : '#dc3545',
                              opacity: processingId === id ? 0.6 : 1,
                            }}
                          >
                            {processingId === id 
                              ? 'Đang xử lý...' 
                              : (isLocked ? '🔓 Mở khóa' : '🔒 Khóa TK')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      Không tìm thấy bệnh nhân nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES GIAO DIỆN MẶC ĐỊNH ---
const inputStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  width: '250px',
  outline: 'none'
};

const btnSearchStyle = {
  padding: '8px 15px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const btnClearStyle = {
  padding: '8px 15px',
  background: '#e0e0e0',
  color: '#333',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '10px'
};

const thStyle = {
  background: '#f8f9fa',
  color: '#495057',
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '2px solid #dee2e6',
  fontWeight: '600'
};

const tdStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #e9ecef',
  verticalAlign: 'middle'
};

const trStyle = {
  transition: 'background-color 0.2s',
  ':hover': { background: '#f1f3f5' }
};

const badgeStyle = {
  background: '#e9ecef',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#495057'
};

const statusBadgeStyle = {
  padding: '5px 10px',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 'bold'
};

const btnActionStyle = {
  padding: '6px 12px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '13px',
  transition: 'transform 0.1s',
};