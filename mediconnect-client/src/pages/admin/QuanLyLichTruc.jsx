import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
// Hàm tạo danh sách giờ chuẩn 24h (mỗi 30 phút)
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 6; h <= 22; h++) {
    const hour = h.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

export default function QuanLyLichTruc({ token }) {
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [danhSachLich, setDanhSachLich] = useState([]);

  // ==========================
  // STATE CHUNG CHO FORM
  // ==========================
  const [editingId, setEditingId] = useState(null);
  const [doctorId, setDoctorId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('13:30');
  const [endTime, setEndTime] = useState('17:00');
  const [maxAppointments, setMaxAppointments] = useState(20);

  // Danh sách các mốc giờ để render vào thẻ <select>
  const timeSlots = generateTimeSlots();

  // ==========================
  // BỘ LỌC XEM LỊCH
  // ==========================
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  


  useEffect(() => {
    layDanhSachBacSi();
  }, []);

  useEffect(() => {
    if (filterDoctorId && filterDate) {
      layDanhSachLich();
    } else {
      setDanhSachLich([]);
    }
  }, [filterDoctorId, filterDate]);

  const layDanhSachBacSi = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/GetAllDoctors`, axiosConfig);
      setDanhSachBacSi(res.data.data || res.data.Data || []);
    } catch (err) { console.error("Lỗi lấy danh sách bác sĩ:", err); }
  };

  const layDanhSachLich = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Schedule/Admin_Get_Schedules?doctorId=${filterDoctorId}&date=${filterDate}`, axiosConfig);
      setDanhSachLich(res.data.data || res.data.Data || []);
    } catch (err) {
      setDanhSachLich([]);
    }
  };

  const xuLyLuuLich = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formatTimeForApi = (timeStr) => {
      if (!timeStr) return "00:00:00";
      return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    };

    try {
      const payload = {
        startTime: formatTimeForApi(startTime),
        endTime: formatTimeForApi(endTime),
        maxAppointments: parseInt(maxAppointments)
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/Schedule/Update_Schedule?scheduleId=${editingId}`, payload, axiosConfig);
        alert("✅ Cập nhật ca làm việc thành công!");
      } else {
        const createPayload = {
          ...payload,
          doctorId: doctorId,
          scheduleDate: scheduleDate
        };
        await axios.post(`${API_BASE_URL}/api/Schedule/Create_Schedule`, createPayload, axiosConfig);
        alert("✅ Tạo ca làm việc thành công!");
      }

      lamMoiForm();
      if (filterDoctorId === doctorId && filterDate === scheduleDate) {
        layDanhSachLich();
      }
    } catch (err) {
      alert(`⚠️ Lỗi: ${err.response?.data?.message || "Không thể lưu ca làm việc!"}`);
    } finally {
      setLoading(false);
    }
  };

  const xuLyHuyCa = async (scheduleId) => {
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn hủy ca trực này không? Tất cả lịch hẹn của bệnh nhân trong ca này sẽ bị hủy!")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/Schedule/Cancel_Schedule?scheduleId=${scheduleId}`, axiosConfig);
      alert("✅ Đã hủy ca trực và các lịch hẹn liên quan thành công!");
      layDanhSachLich();
    } catch (err) {
      alert(`⚠️ Lỗi: ${err.response?.data?.message || "Không thể hủy ca!"}`);
    }
  };

  const batDauSua = (lich) => {
    setEditingId(lich.id || lich.Id);
    setDoctorId(lich.doctorId || lich.DoctorId);

    const dateStr = lich.scheduleDate || lich.ScheduleDate;
    setScheduleDate(dateStr.split('T')[0]);

    const startStr = lich.startTime || lich.StartTime;
    const endStr = lich.endTime || lich.EndTime;
    setStartTime(startStr.substring(0, 5));
    setEndTime(endStr.substring(0, 5));

    setMaxAppointments(lich.maxAppointments || lich.MaxAppointments);
  };

  const lamMoiForm = () => {
    setEditingId(null);
    setDoctorId('');
    setScheduleDate('');
    setStartTime('08:00');
    setEndTime('11:30');
    setMaxAppointments(20);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>📅 QUẢN LÝ CA TRỰC BÁC SĨ</h2>
      <hr style={{ borderColor: '#eee' }} />

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>

        {/* CỘT TRÁI: FORM TẠO/SỬA LỊCH */}
        <div style={{ flex: 1, padding: '20px', border: editingId ? '2px solid #ffc107' : '1px solid #007bff', borderRadius: '8px', background: editingId ? '#fffdf5' : '#e9f5ff', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: editingId ? '#d39e00' : '#0056b3' }}>
            {editingId ? "📝 Chỉnh Sửa Ca (24h)" : "➕ Tạo Ca Mới (24h)"}
          </h3>
          <form onSubmit={xuLyLuuLich}>
            <label style={{ fontWeight: 'bold' }}>Bác sĩ:</label>
            <select disabled={editingId} value={doctorId} onChange={e => setDoctorId(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: editingId ? '#e9ecef' : 'white' }}>
              <option value="">-- Chọn bác sĩ --</option>
              {danhSachBacSi.map((bs, i) => <option key={i} value={bs.id || bs.Id}>{bs.fullName || bs.FullName}</option>)}
            </select>

            <label style={{ fontWeight: 'bold' }}>Ngày trực:</label>
            <input disabled={editingId} type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} style={{ width: '90%', padding: '8px', margin: '5px 0 15px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: editingId ? '#e9ecef' : 'white' }} />

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>Từ:</label>
                {/* Đã thay đổi thành thẻ SELECT để ép định dạng 24h */}
                <select value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                  {timeSlots.map(time => (
                    <option key={`start-${time}`} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold' }}>Đến:</label>
                {/* Đã thay đổi thành thẻ SELECT để ép định dạng 24h */}
                <select value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                  {timeSlots.map(time => (
                    <option key={`end-${time}`} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ fontWeight: 'bold' }}>Số lượng khám tối đa:</label>
            <input type="number" value={maxAppointments} onChange={e => setMaxAppointments(e.target.value)} required min="1" style={{ width: '90%', padding: '8px', margin: '5px 0 20px', borderRadius: '4px', border: '1px solid #ccc' }} />

            <button type="submit" disabled={loading} style={{ width: '95%', padding: '12px', background: editingId ? '#ffc107' : '#28a745', color: editingId ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Đang xử lý...' : editingId ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN PHÂN CA'}
            </button>

            {editingId && (
              <button onClick={lamMoiForm} type="button" style={{ width: '95%', padding: '10px', marginTop: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Hủy chế độ sửa
              </button>
            )}
          </form>
        </div>

        {/* CỘT PHẢI: BẢNG LỌC VÀ XEM LỊCH */}
        <div style={{ flex: 2 }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>🔍 Xem & Lọc Lịch Phân Ca</h4>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <select value={filterDoctorId} onChange={e => setFilterDoctorId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">-- Chọn bác sĩ để xem lịch --</option>
                  {danhSachBacSi.map((bs, i) => <option key={i} value={bs.id || bs.Id}>{bs.fullName || bs.FullName}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ca làm việc</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>SL Bệnh nhân</th>
                <th style={{ padding: '20px', border: '1px solid #ddd' }}>Trạng thái</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!filterDoctorId ? (
                <tr><td colSpan="4" style={{ padding: '20px', color: '#666' }}>Vui lòng chọn Bác sĩ để hiển thị ca trực.</td></tr>
              ) : danhSachLich.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '20px', color: 'red' }}>Bác sĩ này chưa có ca trực nào trong ngày đã chọn.</td></tr>
              ) : (
                danhSachLich.map((lich, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd', backgroundColor: (lich.isCancelled || lich.IsCancelled) ? '#fff3f3' : 'white' }}>

                    <td style={{ padding: '12px', border: '1px solid #ddd', color: '#007bff', fontWeight: 'bold' }}>
                      {lich.startTime || lich.StartTime} - {lich.endTime || lich.EndTime}
                    </td>

                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                      {lich.maxAppointments || lich.MaxAppointments}
                    </td>

                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {(lich.isCancelled || lich.IsCancelled) ? (
                        <span style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>ĐÃ HỦY</span>
                      ) : (
                        <span style={{ color: 'green', fontWeight: 'bold', fontSize: '13px' }}>Hoạt động</span>
                      )}
                    </td>

                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {!(lich.isCancelled || lich.IsCancelled) ? (
                        <>
                          <button onClick={() => batDauSua(lich)} style={{ marginRight: '8px', padding: '6px 12px', background: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                            Sửa
                          </button>
                          <button onClick={() => xuLyHuyCa(lich.id || lich.Id)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                            Hủy
                          </button>
                        </>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '13px' }}>Không khả dụng</span>
                      )}
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