import { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function HoSoCaNhan({ token }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  
  // State khớp 100% với Entity Patient.cs
  const [formData, setFormData] = useState({
    fullName: '',      // Read-only vì Constructor yêu cầu lúc tạo
    dateOfBirth: '',
    nationalId: '',
    phoneNumber: '',
    isMale: ''     
  });

  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}` } };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/Patient/my-profile`, axiosConfig);
      const data = res.data.data || res.data.Data;
      setProfile(data);
      
      setFormData({
        fullName: data.fullName || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        nationalId: data.nationalId || '',
        phoneNumber: data.phoneNumber || '',
        isMale: data.isMale ?? true 
      });
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Gửi đúng các tham số mà hàm UpdatePatient trong C# yêu cầu
      const payload = {
        date: formData.dateOfBirth,
        nationalId: formData.nationalId,
        phoneNumber: formData.phoneNumber,
        isMale: formData.isMale
      };

      await axios.post(`${API_BASE_URL}/api/Patient/update-profile`, payload, axiosConfig);
      alert("✅ Cập nhật hồ sơ bệnh nhân thành công!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      alert("⚠️ Lỗi: " + (err.response?.data?.message || "Ngày sinh không hợp lệ"));
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải thông tin...</p>;

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>👤 THÔNG TIN BỆNH NHÂN</h2>

      {!isEditing ? (
        <div style={{ lineHeight: '2.5' }}>
          <p><strong>Họ và tên:</strong> <span style={{ color: '#007bff' }}>{profile?.fullName}</span></p>
          <p><strong>Ngày sinh:</strong> {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : '---'}</p>
          <p><strong>Số CCCD:</strong> {profile?.nationalId || 'Chưa cập nhật'}</p>
          <p><strong>Số điện thoại:</strong> {profile?.phoneNumber || 'Chưa cập nhật'}</p>
          <p><strong>Giới tính:</strong> {profile?.sex || 'Chưa cập nhật'}</p>
          
          <button onClick={() => setIsEditing(true)} style={btnPrimaryStyle}>
            Chỉnh sửa hồ sơ
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Họ và tên (Không thể sửa):</label>
            <input type="text" value={formData.fullName} disabled style={{ ...inputStyle, backgroundColor: '#f8f9fa', color: '#6c757d' }} />
          </div>

          <label style={labelStyle}>Ngày sinh:</label>
          <input type="date" value={formData.dateOfBirth} 
            onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} 
            style={inputStyle} required />

          <label style={labelStyle}>Số CCCD:</label>
          <input type="text" value={formData.nationalId} 
            onChange={e => setFormData({...formData, nationalId: e.target.value})} 
            style={inputStyle} placeholder="Nhập số CMND/CCCD" />

          <label style={labelStyle}>Số điện thoại:</label>
          <input type="text" value={formData.phoneNumber} 
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
            style={inputStyle} placeholder="Nhập số điện thoại" />

          <label style={labelStyle}>Giới tính:</label>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="radio" checked={formData.isMale === true} onChange={() => setFormData({...formData, isMale: true})} /> Nam
            </label>
            <label style={{ cursor: 'pointer' }}>
              <input type="radio" checked={formData.isMale === false} onChange={() => setFormData({...formData, isMale: false})} /> Nữ
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ ...btnPrimaryStyle, backgroundColor: '#28a745' }}>Lưu thông tin</button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ ...btnPrimaryStyle, backgroundColor: '#6c757d' }}>Hủy</button>
          </div>
        </form>
      )}
    </div>
  );
}

// Styles
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnPrimaryStyle = { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };