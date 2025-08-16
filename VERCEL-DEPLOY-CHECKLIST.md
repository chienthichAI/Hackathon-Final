# Checklist Deploy lên Vercel

##  Đã cập nhật:
- [x] vite.config.js: Thêm base: '/'
- [x] vite.config.js: Xóa proxy config (không cần cho production)
- [x] vercel.json: Cập nhật routing và headers

##  Cần cập nhật thủ công:

### 1. File .env.production
Cập nhật các URL sau:
`ash
# Thay đổi từ:
VITE_API_URL=http://your-local-ip:5001
VITE_SOCKET_URL=http://your-local-ip:5001
VITE_CHATBOT_URL=http://your-local-ip:8000

# Thành:
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
VITE_CHATBOT_URL=http://localhost:8000
`

### 2. Hoặc sử dụng ngrok để expose local server:
`ash
npm install -g ngrok
ngrok http 5001  # Main Backend
ngrok http 8000  # Chatbot Backend
`

Sau đó cập nhật .env.production với ngrok URLs.

##  Bước deploy:
1. npm run build
2. vercel --prod
3. Cập nhật Environment Variables trong Vercel Dashboard
4. Test website