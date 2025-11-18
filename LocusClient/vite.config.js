import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4173,          // 🔧 여기만 변경
    strictPort: true,    // (선택) 이미 사용 중이면 그냥 에러 내고 죽게
    allowedHosts: true,
  },
})
