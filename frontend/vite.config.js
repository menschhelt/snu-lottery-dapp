// ============================================
// Vite 설정 파일
// ============================================
// Vite는 빠른 개발 서버와 빌드 도구입니다.
// React 프로젝트를 위한 기본 설정입니다.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],  // React 플러그인 사용
  server: {
    port: 3000,        // 개발 서버 포트
    open: true         // 서버 시작 시 브라우저 자동 열기
  }
})
