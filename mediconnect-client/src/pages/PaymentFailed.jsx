import { useNavigate } from 'react-router-dom';

export default function PaymentFailed() {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1 style={{ color: '#dc2626', fontSize: '40px' }}>❌ Thanh toán thất bại hoặc đã hủy!</h1>
            <p style={{ color: '#4b5563', fontSize: '18px', marginTop: '16px' }}>
                Giao dịch chưa được thực hiện thành công. Tiền trong tài khoản của bạn chưa bị trừ.
            </p>
            <button 
                onClick={() => navigate('/invoices')} 
                style={{ marginTop: '24px', padding: '10px 20px', background: '#4b5563', color: 'white', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
            >
                Quay lại để thử lại
            </button>
        </div>
    );
}