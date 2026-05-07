import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

 const API_BASE_URL = import.meta.env.VITE_API_URL;
const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const getValue = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

export default function InvoicePage({ token }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchInvoices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Chỉ gọi API lấy hóa đơn cá nhân
      const res = await axios.get(`${API_BASE_URL}/api/Invoice/my-invoices`, axiosConfig);
      setInvoices(res.data?.Data || res.data?.data || []);
    } catch (err) {
      console.error('Lỗi tải hóa đơn:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [token]);

  const stats = useMemo(() => {
    const total = invoices.length;
    const unpaid = invoices.filter((item) => getValue(item, ['isPaid', 'IsPaid'], 'Unpaid') !== 'Paid').length;
    const paid = total - unpaid;
    const totalAmount = invoices.reduce(
      (sum, item) => sum + Number(getValue(item, ['totalAmount', 'TotalAmount'], 0)),
      0
    );
    return { total, unpaid, paid, totalAmount };
  }, [invoices]);

  // HÀM GỌI VNPAY
  const handleVNPayPayment = async (invoiceId) => {
    if (!invoiceId) return;
    setProcessingId(invoiceId);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/Invoice/create-payment-url/${invoiceId}`, {}, axiosConfig);
      
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        alert('Lỗi: Không lấy được đường dẫn thanh toán từ Server.');
      }
    } catch (err) {
      alert(`Không thể kết nối VNPay: ${err.response?.data?.message || 'Lỗi hệ thống'}`);
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '24px auto', padding: '12px' }}>
      <h2 style={{ marginBottom: '18px', color: '#1f2937' }}>Thanh toán viện phí</h2>

      <div style={statsWrapStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Tổng hóa đơn</div>
          <div style={statValueStyle}>{stats.total}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Chưa thanh toán</div>
          <div style={{ ...statValueStyle, color: '#dc2626' }}>{stats.unpaid}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Đã thanh toán</div>
          <div style={{ ...statValueStyle, color: '#16a34a' }}>{stats.paid}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Tổng giá trị</div>
          <div style={statValueStyle}>{formatMoney(stats.totalAmount)}</div>
        </div>
      </div>

      <div style={tableBoxStyle}>
        {loading ? (
          <div style={emptyStyle}>Đang tải hóa đơn...</div>
        ) : invoices.length === 0 ? (
          <div style={emptyStyle}>Hiện chưa có hóa đơn nào.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={thTdStyle}>Ngày tạo</th>
                <th style={thTdStyle}>Khám</th>
                <th style={thTdStyle}>Thuốc</th>
                <th style={thTdStyle}>Cận lâm sàng</th>
                <th style={thTdStyle}>Tổng tiền</th>
                <th style={thTdStyle}>Trạng thái</th>
                <th style={thTdStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((item, idx) => {
                const invoiceId = getValue(item, ['id', 'Id']);
                const paymentStatus = getValue(item, ['isPaid', 'IsPaid'], 'Unpaid');
                const isPaid = paymentStatus === 'Paid';

                return (
                  <tr key={invoiceId || idx} style={rowStyle}>
                    <td style={thTdStyle}>
                      {new Date(getValue(item, ['createdAt', 'CreatedAt'], new Date())).toLocaleString('vi-VN')}
                    </td>
                    <td style={thTdStyle}>{formatMoney(getValue(item, ['consultationFee', 'ConsultationFee'], 0))}</td>
                    <td style={thTdStyle}>{formatMoney(getValue(item, ['medicineFee', 'MedicineFee'], 0))}</td>
                    <td style={thTdStyle}>{formatMoney(getValue(item, ['subclinicalFee', 'SubclinicalFee'], 0))}</td>
                    <td style={{ ...thTdStyle, fontWeight: 700 }}>
                      {formatMoney(getValue(item, ['totalAmount', 'TotalAmount'], 0))}
                    </td>
                    <td style={thTdStyle}>
                      <span style={isPaid ? paidBadgeStyle : unpaidBadgeStyle}>
                        {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td style={thTdStyle}>
                      {/* Nút bấm tự động cực kỳ gọn gàng */}
                      {!isPaid ? (
                         <button
                            onClick={() => handleVNPayPayment(invoiceId)}
                            disabled={processingId === invoiceId}
                            style={requestBtnStyle}
                          >
                            {processingId === invoiceId ? 'Đang kết nối...' : '💳 Thanh toán VNPay'}
                          </button>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: 'bold' }}>Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// CSS (Giữ nguyên các biến styles của bạn, tôi chỉ chỉnh lại màu nút bấm cho đẹp)
const statsWrapStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' };
const statCardStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px' };
const statLabelStyle = { fontSize: '13px', color: '#6b7280', marginBottom: '4px' };
const statValueStyle = { fontSize: '20px', fontWeight: 700, color: '#111827' };
const tableBoxStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const headerRowStyle = { background: '#f9fafb', textAlign: 'left' };
const rowStyle = { borderTop: '1px solid #f1f5f9' };
const thTdStyle = { padding: '12px', fontSize: '14px', verticalAlign: 'top' };
const emptyStyle = { padding: '24px', textAlign: 'center', color: '#6b7280' };
const paidBadgeStyle = { display: 'inline-block', padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '999px', fontSize: '12px', fontWeight: 600 };
const unpaidBadgeStyle = { display: 'inline-block', padding: '4px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '999px', fontSize: '12px', fontWeight: 600 };
const requestBtnStyle = { padding: '7px 12px', border: 'none', borderRadius: '7px', cursor: 'pointer', background: '#10b981', color: 'white', fontWeight: 600 };