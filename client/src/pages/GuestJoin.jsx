import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, User } from 'lucide-react';

export default function GuestJoin() {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [username, setUsername] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();
        if(pin && username) {
            sessionStorage.setItem('quiz_pin', pin);
            sessionStorage.setItem('quiz_username', username);
            navigate('/lobby');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <h2 className="text-3xl font-black mb-6 text-center">Join Arena</h2>
                
                <form onSubmit={handleJoin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Game PIN</label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                maxLength={6}
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-2xl font-black tracking-widest text-center focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal placeholder:text-base"
                                placeholder="e.g. 123456"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Nickname</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                maxLength={15}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition-all placeholder:text-slate-600 placeholder:font-normal"
                                placeholder="Awesome Player"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-8"
                    >
                        Enter Game <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
                
                <button 
                    onClick={() => navigate('/')}
                    className="mt-6 w-full text-center text-slate-400 text-sm hover:text-white transition-colors"
                >
                    Back to Home
                </button>
            </motion.div>
        </div>
    );
}
