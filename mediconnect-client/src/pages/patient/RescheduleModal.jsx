function RescheduleModal({ appointment, token, onClose, onSuccess }) {
  const [newDate, setNewDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [saving, setSaving] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Mỗi khi chọn ngày, tự động đi tìm ca trực của bác sĩ đó [cite: 13]
  useEffect(() => {
    if (newDate && appointment?.doctorId) {
      axios.get(`${API_BASE_URL}/api/Schedule/Get_Doctor_Schedule?doctorId=${appointment.doctorId}&date=${newDate}`)
        .then(res => {
          const caTruc = res.data.data || res.data.Data || [];
          // Lọc bỏ ca hủy [cite: 13]
          setAvailableTimes(caTruc.filter(ca => !ca.isCancelled && !ca.IsCancelled));
        })
        .catch(err => console.error("Lỗi lấy lịch bác sĩ:", err));
    }
  }, [newDate, appointment.doctorId]);

  const handleConfirm = async () => {
    if (!selectedTime) return alert("Vui lòng chọn giờ khám!");
    setSaving(true);
    try {
      // Payload phải khớp 100% với RescheduleRequest.cs 
      const payload = {
        appointmentId: appointment.id,
        newAppointmentDate: `${newDate}T${selectedTime}` // Định dạng ISO DateTime cho C#
      };

      await axios.put(`${API_BASE_URL}/api/Appointment/Reschedule`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert("✅ Đổi lịch khám thành công!");
      onSuccess(); // Tải lại danh sách 
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || "Ca làm việc này đã đầy hoặc không hợp lệ."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h4 style={{marginTop: 0}}>📅 Chọn ngày và giờ khám mới</h4>
        
        <label style={{fontSize: '13px', fontWeight: 'bold'}}>1. Chọn ngày:</label>
        <input 
          type="date" 
          min={new Date().toISOString().split('T')[0]} 
          value={newDate} 
          onChange={e => { setNewDate(e.target.value); setSelectedTime(''); }} 
          style={inputFullStyle} 
        />

        {newDate && (
          <div style={{ marginTop: '15px' }}>
            <label style={{fontSize: '13px', fontWeight: 'bold'}}>2. Chọn giờ (Ca trực của bác sĩ):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {availableTimes.length === 0 ? <p style={{color: 'red', fontSize: '12px'}}>Bác sĩ không có lịch trực ngày này.</p> : 
                availableTimes.map((ca, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedTime(ca.startTime || ca.StartTime)} 
                    style={{ 
                      padding: '8px', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer',
                      background: selectedTime === (ca.startTime || ca.StartTime) ? '#007bff' : 'white',
                      color: selectedTime === (ca.startTime || ca.StartTime) ? 'white' : '#007bff'
                    }}>
                    {(ca.startTime || ca.StartTime).substring(0, 5)}
                  </button>
                ))
              }
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
          <button onClick={handleConfirm} disabled={!selectedTime || saving} style={btnConfirmStyle}>
            {saving ? 'Đang lưu...' : 'Xác nhận đổi'}
          </button>
          <button onClick={onClose} style={btnCancelStyle}>Hủy</button>
        </div>
      </div>
    </div>
  );
}

// Styles bổ sung
const modalStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const contentStyle = { background: 'white', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const inputFullStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnConfirmStyle = { flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnCancelStyle = { flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };