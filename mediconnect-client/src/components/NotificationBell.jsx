import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios'; // Dùng để gọi API
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_API_URL;
export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem('token');

    // 1. LẤY THÔNG BÁO OFFLINE (KHI VỪA MỞ TRANG)
    useEffect(() => {
        if (!token) return;
        
        // Gọi API lấy dữ liệu từ Database
        axios.get(`${API_BASE_URL}:7071/api/Notification/my-notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setNotifications(res.data))
        .catch(err => console.error("Lỗi lấy thông báo:", err));
    }, [token]);

    // 2. LẮNG NGHE THÔNG BÁO ONLINE (SIGNALR)
    useEffect(() => {
        if (!token) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}:7071/NotificationHub`, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .build();

        connection.start().then(() => {
            connection.on("ReceiveNotification", (newNotif) => {
                toast.success(`🔔 ${newNotif.title}: ${newNotif.message}`);
                
                // Cập nhật ngay vào danh sách hiện tại (đẩy lên đầu)
                // Mặc định thông báo mới tới thì IsRead = false
                setNotifications(prev => [{ ...newNotif, isRead: false }, ...prev]);
            });
        });

        return () => connection.stop();
    }, [token]);

    // 3. XỬ LÝ KHI CLICK VÀO 1 THÔNG BÁO
    const handleReadNotification = async (notifId, isRead) => {
        if (isRead) return; // Đã đọc rồi thì bỏ qua

        try {
            // Gọi API cập nhật IsRead = true dưới DB
            await axios.put(`${API_BASE_URL}/api/Notification/mark-read/${notifId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Cập nhật lại state giao diện (Đổi màu)
            setNotifications(prev => 
                prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
        }
    };

    // Đếm số lượng chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div style={{ position: 'relative', cursor: 'pointer' }}>
            {/* ICON QUẢ CHUÔNG */}
            <div onClick={() => setIsOpen(!isOpen)} style={{ fontSize: '24px' }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-10px',
                        background: 'red', color: 'white', borderRadius: '50%',
                        padding: '2px 6px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* BẢNG DANH SÁCH THÔNG BÁO (DROPDOWN) */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '40px', right: '0', width: '300px',
                    background: 'white', border: '1px solid #ccc', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto'
                }}>
                    <h4 style={{ padding: '10px', margin: 0, borderBottom: '1px solid #eee', color: 'black' }}>Thông báo</h4>
                    {notifications.length === 0 ? (
                        <p style={{ padding: '10px', color: '#666', textAlign: 'center' }}>Không có thông báo nào.</p>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => handleReadNotification(n.id, n.isRead)}
                                style={{
                                    padding: '12px', 
                                    borderBottom: '1px solid #f0f0f0',
                                    // ĐÂY LÀ CHỖ DÙNG isRead ĐỂ ĐỔI MÀU NỀN:
                                    backgroundColor: n.isRead ? 'white' : '#e6f7ff', 
                                    color: n.isRead ? '#666' : 'black',
                                    transition: 'background 0.3s'
                                }}
                            >
                                <strong style={{ display: 'block', fontSize: '14px' }}>{n.title}</strong>
                                <span style={{ fontSize: '13px' }}>{n.message}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}