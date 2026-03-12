# Cồn Sơn Explorer 🌴

Ứng dụng web hỗ trợ tăng trải nghiệm du lịch tại Cồn Sơn thông qua hệ thống nhiệm vụ gamification.

## 🚀 Tính năng

- **Đăng nhập/Đăng ký** với email hoặc username
- **Nhiệm vụ ngắn hạn**: Trải nghiệm ẩm thực, thủ công, cộng đồng
- **Nhiệm vụ dài hạn**: Đếm bước chân, bảo vệ môi trường
- **Giao diện hiện đại**: Dark theme với glassmorphism
- **Animations**: Hiệu ứng khi hoàn thành nhiệm vụ

## 📁 Cấu trúc dự án

```
EXE101/
├── server/                 # Backend Node.js + Express
│   ├── config/            # Cấu hình database
│   ├── models/            # User, Task models
│   ├── routes/            # API routes
│   ├── middleware/        # JWT auth
│   └── server.js          # Entry point
│
└── client/                # Frontend React + Vite
    ├── src/
    │   ├── components/    # Navbar, TaskCard, ProgressRing
    │   ├── pages/         # Login, Register, Dashboard
    │   ├── context/       # AuthContext
    │   └── services/      # API service
    └── index.html
```

## ⚙️ Cài đặt

### Yêu cầu
- Node.js v18+
- MongoDB (optional - app có sample data)

### Backend

```bash
cd server
npm install
npm run dev
```

Server chạy tại: http://localhost:5000

### Frontend

```bash
cd client
npm install
npm run dev
```

App chạy tại: http://localhost:5173

## 🎮 Demo Mode

App có thể chạy **không cần backend** với sample data để demo. Chỉ cần chạy frontend và app sẽ tự động sử dụng dữ liệu mẫu.

## 📝 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/tasks | Lấy danh sách nhiệm vụ |
| POST | /api/tasks/complete/:id | Hoàn thành nhiệm vụ |
| PATCH | /api/tasks/long-term | Cập nhật tiến trình dài hạn |

## 🎨 Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT, bcrypt
- **Styling**: Vanilla CSS với design system

## 📱 Screenshots

Giao diện với dark theme hiện đại, glassmorphism cards, và animations khi hoàn thành nhiệm vụ.
