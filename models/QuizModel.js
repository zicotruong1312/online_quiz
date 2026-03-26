// Mô hình MVC: Model đóng vai trò làm việc với dữ liệu
// Vì dự án này ưu tiên việc Quản lý Quá trình trên GitHub nên ta dùng mảng (Array) cứng làm Database tạm thời để code chạy được nhẹ nhàng.

const quizzes = [
    { id: 1, title: 'Lịch sử thế giới thời cận đại', questionCount: 15 },
    { id: 2, title: 'Tin học đại cương', questionCount: 20 },
    { id: 3, title: 'English Grammar Review', questionCount: 10 },
];

class QuizModel {
    /**
     * Hàm lấy toàn bộ bộ bài kiểm tra (Quiz)
     */
    static getAllQuizzes() {
        // Trong thực tế sẽ gọi: SELECT * FROM Quizzes...
        return quizzes; 
    }

    /**
     * Hàm lấy bài kiểm tra theo ID
     */
    static getQuizById(id) {
        return quizzes.find(q => q.id === parseInt(id));
    }
}

module.exports = QuizModel;
