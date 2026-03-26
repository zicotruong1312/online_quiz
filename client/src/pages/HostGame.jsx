import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, StopCircle, Activity } from 'lucide-react';

export default function HostGame() {
    const navigate = useNavigate();
    const pin = sessionStorage.getItem('host_pin');
    const [leaderboard, setLeaderboard] = useState([]);
    const [actionLogs, setActionLogs] = useState([]);

    useEffect(() => {
        if(!pin) navigate('/host');

        // Lắng nghe điểm số
        socket.on('room:leaderboard_update', (players) => {
            const sorted = [...players].sort((a,b) => b.score - a.score);
            setLeaderboard(sorted);
        });

        // Lắng nghe log hành động thẻ bài
        socket.on('room:action_log', (log) => {
            const id = Date.now();
            setActionLogs(prev => [{ id, ...log }, ...prev].slice(0, 5)); // Lưu tối đa 5 log gần nhất
        });

        return () => {
            socket.off('room:leaderboard_update');
            socket.off('room:action_log');
        };
    }, [pin, navigate]);

    const stopGame = () => {
        socket.emit('host:stop_game', pin);
        navigate('/host');
    };

    return (
        <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                        <Trophy className="w-10 h-10 md:w-14 md:h-14" /> ĐUA TOP THỜI GIAN THỰC
                    </h1>
                    <p className="text-slate-400 font-bold text-xl mt-2 tracking-widest">MÃ PHÒNG CHƠI: <span className="text-white text-2xl bg-black/30 px-3 py-1 rounded-lg ml-2">{pin}</span></p>
                </div>

                <button 
                    onClick={stopGame}
                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-3 transition-colors shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] text-xl"
                >
                    <StopCircle size={24} /> KẾT THÚC NGAY
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 flex-1">
                {/* Bảng Xếp Hạng Động (React Spring/Framer Layout) */}
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col gap-4">
                    {leaderboard.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-slate-400 text-3xl font-bold text-center animate-pulse">Game đã bắt đầu! Đang chờ những điểm số đầu tiên...</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {leaderboard.map((player, index) => {
                                // Style dựa theo thứ hạng
                                let rankStyle = 'bg-slate-800/50 border-white/10 text-white shadow-lg';
                                let rankIcon = <span className="text-slate-500">#{index + 1}</span>;

                                if (index === 0) {
                                    rankStyle = 'bg-gradient-to-r from-amber-400 to-yellow-600 border-amber-300 text-black shadow-[0_0_40px_rgba(251,191,36,0.4)] scale-[1.02] z-30';
                                    rankIcon = '👑';
                                } else if (index === 1) {
                                    rankStyle = 'bg-gradient-to-r from-slate-300 to-slate-400 border-slate-200 text-slate-900 shadow-[0_0_30px_rgba(203,213,225,0.4)] z-20';
                                    rankIcon = '🥈';
                                } else if (index === 2) {
                                    rankStyle = 'bg-gradient-to-r from-orange-800 to-orange-600 border-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)] z-10';
                                    rankIcon = '🥉';
                                }

                                return (
                                    <motion.div
                                        layout
                                        key={player.id}
                                        initial={{ opacity: 0, scale: 0.8, x: -50 }}
                                        animate={{ opacity: 1, scale: index === 0 ? 1.02 : 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className={`flex items-center justify-between p-6 md:p-8 rounded-3xl border-2 transition-colors ${rankStyle}`}
                                    >
                                        <div className="flex items-center gap-6 md:gap-8">
                                            <div className="w-16 text-center text-4xl md:text-5xl font-black">{rankIcon}</div>
                                            <span className="text-3xl md:text-4xl font-black tracking-wide truncate max-w-xs md:max-w-md">{player.username}</span>
                                        </div>
                                        <div className="text-4xl md:text-5xl font-black drop-shadow-md">
                                            {player.score.toLocaleString()} <span className="text-xl md:text-2xl font-bold opacity-80 uppercase">Điểm</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Sidebar tin tức (Ai vừa dùng bài gì) */}
                <div className="w-full xl:w-[450px] bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/30 rounded-[3rem] p-8 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-black mb-6 text-indigo-300 flex items-center gap-3">
                        <Activity className="animate-pulse" /> NHẬT KÝ CHIẾN TRƯỜNG
                    </h2>

                    <div className="flex flex-col gap-4 flex-1">
                        <AnimatePresence>
                            {actionLogs.length === 0 && (
                                <p className="text-indigo-400/50 font-bold italic text-center mt-10">Chưa có ai sử dụng quyền năng thẻ bài...</p>
                            )}
                            {actionLogs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-indigo-900/50 border border-indigo-400/30 p-4 rounded-2xl flex flex-col gap-1 shadow-lg"
                                >
                                    <span className="text-indigo-200 font-bold text-lg"><span className="text-amber-400">{log.player}</span> vừa dùng kỹ năng!</span>
                                    <span className="text-sm font-bold text-indigo-300 bg-black/20 px-3 py-1 rounded-full self-start">Thẻ: {log.cardName}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
