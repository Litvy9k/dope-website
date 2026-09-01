import '../components/Layout.css'
import RichText from '../highlight/RichText';

// 正文就是纯文字，交互写成 [标记]。能用哪些标记看 highlight/actions.js
const paragraphs = [
  `This site is [tooltip=骨架搭好了，内容还在慢慢填。]UNDER CONSTRUCTION[/tooltip] and I kinda messed up the CI/CD process. So things might not be up to date.`,

  `You can turn off the CRT effects (flickering etc.) and pixlated font if you find them annoying. Hit F10, or find [settings]SETUP[/settings] in the bar down there :)`,

  `[tooltip=Work In Progress —— 还没做完]WIP[/tooltip] You can also switch languages in the settings tab. Some of the contents (in both languages) may be automatically translated by i18next. Sometimes I just don't feel like writing same thing twice in two languages :p`,

  `朋友是一个坚韧不拔的纪录片，在[tooltip=鼠标悬浮就能看到这种注释；手机上点一下也行。]香港[/tooltip]这座城市的设置。主演：钱德勒索罗斯傅博斯1瑞秋莫妮卡和一些其他他妈的演员。`,
];

function Home() {
  return (
    <>
      <h1>KIA ORA</h1>
      {paragraphs.map((text, i) => (
        <h2 key={i}><RichText>{text}</RichText></h2>
      ))}
    </>
  );
}

export default Home;
