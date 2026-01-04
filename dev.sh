#!/bin/bash

# ==============================================================================
# Synapse Dev Runner (v2026.01.1)
# Description: Chạy đồng thời Backend (FastAPI) và Frontend (Next.js)
# ==============================================================================

# Hàm xử lý khi nhấn Ctrl+C để tắt cả 2 server
cleanup() {
    echo ""
    echo "🛑 Đang dừng các máy chủ Synapse..."
    # Giết tất cả các task chạy ngầm của script này
    kill $(jobs -p) 2>/dev/null
    exit
}

# Đăng ký hàm cleanup khi script bị dừng (SIGINT hoặc SIGTERM)
trap cleanup SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🚀 KHỞI ĐỘNG DỰ ÁN SYNAPSE (CHẾ ĐỘ PHÁT TRIỂN)"
echo "----------------------------------------------------"

# Kiểm tra thư mục frontend
if [ ! -d "frontend" ]; then
    echo "❌ Lỗi: Không tìm thấy thư mục 'frontend'."
    exit 1
fi

# Kiểm tra thư mục backend
if [ ! -d "backend" ]; then
    echo "❌ Lỗi: Không tìm thấy thư mục 'backend'."
    exit 1
fi

# 1. Chạy Backend (Sử dụng uv run uvicorn)
echo "📦 [1/2] Đang khởi động Backend (FastAPI)..."
(cd backend && uv run uvicorn app.main:app --reload --port 8000) &

# Đợi một chút để Backend khởi động trước
sleep 3

# 2. Chạy Frontend
echo "💻 [2/2] Đang khởi động Frontend (Next.js)..."
echo "💡 Lưu ý: Nếu báo lỗi cổng 3000 đang bận, hãy tắt các trình chạy Next.js cũ."
(cd frontend && pnpm dev) &

echo ""
echo "✨ Hệ thống đã sẵn sàng!"
echo "📍 Backend API: http://localhost:8000"
echo "📍 Frontend UI: http://localhost:3000"
echo "📍 Showcase:    http://localhost:3000/showcase"
echo "----------------------------------------------------"
echo "Nhấn Ctrl+C để dừng cả hai máy chủ."

# Giữ script chạy để đợi các background jobs
wait
