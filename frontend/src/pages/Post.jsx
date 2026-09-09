import '../components/Layout.css';
import { useUI } from '../components/UIContext';
import Rating from '../components/Rating';
import Markdown from '../content/Markdown';
import { pick, pickList } from '../content/posts';

/** 单篇文章。评论和博文共用，区别只是有没有评分那些字段 */
export default function Post({ post }) {
  const { lang } = useUI();
  const body = post.body[lang] ?? post.body.en ?? post.body.zh;
  const tags = pickList(post.tags, lang);

  return (
    <article className="post">
      <h1>{pick(post.title, lang)}</h1>

      {/* 四个字段一个都没有时整行不渲染。无条件渲染的话，没有 meta 的文档
          （abt-me 下面那几个子页就是）标题底下会多出一条 10px 的空隙 ——
          盒子高度是 0，但下外边距照样算 */}
      {(post.original || post.year || post.date || post.rating != null) && (
        <div className="post-meta">
          {post.original && <span className="post-original">{post.original}</span>}
          {post.year && <span>{post.year}</span>}
          {post.date && <span>{post.date}</span>}
          {post.rating != null && <Rating value={post.rating} />}
        </div>
      )}

      {tags.length > 0 && (
        <div className="post-tags">
          {tags.map((tag) => (
            <span key={tag} className="post-tag">#{tag}</span>
          ))}
        </div>
      )}

      <Markdown fontScale={post.fontScale}>{body}</Markdown>
    </article>
  );
}
