import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Đảm bảo bạn đã chạy: npm install recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function DashboardAnalytics({ token: propToken }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Tự động lấy token từ localStorage nếu prop bị trống (để chống văng trang)
  const token = localStorage.getItem('token') || propToken;
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Màu sắc cho biểu đồ tròn (Tỷ lệ khoa)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e84393'];

  // Hàm định dạng tiền VNĐ
  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(val || 0);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/Admin/dashboard-stats`, axiosConfig);
        // Lưu ý: Tên biến phải khớp với DTO bên C# (thường là chữ thường ở đầu khi qua JSON)
        setStats(res.data.data || res.data.Data);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!");
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
    else navigate('/login');
  }, [token, navigate]);

  if (loading) return <div style={msgStyle}>⏳ Đang thu thập và phân tích dữ liệu hệ thống...</div>;
  if (!stats) return <div style={{...msgStyle, color: 'red'}}>❌ Không thể kết nối dữ liệu thống kê.</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        📊 Báo cáo tình hình phòng khám
      </h2>

      {/* --- PHẦN 1: CÁC CHỈ SỐ TỔNG QUAN --- */}
      <div style={gridStyle}>
        <StatCard title="Tổng bệnh nhân" value={stats.totalPatients} icon="👥" color="#4e73df" />
        <StatCard title="Tổng số bác sĩ" value={stats.totalDoctors} icon="👨‍⚕️" color="#1cc88a" />
        <StatCard title="Lịch hôm nay" value={stats.todayAppointments} icon="📅" color="#36b9cc" />
        <StatCard title="Lịch đang chờ" value={stats.pendingAppointments} icon="⏳" color="#f6c23e" />
      </div>

      {/* --- PHẦN 2: CHỈ SỐ DOANH THU --- */}
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '20px' }}>
        <StatCard 
          title="Doanh thu hôm nay" 
          value={formatVND(stats.todayRevenue || stats.TodayRevenue)} 
          icon="💰" color="#e74c3c" 
        />
        <StatCard 
          title="Doanh thu 7 ngày qua" 
          value={formatVND(stats.last7DaysRevenue || stats.Last7DaysRevenue)} 
          icon="📈" color="#fd7e14" 
        />
        <StatCard 
          title="Tổng doanh thu" 
          value={formatVND(stats.totalRevenue || stats.TotalRevenue)} 
          icon="🏦" color="#6f42c1" 
        />
      </div>

      {/* --- PHẦN 3: BIỂU ĐỒ TRỰC QUAN --- */}
      <div style={chartRowStyle}>
        
        {/* Biểu đồ Cột: Lượt khám 7 ngày qua */}
        <div style={chartContainerStyle}>
          <h4 style={chartTitleStyle}>📅 Xu hướng lượt khám (7 ngày gần nhất)</h4>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%"minWidth={0} minHeight={350}>
              <BarChart data={stats.appointmentsLast7Days || stats.AppointmentsLast7Days || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="label" tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                <Tooltip cursor={{fill: '#f8f9fc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Legend />
                <Bar dataKey="value" name="Lượt đặt lịch" fill="#4e73df" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Tròn: Phân bổ theo Khoa */}
        <div style={{ ...chartContainerStyle, flex: '1 1 300px' }}>
          <h4 style={chartTitleStyle}>🏢 Tỷ lệ khám theo Khoa</h4>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%"minWidth={0} minHeight={350}>
              <PieChart>
                <Pie
                  data={stats.appointmentsByDepartment || stats.AppointmentsByDepartment || []}
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="label"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {(stats.appointmentsByDepartment || stats.AppointmentsByDepartment || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Component Thẻ Chỉ Số
function StatCard({ title, value, icon, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      borderLeft: `6px solid ${color}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div>
        <p style={{ color: '#858796', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0' }}>{title}</p>
        <h3 style={{ color: '#2c3e50', fontSize: '22px', margin: 0, fontWeight: '700' }}>{value}</h3>
      </div>
      <div style={{ fontSize: '32px', opacity: 0.25 }}>{icon}</div>
    </div>
  );
}

// STYLES
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px'
};

const chartRowStyle = {
  display: 'flex',
  gap: '20px',
  marginTop: '30px',
  flexWrap: 'wrap'
};

const chartContainerStyle = {
  flex: '2 1 500px',
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
};

const chartTitleStyle = {
  margin: '0 0 20px 0',
  color: '#4e73df',
  fontSize: '16px',
  fontWeight: 'bold',
  borderBottom: '1px solid #f1f1f1',
  paddingBottom: '10px'
};

const msgStyle = {
  textAlign: 'center',
  marginTop: '100px',
  fontSize: '18px',
  color: '#666',
  fontFamily: 'Arial, sans-serif'
};