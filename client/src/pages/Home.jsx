import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-12"
            >
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 mb-4 drop-shadow-lg">
                    QUIZ ARENA
                </h1>
                <p className="text-xl text-slate-300 font-medium tracking-wide">Enter the race. Outsmart your opponents.</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                {/* Guest Card */}
                <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/join')}
                    className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl cursor-pointer hover:bg-white/15 transition-all group"
                >
                    <div className="bg-teal-500/20 p-4 rounded-2xl w-fit mb-6 group-hover:bg-teal-500/40 transition-colors">
                        <Users className="w-10 h-10 text-teal-300" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Join a Game</h2>
                    <p className="text-slate-400">Enter a PIN to join your class and compete in real-time.</p>
                </motion.div>

                {/* Host Card */}
                <motion.div 
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/host')}
                    className="flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl cursor-pointer hover:bg-white/15 transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="bg-indigo-500/20 p-4 rounded-2xl w-fit mb-6 group-hover:bg-indigo-500/40 transition-colors">
                        <Presentation className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Host Dashboard</h2>
                    <p className="text-slate-400">Launch a session, manage players, and watch the leaderboard.</p>
                </motion.div>
            </div>
        </div>
    );
}
