import '../components/Layout.css';
import Markdown from '../content/Markdown';
import { home, pick } from '../content/posts';
import { useUI } from '../components/UIContext';

/**
 * 主页。正文在 content/home.md 里，和文章走同一套解析和标记系统 ——
 * 之前是硬编码在这个文件里的四段，改一句话都要动代码。
 *
 * 标题留在组件里而不是交给 Markdown：和文章页一致，h1 由页面渲染，
 * md 只负责正文。md 里的 # 标题会被降成 h2（见 content/Markdown.jsx），
 * 写进正文的话字号对不上。
 */
function Home() {
  const { lang } = useUI();

  if (!home) return null;

  const body = home.body[lang] ?? home.body.en ?? home.body.zh;

  return (
    <>
      <h1>{pick(home.title, lang)}</h1>
      <Markdown fontScale={home.fontScale}>{body}</Markdown>
    </>
  );
}

export default Home;
