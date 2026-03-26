# Online Quiz System

Online Quiz System là một ứng dụng web mô phỏng nền tảng trắc nghiệm trực tuyến (ví dụ như Kahoot hoặc Blooket) với tính năng thời gian thực (real-time) và các thẻ bài chức năng đa dạng nâng cao sự kịch tính cho người chơi. Dự án được phát triển theo mô hình MVC, sử dụng MERN stack kết hợp Socket.io.

## Các tính năng chính
- **Host (Máy chủ):** Tạo phòng, quản lý người tham gia, có thể kick người chơi, thiết lập bộ câu hỏi (Quiz) tùy chỉnh và các thẻ bài chức năng.
- **Guest (Người chơi):** Tham gia phòng bằng mã PIN, làm bài trắc nghiệm.
- **Tính điểm Real-time:** Bảng xếp hạng cập nhật liên tục thông qua Socket.io.
- **Thẻ bài chức năng đa dạng:** Có nhiều loại thẻ bài thú vị (nhân đôi điểm, cướp điểm, khiên bảo vệ, đóng băng, bom, v.v.).

## Yêu cầu hệ thống
- **Node.js**: Phiên bản 16.x trở lên.
- **MongoDB**: Đã cài đặt và đang chạy local service ở cổng `27017`.

## Hướng dẫn cài đặt và chạy dự án mượt mà

### 1. Cài đặt Backend (Server)
Mở terminal tại thư mục gốc của dự án (`/`):
```bash
# Cài đặt các thư viện cần thiết
npm install
```

```bash
# Seed dữ liệu mẫu (Câu hỏi & Thẻ bài) vào Database
node seed.js
```

```bash
# Khởi chạy server API và Socket.io (chạy trên cổng 5000)
npm start
# Hoặc chạy ở chế độ dev: npm run dev
```
*Lưu ý: Đảm bảo MongoDB đang được bật trước khi chạy server.*

### 2. Cài đặt Frontend (Client)
Mở một terminal mới (hoặc tab mới) và trỏ vào thư mục `client`:
```bash
cd client
```

```bash
# Cài đặt các thư viện cần thiết cho frontend
npm install
```

```bash
# Khởi chạy Frontend React/Vite (mặc định trên cổng 5173)
npm run dev
```

### 3. Trải nghiệm
- **Frontend** sẽ chạy tại: `http://localhost:5173`
- **Backend API & Socket** chạy tại: `http://localhost:5000`

Mở trình duyệt truy cập `http://localhost:5173`. Bạn có thể mở nhiều tab để đóng giả 1 người Host (Tạo phòng) và nhiều Guest (Học sinh) để xem các hiệu ứng đồ họa và socket real-time.

## Cấu trúc thư mục chính
- `/client`: Chứa source code React frontend (Vite, TailwindCSS).
- `/controllers`: Xử lý logic phía backend.
- `/models`: Định nghĩa Schema MongoDB (Quiz, Card, v.v.).
- `/server.js`: File chính cấu hình Express server và Socket.io.
- `/seed.js`: Dùng để tạo dữ liệu mẫu ban đầu (Dummy data) cho Quiz và các thẻ bài.

## Tác giả / Nguồn
Developed for University Project.
