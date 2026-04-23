import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuanLyNhanSu({ token }) {
  // Dữ liệu từ API
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);

  // State tìm kiếm và điều khiển UI
  const [searchTerm, setSearchTerm] = useState(''); // Tìm kiếm User
  const [hienThiFormThem, setHienThiFormThem] = useState(false);
  const [bacSiDangSua, setBacSiDangSua] = useState(null);

  // State Form Cấp quyền (Payload cho AssignRoleRequest.cs)
  const [userId, setUserId] = useState('');
  const [newRole, setNewRole] = useState('Doctor');
  const [doctorCode, setDoctorCode] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');

  // State Form Cập nhật Bác sĩ
  const [chuyenKhoaMoi, setChuyenKhoaMoi] = useState('');
  const [khoaMoiId, setKhoaMoiId] = useState('');

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  useEffect(() => {
    layDanhSachBacSi();
    layDanhSachKhoa();
    layDanhSachUser(""); // Load danh sách ban đầu
  }, []);

  // API: Lấy danh sách User kèm tìm kiếm
  const layDanhSachUser = async (search = "") => {
    try {
      // Gọi API kèm query search để xử lý 100.000 người ở Backend
      const res = await axios.get(`https://localhost:7071/api/Admin/get_users_for_assignment?search=${search}`, axiosConfig);
      setDanhSachUser(res.data.data || res.data.Data || []);
    } catch (err) { console.error("Lỗi lấy danh sách user:", err); }
  };

  const layDanhSachBacSi = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Doctor/GetAllDoctors', axiosConfig);
      setDanhSachBacSi(res.data.data || res.data.Data || []);
    } catch (err) { console.error(err); }
  };

  const layDanhSachKhoa = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Department/Get_All_Department');
      setDanhSachKhoa(res.data.data || res.data.Data || []);
    } catch (err) { console.error(err); }
  };

  // ==========================
  // HÀM: XỬ LÝ CẤP QUYỀN (POST)
  // ==========================
  const xuLyCapQuyen = async (e) => {
    e.preventDefault();
    try {
      // 1. Tự động lấy FullName của User đang được chọn từ danh sách để gửi lên (nếu Backend vẫn yêu cầu FullName trong DTO)
      const selectedUser = danhSachUser.find(u => (u.userId || u.UserId || u.id) === userId);

      const payload = {
        userId: userId, // Bắt buộc phải là GUID
        newRole: newRole,
        doctorProfile: newRole === 'Doctor' ? {
          doctorCode: doctorCode,
          fullName: selectedUser?.fullName || selectedUser?.FullName || "", // Lấy tự động, không bắt Admin nhập
          specialty: specialty,
          departmentId: newDepartmentId
        } : null
      };

      await axios.post('https://localhost:7071/api/Admin/assign_role', payload, axiosConfig);

      alert(`✅ Cấp quyền ${newRole} cho tài khoản ${selectedUser?.userName || ""} thành công!`);

      // Reset Form
      setUserId(''); setDoctorCode(''); setSpecialty(''); setNewDepartmentId(''); setSearchTerm('');
      setHienThiFormThem(false);
      layDanhSachBacSi();
      layDanhSachUser("");

    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || "Kiểm tra lại mã bác sĩ hoặc kết nối DB";
      alert(`⚠️ Lỗi: ${msg}`);
    }
  };

  // ==========================
  // HÀM: XỬ LÝ CẬP NHẬT (PUT)
  // ==========================
  const batDauSua = (bs) => {
    setBacSiDangSua(bs);
    setChuyenKhoaMoi(bs.specialName || bs.SpecialName || '');
    const khoaHienTai = danhSachKhoa.find(k => (k.name || k.Name) === bs.departmentName);
    setKhoaMoiId(khoaHienTai ? (khoaHienTai.id || khoaHienTai.Id) : '');
    setHienThiFormThem(false);
  };

  const xuLyCapNhat = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://localhost:7071/api/Doctor/Update_Doctor', {
        id: bacSiDangSua.id || bacSiDangSua.Id || bacSiDangSua.doctorId || bacSiDangSua.DoctorId,
        specialty: chuyenKhoaMoi,
        departmentId: khoaMoiId
      }, axiosConfig);
      alert("✅ Cập nhật thành công!");
      setBacSiDangSua(null);
      layDanhSachBacSi();
    } catch (err) { alert("Lỗi khi cập nhật!"); }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>👨‍⚕️ QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN</h2>
        <button
          onClick={() => { setHienThiFormThem(!hienThiFormThem); setBacSiDangSua(null); }}
          style={hienThiFormThem ? btnCloseStyle : btnOpenStyle}>
          {hienThiFormThem ? 'Đóng Form' : '➕ Cấp quyền Bác sĩ / Admin'}
        </button>
      </div>
      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* CỘT TRÁI: FORM THÊM / SỬA */}
        {(hienThiFormThem || bacSiDangSua) && (
          <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: bacSiDangSua ? '#fffdf5' : '#f0f7ff', height: 'fit-content' }}>

            {/* 1. FORM CẤP QUYỀN */}
            {hienThiFormThem && (
              <form onSubmit={xuLyCapQuyen}>
                <h3 style={{ color: '#0056b3', marginTop: 0 }}>Phân quyền mới</h3>

                <label style={labelStyle}>Tìm kiếm tài khoản (Tên/Username):</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); layDanhSachUser(e.target.value); }}
                  placeholder="Gõ để tìm..."
                  style={inputStyle}
                />

                <label style={labelStyle}>Chọn tài khoản chính xác:</label>
                <select
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Chọn User --</option>
                  {danhSachUser.map((u, i) => (
                    <option key={i} value={u.userId || u.UserId || u.id}>
                      {u.userName || u.UserName} - {u.fullName || u.FullName}
                    </option>
                  ))}
                </select>

                <label style={labelStyle}>Vai trò (Role):</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={inputStyle}>
                  <option value="Doctor">Bác sĩ (Doctor)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>

                {newRole === 'Doctor' && (
                  <div style={{ padding: '15px', border: '1px dashed #007bff', borderRadius: '6px', backgroundColor: 'white' }}>
                    <label>Mã Bác sĩ (Unique):</label>
                    <input type="text" value={doctorCode} onChange={e => setDoctorCode(e.target.value)} required placeholder="VD: BS001" style={inputStyle} />

                    <label>Chuyên khoa:</label>
                    <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} required placeholder="VD: Nội soi" style={inputStyle} />

                    <label>Gán vào khoa:</label>
                    <select value={newDepartmentId} onChange={e => setNewDepartmentId(e.target.value)} required style={inputStyle}>
                      <option value="">-- Chọn Khoa --</option>
                      {danhSachKhoa.map((k, i) => <option key={i} value={k.id || k.Id}>{k.name || k.Name}</option>)}
                    </select>
                  </div>
                )}
                <button type="submit" style={btnSubmitStyle}>XÁC NHẬN CẤP QUYỀN</button>
              </form>
            )}

            {/* 2. FORM SỬA BÁC SĨ */}
            {bacSiDangSua && (
              <form onSubmit={xuLyCapNhat}>
                <h3 style={{ color: '#d39e00', marginTop: 0 }}>Sửa: {bacSiDangSua.fullName || bacSiDangSua.FullName}</h3>
                <label style={labelStyle}>Chuyên khoa mới:</label>
                <input type="text" value={chuyenKhoaMoi} onChange={e => setChuyenKhoaMoi(e.target.value)} required style={inputStyle} />

                <label style={labelStyle}>Chuyển sang khoa:</label>
                <select value={khoaMoiId} onChange={e => setKhoaMoiId(e.target.value)} required style={inputStyle}>
                  {danhSachKhoa.map((k, i) => <option key={i} value={k.id || k.Id}>{k.name || k.Name}</option>)}
                </select>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ ...btnSubmitStyle, background: '#ffc107', color: 'black' }}>Lưu</button>
                  <button type="button" onClick={() => setBacSiDangSua(null)} style={{ ...btnSubmitStyle, background: '#6c757d' }}>Hủy</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* CỘT PHẢI: BẢNG DANH SÁCH BÁC SĨ */}
        <div style={{ flex: 2, overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={thStyle}>Mã BS</th>
                <th style={thStyle}>Họ và Tên</th>
                <th style={thStyle}>Khoa</th>
                <th style={thStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachBacSi.map((bs, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f9f9f9' : 'white' }}>
                  <td style={tdStyle}>{bs.doctorId || bs.DoctorId}</td>
                  <td style={{ ...tdStyle, fontWeight: 'bold', color: '#007bff' }}>{bs.fullName || bs.FullName}</td>
                  <td style={tdStyle}>{bs.departmentName || bs.DepartmentName}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => batDauSua(bs)} style={btnEditStyle}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// STYLES
const labelStyle = { display: 'block', fontWeight: 'bold', margin: '10px 0 5px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' };
const thStyle = { padding: '12px', textAlign: 'left', border: '1px solid #ddd' };
const tdStyle = { padding: '12px', border: '1px solid #ddd' };
const btnOpenStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const btnCloseStyle = { ...btnOpenStyle, backgroundColor: '#6c757d' };
const btnSubmitStyle = { width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const btnEditStyle = { padding: '5px 12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };