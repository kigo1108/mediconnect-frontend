import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function PatientDashboard({ token }) {
  const [danhSachLich, setDanhSachLich] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReschedule, setSelectedReschedule] = useState(null); 

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  const getStatusInfo = (statusRaw) => {
    const s = String(statusRaw).toLowerCase();
    switch (s) {
      case '0': case 'scheduled': return { text: 'Chờ Check-in', color: '#ffc107', bg: '#fffdf5' };
      case '1': case 'checkedin': return { text: 'Đã lấy số', color: '#17a2b8', bg: '#f0faff' };
      case '2': case 'inprogress': return { text: 'Đang khám', color: '#6f42c1', bg: '#f8f5ff' };
      case '3': case 'completed': return { text: 'Đã hoàn thành', color: '#28a745', bg: '#f6fff8' };
      case '4': case 'canceled': return { text: 'Đã hủy', color: '#dc3545', bg: '#fff5f5' };
      default: return { text: 'N/A', color: '#6c757d', bg: '#f8f9fa' };
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
      alert(`✅ Thành công! Số thứ tự là: ${res.data.QueueNumber || res.data.queueNumber}`);
      layDanhSachLichCuaToi();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi Check-in");
    }
  };
  const handleCancel = async (appointmentId) => {
  // Bật popup xác nhận để tránh bệnh nhân bấm nhầm
  if (!window.confirm("⚠️ Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.")) return;

  try {
    await axios.put(`https://localhost:7071/api/Appointment/Cancel/${appointmentId}`, {}, axiosConfig);
    alert("✅ Đã hủy lịch hẹn thành công!");
    layDanhSachLichCuaToi(); // Tự động load lại bảng để thấy trạng thái chuyển sang "Đã hủy" màu đỏ
  } catch (err) {
    alert("❌ Lỗi: " + (err.response?.data?.message || "Không thể hủy lịch này."));
  }
};

  // 🔴 THÊM HÀM NÀY: Mở Modal đổi lịch thông qua API GetById
  const openRescheduleModal = async (appointmentId) => {
    try {
      // 1. Gọi API GetById để lấy chính xác DoctorId
      const res = await axios.get(`https://localhost:7071/api/Appointment/GetById/${appointmentId}`, axiosConfig);
      const detail = res.data.data || res.data.Data;
      
      // 2. Truyền đúng dữ liệu vào Modal
      setSelectedReschedule({
        id: detail.appointmentId || detail.AppointmentId || appointmentId,
        doctorId: detail.doctorId || detail.DoctorId // Chắc chắn 100% có biến này vì GetById trả về đầy đủ
      });
    } catch (err) {
      alert("❌ Lỗi lấy thông tin lịch hẹn: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>👋 Xin chào Bệnh nhân</h2>
          <p style={{ margin: '5px 0 0', color: '#7f8c8d' }}>Chào mừng bạn quay lại hệ thống MediConnect</p>
        </div>
        <Link to="/dat-lich" style={btnLinkStyle}>➕ Đặt lịch khám mới</Link>
      </div>

      <div style={containerStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📝 Quản lý lịch hẹn khám</h3>
        {loading ? <p>⏳ Đang tải dữ liệu...</p> : danhSachLich.length === 0 ? (
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
                
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const canCheckIn = (statusStr === '0' || statusStr === 'scheduled') && isToday;
                const canReschedule = statusStr === '0' || statusStr === 'scheduled';

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canCheckIn && (
                          <button onClick={() => handleCheckIn(lich.AppointmentId || lich.appointmentId)} style={btnCheckInStyle}>
                            Check-in
                          </button>
                        )}
                        {canReschedule && (
                          <button 
                            // 🔴 SỬ DỤNG HÀM MỚI Ở ĐÂY
                            onClick={() => openRescheduleModal(lich.AppointmentId || lich.appointmentId)}
                            style={{ ...btnCheckInStyle, background: '#6c757d' }}
                          >
                            Đổi lịch
                          </button>
                        )}
                        {canReschedule && (
                        <button 
                          onClick={() => handleCancel(lich.AppointmentId || lich.appointmentId)}
                          style={{ ...btnCheckInStyle, background: '#dc3545' }} // Màu đỏ cảnh báo
                        >
                          ❌ Hủy
                        </button>
                      )}
                        {!canCheckIn && !canReschedule && <span style={{ color: '#bdc3c7' }}>-</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selectedReschedule && (
        <RescheduleModal 
          appointment={selectedReschedule} 
          token={token} 
          onClose={() => setSelectedReschedule(null)} 
          onSuccess={() => { setSelectedReschedule(null); layDanhSachLichCuaToi(); }} 
        />
      )}
    </div>
  );
}

function RescheduleModal({ appointment, token, onClose, onSuccess }) {
  const [newDate, setNewDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Chỉ gọi API khi có đủ cả newDate và doctorId (doctorId bây giờ chắc chắn khác undefined)
    if (newDate && appointment.doctorId) {
      axios.get(`https://localhost:7071/api/Schedule/Get_Doctor_Schedule?doctorId=${appointment.doctorId}&date=${newDate}`)
        .then(res => setAvailableTimes((res.data.data || res.data.Data || []).filter(ca => !ca.IsCancelled && !ca.isCancelled)))
        .catch(() => setAvailableTimes([]));
    }
  }, [newDate, appointment.doctorId]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await axios.put('https://localhost:7071/api/Appointment/Reschedule', {
        appointmentId: appointment.id,
        newAppointmentDate: `${newDate}T${selectedTime}`
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      alert("✅ Đã đổi lịch khám!");
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi đổi lịch");
    } finally { setSaving(false); }
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h4 style={{marginTop: 0}}>📅 Chọn thời gian khám mới</h4>
        <input type="date" min={new Date().toISOString().split('T')[0]} value={newDate} onChange={e => setNewDate(e.target.value)} style={inputFullStyle} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
          {availableTimes.map((ca, i) => (
            <button key={i} onClick={() => setSelectedTime(ca.startTime || ca.StartTime)} 
              style={{ padding: '8px', border: '1px solid #007bff', borderRadius: '4px', background: selectedTime === (ca.startTime || ca.StartTime) ? '#007bff' : 'white', color: selectedTime === (ca.startTime || ca.StartTime) ? 'white' : '#007bff', cursor: 'pointer' }}>
              {(ca.startTime || ca.StartTime).substring(0, 5)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleConfirm} disabled={!selectedTime || saving} style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Xác nhận</button>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const thStyle = { padding: '15px', color: '#7f8c8d', fontSize: '14px', fontWeight: '600' };
const tdStyle = { padding: '15px', verticalAlign: 'middle' };
const queueBadgeStyle = { width: '32px', height: '32px', borderRadius: '50%', background: '#28a745', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const btnCheckInStyle = { padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const btnLinkStyle = { padding: '12px 24px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' };
const modalStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const contentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '400px' };
const inputFullStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };