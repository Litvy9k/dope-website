import { Link } from 'react-router-dom';
import Rating from './Rating';
import { pick } from '../content/posts';
import './PostCard.css';

function Cover({ src, alt }) {
  if (!src) {
    // 还没有封面图。留白不如明说，顺便也是这个主题该有的样子
    return (
      <div className="card-cover is-empty" aria-hidden="true">
        <span>NO<br />SIGNAL</span>
      </div>
    );
  }
  return <img className="card-cover" src={src} alt={alt} loading="lazy" />;
}

/**
 * 列表卡片。featured 的那张横跨整行，其余进双栏。
 * 置顶的不写"我最爱"之类的标签 —— 尺寸和边框已经说明问题了，角上一个 ★ 足够。
 */
export default function PostCard({ post, lang, featured = false }) {
  const title = pick(post.title, lang);

  return (
    <Link
      to={post.route}
      className={`post-card ${featured ? 'is-featured' : ''}`}
    >
      <Cover src={post.cover} alt={title} />

      {featured && (
        <span className="card-star" aria-hidden="true">
          {/* 逐格拼出来的五角星，不用 ★ 字符 —— 点阵字体不一定有那个字形 */}
          <svg viewBox="0 0 9 8" shapeRendering="crispEdges">
            <rect x="4" y="0" width="1" height="2" />
            <rect x="3" y="2" width="3" height="1" />
            <rect x="0" y="3" width="9" height="1" />
            <rect x="1" y="4" width="7" height="1" />
            <rect x="2" y="5" width="5" height="1" />
            <rect x="2" y="6" width="2" height="1" />
            <rect x="5" y="6" width="2" height="1" />
            <rect x="1" y="7" width="2" height="1" />
            <rect x="6" y="7" width="2" height="1" />
          </svg>
        </span>
      )}

      <div className="card-body">
        <h3 className="card-title">{title}</h3>

        <div className="card-sub">
          {post.original && <span className="card-original">{post.original}</span>}
          {post.year && <span>{post.year}</span>}
        </div>

        {post.rating != null && (
          <div className="card-rating"><Rating value={post.rating} /></div>
        )}

        <p className="card-excerpt">{pick(post.excerpt, lang)}</p>
      </div>
    </Link>
  );
}
