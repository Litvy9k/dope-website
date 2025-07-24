import '../components/Layout.css'
import HighlightText from '../components/highlight';

function Home({ setShowTray }) {
  return (
    <>
      <h1>KIA ORA</h1>
      <h2>This site is <HighlightText>UNDER CONSTRUCTION</HighlightText> and I kinda messed up the CI/CD process. So things might not be up to date.</h2>
      <h2>You can turn off the CRT effects (flickering etc.) and pixlated font if you find them annoying. There's a <HighlightText onHover={() => setShowTray(true)} onLeave={() => setShowTray(false)}>settings tab</HighlightText> at the bottom left of the page :)</h2>
      <h2><HighlightText>WIP</HighlightText> You can also switch languages in the settings tab. Some of the contents (in both languages) may be automatically translated by i18next. Sometimes I just don't feel like writing same thing twice in two languages :p</h2>
      <h2>朋友是一个坚韧不拔的纪录片，在<HighlightText>香港</HighlightText>这座城市的设置。主演：钱德勒索罗斯傅博斯1瑞秋莫妮卡和一些其他他妈的演员。</h2>
    </>
  );
}

export default Home;