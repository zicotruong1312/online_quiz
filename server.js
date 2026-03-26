const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
// Thiết lập CORS để React (cổng 5173) có thể trò chuyện với Express (Cổng 5000)
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// ==== KẾT NỐI MONGODB ====
mongoose.connect('mongodb://127.0.0.1:27017/online-quiz')
  .then(() => console.log('✅ Mongoose Connected (Local Database: online-quiz)'))
  .catch(err => {
      console.error('❌ Mongoose Connection Error: BẬT MONGODB LÊN NẾU MUỐN LƯU DỮ LIỆU!', err.message);
  });

const QuizSchema = new mongoose.Schema({
    title: String,
    questions: [{ 
        questionText: String, 
        options: [String], 
        correctAnswer: String,
        points: Number 
    }],
    allowedCards: [String] // Các thẻ bài được phép xuất hiện
});
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

const CardSchema = new mongoose.Schema({
    name: String,
    attribute: String,
    description: String,
    type: String, // e.g. add_points, multiplier, remove_wrong, attack_top1, steal_random, shield, bomb_all, help_bottom, auto_correct, freeze_random
    value: Number,
    color: String,
    icon: String // emoji
});
const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

// ==== REST API ====
// API lấy danh sách bài thi cho Host dọn lên giao diện
app.get('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch(err) {
        res.status(500).json({error: "Database error"});
    }
});

// Thêm Bộ câu hỏi tùy chỉnh
app.post('/api/quizzes', async (req, res) => {
    try {
        const { title, questions, allowedCards } = req.body;
        const newQuiz = new Quiz({ title, questions, allowedCards });
        await newQuiz.save();
        res.status(201).json(newQuiz);
    } catch(err) {
        res.status(500).json({error: "Database error"});
    }
});

// Thư viện Thẻ Bài Chức Năng
app.get('/api/cards', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch(err) {
        res.status(500).json({error: "Database error"});
    }
});

// Yêu cầu lấy thông tin 1 bài Quiz (khi User trả lời trắc nghiệm)
app.get('/api/quizzes/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        res.json(quiz);
    } catch(err) {
        res.status(500).json({error: "Database error"});
    }
});

// ==== THUẬT TOÁN QUẢN LÝ PHÒNG TRONG BỘ NHỚ RAM (REAL-TIME SOCKET) ====
// Dùng lưu trữ Array nội bộ RAM thay cho Database để đẩy tốc độ Realtime
const rooms = {};

