import Layout from '../components/Layout';
import '../components/Layout.css'

function Home() {
  return (
    <Layout>
        <div className='testslimfont'>
          <h1>Hello</h1>
          <h2>If you find the CRT effect and pixel font annoying you can turn them off. There's a settings tab at the bottom left of the page :)</h2>
        </div>
    </Layout>
  );
}

export default Home;