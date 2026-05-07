import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1 style={{ color: '#16a34a', fontSize: '40px' }}>✅ Thanh toán thành công!</h1>
            <p style={{ color: '#4b5563', fontSize: '18px', marginTop: '16px' }}>
                Hóa đơn của bạn đã được thanh toán. Cảm ơn bạn đã sử dụng dịch vụ của phòng khám.
            </p>
            <button 
                onClick={() => navigate('/invoices')} // Đổi link này về đúng đường dẫn trang Hóa đơn của bạn
                style={{ marginTop: '24px', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
            >
                Quay lại danh sách Hóa đơn
            </button>
        </div>
    );
}