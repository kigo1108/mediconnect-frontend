import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DatLichKham({ token }) {
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // ==========================
  // STATE DỮ LIỆU TỪ API
  // ==========================
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [danhSachTatCaBacSi, setDanhSachTatCaBacSi] = useState([]);
  
  const [bacSiKhaDung, setBacSiKhaDung] = useState([]); 
  const [lichCuaBacSi, setLichCuaBacSi] = useState({}); 

  // ==========================
  // STATE LỰA CHỌN CỦA BỆNH NHÂN
  // ==========================
  const [selectedKhoaId, setSelectedKhoaId] = useState('');
  const [selectedKhoaName, setSelectedKhoaName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBacSiId, setSelectedBacSiId] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  // 1. Tải Khoa và Toàn bộ Bác sĩ khi mới vào trang
  useEffect(() => {
    layDanhSachKhoa();
    layDanhSachBacSi();
  }, []);

  // 2. TỰ ĐỘNG TÌM LỊCH TRỰC KHI ĐÃ CÓ KHOA VÀ NGÀY
  useEffect(() => {
    const timBacSiTheoNgay = async () => {
      if (!selectedKhoaName || !selectedDate) return;

      setLoadingDoctors(true);
      // Lọc bác sĩ theo Tên Khoa (Khắc phục lỗi phân biệt hoa/thường của C#)
      const bacSiTrongKhoa = danhSachTatCaBacSi.filter(bs => {
        const bsKhoa = bs.departmentName || bs.DepartmentName;
        return bsKhoa === selectedKhoaName;
      });
      
      const cacBacSiCoLich = [];
      const mapLich = {};

      // Chạy ngầm gọi API kiểm tra lịch của từng bác sĩ trong ngày đó
      await Promise.all(bacSiTrongKhoa.map(async (bs) => {
        try {
          const doctorId = bs.id || bs.Id;
          const res = await axios.get(`${API_BASE_URL}/api/Schedule/Get_Doctor_Schedule?doctorId=${doctorId}&date=${selectedDate}`);
          
          const caHoatDong = (res.data.data || res.data.Data || []).filter(ca => !(ca.isCancelled || ca.IsCancelled));
          
          if (caHoatDong.length > 0) {
            cacBacSiCoLich.push(bs);
            mapLich[doctorId] = caHoatDong; 
          }
        } catch (error) {
          // Bác sĩ này không trực, bỏ qua
        }
      }));

      setBacSiKhaDung(cacBacSiCoLich);
      setLichCuaBacSi(mapLich);
      setLoadingDoctors(false);
    };

    timBacSiTheoNgay();
  }, [selectedKhoaName, selectedDate, danhSachTatCaBacSi]);

  // ==========================
  // CÁC HÀM GỌI API
  // ==========================
  const layDanhSachKhoa = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Department/Get_All_Department`);
      setDanhSachKhoa(res.data.data || res.data.Data || []);
    } catch (err) { console.error("Lỗi lấy Khoa"); }
  };

  const layDanhSachBacSi = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/GetAllDoctors`);
      setDanhSachTatCaBacSi(res.data.data || res.data.Data || []);
    } catch (err) { console.error("Lỗi lấy Bác sĩ"); }
  };

  // ==========================
  // HÀM RESET CÁC BƯỚC SAU KHI THAY ĐỔI
  // ==========================
  const handleChonKhoa = (e) => {
    setSelectedKhoaId(e.target.value);
    setSelectedKhoaName(e.target.options[e.target.selectedIndex].text);
    // Xóa trắng các bước sau để ép người dùng chọn lại từ đầu
    setSelectedDate('');
    setSelectedBacSiId('');
    setSelectedTime('');
    setBacSiKhaDung([]);
  };

  const handleChonNgay = (e) => {
    setSelectedDate(e.target.value);
    // Xóa trắng các bước sau
    setSelectedBacSiId('');
    setSelectedTime('');
  };

  const xuLyDatLich = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Vui lòng chọn một khung giờ khám!"); return;
    }
    setLoading(true);
    try {
      const appointmentDateTime = `${selectedDate}T${selectedTime}`;
      const payload = {
        departmentId: selectedKhoaId,
        doctorId: selectedBacSiId,
        appointmentDate: appointmentDateTime
      };

      await axios.post(`${API_BASE_URL}/api/Appointment/Create_Appointment`, payload, axiosConfig);
      alert("🎉 Đặt lịch khám thành công! Vui lòng đến đúng giờ để làm thủ tục.");
      
      // Đặt xong thì Reset sạch form
      setSelectedKhoaId(''); setSelectedKhoaName('');
      setSelectedDate(''); setSelectedBacSiId(''); setSelectedTime('');
    } catch (err) {
      if (err.response?.status === 401) {
        alert("⚠️ Lỗi 401: Vui lòng F5 và Đăng nhập lại với tài khoản Bệnh nhân!");
      } else {
        alert(`⚠️ Lỗi: ${err.response?.data?.message || "Lỗi hệ thống."}`);
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#f4f7f6', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px' }}>🏥 ĐẶT LỊCH KHÁM CHUYÊN GIA</h2>
      
      <form onSubmit={xuLyDatLich} style={{ background: 'white', padding: '25px', borderRadius: '8px', borderTop: '4px solid #007bff' }}>
        
        {/* ================= BƯỚC 1: CHỌN KHOA ================= */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#007bff' }}>Bước 1: Chọn Chuyên khoa</label>
          <select required value={selectedKhoaId} onChange={handleChonKhoa} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ced4da' }}>
            <option value="">-- Lựa chọn chuyên khoa --</option>
            {danhSachKhoa.map((k, i) => <option key={i} value={k.id || k.Id}>{k.name || k.Name}</option>)}
          </select>
        </div>

        {/* ================= BƯỚC 2: CHỌN NGÀY ================= */}
        <div style={{ marginBottom: '20px', opacity: selectedKhoaId ? 1 : 0.5 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: selectedKhoaId ? '#007bff' : '#6c757d' }}>Bước 2: Chọn Ngày khám</label>
          <input 
            type="date" required 
            disabled={!selectedKhoaId} // Khóa nếu chưa chọn khoa
            min={new Date().toISOString().split('T')[0]} 
            value={selectedDate} 
            onChange={handleChonNgay} 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' }} 
          />
        </div>

        {/* ================= BƯỚC 3: CHỌN BÁC SĨ ================= */}
        <div style={{ marginBottom: '20px', opacity: selectedDate ? 1 : 0.5 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: selectedDate ? '#007bff' : '#6c757d' }}>Bước 3: Chọn Bác sĩ (Có lịch trực ngày này)</label>
          
          {loadingDoctors ? (
            <p style={{ color: '#007bff', fontStyle: 'italic', margin: 0 }}>⏳ Đang tìm bác sĩ có lịch trống...</p>
          ) : (bacSiKhaDung.length === 0 && selectedDate) ? (
            <p style={{ color: '#dc3545', margin: 0, padding: '10px', backgroundColor: '#fff3f3', border: '1px solid #dc3545', borderRadius: '4px' }}>
              ⚠️ Khoa này không có Bác sĩ trực vào ngày bạn chọn. Xin chọn ngày khác!
            </p>
          ) : (
            <select 
              required 
              disabled={!selectedDate || bacSiKhaDung.length === 0} 
              value={selectedBacSiId} 
              onChange={e => { setSelectedBacSiId(e.target.value); setSelectedTime(''); }} 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ced4da' }}
            >
              <option value="">-- Chọn Bác sĩ điều trị --</option>
              {bacSiKhaDung.map((bs, i) => (
                <option key={i} value={bs.id || bs.Id}>{bs.fullName || bs.FullName} - {bs.specialName || bs.specialName}</option>
              ))}
            </select>
          )}
        </div>

        {/* ================= BƯỚC 4: CHỌN GIỜ ================= */}
        <div style={{ marginBottom: '30px', opacity: selectedBacSiId ? 1 : 0.5 }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: selectedBacSiId ? '#007bff' : '#6c757d' }}>Bước 4: Chọn Khung giờ khám</label>
          
          {!selectedBacSiId ? (
            <p style={{ margin: 0, color: '#6c757d', fontStyle: 'italic' }}>Vui lòng hoàn thành các bước trên để xem giờ khám.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {lichCuaBacSi[selectedBacSiId]?.map((ca, i) => {
                const startTimeStr = ca.startTime || ca.StartTime;
                const isSelected = selectedTime === startTimeStr;
                return (
                  <div key={i} onClick={() => setSelectedTime(startTimeStr)}
                    style={{ 
                      padding: '10px 20px', border: isSelected ? '2px solid #28a745' : '1px solid #007bff', 
                      borderRadius: '6px', backgroundColor: isSelected ? '#d4edda' : '#e9f5ff', 
                      color: isSelected ? '#155724' : '#0056b3', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                    }}
                  >
                    {startTimeStr.substring(0, 5)} - {(ca.endTime || ca.EndTime).substring(0, 5)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NÚT XÁC NHẬN */}
        <button type="submit" disabled={loading || !selectedTime}
          style={{ 
            width: '100%', padding: '15px', background: (!selectedTime || loading) ? '#6c757d' : '#28a745', 
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', 
            cursor: (!selectedTime || loading) ? 'not-allowed' : 'pointer', transition: '0.3s'
          }}
        >
          {loading ? '⏳ ĐANG XỬ LÝ...' : '✅ XÁC NHẬN ĐẶT LỊCH'}
        </button>

      </form>
    </div>
  );
}