import Markdown from '../content/Markdown';
import { pick } from '../content/posts';
import { useUI } from '../components/UIContext';

/**
 * 一篇 md 撑起的整页：主页、关于我这类。和文章页的区别是没有日期、
 * 评分、标签那些 meta，只有标题和正文。
 *
 * 标题留在这里而不是写进 md 的正文：md 里的 # 会被 Markdown 组件降成 h2
 * （见 content/Markdown.jsx），字号对不上文章页的 h1。
 */
export default function MarkdownPage({ doc }) {
  const { lang } = useUI();

  if (!doc) return null;

  const body = doc.body[lang] ?? doc.body.en ?? doc.body.zh;

  return (
    /* 外面这层不是摆设：宽度限制挂在它身上。之前这里是个 Fragment，
       单页就没有任何 max-width，2200px 宽的屏上正文铺满 2130px、
       一行 187 个字符，而同屏的文章是 890px / 78 字符 */
    <article className="page">
      <h1>{pick(doc.title, lang)}</h1>
      <Markdown fontScale={doc.fontScale}>{body}</Markdown>
    </article>
  );
}
