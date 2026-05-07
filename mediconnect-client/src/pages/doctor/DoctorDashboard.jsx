import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Import component Hồ sơ bác sĩ (Đảm bảo bạn đã tạo tệp này)
import HoSoBacSi from './HoSoBacSi'; 
const API_BASE_URL = import.meta.env.VITE_API_URL;

const getValue = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

export default function DoctorDashboard({ token }) {
  const [waitingList, setWaitingList] = useState([]);
  const [draftRecords, setDraftRecords] = useState([]);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('waiting'); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      if (activeTab === 'profile') return; 

      setLoading(true);
      try {
        if (activeTab === 'waiting') await fetchWaitingPatients();
        if (activeTab === 'drafts') await fetchDraftRecords();
        if (activeTab === 'completed') await fetchCompletedRecords();
        if (activeTab === 'schedule') await fetchMySchedules();
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [activeTab, token]);

  const fetchWaitingPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/waiting_patients`, axiosConfig);
      setWaitingList(res.data.data || res.data.Data || []);
    } catch { setWaitingList([]); }
  };

  const fetchDraftRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/Get_Record?isDraft=true`, axiosConfig);
      setDraftRecords(res.data.data || res.data.Data || []);
    } catch { setDraftRecords([]); }
  };

  const fetchCompletedRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/Get_Record?isDraft=false`, axiosConfig);
      setCompletedRecords(res.data.data || res.data.Data || []);
    } catch { setCompletedRecords([]); }
  };

  const fetchMySchedules = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(`${API_BASE_URL}/api/Schedule/My_Schedules?date=${today}`, axiosConfig);
      setSchedules(res.data.data || res.data.Data || []);
    } catch { setSchedules([]); }
  };

  // ĐÃ THÊM: Hàm xử lý Khóa bệnh án ngay từ bên ngoài Dashboard
  const handleLockDraft = async (recordId) => {
    if (!recordId) {
      alert("⚠️ Lỗi: Không lấy được Mã bệnh án!");
      return;
    }
    if (!window.confirm("🔒 CẢNH BÁO: Bệnh án sẽ chuyển sang Đã hoàn thành và không thể sửa lại. Bệnh nhân có thể thanh toán. Bạn chắc chắn muốn khóa?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/Doctor/Mark_comple_Medical_Record?medicalRecordId=${recordId}`, {}, axiosConfig);
      alert("✅ Đã khóa bệnh án thành công!");
      // Tải lại danh sách ngay lập tức để cập nhật UI
      fetchDraftRecords();
      fetchCompletedRecords();
    } catch (err) {
      alert(`❌ Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '25px' }}>👨‍⚕️ Bảng điều khiển bác sĩ</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('waiting')} style={activeTab === 'waiting' ? tabActiveStyle : tabStyle}>
          📋 Đang chờ khám
        </button>
        <button onClick={() => setActiveTab('drafts')} style={activeTab === 'drafts' ? tabActiveStyle : tabStyle}>
          📝 Bệnh án nháp
        </button>
        <button onClick={() => setActiveTab('completed')} style={activeTab === 'completed' ? tabActiveStyle : tabStyle}>
          ✅ Đã hoàn thành
        </button>
        <button onClick={() => setActiveTab('schedule')} style={activeTab === 'schedule' ? tabActiveStyle : tabStyle}>
          📅 Lịch trực
        </button>
        <button onClick={() => setActiveTab('profile')} style={activeTab === 'profile' ? tabActiveStyleProfile : tabStyle}>
          👤 Hồ sơ của tôi
        </button>
      </div>

      <div style={containerStyle}>
        {loading && <div style={{ marginBottom: '12px', color: '#666' }}>⏳ Đang tải dữ liệu...</div>}

        {activeTab === 'waiting' && (
          waitingList.length === 0 ? <p style={emptyMsg}>Hiện chưa có bệnh nhân đang chờ.</p> : (
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  <th style={paddingStyle}>STT</th>
                  <th style={paddingStyle}>Bệnh nhân</th>
                  <th style={paddingStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.map((item, i) => (
                  <tr key={i} style={rowStyle}>
                    <td style={paddingStyle}>{getValue(item, ['queueNumber', 'QueueNumber'], i + 1)}</td>
                    <td style={paddingStyle}>{getValue(item, ['patientName', 'PatientName'])}</td>
                    <td style={paddingStyle}>
                      <button onClick={() => navigate(`/exam/${item.appointmentId || item.AppointmentId}`)} style={btnStyle}>Khám bệnh</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* TAB 2: BỆNH ÁN NHÁP VỚI NÚT KHÓA Ở NGOÀI */}
        {activeTab === 'drafts' && (
           draftRecords.length === 0 ? <p style={emptyMsg}>Không có bệnh án nháp.</p> : (
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  <th style={paddingStyle}>Bệnh nhân</th>
                  <th style={paddingStyle}>Triệu chứng</th>
                  <th style={paddingStyle}>Chẩn đoán</th>
                  <th style={paddingStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {draftRecords.map((d, i) => {
                  const recId = getValue(d, ['id', 'Id', 'medicalRecordId', 'MedicalRecordId']);
                  return (
                    <tr key={i} style={rowStyle}>
                      <td style={paddingStyle}><strong>{getValue(d, ['patientName', 'PatientName'])}</strong></td>
                      <td style={paddingStyle}>{getValue(d, ['symptoms', 'Symptoms'])}</td>
                      <td style={paddingStyle}>{getValue(d, ['diagnosis', 'Diagnosis'])}</td>
                      <td style={paddingStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => navigate(`/exam/${d.appointmentId || d.AppointmentId}`,{state: { recordId: d.id || d.Id }})}
                            
                            style={{ ...btnStyle, background: '#007bff' }}
                          >
                            ✏️ Sửa
                          </button>
                          
                          {/* NÚT KHÓA BỆNH ÁN */}
                          <button 
                            onClick={() => handleLockDraft(recId)} 
                            style={{ ...btnStyle, background: '#dc3545' }}
                          >
                            🔒 Khóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
           )
        )}

        {activeTab === 'completed' && (
           completedRecords.length === 0 ? <p style={emptyMsg}>Chưa có bệnh án hoàn thành.</p> : (
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  <th style={paddingStyle}>Bệnh nhân</th>
                  <th style={paddingStyle}>Chẩn đoán</th>
                  <th style={paddingStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {completedRecords.map((record, i) => (
                  <tr key={i} style={rowStyle}>
                    <td style={paddingStyle}>{getValue(record, ['patientName', 'PatientName'])}</td>
                    <td style={paddingStyle}>{getValue(record, ['diagnosis', 'Diagnosis'])}</td>
                    <td style={paddingStyle}>
                      <button 
                        onClick={() => navigate(`/print/${record.medicalRecordId || record.id}`)}
                        style={{ ...btnStyle, background: '#17a2b8' }}
                      >
                        🖨️ In Đơn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           )
        )}

        {activeTab === 'schedule' && (
          schedules.length === 0 ? <p style={emptyMsg}>Hôm nay bạn không có ca trực nào.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {schedules.map((s, i) => (
                <div key={i} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ marginTop: '0', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    📅 {new Date(s.scheduleDate || s.ScheduleDate).toLocaleDateString('vi-VN')}
                  </h4>
                  <div style={{ lineHeight: '1.8', color: '#334155' }}>
                    <div><strong>🕒 Thời gian:</strong> {s.startTime} - {s.endTime}</div>
                    <div><strong>🩺 Bác sĩ:</strong> {s.doctorName || s.DoctorName}</div>
                    <div><strong>Trạng thái:</strong> {s.isCancelled ? <span style={{color: 'red', fontWeight: 'bold'}}>Đã hủy</span> : <span style={{color: '#10b981', fontWeight: 'bold'}}>Hoạt động</span>}</div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'profile' && (
          <HoSoBacSi token={token} />
        )}
      </div>
    </div>
  );
}

// === CSS STYLES ===
const tabStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '8px', fontWeight: 'bold' };
const tabActiveStyle = { ...tabStyle, background: '#007bff', color: 'white', border: '1px solid #007bff' };
const tabActiveStyleProfile = { ...tabStyle, background: '#6f42c1', color: 'white', border: '1px solid #6f42c1' }; 
const containerStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const headerRowStyle = { textAlign: 'left', borderBottom: '2px solid #eee' };
const rowStyle = { borderBottom: '1px solid #f3f3f3' };
const paddingStyle = { padding: '12px' };
const btnStyle = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const emptyMsg = { textAlign: 'center', padding: '30px', color: '#888' };