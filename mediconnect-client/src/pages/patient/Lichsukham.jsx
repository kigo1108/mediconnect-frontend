import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const getValue = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

const isCompletedRecord = (item) => {
  const draftValue = getValue(item, ['isDraft', 'IsDraft'], null);
  if (draftValue !== null) return draftValue === false;

  const statusText = `${getValue(item, ['status', 'Status', 'recordStatus', 'RecordStatus', 'statusText', 'StatusText'], '')}`.toLowerCase();
  if (statusText === 'completed' || statusText === 'complete') return true;

  const statusNumber = Number(
    getValue(item, ['status', 'Status', 'recordStatus', 'RecordStatus'], Number.NaN)
  );
  return statusNumber === 1;
};

export default function LichSuKham({ token }) {
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };
  

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) {
      alert("⚠️ Lỗi: Không có Token đăng nhập!");
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Appointment/Get_History`, axiosConfig);
      const rawHistory = res.data.data || res.data.Data || [];
      setHistory(rawHistory);
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailRecord = async (medicalRecordId) => {
    // Nếu không lấy được ID, in thẳng ra console để debug xem Backend trả về cái gì
    if (!medicalRecordId) {
      console.warn("⚠️ Lỗi mất ID. Dữ liệu một dòng lịch sử hiện tại là:", history);
      alert("Hệ thống không tìm thấy Mã bệnh án! Vui lòng F12 -> Tab Console để kiểm tra dữ liệu Backend trả về.");
      return;
    }

    try {
      // Gửi raw string ID lên C#
      const res = await axios.post(
        `${API_BASE_URL}/api/Patient/my-medical-records`, 
        JSON.stringify(medicalRecordId),
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSelectedRecord(res.data.data || res.data.Data);
      setShowModal(true);
    } catch (err) {
      console.error("Lỗi API chi tiết bệnh án:", err);
      alert("⚠️ Không thể tải thông tin bệnh án chi tiết! Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải sổ khám bệnh...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px' }}>📜</span> SỔ KHÁM BỆNH ĐIỆN TỬ
      </h2>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '2px dashed #dee2e6' }}>
          <p style={{ color: '#6c757d', fontSize: '18px' }}>Bạn chưa có hồ sơ khám nào ở trạng thái hoàn thành.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {history.map((item, index) => {
            // BAO TRỌN GÓI MỌI TRƯỜNG HỢP TÊN BIẾN ID CỦA BACKEND
            const recordId = item.medicalRecordId || item.MedicalRecordId || item.id || item.Id || item.appointmentId || item.AppointmentId;

            return (
              <div key={index} style={cardStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#007bff' }}>
                    📅 Ngày khám: {new Date(item.appointmentDate || item.AppointmentDate || item.date || item.Date).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ marginTop: '8px', color: '#2c3e50' }}>
                    <strong>Khoa:</strong> {item.departmentName || item.DepartmentName || "Đa khoa"} 
                    <span style={{ margin: '0 15px', color: '#ccc' }}>|</span>
                    <strong>Bác sĩ:</strong> {item.doctorName || item.DoctorName || "Chưa cập nhật"}
                  </div>
                </div>
                <button 
                  onClick={() => fetchDetailRecord(recordId)}
                  style={btnViewStyle}
                >
                  Xem chi tiết & Đơn thuốc
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL CHI TIẾT */}
      {/* ========================================== */}
      {showModal && selectedRecord && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#28a745' }}>📄 THÔNG TIN BỆNH ÁN</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              {/* Thông tin hành chính */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', backgroundColor: '#f1f8ff', padding: '15px', borderRadius: '10px', fontSize: '14px' }}>
                <div><strong>Bệnh nhân:</strong> {selectedRecord.patientName || selectedRecord.PatientName}</div>
                <div><strong>Bác sĩ khám:</strong> {selectedRecord.doctorName || selectedRecord.DoctorName}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Thời gian khám:</strong> {new Date(selectedRecord.date || selectedRecord.Date).toLocaleString('vi-VN')}
                </div>
              </div>

              {/* Chẩn đoán */}
              <div style={{ marginBottom: '20px' }}>
                <p><strong>⚠️ Triệu chứng:</strong> {selectedRecord.symptoms || selectedRecord.Symptoms || "Không ghi nhận"}</p>
                <p><strong>🩺 Chẩn đoán:</strong> <span style={{ color: '#d9534f', fontWeight: 'bold' }}>{selectedRecord.diagnosis || selectedRecord.Diagnosis}</span></p>
              </div>
              
              {/* ĐƠN THUỐC */}
              <h4 style={{ borderTop: '2px solid #eee', paddingTop: '15px', color: '#007bff', marginBottom: '10px' }}>💊 ĐƠN THUỐC CHI TIẾT</h4>
              {/* Lấy list thuốc bất chấp viết hoa hay thường */}
              {(() => {
                const dsThuoc = selectedRecord.medicines || selectedRecord.Medicines;
                if (dsThuoc && dsThuoc.length > 0) {
                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                          <th style={thStyle}>Tên thuốc</th>
                          <th style={thStyle}>SL</th>
                          <th style={thStyle}>Cách dùng</th>
                          <th style={thStyle}>Giá tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dsThuoc.map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={tdStyle}><strong>{m.medicineName || m.MedicineName}</strong></td>
                            <td style={tdStyle}>{m.quantity || m.Quantity}</td>
                            <td style={tdStyle}>{m.instructions || m.Instructions}</td>
                            <td style={tdStyle}>{m.totalPrice || m.TotalPrice} VNĐ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                }
                return <p style={{ fontStyle: 'italic', color: '#999' }}>Không có chỉ định thuốc.</p>;
              })()}

            </div>
            <button onClick={() => setShowModal(false)} style={btnCloseStyle}>ĐÓNG CỬA SỔ</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES 
const cardStyle = { display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '6px solid #28a745' };
const btnViewStyle = { padding: '12px 20px', backgroundColor: '#f0f7ff', color: '#007bff', border: '1px solid #007bff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' };
const thStyle = { padding: '12px', color: '#666', fontWeight: '600', borderBottom: '2px solid #eee' };
const tdStyle = { padding: '12px', verticalAlign: 'top' };
const btnCloseStyle = { width: '100%', marginTop: '30px', padding: '15px', background: '#f8f9fa', color: '#333', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };