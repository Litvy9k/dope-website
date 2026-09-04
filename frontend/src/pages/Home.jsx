import '../components/Layout.css';
import MarkdownPage from './MarkdownPage';
import { home } from '../content/posts';

/**
 * 主页。正文在 content/home.md 里，和文章、关于我走同一套解析和标记系统。
 *
 * 单独留一个组件而不是并进 Resolve：主页在 App.jsx 里有自己的路由，
 * 而且不该有"返回上一层"那个链接。
 */
function Home() {
  return <MarkdownPage doc={home} />;
}

export default Home;
