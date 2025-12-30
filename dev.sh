#!/bin/bash

# ==============================================================================
# Synapse Dev Runner
# Description: Chạy đồng thời Backend (FastAPI) và Frontend (Next.js)
# ==============================================================================

# Hàm xử lý khi nhấn Ctrl+C để tắt cả 2 server
cleanup() {
    echo ""
    echo "Stopping Synapse dev servers..."
    # Giết tất cả các task chạy ngầm của script này
    kill $(jobs -p) 2>/dev/null
    exit
}

# Đăng ký hàm cleanup khi script bị dừng (SIGINT hoặc SIGTERM)
trap cleanup SIGINT SIGTERM

echo "----------------------------------------------------"
echo "🚀 Starting Synapse Project in Development Mode"
echo "----------------------------------------------------"

# 1. Chạy Backend
echo "📦 [1/2] Launching Backend (Uvicorn)..."
(cd backend && python -m uv run uvicorn app.main:app --reload) &

# Đợi một chút để Backend khởi động trước
sleep 2

# 2. Chạy Frontend
echo "💻 [2/2] Launching Frontend (Next.js)..."
(cd frontend && npm run dev) &

echo ""
echo "✨ All systems are running!"
echo "📍 Backend: http://localhost:8000"
echo "📍 Frontend: http://localhost:3000"
echo "----------------------------------------------------"
echo "Press Ctrl+C to stop both servers."

# Giữ script chạy để đợi các background jobs
wait
