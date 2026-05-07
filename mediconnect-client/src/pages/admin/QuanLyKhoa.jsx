import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuanLyKhoa({ token }) {
  const [danhSachKhoa, setDanhSachKhoa] = useState([]);
  // State quản lý Form
  const [formData, setFormData] = useState({ id: '', name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  // State quản lý Tab (Đang hoạt động / Thùng rác)
  const [activeSubTab, setActiveSubTab] = useState('active'); 

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };
  const API_BASE_URL = import.meta.env.VITE_API_URL;


  useEffect(() => { 
    layDanhSachKhoa(); 
  }, []);

  const layDanhSachKhoa = async () => {
    try {
      // API này trả về IsDeleted
      const res = await axios.get(`${API_BASE_URL}/api/Department/Get_All_Department`);
      setDanhSachKhoa(res.data.data || res.data.Data || []);
    } catch (err) { 
      console.log(err); 
    }
  };

  // --- THAO TÁC LƯU (THÊM HOẶC SỬA) ---
  const xuLyLuuKhoa = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Gọi API Update
        await axios.put(`${API_BASE_URL}/api/Department/Update_Department`, formData, axiosConfig);
        alert("✅ Cập nhật Khoa thành công!");
      } else {
        // Gọi API Create
        await axios.post(`${API_BASE_URL}/api/Department/Create_Department`, 
          { name: formData.name, description: formData.description }, 
          axiosConfig
        );
        alert("✅ Thêm Khoa thành công!");
      }
      lamMoiForm();
      layDanhSachKhoa();
    } catch (err) { 
      alert(`⚠️ Lỗi: ${err.response?.data?.message || "Thao tác thất bại"}`); 
    }
  };

  // --- THAO TÁC XÓA (SOFT DELETE) ---
  const xuLyXoaKhoa = async (id, name) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn xóa khoa "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/Department/Delete_Department/${id}`, axiosConfig);
      alert("✅ Đã chuyển khoa vào Thùng rác!");
      layDanhSachKhoa();
    } catch (err) { // 4. Xử lý bắt lỗi từ Backend trả về
        if (err.response && err.response.data) {
            // Lấy chính xác trường 'message' từ object lỗi bạn đã cung cấp
            const serverMessage = err.response.data.message;
            alert(`❌ Lỗi: ${serverMessage}`);
        } else {
            // Trường hợp lỗi mạng hoặc server không phản hồi
            alert("❌ Lỗi hệ thống: Không thể kết nối tới máy chủ.");
        }
        console.error("Chi tiết lỗi xóa khoa:", err);
      }
  };

  // --- THAO TÁC KHÔI PHỤC ---
  const xuLyKhoiPhuc = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/Department/Restore_Department/${id}`, {}, axiosConfig);
      alert("✅ Khôi phục khoa thành công!");
      layDanhSachKhoa();
    } catch (err) { alert("❌ Lỗi khôi phục"); }
  };

  const chuanBiSua = (khoa) => {
    setFormData({ id: khoa.id, name: khoa.name, description: khoa.description || '' });
    setIsEditing(true);
  };

  const lamMoiForm = () => {
    setFormData({ id: '', name: '', description: '' });
    setIsEditing(false);
  };

  // Bộ lọc danh sách theo Tab
  const listHienThi = danhSachKhoa.filter(k => 
    activeSubTab === 'active' ? !k.isDeleted : k.isDeleted
  );

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🏥 QUẢN LÝ DANH MỤC KHOA</h2>
      <hr style={{ borderColor: '#eee' }} />
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* CỘT TRÁI: FORM (GIỮ NGUYÊN STYLE CŨ) */}
        <div style={{ flex: 1, padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#f8f9fa', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>
            {isEditing ? "📝 Chỉnh sửa Khoa" : "➕ Thêm Khoa Mới"}
          </h3>
          <form onSubmit={xuLyLuuKhoa}>
            <label style={{display:'block', marginBottom: '5px', fontWeight:'bold'}}>Tên Khoa:</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="Nhập tên Khoa..." 
              style={{ width: '90%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
            
            <label style={{display:'block', marginBottom: '5px', fontWeight:'bold'}}>Mô tả:</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="Mô tả về khoa (nếu có)..." 
              style={{ width: '90%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', height: '80px', resize:'none' }} 
            />

            <button 
              type="submit" 
              style={{ padding: '10px 15px', background: isEditing ? '#007bff' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', width: '95%' }}>
              {isEditing ? "Cập nhật" : "Lưu Khoa"}
            </button>

            {isEditing && (
              <button 
                type="button"
                onClick={lamMoiForm}
                style={{ padding: '10px 15px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', width: '95%', marginTop: '10px' }}>
                Hủy
              </button>
            )}
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH (GIỮ NGUYÊN STYLE CŨ + TAB) */}
        <div style={{ flex: 2 }}>
          
          {/* Nút chuyển Tab */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              onClick={() => setActiveSubTab('active')} 
              style={{ ...btnTabStyle, borderBottom: activeSubTab === 'active' ? '3px solid #28a745' : 'none', color: activeSubTab === 'active' ? '#28a745' : '#666' }}
            >
              ✅ Đang hoạt động
            </button>
            <button 
              onClick={() => setActiveSubTab('deleted')} 
              style={{ ...btnTabStyle, borderBottom: activeSubTab === 'deleted' ? '3px solid #dc3545' : 'none', color: activeSubTab === 'deleted' ? '#dc3545' : '#666' }}
            >
              🗑️ Thùng rác
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#343a40', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>STT</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên Khoa</th>
                <th style={{ padding: '12px', border: '1px solid #ddd' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {listHienThi.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', color: '#888' }}>
                    {activeSubTab === 'active' ? "Chưa có Khoa nào!" : "Thùng rác trống."}
                  </td>
                </tr>
              ) : (
                listHienThi.map((k, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd', backgroundColor: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{i + 1}</td>
                    <td style={{ padding: '12px', color: '#007bff', fontWeight: 'bold', border: '1px solid #ddd' }}>
                      {k.name}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {activeSubTab === 'active' ? (
                        <>
                          <button onClick={() => chuanBiSua(k)} style={btnMiniStyle}>✏️ Sửa</button>
                          <button onClick={() => xuLyXoaKhoa(k.id, k.name)} style={{ ...btnMiniStyle, color: 'red' }}>🗑️ Xóa</button>
                        </>
                      ) : (
                        <button onClick={() => xuLyKhoiPhuc(k.id)} style={{ ...btnMiniStyle, color: '#17a2b8', fontWeight: 'bold' }}>🔄 Khôi phục</button>
                      )}
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

const btnTabStyle = { background: 'none', border: 'none', padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' };
const btnMiniStyle = { background: 'none', border: '1px solid #ddd', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', marginLeft: '5px' };