// Mô hình MVC: Đây là Controller xử lý logic của phía Host / Chủ Phòng 
// (Bạn gọi là HookController)

const QuizModel = require('../models/QuizModel');

/**
 * Hiển thị trang quản lý (Dashboard) cho Host để chọn bài kiểm tra
 */
exports.getDashboard = (req, res) => {
    // 1. Lấy dữ liệu bài Quiz từ Model
    const quizzes = QuizModel.getAllQuizzes();
    
    // 2. Chuyển dữ liệu vào trong Views (sử dụng EJS rendering)
    res.render('hook/index', { quizzes: quizzes });
};

/**
 * Logic để Host tạo phòng mới và tạo ra mã PIN có 6 chữ số
 */
exports.createRoom = (req, res) => {
    const quizId = req.body.quizId;
    
    // Logic tạo mã PIN phòng ngẫu nhiên 6 số
    const roomPIN = Math.floor(100000 + Math.random() * 900000);
    
    console.log(`[Báo cáo từ Host]: Đã tạo phòng - Mã PIN [${roomPIN}] cho bộ Quiz ID [${quizId}]`);
    
    // Đưa Host vào sảnh chờ học sinh
    // Vì chưa có front-end phức tạp, tạm thời trả về HTML thẳng từ Controller để bạn xem hiệu quả chuyển giao diện
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #6c5ce7; font-size: 50px;">Phòng Đã Mở!</h1>
            <p>Mã PIN vào phòng của bạn là:</p>
            <h2 style="font-size: 80px; margin: 10px 0;">${roomPIN}</h2>
            <p style="color: gray">Hãy để màn hình máy chiếu này để Guest nhập mã PIN ở máy của họ...</p>
        </div>
    `);
};
