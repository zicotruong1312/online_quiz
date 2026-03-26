import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Zap } from 'lucide-react';

export default function HostDashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [allCards, setAllCards] = useState([]);
    const navigate = useNavigate();

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [selectedCards, setSelectedCards] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/quizzes')
            .then(res => setQuizzes(res.data))
            .catch(err => console.error(err));

        axios.get('http://localhost:5000/api/cards')
            .then(res => setAllCards(res.data))
            .catch(err => console.error(err));
    }, []);

    const openHostModal = (quiz) => {
        setSelectedQuiz(quiz);
        // Lấy cards mặc định từ DB của bộ quiz, nếu không có thì lấy tất cả
        setSelectedCards(quiz.allowedCards && quiz.allowedCards.length > 0 ? quiz.allowedCards : allCards.map(c => c.type));
        setShowModal(true);
    };

    const toggleCard = (type) => {
        setSelectedCards(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const applyCombo = (comboTypes) => {
        setSelectedCards(comboTypes);
    };

    const launchRoom = () => {
        socket.emit('host:create_room', { quizId: selectedQuiz._id, allowedCards: selectedCards }, (response) => {
            if(response.success) {
                sessionStorage.setItem('host_pin', response.pin);
                sessionStorage.setItem('host_quizId', selectedQuiz._id);
                navigate('/host/lobby');
            }
        });
    };

    const combos = [
        { name: "Cơ Bản Ngây Thơ", desc: "Chỉ cộng điểm, không tấn công ai", types: ["add_points", "multiplier", "remove_wrong"], color: "bg-emerald-600 hover:bg-emerald-500" },
        { name: "Hơi Chiến Thuật", desc: "Có thêm lá khiên, trộm điểm, buff", types: ["add_points", "multiplier", "remove_wrong", "attack_top1", "shield", "help_bottom", "steal_random"], color: "bg-amber-600 hover:bg-amber-500" },
        { name: "Chế độ MÙ MẮT (Toxic)", desc: "Full combo: Nổ bom, Đóng băng, Cực kì dã man", types: allCards.map(c => c.type), color: "bg-red-600 hover:bg-red-500" }
    ];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen relative">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    Chọn Bài Test Để Tổ Chức
                </h1>
                <button 
                    onClick={() => navigate('/host/create')} 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/50"
                >
                    <Plus /> Tự Tạo Quiz Mới
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                    <motion.div 
                        key={quiz._id}
                        whileHover={{ y: -5 }}
                        className="bg-slate-800/80 backdrop-blur-lg border border-slate-600 p-6 rounded-3xl shadow-xl flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="text-2xl font-black mb-2 text-white">{quiz.title}</h2>
                            <p className="text-indigo-300 font-bold mb-6">{quiz.questions?.length || 0} Câu hỏi căng não</p>
                        </div>
                        <button 
                            onClick={() => openHostModal(quiz)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                        >
                            <Play className="w-5 h-5" fill="currentColor"/> MỞ PHÒNG CHƠI
                        </button>
                    </motion.div>
                ))}
            </div>
            
            {quizzes.length === 0 && (
                <div className="text-center text-slate-400 mt-20 font-bold text-xl">
                    <p>Đang tải bộ dữ liệu từ Cơ Sở Dữ Liệu...</p>
                </div>
            )}

            {/* Modal Thiết Lập Trận Đấu */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 lg:p-8 relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        >
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black mb-2 text-white">⚙️ Cấu Hình Cấm/Chọn Thẻ Bài</h2>
                            <p className="text-slate-400 mb-8 font-bold">Chế độ này dành cho: <span className="text-amber-400">{selectedQuiz?.title}</span></p>

                            <div className="mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                                <h3 className="text-xl font-bold mb-4 text-indigo-300 flex items-center gap-2"><Zap/> Combo Cấu Hình Nhanh</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {combos.map(combo => (
                                        <button 
                                            key={combo.name}
                                            onClick={() => applyCombo(combo.types)}
                                            className={`${combo.color} text-white p-4 rounded-xl font-bold flex flex-col items-center text-center transition-transform hover:scale-105 shadow-lg border border-white/20`}
                                        >
                                            <span className="text-lg">{combo.name}</span>
                                            <span className="text-xs opacity-80 mt-1">{combo.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-4 text-amber-300">Tùy Chọn Chi Tiết Từng Lá Bài</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
                                {allCards.map(card => {
                                    const isSelected = selectedCards.includes(card.type);
                                    return (
                                        <div 
                                            key={card.type} 
                                            onClick={() => toggleCard(card.type)}
                                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 select-none
                                                ${isSelected ? 'border-amber-400 bg-amber-400/10 scale-100 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-slate-700 bg-slate-900 scale-95 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}
                                            `}
                                        >
                                            <span className="text-4xl drop-shadow-md">{card.icon}</span>
                                            <span className="font-bold text-xs leading-tight text-white">{card.name}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-slate-300 hover:text-white transition-colors">Hủy Bỏ</button>
                                <button 
                                    onClick={launchRoom}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl px-10 py-4 rounded-full flex items-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-transform hover:scale-105"
                                >
                                    <Play fill="currentColor" /> RUNG CHUÔNG BẮT ĐẦU CHƠI
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
