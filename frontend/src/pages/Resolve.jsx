import { useLocation } from 'react-router-dom';
import { useUI } from '../components/UIContext';
import UpLink from '../components/UpLink';
import { trailOf } from '../components/nav/sections';
import { getPost } from '../content/posts';
import Post from './Post';
import Section, { NotFound } from './Section';

/**
 * 一个地址可能是文章也可能是栏目，深度不固定
 * （/blog-post/hello 两层，/review/films/xxx 三层），
 * 所以不按层数写路由，统一在这里解析。
 */
export default function Resolve() {
  const { pathname } = useLocation();
  const { lang } = useUI();

  const post = getPost(pathname);
  const trail = trailOf(pathname);
  const depth = pathname.split('/').filter(Boolean).length;

  // 主页以外每一页都带返回上一层，所以统一放在这儿，不用每个页面各写一遍
  return (
    <>
      <UpLink />
      {post ? (
        <Post post={post} />
      ) : trail.length && trail.length === depth ? (
        <Section node={trail[trail.length - 1]} trail={trail} />
      ) : (
        <NotFound pathname={pathname} lang={lang} />
      )}
    </>
  );
}
