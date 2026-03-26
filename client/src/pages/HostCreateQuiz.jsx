import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function HostCreateQuiz() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctIndex: 0, points: 100 }
    ]);
    const [allCards, setAllCards] = useState([]);
    const [allowedCards, setAllowedCards] = useState([]);
    
    useEffect(() => {
        axios.get('http://localhost:5000/api/cards')
            .then(res => {
                setAllCards(res.data);
                setAllowedCards(res.data.map(c => c.type)); // Mặc định chọn tất cả
            })
            .catch(console.error);
    }, []);

    const handleAddQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0, points: 100 }]);
    };

    const handleRemoveQuestion = (idx) => {
        if(questions.length === 1) return alert("Phải có ít nhất 1 câu hỏi!");
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx, field, value) => {
        const newQ = [...questions];
        newQ[idx][field] = value;
        setQuestions(newQ);
    };

    const updateOption = (qIdx, optIdx, value) => {
        const newQ = [...questions];
        newQ[qIdx].options[optIdx] = value;
        setQuestions(newQ);
    };

    const toggleCard = (type) => {
        setAllowedCards(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!title.trim()) return alert("Vui lòng nhập Tên Bộ Câu Hỏi!");
        
        // Format lại mảng trước khi gửi: correctAnswer sẽ là chuỗi dựa vào correctIndex
        const formattedQuestions = questions.map(q => {
            if(!q.questionText.trim()) throw new Error("Vui lòng điền đủ nội dung câu hỏi!");
            if(q.options.some(opt => !opt.trim())) throw new Error("Vui lòng điền đủ 4 đáp án cho mỗi câu!");
            
            return {
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.options[q.correctIndex],
                points: Number(q.points)
            };
        });

        try {
            await axios.post('http://localhost:5000/api/quizzes', {
                title,
                questions: formattedQuestions,
                allowedCards
            });
            alert("Đã lưu bộ câu hỏi thành công!");
            navigate('/host');
        } catch (err) {
            alert(err.message || "Lỗi khi lưu bộ câu hỏi!");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
            <button onClick={() => navigate('/host')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold mb-6">
                <ArrowLeft /> Quay lại Dashboard
            </button>
            <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                Tạo Bộ Câu Hỏi Tùy Chỉnh
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Info */}
                <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <label className="block text-xl font-bold text-slate-300 mb-2">Tên Bộ Câu Hỏi</label>
                    <input 
                        type="text" 
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="VD: Kiểm tra 15 phút môn Hóa..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                {/* Cards Configuration */}
                <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">🃏 Cấu Hình Thẻ Bài Của Trận Đấu</h2>
                    <p className="text-slate-400 mb-6">Chọn những lá bài bạn cho phép xuất hiện ngẫu nhiên trong trận đấu này. Khuyến khích chọn hết cho vui!</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {allCards.map(card => {
                            const isSelected = allowedCards.includes(card.type);
                            return (
                                <div 
                                    key={card.type} 
                                    onClick={() => toggleCard(card.type)}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 
                                        ${isSelected ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 opacity-50 bg-slate-900'}
                                    `}
                                >
                                    <span className="text-4xl">{card.icon}</span>
                                    <span className="font-bold text-sm leading-tight">{card.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-6">
                    {questions.map((q, qIdx) => (
                        <motion.div 
                            key={qIdx} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800/80 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl relative"
                        >
                            <div className="absolute top-6 right-6 flex gap-4">
                                <span className="font-bold text-slate-500">Câu #{qIdx + 1}</span>
                                <button type="button" onClick={() => handleRemoveQuestion(qIdx)} className="text-red-400 hover:text-red-300"><Trash2/></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-indigo-300 mb-2">Nội dung câu hỏi</label>
                                    <input 
                                        type="text" required value={q.questionText}
                                        onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                                        placeholder="Nhập câu hỏi tại đây..."
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-amber-300 mb-2">Điểm số</label>
                                    <input 
                                        type="number" required value={q.points} min="10"
                                        onChange={e => updateQuestion(qIdx, 'points', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {[0, 1, 2, 3].map(optIdx => (
                                    <div key={optIdx} className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                                            <input 
                                                type="radio" 
                                                name={`correct-${qIdx}`} 
                                                checked={q.correctIndex === optIdx}
                                                onChange={() => updateQuestion(qIdx, 'correctIndex', optIdx)}
                                                className="w-5 h-5 accent-emerald-500"
                                            />
                                            <span className={`text-sm font-bold ${q.correctIndex === optIdx ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {q.correctIndex === optIdx ? 'Là ĐÁP ÁN ĐÚNG' : 'Là Đáp án sai'}
                                            </span>
                                        </label>
                                        <input 
                                            type="text" required value={q.options[optIdx]}
                                            onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                                            placeholder={`Lựa chọn ${optIdx + 1}`}
                                            className={`w-full bg-slate-900 border-2 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
                                                q.correctIndex === optIdx ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-700 focus:border-indigo-500'
                                            }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex gap-4 sticky bottom-8 left-0 justify-center">
                    <button 
                        type="button" 
                        onClick={handleAddQuestion}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 border border-indigo-400"
                    >
                        <Plus size={24}/> Thêm Câu Hỏi
                    </button>
                    <button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 border border-emerald-400"
                    >
                        <Save size={24}/> Lưu Bộ Câu Hỏi
                    </button>
                </div>
            </form>
        </div>
    );
}
