import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import HostCreateQuiz from './pages/HostCreateQuiz';
import HostLobby from './pages/HostLobby';
import HostGame from './pages/HostGame';
import GuestJoin from './pages/GuestJoin';
import GuestLobby from './pages/GuestLobby';
import GuestGame from './pages/GuestGame';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
        {/* Lớp nền Pattern hiện đại tạo chiều sâu */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-slate-900/80 -z-10"></div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Host Routes */}
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/host/create" element={<HostCreateQuiz />} />
          <Route path="/host/lobby" element={<HostLobby />} />
          <Route path="/host/game" element={<HostGame />} />
          
          {/* Guest Routes */}
          <Route path="/join" element={<GuestJoin />} />
          <Route path="/lobby" element={<GuestLobby />} />
          <Route path="/play" element={<GuestGame />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
