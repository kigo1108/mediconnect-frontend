import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PatientHistorySidebar({ patientId, token }) {
    const [historyList, setHistoryList] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (patientId) fetchHistorySummary();
    }, [patientId]);

    // 1. Tải danh sách tóm tắt
    const fetchHistorySummary = async () => {
        try {
            const res = await axios.get(`https://localhost:7071/api/Doctor/patient-history-summary/${patientId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistoryList(res.data.data || res.data.Data || []);
        } catch (err) { console.error("Lỗi lấy lịch sử", err); }
    };

    // 2. Tải chi tiết khi click
    const fetchDetail = async (recordId) => {
        setLoading(true);
        try {
            const res = await axios.get(`https://localhost:7071/api/Doctor/medical-record-detail/${recordId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedRecord(res.data.data || res.data.Data);
        } catch (err) { console.error("Lỗi lấy chi tiết", err); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ width: '350px', borderLeft: '2px solid #eee', padding: '15px', backgroundColor: '#fff', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ color: '#2c3e50', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>📜 Lịch sử khám</h3>
            
            {/* Timeline danh sách */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {historyList.map((item, i) => (
                    <div key={i} onClick={() => fetchDetail(item.medicalRecordId || item.MedicalRecordId)}
                        style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f8f9fa', transition: '0.2s' }}>
                        <div style={{ fontWeight: 'bold', color: '#007bff' }}>📅 {new Date(item.date || item.Date).toLocaleDateString('vi-VN')}</div>
                        <div style={{ fontSize: '14px' }}><strong>CĐ:</strong> {item.diagnosis || item.Diagnosis}</div>
                    </div>
                ))}
            </div>

            {/* Chi tiết đơn thuốc khi được click */}
            {loading ? <p>⏳ Đang tải chi tiết...</p> : selectedRecord && (
                <div style={{ padding: '15px', backgroundColor: '#e9f5ff', borderRadius: '10px', border: '1px dashed #007bff' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>Chi tiết ngày {new Date(selectedRecord.date).toLocaleDateString('vi-VN')}</h4>
                    <p style={{ fontSize: '13px', margin: '5px 0' }}><strong>BS:</strong> {selectedRecord.doctorName}</p>
                    <p style={{ fontSize: '13px', margin: '5px 0' }}><strong>Triệu chứng:</strong> {selectedRecord.symptoms}</p>
                    <h5 style={{ marginTop: '15px', marginBottom: '5px' }}>💊 Đơn thuốc:</h5>
                    <ul style={{ fontSize: '13px', paddingLeft: '20px', margin: 0 }}>
                        {selectedRecord.medicines?.map((m, i) => (
                            <li key={i}>{m.medicineName} ({m.quantity}) - {m.instructions}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}