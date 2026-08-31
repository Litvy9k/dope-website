import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Section from './pages/Section';

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
          {/* 所有栏目暂时共用占位页，两级都走这里 */}
          <Route path="/:section" element={<Section />} />
          <Route path="/:section/:sub" element={<Section />} />
          <Route path="*" element={<Section />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
