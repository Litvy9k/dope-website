import Layout from '../components/Layout';
import bgImage from '../assets/bg.png';

function Home() {
  return (
    <div style={{ backgroundImage: `url(${bgImage})` }}>
        <h2>欢迎来到主页</h2>
        <p>这是我的个人网站。</p>
    </div>
  );
}

export default Home;