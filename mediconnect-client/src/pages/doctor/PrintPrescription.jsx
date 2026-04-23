import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PrintPrescription() {
    const { recordId } = useParams();
    const navigate = useNavigate();

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchRecordDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setErrorMsg("Không tìm thấy Token đăng nhập.");
                    setLoading(false);
                    return;
                }

                const url = `https://localhost:7071/api/Doctor/medical-record-detail/${recordId}`;
                const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
                setRecord(res.data.data || res.data.Data);
            } catch (err) {
                console.error("LỖI GỌI API:", err);
                if (err.response?.status === 404) setErrorMsg(`Lỗi 404: Không tìm thấy dữ liệu bệnh án.`);
                else if (err.response?.status === 401) setErrorMsg("Lỗi 401: Token hết hạn, vui lòng đăng nhập lại.");
                else setErrorMsg(err.response?.data?.message || err.message || "Lỗi không xác định.");
            } finally {
                setLoading(false);
            }
        };

        if (recordId) fetchRecordDetail();
    }, [recordId]);

    const handlePrint = () => window.print();

    // 1. Loading & Lỗi
    if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>⏳ Đang tải form in...</h3>;
    if (errorMsg) return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h2 style={{ color: 'red' }}>🛑 KHÔNG THỂ TẢI BỆNH ÁN</h2>
            <p>{errorMsg}</p>
            <button onClick={() => navigate(-1)} className="btn-back">⬅ Quay lại</button>
        </div>
    );
    if (!record) return <h3 style={{ textAlign: 'center', color: 'red' }}>Dữ liệu trống!</h3>;

    // --- BẮT ĐẦU GIAO DIỆN IN ---
    return (
        <div className="print-wrapper">

            {/* Thanh công cụ (Ẩn khi in) */}
            <div className="no-print toolbar">
                <button onClick={() => navigate(-1)} className="btn-back">⬅ Quay lại</button>
                <button onClick={handlePrint} className="btn-print">🖨️ IN ĐƠN THUỐC</button>
            </div>

            {/* TRANG A4 */}
            <div className="a4-page">

                {/* PHẦN 1: HEADER PHÒNG KHÁM */}
                <div className="header-section">
                    <div className="clinic-info">
                        <div className="logo-placeholder">🏥</div>
                        <div>
                            <h2 className="clinic-name">HỆ THỐNG Y TẾ MEDICONNECT</h2>
                            <p className="clinic-address">📍 123 Đường Công Nghệ, Quận Cầu Giấy, Hà Nội</p>
                            <p className="clinic-contact">📞 Hotline: 1900 1515 | 🌐 mediconnect.vn</p>
                        </div>
                    </div>
                    <div className="prescription-title-box">
                        <h1 className="main-title">ĐƠN THUỐC</h1>
                        <p className="barcode">Mã BA: <strong>{recordId.substring(0, 8).toUpperCase()}</strong></p>
                    </div>
                </div>

                <hr className="divider" />

                {/* PHẦN 2: THÔNG TIN BỆNH NHÂN (Dàn Grid hiện đại) */}
                <div className="patient-info-box">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Họ tên bệnh nhân:</span>
                            <span className="info-value uppercase bold">{record.patientName || "Chưa cập nhật"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Ngày khám:</span>
                            <span className="info-value">{new Date(record.date || record.Date || new Date()).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="info-item full-width">
                            <span className="info-label">Lý do / Triệu chứng:</span>
                            <span className="info-value">{record.symptoms || record.Symptoms || "Không ghi nhận"}</span>
                        </div>
                        <div className="info-item full-width highlight-box">
                            <span className="info-label">CHẨN ĐOÁN:</span>
                            <span className="info-value text-danger bold">{record.diagnosis || record.Diagnosis || "Đang chờ kết luận"}</span>
                        </div>
                    </div>
                </div>

                {/* PHẦN 3: DANH SÁCH THUỐC */}
                <div className="medicine-section">
                    <h3 className="section-title">💊 CHỈ ĐỊNH DÙNG THUỐC:</h3>
                    <table className="medicine-table">
                        <thead>
                            <tr>
                                <th width="5%">STT</th>
                                <th width="40%">Tên thuốc / Hàm lượng</th>
                                <th width="15%">Số lượng</th>
                                <th width="40%">Hướng dẫn sử dụng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(record.medicines || record.Medicines || []).map((m, i) => (
                                <tr key={i}>
                                    <td className="center bold">{i + 1}</td>
                                    <td>
                                        <div className="med-name">{m.medicineName || m.MedicineName}</div>
                                    </td>
                                    <td className="center bold">{m.quantity || m.Quantity}</td>
                                    <td className="italic">{m.instructions || m.Instructions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(record.medicines || record.Medicines || []).length === 0 && (
                        <p className="empty-meds">Bác sĩ không chỉ định dùng thuốc cho ca khám này.</p>
                    )}
                </div>

                {/* PHẦN 4: FOOTER CHỮ KÝ */}
                <div className="footer-section">
                    <div className="advice-box">
                        <h4>Lời dặn của bác sĩ:</h4>
                        <p>- Uống thuốc đúng giờ, không tự ý ngưng thuốc.</p>
                        <p>- Tái khám nhớ mang theo đơn thuốc này.</p>
                        <p>- Nếu có dấu hiệu bất thường, gọi ngay Hotline 1900 1515.</p>
                    </div>
                    <div className="signature-box">
                        <p className="date-text">
                            Hà Nội, Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}
                        </p>
                        <p className="doctor-title">BÁC SĨ ĐIỀU TRỊ</p>
                        <div className="signature-space">
                            {/* Chữ ký điện tử hoặc khoảng trống */}
                            <span className="stamp">ĐÃ KÝ</span>
                        </div>
                        <p className="doctor-name">BS. {record.doctorName || record.DoctorName}</p>
                    </div>
                </div>
            </div>

            {/* CSS TỔNG HỢP (Chứa các trick in ấn) */}
            <style>
                {`
                :root {
                    --primary-color: #0056b3;
                    --text-color: #333;
                    --border-color: #dee2e6;
                }
                
                .print-wrapper {
                    background-color: #525659;
                    min-height: 100vh;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }

                .toolbar {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .btn-print { padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s; }
                .btn-print:hover { background: #218838; transform: translateY(-2px); }
                .btn-back { padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px; }

                /* Cấu trúc tờ A4 */
                .a4-page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 25mm 20mm;
                    background-color: white;
                    margin: 0 auto;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    box-sizing: border-box;
                    color: var(--text-color);
                    position: relative;
                }

                /* Header */
                .header-section { display: flex; justify-content: space-between; align-items: flex-start; }
                .clinic-info { display: flex; gap: 15px; align-items: center; }
                .logo-placeholder { font-size: 50px; line-height: 1; }
                .clinic-name { margin: 0 0 5px 0; color: var(--primary-color); font-size: 20px; font-weight: 800; text-transform: uppercase; }
                .clinic-address, .clinic-contact { margin: 2px 0; font-size: 13px; color: #555; }
                
                .prescription-title-box { text-align: right; }
                .main-title { margin: 0; color: #dc3545; font-size: 28px; font-weight: 900; letter-spacing: 1px; }
                .barcode { margin: 5px 0 0; font-size: 14px; background: #f8f9fa; padding: 4px 10px; border-radius: 4px; display: inline-block; border: 1px dashed #ccc; }

                .divider { border: 0; height: 3px; background: var(--primary-color); margin: 25px 0; border-radius: 2px; }

                /* Patient Info */
                .patient-info-box { background: #f8faff; border: 1px solid #b8daff; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .full-width { grid-column: span 2; }
                .info-label { color: #666; font-size: 14px; margin-right: 8px; }
                .info-value { font-size: 15px; color: #111; }
                .uppercase { text-transform: uppercase; }
                .bold { font-weight: bold; }
                .text-danger { color: #dc3545; }
                .highlight-box { background: white; padding: 10px; border-radius: 6px; border-left: 4px solid #dc3545; margin-top: 5px; }

                /* Table */
                .medicine-section { margin-bottom: 40px; }
                .section-title { font-size: 18px; color: var(--primary-color); border-bottom: 2px solid var(--primary-color); display: inline-block; padding-bottom: 5px; margin-bottom: 15px; }
                .medicine-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .medicine-table th { background-color: var(--primary-color) !important; color: white !important; padding: 12px; text-align: left; font-size: 14px; border: 1px solid var(--primary-color); }
                .medicine-table td { padding: 12px; border: 1px solid var(--border-color); font-size: 15px; vertical-align: middle; }
                .medicine-table tr:nth-child(even) { background-color: #f8f9fa !important; }
                .med-name { font-weight: bold; color: #2c3e50; font-size: 16px; }
                .center { text-align: center; }
                .italic { font-style: italic; color: #555; }
                .empty-meds { text-align: center; padding: 20px; color: #888; font-style: italic; background: #f9f9f9; border: 1px dashed #ccc; border-radius: 6px; }

                /* Footer */
                .footer-section { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
                .advice-box { width: 55%; font-size: 13px; color: #555; background: #fffdf5; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; }
                .advice-box h4 { margin: 0 0 10px 0; color: #856404; }
                .advice-box p { margin: 5px 0; }
                
                .signature-box { width: 40%; text-align: center; }
                .date-text { font-style: italic; font-size: 14px; margin: 0 0 10px 0; }
                .doctor-title { font-weight: bold; font-size: 16px; margin: 0; color: #2c3e50; }
                .signature-space { height: 100px; display: flex; align-items: center; justify-content: center; position: relative; }
                .stamp { color: rgba(220, 53, 69, 0.2); border: 3px solid rgba(220, 53, 69, 0.2); padding: 5px 15px; transform: rotate(-15deg); font-weight: 900; font-size: 24px; letter-spacing: 2px; }
                .doctor-name { font-weight: bold; font-size: 16px; margin: 0; text-transform: uppercase; color: var(--primary-color); }

                /* ========================================= */
                /* CSS MA THUẬT DÀNH RIÊNG CHO MÁY IN        */
                /* ========================================= */
                @media print {
                    /* Bắt trình duyệt in màu nền và màu chữ (Quan trọng nhất) */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Ẩn giao diện web */
                    body { background: white; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    
                    /* Đưa trang A4 ra toàn màn hình giấy */
                    .print-wrapper { background: none; padding: 0; }
                    .a4-page {
                        box-shadow: none;
                        width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    
                    /* Đảm bảo bảng không bị cắt ngang giữa 2 trang */
                    tr { page-break-inside: avoid; }
                }
                `}
            </style>
        </div>
    );
}