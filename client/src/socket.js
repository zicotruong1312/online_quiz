import { io } from 'socket.io-client';

// Kết nối tới Backend Express Node.js chạy ở cổng 5000
const URL = 'http://localhost:5000';
export const socket = io(URL, { autoConnect: true });
