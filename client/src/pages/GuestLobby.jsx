import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuestLobby() {
    const navigate = useNavigate();
    const pin = sessionStorage.getItem('quiz_pin');
    const username = sessionStorage.getItem('quiz_username');

    useEffect(() => {
        if(!pin || !username) navigate('/join');

        // Xin join phòng
        socket.emit('guest:join_room', { pin, username }, (response) => {
            if(!response.success) {
                alert(response.message);
                navigate('/join');
            } else {
                sessionStorage.setItem('quizId', response.room.quizId);
                sessionStorage.setItem('allowedCards', JSON.stringify(response.room.allowedCards));
            }
        });

        // Lệnh bị Kick từ Host
        socket.on('guest:kicked', () => {
            alert("Bạn đã bị Chủ phòng KICK ra khỏi phòng vì lý do nào đó!");
            sessionStorage.clear();
            navigate('/');
        });

        // Host bấm Start
        socket.on('room:game_started', () => {
            navigate('/play');
        });

        // Thu hồi phòng
        socket.on('room:game_stopped', () => {
            alert("Host đã giải tán phòng chờ!");
            navigate('/');
        });

        return () => {
            socket.off('guest:kicked');
            socket.off('room:game_started');
            socket.off('room:game_stopped');
        };
    }, [pin, username, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-indigo-600/30 p-8 rounded-full mb-8 shadow-[0_0_50px_rgba(79,70,229,0.5)]"
            >
                <Loader2 className="w-16 h-16 animate-spin text-indigo-400" />
            </motion.div>

            <h2 className="text-5xl font-black mb-6">Bạn đã vào phòng!</h2>
            <p className="text-2xl text-slate-300">Tên nhân vật: <span className="font-bold text-teal-400">{username}</span></p>
            <div className="mt-12 bg-white/10 px-8 py-4 rounded-full border border-white/20">
                <p className="text-xl text-slate-300 flex items-center gap-3">
                    <span className="animate-pulse w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
                    Đang đợi Chủ phòng (Host) nhấn nút Bắt đầu...
                </p>
            </div>
        </div>
    );
}
