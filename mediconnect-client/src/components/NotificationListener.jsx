import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
// 1. MỞ COMMENT 2 DÒNG NÀY:
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationListener() {
    const [connection, setConnection] = useState(null);
    const token = localStorage.getItem('token'); 

    useEffect(() => {
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7071/NotificationHub", {
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('🟢 Đã kết nối thành công tới Notification Hub!');

                    connection.on("ReceiveNotification", (notification) => {
                        console.log('🔔 Có thông báo mới:', notification);
                        
                        // 2. TẮT ALERT ĐI VÀ DÙNG TOASTIFY ĐỂ HIỆN POPUP MÀU XANH LÁ
                        toast.success(`🔔 ${notification.title}: ${notification.message}`);
                        // alert(`🔔 ${notification.title}\n${notification.message}`); // Xóa hoặc comment dòng này lại
                    });
                })
                .catch(err => console.error('🔴 Lỗi kết nối SignalR: ', err));

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    // 3. RENDER CÁI KHUNG CHỨA TOAST Ở GÓC TRÊN BÊN PHẢI
    return (
        <>
            <ToastContainer position="top-right" autoClose={5000} theme="colored" />
        </>
    );
}