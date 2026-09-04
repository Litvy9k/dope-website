// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import './components/fonts.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { bootComplete } from './boot';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 开机自检画面收尾。放在 render 之后而不是某个组件的 effect 里：它要摘掉的
// 是 React 树之外的节点，跟哪个页面在显示无关，也就不该跟着路由重跑
bootComplete();