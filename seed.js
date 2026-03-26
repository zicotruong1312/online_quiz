const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/online-quiz')
    .then(async () => {
        const QuizSchema = new mongoose.Schema({
            title: String,
            questions: [{ 
                questionText: String, 
                options: [String], 
                correctAnswer: String,
                points: Number
            }]
        });
        const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

        const CardSchema = new mongoose.Schema({
            name: String,
            attribute: String,
            description: String,
            type: String,
            value: Number,
            color: String,
            icon: String
        });
        const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

        // Reset dữ liệu trắng
        await Quiz.deleteMany({}); 
        await Card.deleteMany({});
        
        // Chèn 10 Thẻ bài chức năng
        const cards = [
            { name: "Tăng Tốc", attribute: "Sức mạnh", description: "Cộng ngay 500 điểm vào tài khoản của bạn.", type: "add_points", value: 500, color: "bg-emerald-500", icon: "🚀" },
            { name: "Nhân Đôi", attribute: "Trí tuệ", description: "Gấp đôi số điểm nhận được ở câu hỏi tiếp theo.", type: "multiplier", value: 2, color: "bg-yellow-500", icon: "✨" },
            { name: "50/50", attribute: "May mắn", description: "Loại bỏ 2 đáp án sai cho câu hỏi hiện tại.", type: "remove_wrong", value: 2, color: "bg-blue-500", icon: "⚖️" },
            { name: "Bắn Tỉa Top 1", attribute: "Tấn công", description: "Trừ 300 điểm của người đang xếp hạng 1.", type: "attack_top1", value: -300, color: "bg-red-600", icon: "🎯" },
            { name: "Đạo Tặc", attribute: "Tấn công", description: "Đánh cắp ngẫu nhiên 200 điểm của 1 người chơi khác.", type: "steal_random", value: 200, color: "bg-purple-600", icon: "🥷" },
            { name: "Khiên Aegis", attribute: "Phòng thủ", description: "Bảo vệ bạn khỏi mọi đòn tấn công trong 1 lượt tiếp theo.", type: "shield", value: 1, color: "bg-sky-500", icon: "🛡️" },
            { name: "Bom Bão Hoà", attribute: "Tấn công", description: "Trừ 100 điểm của TẤT CẢ người chơi khác (trừ bạn).", type: "bomb_all", value: -100, color: "bg-orange-600", icon: "💣" },
            { name: "Gói Cứu Trợ", attribute: "Phép thuật", description: "Tặng 500 điểm cho người đang đứng Bét bảng.", type: "help_bottom", value: 500, color: "bg-pink-500", icon: "🎁" },
            { name: "Hack Hệ Thống", attribute: "Công nghệ", description: "Tự động chọn đáp án chính xác cho câu hiện tại mà không cần nghĩ.", type: "auto_correct", value: 0, color: "bg-zinc-800", icon: "💻" },
            { name: "Đóng Băng", attribute: "Phép thuật", description: "Khóa màn hình của 1 người chơi ngẫu nhiên trong 5 giây.", type: "freeze_random", value: 5, color: "bg-cyan-500", icon: "❄️" }
        ];
        await Card.insertMany(cards);

        // Chèn Fake Data - Nhiều bài Quiz
        const allCardTypes = cards.map(c => c.type);
        await Quiz.insertMany([
            {
                title: "Trắc nghiệm Lập trình Web & IT Vui Nhộn",
                allowedCards: allCardTypes, // Cho phép toàn bộ thẻ
                questions: [
                    { questionText: "HTML là viết tắt của?", options: ["HyperText Markup Language", "Hyperlinks Text Mark Language", "Home Tool Markup Language", "Hyper Tool Multi Language"], correctAnswer: "HyperText Markup Language", points: 100 },
                    { questionText: "Ngôn ngữ nào dùng để định dạng màu sắc/CSS UI?", options: ["C++", "Python", "CSS", "Java"], correctAnswer: "CSS", points: 100 },
                    { questionText: "ReactJS được hỗ trợ và phát triển bởi công ty lớn nào?", options: ["Google", "Microsoft", "Meta (Facebook)", "Amazon"], correctAnswer: "Meta (Facebook)", points: 200 },
                    { questionText: "Vị trí nào đặt thẻ <script> tốt nhất cho Performance?", options: ["Đầu phần <head>", "Giữa phần <body>", "Sát trên thẻ đóng </body>", "Ở CSS file ngoài"], correctAnswer: "Sát trên thẻ đóng </body>", points: 150 },
                    { questionText: "Thuộc tính nào dùng để căn giữa grid content cực xịn trong CSS?", options: ["align-items", "justify-content", "place-items", "Tất cả đều đúng trong tùy trường hợp"], correctAnswer: "Tất cả đều đúng trong tùy trường hợp", points: 200 },
                    { questionText: "Đâu là cú pháp đúng để in ra console trong JavaScript?", options: ["print()", "console.log()", "echo", "System.out.println()"], correctAnswer: "console.log()", points: 150 },
                    { questionText: "Trong Git, lệnh nào dùng để tải code từ server về máy lần đầu tiên?", options: ["git pull", "git fetch", "git clone", "git push"], correctAnswer: "git clone", points: 200 },
                    { questionText: "Cơ sở dữ liệu MongoDB thuộc loại nào dưới đây?", options: ["Relational (SQL)", "NoSQL (Document)", "Graph Database", "Key-Value Store"], correctAnswer: "NoSQL (Document)", points: 150 },
                    { questionText: "TailwindCSS sử dụng phương pháp luận CSS nào?", options: ["BEM", "OOCSS", "Utility-first", "SMACSS"], correctAnswer: "Utility-first", points: 200 },
                    { questionText: "Hook nào trong React được dùng để quản lý state nội bộ?", options: ["useEffect", "useMemo", "useContext", "useState"], correctAnswer: "useState", points: 100 },
                    { questionText: "Lỗi 'Cannot read properties of undefined' kinh điển thường bắt nguồn từ đâu?", options: ["Server bị hỏng", "Truy cập biến chưa có giá trị", "Lỗi cú pháp HTML", "Hỏng ổ cứng"], correctAnswer: "Truy cập biến chưa có giá trị", points: 150 },
                    { questionText: "Một API RESTful thường trả dữ liệu về theo định dạng nào?", options: ["XML", "JSON", "HTML", "TXT"], correctAnswer: "JSON", points: 100 },
                    { questionText: "Giao thức nào cung cấp kết nối thời gian thực 2 chiều (real-time)?", options: ["HTTP", "FTP", "WebSocket", "SMTP"], correctAnswer: "WebSocket", points: 250 },
                    { questionText: "Từ khóa nào được dùng để khai báo hằng số trong phiên bản ES6?", options: ["var", "let", "constant", "const"], correctAnswer: "const", points: 100 },
                    { questionText: "Framework Express.js được xây dựng trên môi trường chạy nào?", options: ["Ruby", "ASP.NET", "Node.js", "Django"], correctAnswer: "Node.js", points: 150 }
                ]
            },
            {
                title: "Đố Vui Lịch Sử Thế Giới",
                allowedCards: ["add_points", "multiplier", "remove_wrong"], // Gói cơ bản, không có tấn công
                questions: [
                    { questionText: "Ai là vị tổng thống đầu tiên của Hoa Kỳ?", options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"], correctAnswer: "George Washington", points: 100 },
                    { questionText: "Chiến tranh thế giới thứ 2 kết thúc vào năm nào?", options: ["1943", "1944", "1945", "1946"], correctAnswer: "1945", points: 150 },
                    { questionText: "Đế quốc La Mã sụp đổ vào thế kỷ thứ mấy?", options: ["Thế kỷ 3", "Thế kỷ 4", "Thế kỷ 5", "Thế kỷ 6"], correctAnswer: "Thế kỷ 5", points: 200 },
                    { questionText: "Ai là người tìm ra châu Mỹ năm 1492?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Marco Polo"], correctAnswer: "Christopher Columbus", points: 100 },
                    { questionText: "Cách mạng công nghiệp lần thứ nhất bắt nguồn từ quốc gia nào?", options: ["Pháp", "Mỹ", "Đức", "Anh"], correctAnswer: "Anh", points: 150 },
                    { questionText: "Nữ hoàng Ai Cập nổi tiếng có tên là gì?", options: ["Hatshepsut", "Nefertiti", "Cleopatra", "Sobekneferu"], correctAnswer: "Cleopatra", points: 100 }
                ]
            },
            {
                title: "Khám Phá Vũ Trụ 🚀",
                allowedCards: ["steal_random", "shield", "attack_top1", "auto_correct", "freeze_random"], // Gói siêu bạo lực
                questions: [
                    { questionText: "Hành tinh nào gần Mặt Trời nhất?", options: ["Sao Kim", "Sao Thủy", "Sao Hỏa", "Trái Đất"], correctAnswer: "Sao Thủy", points: 100 },
                    { questionText: "Hành tinh lớn nhất trong Hệ Mặt Trời là?", options: ["Sao Mộc", "Sao Thổ", "Sao Thiên Vương", "Sao Hải Vương"], correctAnswer: "Sao Mộc", points: 100 },
                    { questionText: "Ngôi sao gần Trái Đất nhất sau Mặt Trời là?", options: ["Sirius", "Alpha Centauri", "Proxima Centauri", "Betelgeuse"], correctAnswer: "Proxima Centauri", points: 250 },
                    { questionText: "Con người lần đầu tiên đặt chân lên Mặt Trăng vào năm nào?", options: ["1967", "1968", "1969", "1970"], correctAnswer: "1969", points: 150 },
                    { questionText: "Trạm vũ trụ quốc tế có tên viết tắt là gì?", options: ["NASA", "ESA", "ISS", "JAXA"], correctAnswer: "ISS", points: 100 },
                    { questionText: "Tàu vũ trụ Kepler được phóng lên để làm gì?", options: ["Chụp ảnh Mặt Trăng", "Tìm kiếm ngoại hành tinh", "Nghiên cứu Mặt Trời", "Thu gom rác vũ trụ"], correctAnswer: "Tìm kiếm ngoại hành tinh", points: 200 },
                    { questionText: "Ánh sáng đi từ Mặt Trời đến Trái Đất mất khoảng bao lâu?", options: ["8 giây", "80 giây", "8 phút", "80 phút"], correctAnswer: "8 phút", points: 150 }
                ]
            }
        ]);

        console.log("✅ Seed dữ liệu cơ bản (Bài Quiz + Thẻ Bài) vào MongoDB thành công!");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Lỗi Mongoose:", err);
        process.exit(1);
    });
