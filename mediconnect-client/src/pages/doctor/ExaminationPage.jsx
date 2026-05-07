import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PatientHistorySidebar from './PatientHistorySidebar';

const getValue = (obj, keys, fallback = '') => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

const normalizeMedicines = (list = []) =>
  list.map((m) => ({
    medicineId: getValue(m, ['medicineId', 'MedicineId', 'medicineID', 'MedicineID'], ''),
    medicineName: getValue(m, ['medicineName', 'MedicineName', 'name', 'Name'], ''),
    quantity: getValue(m, ['quantity', 'Quantity'], 1),
    instructions: getValue(m, ['instructions', 'Instructions'], ''),
  }));

const normalizeAttachments = (list = []) =>
  list.map((a) => ({
    fileUrl: getValue(a, ['fileUrl', 'FileUrl'], ''),
    description: getValue(a, ['description', 'Description'], ''),
  }));

export default function ExaminationPage({ token }) {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  
  const recordIdFromDashboard = location.state?.recordId;
  const isFromCompletedTab = location.state?.sourceTab === 'completed';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [medicineStock, setMedicineStock] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    appointmentId,
    symptoms: '',
    diagnosis: '',
    medicines: [],
    attachments: [],
  });

  const mapRecordToForm = (record) => ({
    appointmentId,
    symptoms: getValue(record, ['symptoms', 'Symptoms'], ''),
    diagnosis: getValue(record, ['diagnosis', 'Diagnosis'], ''),
    medicines: normalizeMedicines(getValue(record, ['medicines', 'Medicines'], [])),
    attachments: normalizeAttachments(getValue(record, ['attachments', 'Attachments'], [])),
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resAppt, resMed] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/Appointment/GetById/${appointmentId}`, axiosConfig),
          axios.get(`${API_BASE_URL}/api/Medicine/Get_All_Medicine_In_Stock`, axiosConfig),
        ]);

        setAppointmentInfo(resAppt.data.data || resAppt.data.Data);
        setMedicineStock(resMed.data.data || resMed.data.Data || []);
        setIsReadOnly(isFromCompletedTab);

        if (recordIdFromDashboard) {
          try {
            const resDetail = await axios.get(
              `${API_BASE_URL}/api/Doctor/medical-record-detail/${recordIdFromDashboard}`,
              axiosConfig
            );
            const recordDetail = resDetail.data.data || resDetail.data.Data;

            setRecordId(recordIdFromDashboard);
            setFormData(mapRecordToForm(recordDetail));

            const status = getValue(recordDetail, ['recordStatus', 'RecordStatus', 'status', 'Status'], null);
            if (status === 1 || String(status).toLowerCase() === 'completed') {
              setIsReadOnly(true);
            }
          } catch (detailErr) {
            console.error('Không thể tải chi tiết bệnh án:', detailErr);
          }
        } else {
          setRecordId(null);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu nền:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [appointmentId, recordIdFromDashboard, isFromCompletedTab]);

  const handleFileUpload = async (index, file) => {
    if (isReadOnly || !file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/Upload/file`, uploadData, {
        headers: { ...axiosConfig.headers, 'Content-Type': 'multipart/form-data' },
      });
      handleAttachmentChange(index, 'fileUrl', res.data.fileUrl || res.data.FileUrl);
    } catch {
      alert('Lỗi upload ảnh.');
    }
  };

  const addMedicineRow = () => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineId: '', quantity: 1, instructions: '' }],
    }));
  };

  const removeMedicineRow = (index) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const next = [...prev.medicines];
      next[index][field] = value;
      return { ...prev, medicines: next };
    });
  };

  const addAttachmentRow = () => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, { fileUrl: '', description: '' }],
    }));
  };

  const handleAttachmentChange = (index, field, value) => {
    if (isReadOnly) return;
    setFormData((prev) => {
      const next = [...prev.attachments];
      next[index][field] = value;
      return { ...prev, attachments: next };
    });
  };

  // 👉 ĐÃ THÊM: Hàm xóa ảnh
  const removeAttachmentRow = (index) => {
    if (isReadOnly) return;
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const upsertDraftRecord = async () => {
    const payload = {
      id: recordId,
      appointmentId: appointmentId,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      medicines: formData.medicines.map(m => ({
        medicineId: m.medicineId,
        quantity: parseInt(m.quantity) || 1,
        instructions: m.instructions || ''
      })),
      attachments: formData.attachments.map(a => ({
        fileUrl: a.fileUrl || '',
        description: a.description || ''
      }))
    };

    if (recordId) {
      await axios.put(`${API_BASE_URL}/api/Doctor/Update_Medical_Record`, payload, axiosConfig);
    } else {
      await axios.post(`${API_BASE_URL}/api/Doctor/Create_Medical_Record`, payload, axiosConfig);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (formData.medicines.some(m => !m.medicineId)) {
        alert("⚠️ Vui lòng chọn tên thuốc cho tất cả các dòng kê đơn, hoặc xóa dòng trống!");
        return;
    }

    setSubmitting(true);
    try {
      await upsertDraftRecord();
      alert('Đã lưu bệnh án thành công.');
      navigate('/doctor');
    } catch (err) {
      alert(`Không thể lưu bệnh án: ${err.response?.data?.message || 'Lỗi hệ thống'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockRecord = async () => {
    if (!recordId) {
      alert("⚠️ Vui lòng 'Lưu nháp' ít nhất một lần để tạo bệnh án trước khi Khóa!");
      return;
    }

    if (!window.confirm("🔒 CẢNH BÁO: Sau khi khóa, bạn sẽ KHÔNG THỂ SỬA LẠI. Bệnh nhân sẽ phải thanh toán. Bạn chắc chắn?")) {
      return;
    }

    setSubmitting(true);
    try {
      await upsertDraftRecord();
      await axios.put(`${API_BASE_URL}/api/Doctor/Mark_comple_Medical_Record?medicalRecordId=${recordId}`, {}, axiosConfig);
      alert('✅ Đã khóa bệnh án thành công!');
      navigate('/doctor');
    } catch (err) {
      alert(`❌ Lỗi khóa bệnh án: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px' }}>Đang tải dữ liệu khám bệnh...</h3>;
  const patientId = appointmentInfo?.patientId || appointmentInfo?.PatientId;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div
        style={{
          flex: 1,
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>{isReadOnly ? 'Chi tiết bệnh án' : 'Khám và tạo bệnh án'}</h2>
          {isReadOnly && (
            <span style={{ background: '#6c757d', color: 'white', padding: '5px 15px', borderRadius: '20px', height: 'fit-content' }}>
              Đã hoàn thành
            </span>
          )}
        </div>

        <form onSubmit={handleSaveDraft}>
          <label style={labelStyle}>Triệu chứng:</label>
          <textarea
            readOnly={isReadOnly}
            style={{ ...inputStyle, backgroundColor: isReadOnly ? '#f0f0f0' : 'white' }}
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          />

          <label style={labelStyle}>Chẩn đoán:</label>
          <input
            readOnly={isReadOnly}
            style={{ ...inputStyle, backgroundColor: isReadOnly ? '#f0f0f0' : 'white' }}
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          />

          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Đơn thuốc</h4>
              {!isReadOnly && (
                <button type="button" onClick={addMedicineRow} style={btnAddStyle}>
                  + Thêm
                </button>
              )}
            </div>
            {formData.medicines.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                {isReadOnly ? (
                  <div style={readonlyPillStyle}>
                    {m.medicineName || 'Thuốc không xác định'}
                  </div>
                ) : (
                  <select
                    disabled={isReadOnly}
                    style={{ flex: 2, ...fieldCompactStyle }}
                    value={m.medicineId || ''}
                    onChange={(e) => handleMedicineChange(i, 'medicineId', e.target.value)}
                  >
                    <option value="">Chọn thuốc</option>
                    {medicineStock.map((item) => (
                      <option key={item.id || item.Id} value={item.id || item.Id}>
                        {item.name || item.Name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  readOnly={isReadOnly}
                  type="number"
                  min="1"
                  style={{ width: '80px', ...fieldCompactStyle }}
                  value={m.quantity}
                  onChange={(e) => handleMedicineChange(i, 'quantity', e.target.value)}
                />
                <input
                  readOnly={isReadOnly}
                  placeholder="Cách dùng"
                  style={{ flex: 2, ...fieldCompactStyle }}
                  value={m.instructions}
                  onChange={(e) => handleMedicineChange(i, 'instructions', e.target.value)}
                />
                {!isReadOnly && (
                  <button type="button" onClick={() => removeMedicineRow(i)}>
                    X
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ ...sectionStyle, background: '#eef9f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Ảnh cận lâm sàng</h4>
              {!isReadOnly && (
                <button type="button" onClick={addAttachmentRow} style={btnAddStyle}>
                  + Thêm ảnh
                </button>
              )}
            </div>
            <div style={attachmentGridStyle}>
              {formData.attachments.map((a, i) => (
                // 👉 ĐÃ THÊM: Nút Xóa ảnh góc trên bên phải
                <div key={i} style={{ ...attachmentCardStyle, position: 'relative' }}>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeAttachmentRow(i)}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: '#dc3545', color: 'white', border: 'none',
                        borderRadius: '50%', width: '24px', height: '24px',
                        cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title="Xóa ảnh này"
                    >
                      ✕
                    </button>
                  )}
                  {!isReadOnly && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(i, e.target.files[0])}
                      style={{ fontSize: '12px' }}
                    />
                  )}
                  {a.fileUrl ? (
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <img src={a.fileUrl} alt={a.description || 'Attachment'} style={attachmentPreviewStyle} />
                    </a>
                  ) : (
                    <div style={attachmentPlaceholderStyle}>Chưa có ảnh</div>
                  )}
                  <input
                    readOnly={isReadOnly}
                    placeholder="Mô tả ảnh"
                    style={{ ...fieldCompactStyle, width: '100%' }}
                    value={a.description}
                    onChange={(e) => handleAttachmentChange(i, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button 
                type="submit" 
                disabled={submitting} 
                style={{ ...btnSubmitStyle, background: '#007bff' }}
              >
                {submitting ? 'Đang xử lý...' : '💾 Lưu nháp'}
              </button>

              <button 
                type="button" 
                onClick={handleLockRecord} 
                disabled={submitting} 
                style={{ ...btnSubmitStyle, background: '#dc3545' }}
              >
                🔒 Hoàn thành & Khóa
              </button>
            </div>
          )}

          <button 
            type="button" 
            onClick={() => navigate('/doctor')} 
            style={{ ...btnSubmitStyle, background: '#6c757d', marginTop: '15px' }}
          >
            Quay lại Dashboard
          </button>
        </form>
      </div>
      {!isReadOnly && (
        <div style={{ width: '350px' }}>
          {patientId && <PatientHistorySidebar patientId={patientId} token={token} />}
        </div>
      )}
    </div>
  );
}

// --- STYLES GIỮ NGUYÊN ---
const labelStyle = { display: 'block', fontWeight: 'bold', marginTop: '10px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' };
const sectionStyle = { padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' };
const btnAddStyle = { padding: '5px 10px', cursor: 'pointer' };
const btnSubmitStyle = { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const fieldCompactStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #d9d9d9' };
const readonlyPillStyle = {
  flex: 2, background: '#edf2ff', border: '1px solid #c7d2fe', color: '#1e3a8a',
  borderRadius: '999px', padding: '8px 12px', fontSize: '13px', fontWeight: '600',
};
const attachmentGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' };
const attachmentCardStyle = {
  border: '1px solid #dfe7df', borderRadius: '10px', background: 'white',
  padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px',
};
const attachmentPreviewStyle = { width: '100%', height: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' };
const attachmentPlaceholderStyle = {
  width: '100%', height: '130px', borderRadius: '8px', border: '1px dashed #bdbdbd',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8a8a', fontSize: '12px',
};