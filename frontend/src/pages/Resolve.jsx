import { useLocation } from 'react-router-dom';
import { useUI } from '../components/UIContext';
import UpLink from '../components/UpLink';
import { trailOf } from '../components/nav/sections';
import { getPost, pages } from '../content/posts';
import GamePage from './GamePage';
import MarkdownPage from './MarkdownPage';
import Post from './Post';
import Section, { NotFound } from './Section';

/**
 * 有些栏目不是文章列表而是一个独立页面，在 sections.js 里写 page: '名字'。
 * 表放在这儿而不是 sections.js 里：那个文件是纯数据，不该 import 组件，
 * 否则栏目树就和 React 绑死了，node 里跑不了。
 */
const PAGES = { game: GamePage };

/**
 * 一个地址可能是文章也可能是栏目，深度不固定
 * （/blog-post/hello 两层，/review/films/xxx 三层），
 * 所以不按层数写路由，统一在这里解析。
 */
export default function Resolve() {
  const { pathname } = useLocation();
  const { lang } = useUI();

  const post = getPost(pathname);
  // content/ 根目录下的 md 撑起来的单页（关于我这种）
  const page = pages[pathname];
  const trail = trailOf(pathname);
  const depth = pathname.split('/').filter(Boolean).length;

  // 栏目自带组件的（比如 /game），走它自己的组件，不进列表那套
  const node = trail.length === depth ? trail[trail.length - 1] : null;
  const CustomPage = node?.page ? PAGES[node.page] : null;

  // 主页以外每一页都带返回上一层，所以统一放在这儿，不用每个页面各写一遍
  return (
    <>
      <UpLink />
      {post ? (
        <Post post={post} />
      ) : page ? (
        <MarkdownPage doc={page} />
      ) : CustomPage ? (
        <CustomPage />
      ) : trail.length && trail.length === depth ? (
        <Section node={trail[trail.length - 1]} trail={trail} />
      ) : (
        <NotFound pathname={pathname} lang={lang} />
      )}
    </>
  );
}
