Write-Host "Cài đặt thư viện MERN Backend..."
npm install cors mongoose dotenv

Write-Host "Push dữ liệu khởi tạo vào MongoDB..."
node seed.js

Write-Host "Khởi tạo thư mục Client Frontend bằng VITE siêu tốc..."
if (Test-Path -Path "client") {
    Remove-Item -Recurse -Force "client"
}
npm create vite@latest client -- --template react

Write-Host "Cài đặt thư viện siêu xịn cho Giao diện..."
cd client
npm install
npm install tailwindcss postcss autoprefixer react-router-dom axios socket.io-client lucide-react classnames framer-motion
npx tailwindcss init -p

Write-Host "Khởi tạo CSS cho Tailwind..."
Set-Content -Path "src\index.css" -Value "@tailwind base;`n@tailwind components;`n@tailwind utilities;`nbody { background-color: #0f172a; color: white; margin: 0; }"

Write-Host "Cài đặt hoàn tất! Vite React frontend & Backend đã sẵn sàng lập trình màn hình."
