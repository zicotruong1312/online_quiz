// Mô hình MVC: Controller xử lý logic của Học sinh/Guest

/**
 * Hiển thị giao diện nhập mã PIN phòng cho Guest
 */
exports.getJoinPage = (req, res) => {
    // Render file: views/guest/index.ejs
    res.render('guest/index');
};

/**
 * Guest gửi yêu cầu xin truy cập vào phòng
 */
exports.joinRoom = (req, res) => {
    const pin = req.body.pin;
    const username = req.body.username;
    
    // Đoạn này thực tế sẽ đối chiếu với Database để xem phòng đang mở không
    // Cập nhật trạng thái người chơi tham gia phòng...
    
    console.log(`[Báo cáo từ Trò Chơi]: Học sinh [${username}] vừa truy cập phòng [${pin}]`);

    // Gửi tín hiệu báo cho Guest là đã vào phòng chờ
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #00cec9; color: white; height: 100vh;">
            <h1>Tham gia thành công!</h1>
            <h2>Chào mừng bạn, ${username} 🚀</h2>
            <p>Đang chờ bộ đếm thời gian từ Host để bắt đầu làm bài...</p>
            <p>(Sẽ bổ sung logic chọn Thẻ sức mạnh và Nhân vật tại sảnh chờ này)</p>
        </div>
    `);
};
