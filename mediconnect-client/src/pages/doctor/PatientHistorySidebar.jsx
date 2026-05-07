import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PatientHistorySidebar({ patientId, token }) {
  const [historyList, setHistoryList] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (patientId) fetchHistorySummary();
  }, [patientId]);

  const fetchHistorySummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/patient-history-summary/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistoryList(res.data.data || res.data.Data || []);
    } catch (err) {
      console.error('Lỗi lấy lịch sử', err);
      setHistoryList([]);
    }
  };

  const fetchDetail = async (recordId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/medical-record-detail/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedRecord(res.data.data || res.data.Data);
    } catch (err) {
      console.error('Lỗi lấy chi tiết', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '350px',
        borderLeft: '2px solid #eee',
        padding: '15px',
        backgroundColor: '#fff',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Lịch sử khám bệnh nhân</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {historyList.length === 0 && <p style={{ color: '#777', fontSize: '14px' }}>Bệnh nhân chưa có lịch sử khám trước đó.</p>}
        {historyList.map((item, i) => (
          <button
            key={item.medicalRecordId || item.MedicalRecordId || i}
            type="button"
            onClick={() => fetchDetail(item.medicalRecordId || item.MedicalRecordId)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#007bff' }}>
              {new Date(item.date || item.Date).toLocaleDateString('vi-VN')}
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Chẩn đoán:</strong> {item.diagnosis || item.Diagnosis || 'Không có'}
            </div>
          </button>
        ))}
      </div>

      {loading ? (
        <p>Đang tải chi tiết...</p>
      ) : (
        selectedRecord && (
          <div style={{ padding: '15px', backgroundColor: '#e9f5ff', borderRadius: '10px', border: '1px dashed #007bff' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>
              Chi tiết ngày {new Date(selectedRecord.date || selectedRecord.Date).toLocaleDateString('vi-VN')}
            </h4>
            <p style={{ fontSize: '13px', margin: '5px 0' }}>
              <strong>Bác sĩ:</strong> {selectedRecord.doctorName || selectedRecord.DoctorName || 'Chưa rõ'}
            </p>
            <p style={{ fontSize: '13px', margin: '5px 0' }}>
              <strong>Triệu chứng:</strong> {selectedRecord.symptoms || selectedRecord.Symptoms || 'Không có'}
            </p>
            <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>Đơn thuốc:</h5>
            <ul style={{ fontSize: '13px', paddingLeft: '20px', margin: 0 }}>
              {(selectedRecord.medicines || selectedRecord.Medicines || []).map((m, i) => (
                <li key={i}>
                  {m.medicineName || m.MedicineName} ({m.quantity || m.Quantity}) -{' '}
                  {m.instructions || m.Instructions}
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}