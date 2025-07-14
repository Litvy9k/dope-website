import Layout from '../components/Layout';
import '../components/Layout.css'

function Home() {
  return (
    <Layout>
      <h1>Hello</h1>
      <h2>You can turn off the CRT effects and pixlated font if you find them annoying. There's a <span className='highlight'>settings tab</span> at the bottom left of the page :)</h2>
      <h2>You can also switch languages in the settings tab. Some of the contents (in both languages) may be automatically translated by i18next. Sometimes I just don't feel like writing everything in two languages :p</h2>
      <h2>朋友是一个坚韧不拔的纪录片，在<span class='highlight'>香港</span>这座城市的设置。主演：钱德勒索罗斯傅博斯1瑞秋莫妮卡和一些其他他妈的演员。</h2>
    </Layout>
  );
}

export default Home;