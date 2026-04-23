import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const getValue = (obj, keys, fallback = null) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return fallback;
};

export default function InvoicePage({ token, role }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');

  const isAdmin = role?.toLowerCase() === 'admin';
  const isPatient = role?.toLowerCase() === 'patient';
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchInvoices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const endpoint = isAdmin
        ? 'https://localhost:7071/api/Invoice/pending-invoices'
        : 'https://localhost:7071/api/Invoice/my-invoices';
      const res = await axios.get(endpoint, axiosConfig);
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
  }, [token, role]);

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

  const handleConfirmPayment = async (invoiceId) => {
    if (!isAdmin) return;
    if (!window.confirm('Xác nhận hóa đơn này đã thanh toán?')) return;

    setProcessingId(invoiceId);
    try {
      await axios.post(`https://localhost:7071/api/Invoice/confirm-payment/${invoiceId}`, {}, axiosConfig);
      await fetchInvoices();
      alert('Đã xác nhận thanh toán.');
    } catch (err) {
      alert(`Không thể xác nhận: ${err.response?.data?.message || 'Lỗi hệ thống'}`);
    } finally {
      setProcessingId('');
    }
  };

  const handleSendPaymentRequest = (invoiceId) => {
    if (!isPatient || !invoiceId) return;
    setProcessingId(invoiceId);
    axios
      .post(`https://localhost:7071/api/Invoice/request-payment/${invoiceId}`, {}, axiosConfig)
      .then(async () => {
        await fetchInvoices();
        alert('Đã gửi yêu cầu thanh toán. Vui lòng chờ thu ngân xác nhận.');
      })
      .catch((err) => {
        alert(`Không thể gửi yêu cầu: ${err.response?.data?.message || 'Lỗi hệ thống'}`);
      })
      .finally(() => {
        setProcessingId('');
      });
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
                <th style={thTdStyle}>Bệnh nhân</th>
                <th style={thTdStyle}>Khám</th>
                <th style={thTdStyle}>Thuốc</th>
                <th style={thTdStyle}>Cận lâm sàng</th>
                <th style={thTdStyle}>Tổng tiền</th>
                <th style={thTdStyle}>Trạng thái</th>
                {(isAdmin || isPatient) && <th style={thTdStyle}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {invoices.map((item, idx) => {
                const invoiceId = getValue(item, ['id', 'Id']);
                const paymentStatus = getValue(item, ['isPaid', 'IsPaid'], 'Unpaid');
                const isPaid = paymentStatus === 'Paid';
                const isRequested = paymentStatus === 'Pending';

                return (
                  <tr key={invoiceId || idx} style={rowStyle}>
                    <td style={thTdStyle}>
                      {new Date(getValue(item, ['createdAt', 'CreatedAt'], new Date())).toLocaleString('vi-VN')}
                    </td>
                    <td style={thTdStyle}>{getValue(item, ['patientName', 'PatientName'], 'N/A')}</td>
                    <td style={thTdStyle}>
                      {formatMoney(getValue(item, ['consultationFee', 'ConsultationFee'], 0))}
                    </td>
                    <td style={thTdStyle}>{formatMoney(getValue(item, ['medicineFee', 'MedicineFee'], 0))}</td>
                    <td style={thTdStyle}>
                      {formatMoney(getValue(item, ['subclinicalFee', 'SubclinicalFee'], 0))}
                    </td>
                    <td style={{ ...thTdStyle, fontWeight: 700 }}>
                      {formatMoney(getValue(item, ['totalAmount', 'TotalAmount'], 0))}
                    </td>
                    <td style={thTdStyle}>
                      <span style={isPaid ? paidBadgeStyle : isRequested ? requestedBadgeStyle : unpaidBadgeStyle}>
                        {isPaid ? 'Đã thanh toán' : isRequested ? 'Đang chờ duyệt' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    {(isAdmin || isPatient) && (
                      <td style={thTdStyle}>
                        {isAdmin && !isPaid ? (
                          <button
                            onClick={() => handleConfirmPayment(invoiceId)}
                            disabled={processingId === invoiceId}
                            style={confirmBtnStyle}
                          >
                            {processingId === invoiceId ? 'Đang xử lý...' : 'Xác nhận'}
                          </button>
                        ) : isPatient && !isPaid ? (
                          <button
                            onClick={() => handleSendPaymentRequest(invoiceId)}
                            disabled={isRequested || processingId === invoiceId}
                            style={isRequested ? requestedBtnStyle : requestBtnStyle}
                          >
                            {processingId === invoiceId
                              ? 'Đang gửi...'
                              : isRequested
                                ? 'Đã gửi yêu cầu'
                                : 'Gửi yêu cầu thanh toán'}
                          </button>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>Hoàn tất</span>
                        )}
                      </td>
                    )}
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
const requestedBadgeStyle = { display: 'inline-block', padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '12px', fontWeight: 600 };
const confirmBtnStyle = { padding: '7px 12px', border: 'none', borderRadius: '7px', cursor: 'pointer', background: '#2563eb', color: 'white', fontWeight: 600 };
const requestBtnStyle = { padding: '7px 12px', border: 'none', borderRadius: '7px', cursor: 'pointer', background: '#0ea5e9', color: 'white', fontWeight: 600 };
const requestedBtnStyle = { ...requestBtnStyle, background: '#94a3b8', cursor: 'not-allowed' };