import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard({ token }) {
  const [waitingList, setWaitingList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [draftRecords, setDraftRecords] = useState([]); 
  const [completedRecords, setCompletedRecords] = useState([]); // THÊM: List đã khóa
  
  const [activeTab, setActiveTab] = useState('waiting'); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  useEffect(() => {
    if (activeTab === 'waiting') fetchWaitingPatients();
    else if (activeTab === 'drafts') fetchDraftRecords();
    else if (activeTab === 'completed') fetchCompletedRecords(); // THÊM
    else if (activeTab === 'schedule') fetchMySchedules();
  }, [activeTab]);

  const fetchWaitingPatients = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Doctor/waiting_patients', axiosConfig);
      setWaitingList(res.data.data || res.data.Data || []);
    } catch (err) { setWaitingList([]); }
  };

  const fetchDraftRecords = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Doctor/Get_Record?isDraft=false', axiosConfig);;
      setDraftRecords(res.data.data || res.data.Data || []);
    } catch (err) { setDraftRecords([]); }
  };

  // THÊM HÀM LẤY LỊCH SỬ ĐÃ KHÓA
  const fetchCompletedRecords = async () => {
    try {
      
      const res = await await axios.get('https://localhost:7071/api/Doctor/Get_Record?isDraft=true', axiosConfig);;
      setCompletedRecords(res.data.data || res.data.Data || []);
    } catch (err) { setCompletedRecords([]); }
  };

  const fetchMySchedules = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(`https://localhost:7071/api/Schedule/My_Schedules?date=${today}`, axiosConfig);
      setSchedules(res.data.data || res.data.Data || []);
    } catch (err) { setSchedules([]); }
  };

  const handleLock = async (id) => {
    if (!window.confirm("🔒 Khóa bệnh án này? Sẽ không thể sửa sau khi khóa.")) return;
    try {
      await axios.post(`https://localhost:7071/api/Doctor/Mark_comple_Medical_Record?medicalRecordId=${id}`, {}, axiosConfig);
      alert("✅ Đã hoàn thành ca khám!");
      fetchDraftRecords();
    } catch (err) { alert("Lỗi: " + err.response?.data?.message); }
  };

  const handleEdit = async (record) => {
    const newDiagnosis = prompt("Sửa chẩn đoán nhanh:", record.diagnosis || record.Diagnosis);
    if (!newDiagnosis) return;
    try {
      await axios.put('https://localhost:7071/api/Doctor/Update_Medical_Record', {
        id: record.id || record.Id,
        diagnosis: newDiagnosis,
        prescription: ""
      }, axiosConfig);
      alert("✅ Đã cập nhật!");
      fetchDraftRecords();
    } catch (err) { alert("Lỗi: " + err.response?.data?.message); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ color: '#2c3e50' }}>👨‍⚕️ BẢNG ĐIỀU KHIỂN BÁC SĨ</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('waiting')} style={activeTab === 'waiting' ? tabActiveStyle : tabStyle}>🔴 Đang chờ ({waitingList.length})</button>
        <button onClick={() => setActiveTab('drafts')} style={activeTab === 'drafts' ? tabActiveStyle : tabStyle}>📝 Nháp ({draftRecords.length})</button>
        <button onClick={() => setActiveTab('completed')} style={activeTab === 'completed' ? tabActiveStyle : tabStyle}>📜 Lịch sử đã khám</button>
        <button onClick={() => setActiveTab('schedule')} style={activeTab === 'schedule' ? tabActiveStyle : tabStyle}>📅 Lịch trực</button>
      </div>

      <div style={containerStyle}>
        {/* TAB CHỜ KHÁM */}
        {activeTab === 'waiting' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={paddingStyle}>STT</th><th style={paddingStyle}>Bệnh nhân</th><th style={paddingStyle}>Thao tác</th></tr></thead>
            <tbody>
              {waitingList.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={paddingStyle}><strong>{item.queueNumber || item.QueueNumber}</strong></td>
                  <td style={paddingStyle}>{item.patientName || item.PatientName}</td>
                  <td style={paddingStyle}><button onClick={() => navigate(`/exam/${item.appointmentId || item.AppointmentId}`)} style={btnPrimaryStyle}>Mở ca khám</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB NHÁP */}
        {activeTab === 'drafts' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={paddingStyle}>Bệnh nhân</th><th style={paddingStyle}>Chẩn đoán</th><th style={paddingStyle}>Thao tác</th></tr></thead>
            <tbody>
              {draftRecords.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={paddingStyle}><strong>{d.patientName || d.PatientName}</strong></td>
                  <td style={paddingStyle}>{d.diagnosis || d.Diagnosis}</td>
                  <td style={{ ...paddingStyle, display: 'flex', gap: '5px' }}>
                    <button onClick={() => navigate(`/exam/${d.appointmentId || d.AppointmentId}`)} style={btnPrimaryStyle}>Mở Form Sửa</button>
                    <button onClick={() => handleEdit(d)} style={{...btnPrimaryStyle, background:'#ffc107', color:'black'}}>Sửa Nhanh</button>
                    <button onClick={() => handleLock(d.id || d.Id)} style={{...btnPrimaryStyle, background:'#dc3545'}}>🔒 Khóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB LỊCH SỬ ĐÃ KHÓA */}
        {activeTab === 'completed' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={paddingStyle}>Bệnh nhân</th><th style={paddingStyle}>Chẩn đoán</th><th style={paddingStyle}>Thao tác</th></tr></thead>
            <tbody>
              {completedRecords.length === 0 && <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center'}}>Chưa có ca khám nào được khóa.</td></tr>}
              {completedRecords.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={paddingStyle}><strong>{c.patientName || c.PatientName}</strong></td>
                  <td style={paddingStyle}>{c.diagnosis || c.Diagnosis}</td>
                  <td style={paddingStyle}>
                    <button onClick={() => navigate(`/exam/${c.appointmentId || c.AppointmentId}`)} style={{...btnPrimaryStyle, backgroundColor: '#6c757d'}}>👁️ Xem lại hồ sơ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB LỊCH TRỰC */}
        {activeTab === 'schedule' && (
           <div style={{ display: 'grid', gap: '10px' }}>
            {schedules.map((s, i) => (
              <div key={i} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                📅 Ngày: {new Date(s.scheduleDate || s.ScheduleDate).toLocaleDateString('vi-VN')} | 🕒 {s.startTime} - {s.endTime}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const tabStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '5px' };
const tabActiveStyle = { ...tabStyle, background: '#007bff', color: 'white', border: '1px solid #007bff' };
const containerStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const paddingStyle = { padding: '12px' };
const btnPrimaryStyle = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };