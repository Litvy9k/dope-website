import Markdown from '../content/Markdown';
import { scaleOf } from '../content/fontScale';
import Contact from '../components/Contact';
import { pick } from '../content/posts';
import { useUI } from '../components/UIContext';

/**
 * 一篇 md 撑起的整页：主页、关于我这类。和文章页的区别是没有日期、
 * 评分、标签那些 meta，只有标题和正文。
 *
 * 标题留在这里而不是写进 md 的正文：md 里的 # 会被 Markdown 组件降成 h2
 * （见 content/Markdown.jsx），字号对不上文章页的 h1。
 *
 * 有子页的栏目（abt-me 就是）这里也不列它们 —— 子页在底栏的二级菜单里，
 * 页面上不重复。和栏目页的做法一致，见 Section.jsx 里同样的取舍。
 */
export default function MarkdownPage({ doc }) {
  const { lang } = useUI();

  if (!doc) return null;

  const body = doc.body[lang] ?? doc.body.en ?? doc.body.zh;
  const scale = scaleOf(doc.fontScale);

  return (
    /* 外面这层不是摆设：宽度限制挂在它身上。之前这里是个 Fragment，
       单页就没有任何 max-width，2200px 宽的屏上正文铺满 2130px、
       一行 187 个字符，而同屏的文章是 890px / 78 字符 */
    /* --md-scale 提到这一层，Contact 才看得见 —— 它是 .md 的兄弟节点，
       而 Markdown 组件把这个变量内联设在 .md 自己身上。不提上来的话联系
       方式那块拿不到这篇的字号倍率，实测正文 25.5px 而它只有 17px，
       看着像另一个站的页脚 */
    <article className="page" style={scale ? { '--md-scale': scale } : undefined}>
      <h1>{pick(doc.title, lang)}</h1>
      <Markdown fontScale={doc.fontScale}>{body}</Markdown>
      {/* 接在正文之后：读者扫完这一页正要找"怎么联系"的时候，它就在那儿。
          想挪到正文前面就是把这一行往上移 */}
      <Contact items={doc.contact} lang={lang} />
    </article>
  );
}
