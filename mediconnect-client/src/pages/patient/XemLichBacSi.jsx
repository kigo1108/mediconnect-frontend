import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function XemLichBacSi({ token }) {
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu danh mục
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  const [danhSachTatCaBacSi, setDanhSachTatCaBacSi] = useState([]);
  const [danhSachLich, setDanhSachLich] = useState([]);

  // Lựa chọn của người dùng
  const [selectedKhoaName, setSelectedKhoaName] = useState('');
  const [selectedBacSiId, setSelectedBacSiId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Mặc định hôm nay

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  // 1. Lấy danh sách Khoa và Bác sĩ khi vừa vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resKhoa = await axios.get('https://localhost:7071/api/Department/Get_All_Department');
        setDanhSachKhoa(resKhoa.data.data || resKhoa.data.Data || []);

        const resBS = await axios.get('https://localhost:7071/api/Doctor/GetAllDoctors');
        setDanhSachTatCaBacSi(resBS.data.data || resBS.data.Data || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu", err);
      }
    };
    fetchData();
  }, []);

  // 2. Lấy lịch trực khi đổi Bác sĩ hoặc Ngày
  useEffect(() => {
    if (selectedBacSiId && selectedDate) {
      layLichTruc();
    } else {
      setDanhSachLich([]); // Xóa list nếu chưa chọn đủ
    }
  }, [selectedBacSiId, selectedDate]);

  const layLichTruc = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://localhost:7071/api/Schedule/Get_Doctor_Schedule?doctorId=${selectedBacSiId}&date=${selectedDate}`, axiosConfig);
      // Lọc bỏ các ca đã hủy (nếu API chưa tự lọc)
      const lichHoatDong = (res.data.data || res.data.Data || []).filter(ca => !(ca.isCancelled || ca.IsCancelled));
      setDanhSachLich(lichHoatDong);
    } catch (err) {
      setDanhSachLich([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách bác sĩ theo Khoa đã chọn
  const bacSiHienThi = selectedKhoaName 
    ? danhSachTatCaBacSi.filter(bs => (bs.departmentName || bs.DepartmentName) === selectedKhoaName)
    : danhSachTatCaBacSi;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '30px' }}>🗓️ TRA CỨU LỊCH TRỰC BÁC SĨ</h2>

      {/* BỘ LỌC TÌM KIẾM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        
        {/* Chọn Ngày */}
        <div>
          <label style={labelStyle}>Ngày xem lịch</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            style={inputStyle} 
          />
        </div>

        {/* Chọn Khoa */}
        <div>
          <label style={labelStyle}>Chuyên khoa</label>
          <select 
            value={selectedKhoaName} 
            onChange={e => { setSelectedKhoaName(e.target.value); setSelectedBacSiId(''); }} 
            style={inputStyle}
          >
            <option value="">Tất cả các khoa</option>
            {danhSachKhoa.map((k, i) => <option key={i} value={k.name || k.Name}>{k.name || k.Name}</option>)}
          </select>
        </div>

        {/* Chọn Bác sĩ */}
        <div>
          <label style={labelStyle}>Bác sĩ</label>
          <select 
            value={selectedBacSiId} 
            onChange={e => setSelectedBacSiId(e.target.value)} 
            style={inputStyle}
          >
            <option value="">-- Chọn bác sĩ --</option>
            {bacSiHienThi.map((bs, i) => (
              <option key={i} value={bs.id || bs.Id}>{bs.fullName || bs.FullName}</option>
            ))}
          </select>
        </div>

      </div>

      {/* KẾT QUẢ TÌM KIẾM */}
      <div style={{ minHeight: '200px' }}>
        {!selectedBacSiId ? (
          <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic', marginTop: '50px' }}>
            Vui lòng chọn bác sĩ để xem lịch trực.
          </p>
        ) : loading ? (
          <p style={{ textAlign: 'center', color: '#007bff' }}>⏳ Đang tải lịch trực...</p>
        ) : danhSachLich.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fff3f3', border: '1px dashed #dc3545', borderRadius: '8px' }}>
            <p style={{ color: '#dc3545', margin: 0 }}>Bác sĩ không có ca trực nào vào ngày <strong>{new Date(selectedDate).toLocaleDateString('vi-VN')}</strong>.</p>
          </div>
        ) : (
          <div>
            <h4 style={{ color: '#28a745', marginBottom: '15px' }}>Ca trực ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              {danhSachLich.map((ca, i) => {
                const startTime = (ca.startTime || ca.StartTime).substring(0, 5);
                const endTime = (ca.endTime || ca.EndTime).substring(0, 5);
                return (
                  <div key={i} style={{ padding: '15px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#e9f5ff', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0056b3' }}>
                      {startTime} - {endTime}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <Link to="/dat-lich" style={{ textDecoration: 'none', fontSize: '13px', backgroundColor: '#007bff', color: 'white', padding: '5px 10px', borderRadius: '4px' }}>
                        👉 Đặt lịch ca này
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#495057' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', boxSizing: 'border-box' };