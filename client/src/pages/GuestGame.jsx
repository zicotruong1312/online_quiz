import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestGame() {
    const navigate = useNavigate();
    const pin = sessionStorage.getItem('quiz_pin');
    const quizId = sessionStorage.getItem('quizId');
    
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showingResult, setShowingResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);

    // ==== THẺ BÀI CHỨC NĂNG ====
    const [allCards, setAllCards] = useState([]);
    const [availableCards, setAvailableCards] = useState([]);
    const [showingCardSelection, setShowingCardSelection] = useState(false);
    
    // Trạng thái hiệu ứng
    const [activeMultiplier, setActiveMultiplier] = useState(1);
    const [removedOptions, setRemovedOptions] = useState([]);
    const [hasShield, setHasShield] = useState(false);
    const [freezeTime, setFreezeTime] = useState(0);
    const [activeCardMessage, setActiveCardMessage] = useState("");

    const showMessage = (msg) => {
        setActiveCardMessage(msg);
        setTimeout(() => setActiveCardMessage(""), 4000);
    };

    useEffect(() => {
        if(!pin || !quizId) navigate('/');

        // Bóc tách API lấy list Câu hỏi
        axios.get(`http://localhost:5000/api/quizzes/${quizId}`)
            .then(res => {
                const data = res.data;
                // Xáo trộn ngẫu nhiên danh sách câu hỏi
                const shuffledQuestions = [...data.questions].sort(() => Math.random() - 0.5);
                // Với mỗi bài, tiếp tục xáo trộn 4 đáp án bên trong
                const fullyShuffled = shuffledQuestions.map(q => ({
                    ...q,
                    options: [...q.options].sort(() => Math.random() - 0.5)
                }));
                setQuiz({ ...data, questions: fullyShuffled });
            })
            .catch(err => { console.error(err); navigate('/'); });

        // Tải danh sách Thẻ bài
        axios.get(`http://localhost:5000/api/cards`)
            .then(res => setAllCards(res.data))
            .catch(err => console.error(err));

        socket.on('room:game_stopped', () => {
            alert("Host đã kết thúc hoặc hủy trò chơi!");
            navigate('/');
        });

        socket.on('guest:update_score', (serverScore) => {
            setScore(serverScore);
        });

        // Lắng nghe bị tấn công
        socket.on('guest:receive_attack', (msg) => {
            showMessage("💥 " + msg);
        });

        socket.on('guest:shield_broken', () => {
            setHasShield(false);
            showMessage("🛡️ KHIÊN AEGIS của bạn đã vỡ vụn do đỡ 1 đòn ẩn danh!");
        });

        // Lắng nghe buff
        socket.on('guest:receive_buff', (msg) => {
            showMessage("💖 " + msg);
        });

        // Lắng nghe đóng băng
        socket.on('guest:freeze', (sec) => {
            setFreezeTime(sec);
        });

        return () => {
            socket.off('room:game_stopped');
            socket.off('guest:update_score');
            socket.off('guest:receive_attack');
            socket.off('guest:shield_broken');
            socket.off('guest:receive_buff');
            socket.off('guest:freeze');
        };
    }, [pin, quizId, navigate]);

    // Giảm thời gian đóng băng
    useEffect(() => {
        if (freezeTime > 0) {
            const timer = setTimeout(() => {
                setFreezeTime(freezeTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [freezeTime]);

    const handleAnswer = (selectedOption) => {
        if (freezeTime > 0) return; // Đang đóng băng không được bấm
        
        const currentQ = quiz.questions[currentQuestionIndex];
        const correct = selectedOption === currentQ.correctAnswer;
        
        setIsCorrect(correct);
        setShowingResult(true);

        if(correct) {
            const pointsToAdd = currentQ.points * activeMultiplier;
            setScore(prev => prev + pointsToAdd);
            // Bắn tín hiệu Tăng Điểm sang Database trung gian của Host trực tiếp
            socket.emit('guest:submit_score', { pin, pointsToAdd });
        }

        // Logic Wait kết quả rồi chuyển câu
        setTimeout(() => {
            setShowingResult(false);
            setRemovedOptions([]);
            setActiveMultiplier(1); // Reset sau khi dùng
            
            if(currentQuestionIndex < quiz.questions.length - 1) {
                const nextIdx = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIdx);

                // Random Cards mỗi 3 câu hỏi
                if (nextIdx % 3 === 0 && allCards.length > 0) {
                    let pool = allCards;
                    
                    // Lấy danh sách thẻ bài được Host cho phép riêng cho phòng này
                    const sessionCardsStr = sessionStorage.getItem('allowedCards');
                    const sessionCards = sessionCardsStr ? JSON.parse(sessionCardsStr) : [];

                    if (sessionCards.length > 0) {
                        pool = allCards.filter(c => sessionCards.includes(c.type));
                    }
                    if (pool.length > 0) {
                        const shuffled = [...pool].sort(() => 0.5 - Math.random());
                        setAvailableCards(shuffled.slice(0, 4));
                        setShowingCardSelection(true);
                    }
                }
            } else {
                setGameEnded(true);
            }
        }, 2000);
    };

    const handleUseCard = (card) => {
        setShowingCardSelection(false);
        showMessage(`Đã kích hoạt: ${card.name} ${card.icon}`);

        if (card.type === 'add_points') {
            setScore(prev => prev + card.value);
            socket.emit('guest:submit_score', { pin, pointsToAdd: card.value });
        } else if (card.type === 'multiplier') {
            setActiveMultiplier(card.value);
        } else if (card.type === 'remove_wrong') {
            const currentQ = quiz.questions[currentQuestionIndex];
            const wrongs = currentQ.options.filter(o => o !== currentQ.correctAnswer);
            const toRemove = wrongs.slice(0, card.value);
            setRemovedOptions(toRemove);
        } else if (card.type === 'shield') {
            setHasShield(true);
            socket.emit('guest:use_card_effect', { pin, type: card.type, value: card.value, cardName: card.name });
        } else if (card.type === 'auto_correct') {
            const currentQ = quiz.questions[currentQuestionIndex];
            handleAnswer(currentQ.correctAnswer); 
        } else {
            // attack_top1, steal_random, bomb_all, help_bottom, freeze_random
            socket.emit('guest:use_card_effect', { pin, type: card.type, value: card.value, cardName: card.name });
        }
    };

    if(!quiz) return <div className="min-h-screen flex items-center justify-center text-3xl font-black">Loading Database...</div>;

    if(gameEnded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div initial={{scale:0}} animate={{scale:1}} className="bg-white/10 p-12 top-0 border border-white/20 rounded-3xl backdrop-blur-xl text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <h1 className="text-6xl text-amber-400 font-black mb-6">HOÀN THÀNH TỐT!</h1>
                    <p className="text-2xl text-slate-300">Điểm tổng kết chặng đua của bạn</p>
                    <p className="text-[120px] font-black mt-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">{score}</p>
                    <p className="text-slate-200 mt-8 text-xl font-bold">Hãy ngẩng cao đầu nhìn lên bảng máy chiếu (màn hình Host) để xem lọt Top mấy nhé!</p>
                </motion.div>
            </div>
        )
    }

    if (showingCardSelection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black z-0"></div>
                <div className="z-10 flex flex-col items-center w-full max-w-5xl">
                    <motion.h1 
                        initial={{ y: -50, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        className="text-4xl md:text-5xl font-black mb-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] text-center"
                    >
                        CHỌN 1 THẺ BÀI QUYỀN NĂNG
                    </motion.h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {availableCards.map((card, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUseCard(card)}
                                className={`${card.color} text-white p-6 rounded-[2rem] border-b-[6px] border-black/30 shadow-2xl flex flex-col items-center text-center gap-3 relative overflow-hidden group`}
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                                <span className="text-6xl drop-shadow-md">{card.icon}</span>
                                <h2 className="text-3xl font-black tracking-wide">{card.name}</h2>
                                <p className="text-sm font-bold bg-black/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{card.attribute}</p>
                                <p className="text-lg mt-2 opacity-90">{card.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestionIndex];

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen flex flex-col relative">
            {/* Overlay đóng băng */}
            {freezeTime > 0 && (
                <div className="fixed inset-0 bg-cyan-900/60 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
                    <motion.h1 animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-9xl mb-6">❄️</motion.h1>
                    <h2 className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]">BẠN ĐÃ BỊ ĐÓNG BĂNG!</h2>
                    <p className="text-3xl text-cyan-200 mt-4 font-bold">{freezeTime} giây còn lại</p>
                </div>
            )}

            {/* Thông báo Card */}
            <AnimatePresence>
                {activeCardMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-8 py-4 rounded-full z-40 font-bold text-2xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md whitespace-nowrap"
                    >
                        {activeCardMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-8 py-5 bg-slate-800/50 rounded-3xl border border-slate-600 shadow-xl gap-4">
                <span className="font-black text-xl text-slate-400">Câu hỏi {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                
                <div className="flex items-center gap-4">
                    {hasShield && <span className="font-black text-xl bg-sky-500/20 text-sky-400 px-4 py-2 rounded-xl border border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.5)] flex items-center gap-2">🛡️ CÓ KHIÊN</span>}
                    {activeMultiplier > 1 && <span className="font-black text-xl bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-400/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-2">✨ x{activeMultiplier} ĐIỂM</span>}
                    <span className="font-black text-3xl text-amber-400 bg-amber-500/10 px-6 py-2 rounded-xl">Điểm: {score}</span>
                </div>
            </div>

            <div className="flex-1 flex justify-center items-center mb-12 px-4 shadow-black/20">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-center leading-tight drop-shadow-2xl">
                    {currentQ.questionText}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                <AnimatePresence mode="wait">
                    {!showingResult ? currentQ.options.map((option, idx) => {
                        const colors = [
                            'bg-[#E74C3C] hover:bg-[#c0392b] shadow-[#c0392b]',
                            'bg-[#3498DB] hover:bg-[#2980b9] shadow-[#2980b9]',
                            'bg-[#F1C40F] hover:bg-[#f39c12] shadow-[#f39c12] text-slate-900',
                            'bg-[#2ECC71] hover:bg-[#27ae60] shadow-[#27ae60]'
                        ];
                        const colorClass = colors[idx % colors.length];
                        const isRemoved = removedOptions.includes(option);

                        return (
                            <motion.button
                                key={`opt-${idx}`}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: isRemoved ? 0.3 : 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                disabled={isRemoved || freezeTime > 0}
                                onClick={() => !isRemoved && handleAnswer(option)}
                                className={`${colorClass} ${colorClass.includes('text-slate-900')?'':'text-white'} 
                                ${isRemoved ? 'pointer-events-none grayscale' : ''}
                                font-bold text-2xl lg:text-3xl py-12 px-6 rounded-[2rem] border-b-[8px] transition-transform hover:translate-y-[4px] hover:border-b-[4px] active:translate-y-[8px] active:border-b-0 flex items-center justify-center text-center`}
                            >
                                {isRemoved ? '❌' : option}
                            </motion.button>
                        );
                    }) : (
                        <motion.div 
                            key="result"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`col-span-1 md:col-span-2 p-16 rounded-[3rem] text-center shadow-2xl ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}
                        >
                            <h1 className="text-6xl lg:text-7xl font-black text-white drop-shadow-md mb-6">{isCorrect ? 'CHÍNH XÁC! 🎉' : 'SAI RỒI! 😢'}</h1>
                            <p className="text-3xl lg:text-4xl font-bold text-white/90">
                                {isCorrect ? `+${currentQ.points * activeMultiplier} Điểm vào quỹ` : 'Không được cộng điểm, cẩn thận người sau qua mặt kìa'}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
