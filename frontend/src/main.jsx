// ============================================
// React 앱 진입점 (Entry Point)
// ============================================
// 이 파일은 React 앱을 시작하는 진입점입니다.
// index.html의 #root 요소에 React 앱을 렌더링합니다.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// React 18의 createRoot API를 사용하여 앱을 렌더링합니다.
// StrictMode: 개발 중 잠재적인 문제를 감지하는 도구
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
