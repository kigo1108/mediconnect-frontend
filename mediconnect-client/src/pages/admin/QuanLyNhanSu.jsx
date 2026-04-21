import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuanLyNhanSu({ token }) {
const [danhSachUser, setDanhSachUser] = useState([]);
  const [danhSachBacSi, setDanhSachBacSi] = useState([]);
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  
  // ==========================
  // STATE: FORM SỬA BÁC SĨ
  // ==========================
  const [bacSiDangSua, setBacSiDangSua] = useState(null);
  const [chuyenKhoaMoi, setChuyenKhoaMoi] = useState('');
  const [khoaMoiId, setKhoaMoiId] = useState('');

  // ==========================
  // STATE: FORM THÊM / CẤP QUYỀN
  // ==========================
  
  const [hienThiFormThem, setHienThiFormThem] = useState(false);
  const [userId, setUserId] = useState('');
  const [newRole, setNewRole] = useState('Doctor'); // Mặc định là cấp quyền Bác sĩ
  
  // Hồ sơ bác sĩ (Chỉ dùng khi role là Doctor)
  const [doctorCode, setDoctorCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [newDepartmentId, setNewDepartmentId] = useState('');

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  useEffect(() => {
    layDanhSachBacSi();
    layDanhSachKhoa();
    layDanhSachUser();
  }, []);

  const layDanhSachBacSi = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Doctor/GetAllDoctors', axiosConfig);
      setDanhSachBacSi(res.data.data || res.data.Data || []);
    } catch (err) { console.log(err); }
  };

  const layDanhSachKhoa = async () => {
    try {
      const res = await axios.get('https://localhost:7071/api/Department/Get_All_Department');
      setDanhSachKhoa(res.data.data || res.data.Data || []);
    } catch (err) { console.log(err); }
  };
  const layDanhSachUser = async () => {
  try {
    const res = await axios.get('https://localhost:7071/api/Auth/get_users_for_assignment', axiosConfig);
    setDanhSachUser(res.data.data || res.data.Data || []);
  } catch (err) { console.log("Lỗi lấy danh sách user:", err); }
};

  // ==========================
  // HÀM: XỬ LÝ CẤP QUYỀN (POST)
  // ==========================
  const xuLyCapQuyen = async (e) => {
    e.preventDefault();
    try {
      // 1. Dựng Payload khớp 100% với AssignRoleRequest.cs
      const payload = {
        userId: userId,
        newRole: newRole,
        doctorProfile: newRole === 'Doctor' ? {
          doctorCode: doctorCode,
          fullName: fullName,
          specialty: specialty,
          departmentId: newDepartmentId
        } : null // Nếu cấp quyền Admin thì không cần gửi hồ sơ bác sĩ
      };

      // 2. Gửi API
      await axios.post('https://localhost:7071/api/Auth/assign_role', payload, axiosConfig);

      alert(`✅ Cấp quyền ${newRole} thành công!`);
      
      // 3. Xóa trắng form và tải lại bảng
      setUserId(''); setDoctorCode(''); setFullName(''); setSpecialty(''); setNewDepartmentId('');
      setHienThiFormThem(false);
      layDanhSachBacSi(); 

    } catch (err) {
      if (err.response) {
        alert(`⚠️ Lỗi: ${err.response.data.message || 'Kiểm tra lại UserId hoặc Dữ liệu'}`);
      } else {
        alert("🔌 Lỗi kết nối mạng!");
      }
    }
  };

  // ==========================
  // HÀM: XỬ LÝ SỬA BÁC SĨ (PUT)
  // ==========================
  const batDauSua = (bacSi) => {
    setBacSiDangSua(bacSi);
    setChuyenKhoaMoi(bacSi.specialName || '');
    const khoaHienTai = danhSachKhoa.find(k => (k.name || k.tenKhoa) === bacSi.departmentName);
    setKhoaMoiId(khoaHienTai ? (khoaHienTai.id || khoaHienTai.Id) : '');
    setHienThiFormThem(false); // Đóng form thêm nếu đang mở
  };

  const huySua = () => { setBacSiDangSua(null); };

  const xuLyCapNhat = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://localhost:7071/api/Doctor/Update_Doctor', {
        id: bacSiDangSua.id || bacSiDangSua.Id,
        specialty: chuyenKhoaMoi,
        departmentId: khoaMoiId
      }, axiosConfig);
      alert("✅ Cập nhật thông tin Bác sĩ thành công!");
      huySua();
      layDanhSachBacSi();
    } catch (err) { alert("Lỗi khi cập nhật!"); }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#2c3e50', marginTop: 0 }}>👨‍⚕️ QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN</h2>
        
        {/* NÚT MỞ FORM THÊM NHÂN SỰ */}
        <button 
          onClick={() => { setHienThiFormThem(!hienThiFormThem); setBacSiDangSua(null); }}
          style={{ padding: '10px 20px', backgroundColor: hienThiFormThem ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {hienThiFormThem ? 'Đóng Form' : '➕ Cấp quyền / Thêm Bác sĩ'}
        </button>
      </div>
      <hr style={{ borderColor: '#eee' }} />
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* ================================== */}
        {/* KHU VỰC CỘT TRÁI: FORMS THÊM / SỬA */}
        {/* ================================== */}
        {(hienThiFormThem || bacSiDangSua) && (
          <div style={{ flex: 1, padding: '20px', border: bacSiDangSua ? '1px solid #ffc107' : '1px solid #007bff', borderRadius: '8px', background: bacSiDangSua ? '#fffdf5' : '#e9f5ff', height: 'fit-content' }}>
            
            {/* 1. FORM CẤP QUYỀN MỚI */}
            {hienThiFormThem && (
              <>
                <h3 style={{ color: '#0056b3', marginTop: 0 }}>➕ Phân Quyền Tài Khoản</h3>
                <form onSubmit={xuLyCapQuyen}>
                  
                  <label style={{ fontWeight: 'bold' }}>User ID (Của tài khoản cần cấp):</label>
                  <label style={{ fontWeight: 'bold' }}>Chọn Tài khoản (Email/Tên):</label>
                    <select 
                    value={userId} 
                    onChange={e => setUserId(e.target.value)} 
                    required 
                    style={{ width: '95%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                    <option value="">-- Chọn tài khoản cần nâng cấp --</option>
                    {danhSachUser.map((u, i) => (
                        <option key={i} value={u.id || u.Id}>
                        {u.email || u.Email} {(u.fullName || u.FullName) ? `- ${u.fullName || u.FullName}` : ''}
                        </option>
                    ))}
                    </select>

                  <label style={{ fontWeight: 'bold' }}>Phân Quyền (Role):</label>
                  <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '95%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="Doctor">Bác sĩ (Doctor)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>

                  {/* CHỈ HIỆN THÔNG TIN NÀY NẾU CHỌN ROLE LÀ DOCTOR */}
                  {newRole === 'Doctor' && (
                    <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px dashed #007bff', marginBottom: '15px' }}>
                      <h4 style={{ marginTop: 0, color: '#007bff' }}>📄 Hồ Sơ Bác Sĩ</h4>
                      
                      <label>Mã Bác Sĩ:</label>
                      <input type="text" value={doctorCode} onChange={e => setDoctorCode(e.target.value)} required placeholder="VD: BS001" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
                      
                      <label>Họ và Tên:</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="VD: Nguyễn Văn A" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
                      
                      <label>Chuyên khoa:</label>
                      <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} required placeholder="VD: Nội tổng hợp" style={{ width: '90%', padding: '8px', marginBottom: '10px' }} />
                      
                      <label>Phân vào Khoa:</label>
                      <select value={newDepartmentId} onChange={e => setNewDepartmentId(e.target.value)} required style={{ width: '95%', padding: '8px', marginBottom: '10px' }}>
                        <option value="">-- Chọn Khoa --</option>
                        {danhSachKhoa.map((k, i) => (
                          <option key={i} value={k.id || k.Id}>{k.name || k.tenKhoa}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Xác Nhận Cấp Quyền
                  </button>
                </form>
              </>
            )}

            {/* 2. FORM SỬA BÁC SĨ (Giữ nguyên như cũ) */}
            {bacSiDangSua && (
              <>
                <h3 style={{ color: '#d39e00', marginTop: 0 }}>Sửa thông tin: {bacSiDangSua.fullName || bacSiDangSua.FullName}</h3>
                <form onSubmit={xuLyCapNhat}>
                  <label style={{ fontWeight: 'bold' }}>Chuyên khoa:</label><br />
                  <input type="text" value={chuyenKhoaMoi} onChange={(e) => setChuyenKhoaMoi(e.target.value)} required style={{ width: '90%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  
                  <label style={{ fontWeight: 'bold' }}>Chuyển Khoa:</label><br />
                  <select value={khoaMoiId} onChange={(e) => setKhoaMoiId(e.target.value)} required style={{ width: '95%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="">-- Chọn Khoa mới --</option>
                    {danhSachKhoa.map((k, i) => <option key={i} value={k.id || k.Id}>{k.name || k.tenKhoa}</option> )}
                  </select>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Lưu thay đổi</button>
                    <button type="button" onClick={huySua} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Hủy</button>
                  </div>
                </form>
              </>
            )}

          </div>
        )}

        {/* ================================== */}
        {/* CỘT PHẢI: BẢNG DANH SÁCH BÁC SĨ */}
        {/* ================================== */}
        <div style={{ flex: (hienThiFormThem || bacSiDangSua) ? 2 : 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>STT</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Mã BS</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Họ và Tên</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Chuyên khoa</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Khoa hiện tại</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachBacSi.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Chưa có Bác sĩ nào.</td></tr>
              ) : (
                danhSachBacSi.map((bs, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', color: '#666' }}>{bs.doctorId || bs.DoctorId}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold', color: '#007bff' }}>{bs.fullName || bs.FullName}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bs.specialName || bs.SpecialName || 'Chưa cập nhật'}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{bs.departmentName || bs.DepartmentName || 'Chưa phân khoa'}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button onClick={() => batDauSua(bs)} style={{ padding: '6px 12px', background: '#ffc107', color: '#212529', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}