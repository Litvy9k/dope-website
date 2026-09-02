import '../components/Layout.css';
import { useUI } from '../components/UIContext';
import Rating from '../components/Rating';
import Markdown from '../content/Markdown';
import { pick } from '../content/posts';

/** 单篇文章。评论和博文共用，区别只是有没有评分那些字段 */
export default function Post({ post }) {
  const { lang } = useUI();
  const body = post.body[lang] ?? post.body.en ?? post.body.zh;

  return (
    <article className="post">
      <h1>{pick(post.title, lang)}</h1>

      <div className="post-meta">
        {post.original && <span className="post-original">{post.original}</span>}
        {post.year && <span>{post.year}</span>}
        {post.date && <span>{post.date}</span>}
        {post.rating != null && <Rating value={post.rating} />}
      </div>

      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="post-tag">#{tag}</span>
          ))}
        </div>
      )}

      <Markdown>{body}</Markdown>
    </article>
  );
}