io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // ----- CÁC CHỨC NĂNG DÀNH CHO HOST/HOOK ----- //
    // 1. Host tạo phòng
    socket.on('host:create_room', ({ quizId, allowedCards }, callback) => {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        rooms[pin] = { 
            hostId: socket.id, 
            quizId, 
            status: 'lobby', 
            allowedCards: allowedCards || [], // Bài được Host chọn riêng cho ván này
            players: {} 
        };
        socket.join(pin);
        callback({ success: true, pin });
        console.log(`[HOST] Tạo phòng mới cực mượt với mã PIN: ${pin}`);
    });

    // 2. Host đuổi / Kick người chơi ngứa mắt
    socket.on('host:kick_guest', ({ pin, targetSocketId }) => {
        if(rooms[pin] && rooms[pin].hostId === socket.id) {
            delete rooms[pin].players[targetSocketId];
            io.to(targetSocketId).emit('guest:kicked');  // Báo UI Guest tự động bốc hơi
            io.to(pin).emit('room:player_list_update', Object.values(rooms[pin].players)); // F5 danh sách Host
        }
    });

    // 3. Host nhấn còi bắt đầu cuộc đua!
    socket.on('host:start_game', (pin) => {
        if(rooms[pin] && rooms[pin].hostId === socket.id) {
            rooms[pin].status = 'playing';
            io.to(pin).emit('room:game_started'); // Tất cả các Guest đều load sang màn Quiz
        }
    });

    // 4. Host dừng ngang cuộc chơi
    socket.on('host:stop_game', (pin) => {
         if(rooms[pin] && rooms[pin].hostId === socket.id) {
            rooms[pin].status = 'finished';
            io.to(pin).emit('room:game_stopped');
         }
    });

    // ----- CÁC CHỨC NĂNG DÀNH CHO GUEST/HỌC SINH ----- //
    // 1. Xin vào phòng
    socket.on('guest:join_room', ({ pin, username }, callback) => {
        if(!rooms[pin]) {
            return callback({ success: false, message: 'Phòng này không tồn tại!'});
        }
        if(rooms[pin].status !== 'lobby') {
            return callback({ success: false, message: 'Trận đấu đang diễn ra hoặc đã kết thúc, bạn đến muộn rồi!'});
        }
        
        // Kiểm duyệt Tên người chơi
        const existingPlayer = Object.values(rooms[pin].players).find(p => p.username === username);
        if(existingPlayer) {
            return callback({ success: false, message: 'Tên nhân vật đã bị người khác giành mất!'});
        }

        rooms[pin].players[socket.id] = { id: socket.id, username, score: 0, hasShield: false };
        socket.join(pin);
        callback({ 
            success: true, 
            room: { 
                quizId: rooms[pin].quizId,
                allowedCards: rooms[pin].allowedCards
            } 
        });
        
        // Host sẽ lập tức thấy tên bạn này nhảy pop vào màn hình Realtime
        io.to(pin).emit('room:player_list_update', Object.values(rooms[pin].players));
    });

    // 2. Chấm điểm liên tục mượt mà
    socket.on('guest:submit_score', ({ pin, pointsToAdd }) => {
        if(rooms[pin] && rooms[pin].players[socket.id]) {
            rooms[pin].players[socket.id].score += pointsToAdd;
            // Broadcast BXH cập nhật cho Host
            io.to(rooms[pin].hostId).emit('room:leaderboard_update', Object.values(rooms[pin].players));
            // Trả về số điểm mới nhất cho chính xác
            io.to(socket.id).emit('guest:update_score', rooms[pin].players[socket.id].score);
        }
    });

    // 3. Xử lý Thẻ Bài Chức Năng ảnh hưởng lên người khác
    socket.on('guest:use_card_effect', ({ pin, type, value, cardName }) => {
        const room = rooms[pin];
        if(!room || !room.players[socket.id]) return;
        
        const players = Object.values(room.players);
        const myPlayer = room.players[socket.id];
        
        const changeScore = (targetId, delta) => {
            const target = room.players[targetId];
            if (delta < 0 && target.hasShield) {
                target.hasShield = false;
                io.to(targetId).emit('guest:shield_broken');
                return; // Chặn sát thương
            }
            target.score += delta;
            io.to(targetId).emit('guest:update_score', target.score);
        };

        if (type === 'shield') {
            myPlayer.hasShield = true;
        }
        else if (type === 'attack_top1') {
            const top1 = [...players].sort((a,b) => b.score - a.score)[0];
            if (top1 && top1.id !== socket.id) {
                changeScore(top1.id, value); 
                // Only send attack msg if they actually got attacked (handled loosely, but if shield broke, changeScore already emits shield_broken and returns)
                if(!top1.hasShield) io.to(top1.id).emit('guest:receive_attack', `Bạn bị bắn tỉa bởi thẻ [${cardName}]! ${value}đ`);
            }
        }  
        else if (type === 'steal_random') {
            const others = players.filter(p => p.id !== socket.id);
            if (others.length > 0) {
                const target = others[Math.floor(Math.random() * others.length)];
                changeScore(target.id, -value);
                changeScore(socket.id, value);
                io.to(target.id).emit('guest:receive_attack', `Lén lút! Thẻ [${cardName}] đã trộm ${value}đ của bạn!`);
            }
        }
        else if (type === 'bomb_all') {
            players.forEach(p => {
                if (p.id !== socket.id) {
                    changeScore(p.id, value);
                    io.to(p.id).emit('guest:receive_attack', `Boom! Thẻ [${cardName}] đã phát nổ! ${value}đ`);
                }
            });
        }
        else if (type === 'help_bottom') {
            const bottom = [...players].sort((a,b) => a.score - b.score)[0];
            if (bottom) {
                changeScore(bottom.id, value);
                io.to(bottom.id).emit('guest:receive_buff', `Được vũ trụ cứu trợ từ thẻ [${cardName}]! +${value}đ`);
            }
        }
        else if (type === 'freeze_random') {
            const others = players.filter(p => p.id !== socket.id);
            if (others.length > 0) {
                const target = others[Math.floor(Math.random() * others.length)];
                if (room.players[target.id].hasShield) {
                    room.players[target.id].hasShield = false;
                    io.to(target.id).emit('guest:shield_broken');
                } else {
                    io.to(target.id).emit('guest:freeze', value); 
                }
            }
        }
        
        // Gửi Log hiệu ứng cho Host biết Ai đã dùng (Target không biết, nhưng Host biết)
        io.to(room.hostId).emit('room:action_log', { 
            player: myPlayer.username, 
            cardName, 
            type 
        });
        
        // Cập nhật Update bảng Xếp Hạng
        io.to(room.hostId).emit('room:leaderboard_update', Object.values(room.players));
    });

    // ----- DISCONNECT DỌN DẸP ----- //
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        for(const pin in rooms) {
            if(rooms[pin].hostId === socket.id) {
                // Nếu Host mất mạng -> Phòng sập -> Hủy ván đấu cho toàn bộ Guest
                io.to(pin).emit('room:game_stopped', 'Chủ phòng đã thoát ngầm!');
                delete rooms[pin];
            } else if (rooms[pin].players[socket.id]) {
                // Nếu 1 Guest thoát mạng -> Xóa dòng tên khỏi BXH
                delete rooms[pin].players[socket.id];
                io.to(pin).emit('room:player_list_update', Object.values(rooms[pin].players));
            }
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 MERN Backend (Socket & API) xịn xò đang chạy trên cổng ${PORT}`);
});
