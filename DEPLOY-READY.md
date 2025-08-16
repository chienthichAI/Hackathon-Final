#  Sẵn sàng Deploy lên Vercel!

##  Đã cập nhật xong:
- [x] vite.config.js: Thêm base: '/' và xóa proxy
- [x] vercel.json: Cấu hình routing và headers
- [x] .env.production: File môi trường production

##  Cần làm trước khi deploy:

### 1. Cập nhật .env.production
Thay đổi các URL sau:
`ash
# Từ:
VITE_API_URL=http://your-local-ip:5001
VITE_CHATBOT_URL=http://your-local-ip:8000

# Thành:
VITE_API_URL=http://localhost:5001
VITE_CHATBOT_URL=http://localhost:8000
`

### 2. Build project
`ash
npm run build
`

### 3. Deploy lên Vercel
`ash
npm install -g vercel
vercel login
vercel --prod
`

### 4. Cập nhật Environment Variables trong Vercel Dashboard
- VITE_API_URL: http://localhost:5001
- VITE_CHATBOT_URL: http://localhost:8000

##  Để frontend kết nối được với backend:

### Cách 1: Sử dụng ngrok (Khuyến nghị)
`ash
npm install -g ngrok
ngrok http 5001  # Main Backend
ngrok http 8000  # Chatbot Backend
`

Sau đó cập nhật .env.production với ngrok URLs.

### Cách 2: Port forwarding trên router

##  Kết quả:
- Frontend: https://your-app.vercel.app
- Backend: Chạy trên máy cá nhân
- Chatbot: Chạy trên máy cá nhân