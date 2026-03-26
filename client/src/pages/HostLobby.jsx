import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, XCircle, PlayCircle } from 'lucide-react';

export default function HostLobby() {
    const navigate = useNavigate();
    const [pin, setPin] = useState(sessionStorage.getItem('host_pin'));
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        if(!pin) navigate('/host');

        // Lắng nghe tín hiệu Realtime mỗi khi có Guest vào phòng hoặc thoát
        socket.on('room:player_list_update', (playerList) => {
            setPlayers(playerList);
        });

        return () => {
            socket.off('room:player_list_update');
        };
    }, [pin, navigate]);

    // Quyền năng Host: Đuổi Guest khỏi phòng chờ
    const kickPlayer = (socketId) => {
        socket.emit('host:kick_guest', { pin, targetSocketId: socketId });
    };

    const startGame = () => {
        socket.emit('host:start_game', pin);
        navigate('/host/game'); // Chuyển sang màn hình BXH
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-8 relative">
            {/* Top Bar showing PIN clearly */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white text-slate-900 px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] text-center mb-12"
            >
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Truy cập web và nhập mã PIN:</p>
                <h1 className="text-7xl font-black tracking-[0.2em] text-indigo-600">{pin}</h1>
            </motion.div>

            <div className="w-full max-w-5xl flex justify-between items-end mb-6">
                <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full border border-white/20">
                    <Users className="text-teal-400"/>
                    <span className="text-xl font-bold">{players.length} Học Sinh</span>
                </div>
                
                <button 
                    onClick={startGame}
                    disabled={players.length === 0}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-black text-xl px-10 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <PlayCircle className="w-6 h-6" />
                    BẮT ĐẦU CHƠI
                </button>
            </div>

            {/* Players Area */}
            <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <AnimatePresence>
                    {players.map(player => (
                        <motion.div
                            key={player.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="bg-indigo-600/30 backdrop-blur-md border border-indigo-400/30 rounded-2xl p-4 text-center relative group"
                        >
                            <span className="font-bold text-lg">{player.username}</span>
                            
                            {/* KICK BUTTON (Shows on hover) */}
                            <button 
                                onClick={() => kickPlayer(player.id)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                title="Đuổi khỏi phòng"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            {players.length === 0 && (
                <p className="text-slate-400 mt-20 text-xl animate-pulse">Đang chờ người chơi tham gia...</p>
            )}
        </div>
    );
}
