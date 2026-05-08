import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;
export default function HoSoBacSi({ token }) {
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '', // Chúng ta sẽ gán 'number' từ API vào đây
    avatar: '',
    biography: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      // Gọi API Get_My_Profile
      const res = await axios.get(`${API_BASE_URL}/api/Doctor/Get_My_Profile`, axiosConfig);
      const serverData = res.data.data || res.data.Data;

      if (serverData) {
        console.log("Dữ liệu nhận được:", serverData); // Để bạn kiểm tra trong F12
        setProfile({
          fullName: serverData.fullName || '',
          // 🔴 SỬA LỖI MAPPING: API trả về 'number'
          phoneNumber: serverData.number || '', 
          avatar: serverData.avatar || '',
          biography: serverData.biography || ''
        });
      }
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // Khớp với IFormFile file

    setUploading(true);
    try {
      // Sử dụng UploadController hiện có của bạn
      const res = await axios.post(`${API_BASE_URL}/api/Upload/file`, formData, {
        headers: { ...axiosConfig.headers }
      });
      const newUrl = res.data.fileUrl || res.data.FileUrl;
      setProfile(prev => ({ ...prev, avatar: newUrl }));
      alert("✅ Tải ảnh thành công!");
    } catch (err) {
      alert("❌ Lỗi upload!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi đúng các trường DTO Backend yêu cầu
      await axios.put(`${API_BASE_URL}/api/Doctor/Update_My_Profile`, {
        phoneNumber: profile.phoneNumber,
        avatar: profile.avatar,
        biography: profile.biography
      }, axiosConfig);

      alert("🎉 Đã cập nhật hồ sơ!");
      setIsEditing(false);
      fetchProfile(); // Tải lại để đồng bộ
    } catch (err) {
      alert("❌ Cập nhật thất bại!");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải dữ liệu bác sĩ...</div>;

  // --- CHẾ ĐỘ XEM (VIEW MODE) ---
  if (!isEditing) {
    return (
      <div style={containerStyle}>
        <div style={headerActionStyle}>
          <h2 style={{ margin: 0 }}>👤 Hồ sơ cá nhân</h2>
          <button onClick={() => setIsEditing(true)} style={btnToggleStyle}>⚙️ Sửa hồ sơ</button>
        </div>

        <div style={profileCardStyle}>
          <div style={cardHeaderStyle}>
            <img 
              src={profile.avatar || 'https://via.placeholder.com/150?text=No+Avatar'} 
              alt="Avatar" 
              style={avatarLargeStyle} 
            />
            <h2 style={{ marginTop: '15px' }}>BS. {profile.fullName}</h2>
          </div>
          <div style={cardBodyStyle}>
            <div style={infoBoxStyle}>
              <label style={labelStaticStyle}>📱 SỐ ĐIỆN THOẠI</label>
              <div style={valueStaticStyle}>{profile.phoneNumber || "Chưa có số"}</div>
            </div>
            <div style={{ ...infoBoxStyle, marginTop: '20px' }}>
              <label style={labelStaticStyle}>📖 TIỂU SỬ CHUYÊN MÔN</label>
              <p style={bioTextStyle}>{profile.biography || "Bác sĩ chưa cập nhật tiểu sử."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CHẾ ĐỘ SỬA (EDIT MODE) ---
  return (
    <div style={containerStyle}>
      <div style={headerActionStyle}>
        <h2 style={{ margin: 0 }}>📝 Cập nhật thông tin</h2>
        <button onClick={() => setIsEditing(false)} style={btnCancelStyle}>Hủy</button>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
          <img src={profile.avatar || 'https://via.placeholder.com/150'} alt="Preview" style={avatarPreviewStyle} />
          <input type="file" id="avatarInput" hidden onChange={handleAvatarChange} />
          <label htmlFor="avatarInput" style={btnUploadStyle}>
            {uploading ? "Đang tải..." : "📷 Thay ảnh"}
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Họ và tên (Cố định):</label>
              <input type="text" value={profile.fullName} disabled style={inputDisabledStyle} />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Số điện thoại:</label>
              <input 
                type="text" 
                value={profile.phoneNumber} 
                onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})} 
                required style={inputStyle} 
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Tiểu sử chuyên môn:</label>
              <textarea 
                rows="6" 
                value={profile.biography} 
                onChange={(e) => setProfile({...profile, biography: e.target.value})} 
                style={textareaStyle} 
                placeholder="Nhập kinh nghiệm làm việc..."
              />
            </div>
            <button type="submit" style={btnSubmitStyle}>💾 Lưu thay đổi</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// === STYLES ===
const containerStyle = { padding: '20px', backgroundColor: 'white', borderRadius: '15px' };
const headerActionStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const profileCardStyle = { border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden' };
const cardHeaderStyle = { padding: '30px', textAlign: 'center', background: '#f8f9fa' };
const avatarLargeStyle = { width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white' };
const cardBodyStyle = { padding: '30px' };
const infoBoxStyle = { borderLeft: '4px solid #007bff', paddingLeft: '15px' };
const labelStaticStyle = { fontSize: '12px', fontWeight: 'bold', color: '#999' };
const valueStaticStyle = { fontSize: '18px', fontWeight: '500', color: '#333' };
const bioTextStyle = { lineHeight: '1.6', color: '#555', whiteSpace: 'pre-wrap' };
const btnToggleStyle = { padding: '8px 16px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnCancelStyle = { padding: '8px 16px', background: '#eee', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const avatarPreviewStyle = { width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' };
const btnUploadStyle = { display: 'block', padding: '10px', background: '#007bff', color: 'white', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' };
const formGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' };
const inputDisabledStyle = { ...inputStyle, backgroundColor: '#f5f5f5', color: '#888' };
const textareaStyle = { ...inputStyle, height: '120px', resize: 'none' };
const btnSubmitStyle = { width: '100%', padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };