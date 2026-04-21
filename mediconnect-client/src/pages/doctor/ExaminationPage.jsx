import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientHistorySidebar from './PatientHistorySidebar';

export default function ExaminationPage({ token }) {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [appointmentInfo, setAppointmentInfo] = useState(null);
    const [khoThuoc, setKhoThuoc] = useState([]);
    
    // BIẾN QUAN TRỌNG: Kiểm tra xem trang có ở chế độ chỉ xem không
    const [isReadOnly, setIsReadOnly] = useState(false);

    const [formData, setFormData] = useState({
        appointmentId: appointmentId,
        symptoms: '',
        diagnosis: '',
        medicines: [],
        attachments: [] 
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Lấy thông tin ca khám
                const resAppt = await axios.get(`https://localhost:7071/api/Appointment/GetById/${appointmentId}`, axiosConfig);
                const apptData = resAppt.data.data || resAppt.data.Data;
                setAppointmentInfo(apptData);

                // KIỂM TRA TRẠNG THÁI: Nếu status là Completed (thường là 3 hoặc tùy định nghĩa của bạn), đặt ReadOnly = true
                if (apptData.status === 3 || apptData.Status === "Completed") {
                    setIsReadOnly(true);
                }

                // 2. Lấy danh sách thuốc
                const resMed = await axios.get(`https://localhost:7071/api/Medicine/Get_All_Medicine_In_Stock`, axiosConfig);
                setKhoThuoc(resMed.data.data || resMed.data.Data || []);

                // 3. NẾU LÀ XEM LẠI: Bạn cần gọi thêm API lấy Medical Record cũ để điền vào Form
                // Giả sử Backend có API lấy Medical Record theo AppointmentId
                const resRecord = await axios.get(`https://localhost:7071/api/Doctor/medical-record-by-appointment/${appointmentId}`, axiosConfig);
                if (resRecord.data.data) {
                    const record = resRecord.data.data;
                    setFormData({
                        appointmentId: appointmentId,
                        symptoms: record.symptoms || '',
                        diagnosis: record.diagnosis || '',
                        medicines: record.medicines || [],
                        attachments: record.attachments || []
                    });
                    // Nếu Status bệnh án là Completed thì cũng khóa luôn
                    if (record.recordStatus === 1) setIsReadOnly(true); 
                }

            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [appointmentId]);

    const handleFileUpload = async (index, file) => {
        if (isReadOnly || !file) return; // Chặn upload nếu là ReadOnly
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            const res = await axios.post('https://localhost:7071/api/Upload/file', uploadData, {
                headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' }
            });
            handleAttachmentChange(index, 'fileUrl', res.data.fileUrl || res.data.FileUrl);
        } catch (err) { alert("Lỗi upload"); }
    };

    const addMedicineRow = () => !isReadOnly && setFormData({...formData, medicines: [...formData.medicines, { medicineId: '', quantity: 1, instructions: '' }]});
    const removeMedicineRow = (index) => !isReadOnly && setFormData({...formData, medicines: formData.medicines.filter((_, i) => i !== index)});
    const handleMedicineChange = (index, field, value) => {
        if (isReadOnly) return;
        const newMeds = [...formData.medicines];
        newMeds[index][field] = value;
        setFormData({...formData, medicines: newMeds});
    };

    const addAttachmentRow = () => !isReadOnly && setFormData({...formData, attachments: [...formData.attachments, { fileUrl: '', description: '' }]});
    const handleAttachmentChange = (index, field, value) => {
        if (isReadOnly) return;
        const newAtts = [...formData.attachments];
        newAtts[index][field] = value;
        setFormData({...formData, attachments: newAtts});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        setSubmitting(true);
        try {
            await axios.post('https://localhost:7071/api/Doctor/Create_Medical_Record', formData, axiosConfig);
            alert("✅ Thành công!");
            navigate('/doctor');
        } catch (err) { alert("❌ Lỗi lưu"); } 
        finally { setSubmitting(false); }
    };

    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải...</h3>;
    const patientId = appointmentInfo?.patientId || appointmentInfo?.PatientId;

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <h2>{isReadOnly ? "📜 Chi tiết hồ sơ" : "🩺 Khám bệnh"}</h2>
                    {isReadOnly && <span style={{background: '#6c757d', color: 'white', padding: '5px 15px', borderRadius: '20px', height: 'fit-content'}}>ĐÃ KHÓA</span>}
                </div>
                
                <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>Triệu chứng:</label>
                    <textarea 
                        readOnly={isReadOnly} 
                        style={{...inputStyle, backgroundColor: isReadOnly ? '#f0f0f0' : 'white'}} 
                        value={formData.symptoms} 
                        onChange={e => setFormData({...formData, symptoms: e.target.value})} 
                    />

                    <label style={labelStyle}>Chẩn đoán:</label>
                    <input 
                        readOnly={isReadOnly} 
                        style={{...inputStyle, backgroundColor: isReadOnly ? '#f0f0f0' : 'white'}} 
                        value={formData.diagnosis} 
                        onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
                    />

                    <div style={sectionStyle}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h4>💊 Đơn thuốc</h4>
                            {!isReadOnly && <button type="button" onClick={addMedicineRow} style={btnAddStyle}>+ Thêm</button>}
                        </div>
                        {formData.medicines.map((m, i) => (
                            <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                                <select disabled={isReadOnly} style={{flex:2}} value={m.medicineId} onChange={e => handleMedicineChange(i, 'medicineId', e.target.value)}>
                                    <option value="">Chọn thuốc</option>
                                    {khoThuoc.map(t => <option key={t.id || t.Id} value={t.id || t.Id}>{t.name || t.Name}</option>)}
                                </select>
                                <input readOnly={isReadOnly} type="number" style={{width:'60px'}} value={m.quantity} onChange={e => handleMedicineChange(i, 'quantity', e.target.value)} />
                                <input readOnly={isReadOnly} placeholder="Cách dùng" style={{flex:2}} value={m.instructions} onChange={e => handleMedicineChange(i, 'instructions', e.target.value)} />
                                {!isReadOnly && <button type="button" onClick={() => removeMedicineRow(i)}>❌</button>}
                            </div>
                        ))}
                    </div>

                    <div style={{...sectionStyle, background: '#eef9f0'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h4>🖼️ Ảnh cận lâm sàng</h4>
                            {!isReadOnly && <button type="button" onClick={addAttachmentRow} style={btnAddStyle}>+ Thêm ảnh</button>}
                        </div>
                        {formData.attachments.map((a, i) => (
                            <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
                                {!isReadOnly && <input type="file" accept="image/*" onChange={e => handleFileUpload(i, e.target.files[0])} />}
                                <input readOnly={isReadOnly} placeholder="Mô tả" value={a.description} onChange={e => handleAttachmentChange(i, 'description', e.target.value)} />
                                {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noreferrer">👁️ Xem ảnh</a>}
                            </div>
                        ))}
                    </div>

                    {!isReadOnly && (
                        <button type="submit" disabled={submitting} style={btnSubmitStyle}>
                            {submitting ? 'ĐANG LƯU...' : '💾 LƯU BỆNH ÁN NHÁP'}
                        </button>
                    )}
                    
                    {isReadOnly && (
                        <button type="button" onClick={() => navigate('/doctor')} style={{...btnSubmitStyle, background: '#6c757d'}}>QUAY LẠI</button>
                    )}
                </form>
            </div>
            <div style={{ width: '350px' }}>
                {patientId && <PatientHistorySidebar patientId={patientId} token={token} />}
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginTop: '10px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' };
const sectionStyle = { padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' };
const btnAddStyle = { padding: '5px 10px', cursor: 'pointer' };
const btnSubmitStyle = { width: '100%', padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };