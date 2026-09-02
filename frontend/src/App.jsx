import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Resolve from './pages/Resolve';

function App() {
  // CRT 组件按挂载时的尺寸算特效，首帧偏早，补一次 resize 让它重新量
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 深度不固定，是文章还是栏目交给 Resolve 判断 */}
          <Route path="*" element={<Resolve />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
